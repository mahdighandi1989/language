/**
 * Purpose: Orchestrates the "تمرین با استاد هوش مصنوعی" (practice with the AI
 * teacher) flow for Telegram: topic selection, starting/continuing a session,
 * relaying text and voice messages to the AI, returning the teacher's reply
 * (text + optional synthesized voice), and ending a session with a summary.
 *
 * Upstream (inputs): a TelegramStore (session persistence) and an aiProvider
 * (chat/transcribe/synthesize — see aiProvider.js). Both are injected so the
 * unit tests run without Gemini or the network.
 * Downstream (outputs): consumed by services/telegram/commands.js. Persists all
 * session state through the store so /practice_history and /practice_details
 * work across restarts.
 */

// Curated practice topics for the Lebanese-dialect learner. (Step "out of
// scope": creating new topics — these are the selectable presets.)
export const PRACTICE_TOPICS = [
  { id: 'greetings', title: 'سلام و احوال‌پرسی' },
  { id: 'food', title: 'غذا و رستوران' },
  { id: 'travel', title: 'سفر و مسیریابی' },
  { id: 'shopping', title: 'خرید و بازار' },
  { id: 'daily', title: 'مکالمهٔ روزمره' },
];

export function getTopic(topicId) {
  return PRACTICE_TOPICS.find((t) => t.id === topicId) || null;
}

export class PracticeManager {
  constructor({ store, aiProvider }) {
    if (!store) throw new Error('PracticeManager requires a store');
    if (!aiProvider) throw new Error('PracticeManager requires an aiProvider');
    this.store = store;
    this.ai = aiProvider;
  }

  // Start a new session (ending any currently active one first) so a chat only
  // ever has a single active session.
  startSession(chatId, topicId = null) {
    const active = this.store.getActiveSession(chatId);
    if (active) this.store.endSession(active.id);
    const topic = topicId ? getTopic(topicId)?.title || topicId : null;
    return this.store.createSession(chatId, topic);
  }

  setTopic(sessionId, topicId) {
    const topic = getTopic(topicId);
    return this.store.updateSession(sessionId, { topic: topic ? topic.title : topicId });
  }

  // Send a learner text turn; persist both sides; return the teacher reply text.
  async sendText(sessionId, text) {
    const session = this.store.getSession(sessionId);
    if (!session || session.status !== 'active') {
      throw new Error('no_active_session');
    }
    this.store.appendSessionMessage(sessionId, 'user', text);
    const updated = this.store.getSession(sessionId);
    const reply = (await this.ai.chat(updated.messages, { topic: session.topic })) || '...';
    this.store.appendSessionMessage(sessionId, 'assistant', reply);
    return reply;
  }

  // Transcribe a voice note to text, then run it through the normal text turn.
  // Returns both the transcription and the teacher reply so the caller can echo
  // what was understood.
  async sendVoice(sessionId, buffer, mimeType = 'audio/ogg') {
    const transcript = (await this.ai.transcribe(buffer, mimeType)) || '';
    const reply = await this.sendText(sessionId, transcript || '(صوت نامفهوم)');
    return { transcript, reply };
  }

  // Synthesize the teacher reply to a voice note. Returns null when TTS is
  // unavailable so the caller can gracefully fall back to text only.
  async synthesizeReply(text, voice = 'Kore') {
    if (typeof this.ai.synthesize !== 'function') return null;
    try {
      return await this.ai.synthesize(text, voice);
    } catch {
      return null;
    }
  }

  // End a session and produce a short summary (counts + duration + topic).
  endSession(sessionId) {
    const session = this.store.getSession(sessionId);
    if (!session) return null;
    this.store.endSession(sessionId);
    return this.summarize(sessionId);
  }

  summarize(sessionId) {
    const session = this.store.getSession(sessionId);
    if (!session) return null;
    const userTurns = session.messages.filter((m) => m.role === 'user').length;
    const aiTurns = session.messages.filter((m) => m.role === 'assistant').length;
    const end = session.endedAt || Date.now();
    const durationMin = Math.max(0, Math.round((end - session.startedAt) / 60000));
    return {
      id: session.id,
      topic: session.topic || 'بدون موضوع',
      status: session.status,
      userTurns,
      aiTurns,
      totalMessages: session.messages.length,
      durationMin,
    };
  }

  history(chatId) {
    return this.store.listSessions(chatId).map((s) => this.summarize(s.id));
  }
}

export default PracticeManager;
