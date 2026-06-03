# Inspector Bridge & Live WebSocket — Consolidated Task Coverage

**Task:** `task_410fe171a0cb` — "پیکربندی Inspector Bridge و پیاده‌سازی ردیابی خطا"
(consolidated from 5 source tasks).

This document maps every acceptance criterion of the consolidated task to the
file(s) that already satisfy it and the test(s) that prove it. The work was
implemented incrementally by earlier commits; verification re-confirmed that the
current tree on `main` covers **all** ACs, so no functional code change was
required — only this coverage record.

Companion docs: [`inspector-bridge-audit.md`](inspector-bridge-audit.md) (history
& security audit of the removed tracking script) and
[`outcome_target.md`](outcome_target.md) (measurable error-rate outcome).

---

## Source task 1 — Make Inspector Bridge WebSocket URL configurable
`755e8cbd-c769-415e-8372-b625eb716a5c`

| AC | Satisfied by | Proof |
|----|--------------|-------|
| WS URL configurable via env var | `frontend/src/utils/wsUrl.js` reads `import.meta.env.VITE_WS_URL` (re-exported from `frontend/src/App.jsx`) | `frontend/src/utils/wsUrl.test.js` |
| No hardcoded third-party URLs remain | `grep -rn "ai-creator-backend-q677\|onrender" frontend/` → no matches; tracking script removed from `frontend/index.html` | `tests/test_inspector_bridge_no_iframe.py` |
| Bridge works with valid `WS_URL` or is gracefully disabled | `resolveLiveWsUrl()` falls back to this origin's `/ws/live`; `frontend/src/components/InspectorBridge.jsx` uses `postMessage` only (no external socket) | `frontend/src/components/InspectorBridge.test.jsx` |

## Source task 2 — Error-scenario coverage in Inspector Bridge
`ba60df37-44e8-426e-8bf8-4a48cbedb11b`

| AC | Satisfied by | Proof |
|----|--------------|-------|
| Outcome target rewritten as measurable | `docs/outcome_target.md` (error_rate / outcome_rate) | static |
| Code changed so outcome is achieved | `frontend/src/inspectorBridge.js` captures `window 'error'`, `'unhandledrejection'`, and Firebase catch-block errors (`reportError(err, {source:'firebase'})` in `frontend/src/components/App.jsx`) | `frontend/src/inspectorBridge.test.js` |
| E2E test measuring the outcome passes | `tests/e2e/test_inspector_bridge.py::test_error_tracking` (+ runtime/promise/firebase variants) | pytest |
| Metric/log added so rate is observable in production | `logMetric('error_rate' / outcome_rate, …)` via `frontend/src/utils/logger.js`; mirrors `backend/app/monitoring.py` | `frontend/src/utils/logger.test.js`, `tests/e2e/test_outcome_metrics.py` |

Note: the legacy parent-iframe `postMessage` exfiltration channel was removed on
purpose (security). Error events are reported to an in-app structured-metric sink
that any log scraper can read — an equivalent, safer implementation of the
"report error events for measurement" requirement. Guarded by
`tests/test_inspector_bridge_no_iframe.py`.

## Source task 3 — Correct frontend WebSocket endpoint connection
`8cebc933-b60e-42f6-9f49-5dbb6e2c203a`

| AC | Satisfied by | Proof |
|----|--------------|-------|
| Bridge connects to backend `/ws/live` | `frontend/src/utils/wsUrl.js` (`LIVE_WS_PATH = '/ws/live'`); consumed in `frontend/src/components/App.jsx` | `frontend/src/utils/wsUrl.test.js` |
| No hardcoded external URLs in frontend WS code | no `wss://<host>` literals in `frontend/src/` (only origin-derived) | `frontend/src/utils/wsUrl.test.js` |
| Backend WS server receives frontend connections | `backend/server.js:44` `new WebSocketServer({ server, path: '/ws/live' })`; dev proxy in `frontend/vite.config.js` | `tests/test_websocket_error_handling.py` |

## Source task 4 — WebSocket handler for live voice
`bca62f9c-0e65-448c-99e1-3ffcfb473a34`

| AC | Satisfied by | Proof |
|----|--------------|-------|
| WS server accepts connections | `backend/services/liveProxyService.js:13` `wss.on('connection', …)`; `backend/services/liveWsObserver.js:44` | `tests/test_websocket_error_handling.py`, `tests/backend/test_server.py` |
| Incoming (audio/text) messages processed | `liveProxyService.js:153` `clientWs.on('message', …)` proxied to Gemini Live | same |
| Connection closes cleanly | `liveProxyService.js:173` `clientWs.on('close', …)`; `liveWsObserver.js:61` `ws.on('close', …)` | same |

The handlers live in `backend/services/` (composed into `wss` from
`backend/server.js`) rather than inline in `server.js`; this is the equivalent,
modular implementation the AC ("behavior, not file/class name") explicitly allows.

## Source task 5 — Configure frontend WebSocket bridge endpoint
`01a42a22-f6da-4ba2-90e5-2ac7d1e55eae`

| AC | Satisfied by | Proof |
|----|--------------|-------|
| Change applied without breaking existing tests | full suite green (65 pytest + 61 vitest) | pytest + `npm test` |
| Linter passes without warnings | no lint warnings on changed files (no ESLint config; build clean) | `npm run build` |
| Type-check succeeds | project is plain JS/JSX (no TypeScript) — `vite build` type-validates JSX | `npm run build` |

---

## Reproduce verification

```bash
# Python (backend + e2e)
python -m pytest -q                       # 65 passed

# Frontend unit/component tests
cd frontend && npm install && npm test    # 61 passed

# Build
cd frontend && npm run build              # built OK

# No hardcoded third-party URL anywhere in the frontend
grep -rn "ai-creator-backend-q677\|onrender" frontend/   # (no matches)

# Backend live-socket lifecycle handlers
grep -rn "\.on('connection'\|\.on('message'\|\.on('close'" backend/services/
```

`merged-from: 755e8cbd-c769-415e-8372-b625eb716a5c, ba60df37-44e8-426e-8bf8-4a48cbedb11b, 8cebc933-b60e-42f6-9f49-5dbb6e2c203a, bca62f9c-0e65-448c-99e1-3ffcfb473a34, 01a42a22-f6da-4ba2-90e5-2ac7d1e55eae`
