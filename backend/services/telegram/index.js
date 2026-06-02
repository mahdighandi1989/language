/**
 * Purpose: Composition root + Express wiring for the Telegram integration. It
 * assembles the client, store, logger, notification service, practice manager,
 * commands and bot from config, exposes the assembled service as a singleton so
 * request handlers elsewhere can emit notifications, and registers the HTTP
 * surface: the inbound webhook and the website-side account-link endpoint.
 *
 * Upstream (inputs): environment via services/telegram/config.js; the existing
 * Gemini config (for the practice provider + status) and the Express app from
 * server.js.
 * Downstream (outputs): when a bot token is configured, starts polling or sets a
 * webhook; registers POST /api/telegram/webhook, POST /api/telegram/link and
 * GET /api/telegram/status. When no token is configured every export degrades to
 * a safe no-op so the server boots normally (e.g. in CI/tests).
 */
import { loadTelegramConfig } from './config.js';
import { TelegramClient } from './client.js';
import { TelegramStore } from './store.js';
import { TelegramLogger } from './logger.js';
import { NotificationService, EventBus } from './notifications.js';
import { PracticeManager } from './practice.js';
import { createGeminiProvider } from './aiProvider.js';
import { Commands } from './commands.js';
import { TelegramBot } from './bot.js';
import { requireAuth } from '../../middleware/firebaseAuth.js';

let _service = null;

// Build the full Telegram service graph. `overrides` lets tests inject fakes
// (client, aiProvider, store) and the server inject a getStatus() function.
export function createTelegramService(overrides = {}) {
  const config = overrides.config || loadTelegramConfig();
  const logger = overrides.logger || new TelegramLogger();
  const store =
    overrides.store ||
    new TelegramStore({ dataDir: config.dataDir, persist: config.enabled });
  const client =
    overrides.client ||
    (config.enabled ? new TelegramClient({ token: config.token, apiBase: config.apiBase }) : null);
  const bus = overrides.bus || new EventBus();
  const notifications =
    overrides.notifications ||
    new NotificationService({ client, store, config, bus, logger });
  const aiProvider = overrides.aiProvider || createGeminiProvider();
  const practice = new PracticeManager({ store, aiProvider });
  const getStatus = overrides.getStatus || (() => ({ ok: true }));
  const commands = new Commands({ client, store, config, practice, notifications, logger, getStatus });
  const bot = client ? new TelegramBot({ client, commands, store, config, logger }) : null;

  return { config, logger, store, client, notifications, practice, commands, bot, getStatus };
}

// Lazily return the process-wide singleton (used by request handlers that want
// to emit notifications without threading the service through every call).
export function getTelegramService() {
  return _service;
}

// Start the bot's update source (polling or webhook) according to config.
export async function startTelegram(service) {
  if (!service?.bot) return;
  try {
    if (service.config.mode === 'webhook' && service.config.webhookUrl) {
      await service.bot.setupWebhook();
      service.logger.record({ chatId: null, command: 'startup:webhook', ok: true });
    } else {
      await service.bot.startPolling();
      service.logger.record({ chatId: null, command: 'startup:polling', ok: true });
    }
  } catch (err) {
    service.logger.recordError('startTelegram', err);
  }
}

/**
 * Wire the Telegram HTTP routes onto an Express app and start the bot. Safe to
 * call unconditionally: with no token configured it only registers the
 * link/status endpoints (which report "not configured") and never starts a bot.
 *
 * @param {import('express').Express} app
 * @param {object} [opts] forwarded to createTelegramService (e.g. getStatus)
 */
export function attachTelegram(app, opts = {}) {
  const service = createTelegramService(opts);
  _service = service;
  const { bot, store, config, logger } = service;

  // Inbound webhook: Telegram POSTs updates here when a webhook is configured.
  app.post('/api/telegram/webhook', async (req, res) => {
    if (!bot) return res.status(503).json({ error: 'Telegram bot not configured' });
    const secret = req.get('X-Telegram-Bot-Api-Secret-Token');
    try {
      const result = await bot.handleWebhook(req.body, secret);
      if (!result.ok && result.reason === 'bad_secret') {
        return res.status(403).json({ error: 'forbidden' });
      }
      return res.json({ ok: true });
    } catch (err) {
      logger.recordError('webhook', err);
      return res.status(200).json({ ok: true }); // never make Telegram retry-storm
    }
  });

  // Website-side account linking: the signed-in user submits the code shown by
  // the bot's /login command, binding their Telegram chat to their account.
  app.post('/api/telegram/link', requireAuth, async (req, res) => {
    const code = (req.body?.code || '').toString().trim();
    const userId = req.user?.uid;
    if (!userId) return res.status(401).json({ error: 'احراز هویت لازم است' });
    if (!code) return res.status(400).json({ error: 'کد الزامی است' });
    const link = store.confirmLinkCode(code, userId);
    if (!link) return res.status(404).json({ error: 'کد نامعتبر یا منقضی است' });
    if (bot && service.client) {
      service.client
        .sendMessage(link.chatId, '✅ حساب شما با موفقیت به این چت متصل شد.')
        .catch((err) => logger.recordError('link-confirm-msg', err));
    }
    return res.json({ ok: true, chatId: link.chatId });
  });

  // Lightweight status for the frontend "connect Telegram" panel.
  app.get('/api/telegram/status', (req, res) => {
    res.json({ enabled: config.enabled, mode: config.mode });
  });

  startTelegram(service);
  return service;
}

export default attachTelegram;
