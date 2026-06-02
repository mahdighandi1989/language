# Lebanese Dialect Learning App

An AI-powered web app for learning the Lebanese Arabic dialect. The frontend is
a React (Vite) single-page app; the backend is a Node/Express server that
proxies Google Gemini (REST + Live API) and serves the built SPA. User data is
stored in Firebase (Firestore + Auth), with a localStorage fallback when no
Firebase config is provided.

## Architecture overview

```
                 build-time VITE_* env vars
                            │
 frontend/index.html ──► frontend/src/main.jsx ──► frontend/src/App.jsx
        (app shell)            (mount point)         (root UI + state)
                                                          │
                                  REST /api/*  &  WebSocket /ws/live
                                                          │
                                                  backend/server.js
                                                  (Express + WS proxy)
                                                          │
                                          Google Gemini API (REST + Live)
```

The frontend calls the backend over a relative `/api` path. In development Vite
proxies `/api` to `http://localhost:3001` (see `frontend/vite.config.js`); in
production the Express server serves the built SPA from `frontend/dist` and
answers the same routes, so no API base URL needs to be configured.

## Components and their roles

The purpose of this component set (the role of this file in the overall
system) is documented inline in a header at the top of each file and
summarized in the table below. Each header states the component purpose plus
its upstream/downstream dependencies.

| File | Component purpose / role |
| --- | --- |
| `frontend/index.html` | HTML entry document (Vite app shell). Defines the RTL Persian page chrome, injects Firebase config from `VITE_*` vars at build time, and loads `src/main.jsx`. |
| `frontend/src/main.jsx` | Mounts the React tree: renders `<App/>` into `#root`. |
| `frontend/src/App.jsx` | Root React component. Owns the top-level UI (lessons, chat, live voice call, settings) and client state, and talks to the backend API. |
| `frontend/src/firebaseConfig.js` | Builds the Firebase config object from `VITE_*` env vars and reports whether Firebase is configured. |
| `backend/server.js` | HTTP + WebSocket entry point. Wires Express security, rate limiting, the `/api` router, the Gemini Live WebSocket proxy, and serves the SPA. |
| `backend/config/env.js` | Loads `.env` and validates required environment variables on startup. |
| `backend/routes/`, `controllers/`, `services/`, `middleware/`, `validators/` | Request routing, Gemini request/response handling, the Live API proxy, security/rate-limit middleware, and zod input schemas. |

## Getting started

### Prerequisites

- Node.js 18+ and npm
- A Google Gemini API key (from <https://aistudio.google.com/apikey>)
- (Optional) a Firebase project for persistence; without it the app uses
  localStorage

### Setup

```bash
# 1. Install all workspace dependencies (root + backend + frontend)
npm run install:all

# 2. Configure environment variables
cp backend/.env.example backend/.env       # set GEMINI_API_KEY (and Firebase, CORS…)
cp frontend/.env.example frontend/.env     # set VITE_* Firebase values

# 3. Run the backend (serves the API + WebSocket on PORT, default 3001)
npm run dev

# 4. In a second terminal, run the frontend dev server (Vite, port 5173)
cd frontend && npm run dev

# 5. Production build of the SPA
npm run build
```

### Environment variables

- Backend variables are documented in `backend/.env.example`
  (`GEMINI_API_KEY`, `ENCRYPTION_KEY`, `PORT`, `CORS_ORIGIN`, `FRONTEND_URL`,
  `FIREBASE_*`).
- Frontend variables are documented in `frontend/.env.example`. They **must**
  use the `VITE_` prefix because Vite only exposes `VITE_*` variables to client
  code via `import.meta.env`.
- Deployment defaults live in `render.yaml`; secrets there are marked
  `sync: false` and must be set in the hosting dashboard.

## Lock files

`package-lock.json` (committed at the repository root) pins the exact resolved
version of every dependency and transitive dependency for the npm workspaces
(`backend` and `frontend`). Its purpose is reproducible installs: `npm ci` and
`npm install` use it so every developer and CI/deploy run gets an identical
dependency tree. It is generated and updated by npm — **do not edit it by
hand**; change `package.json` and let npm regenerate the lock file. Because it
is large and machine-generated, JSON syntax forbids comments inside it, so its
purpose is documented here rather than in the file itself.

## Dependency consistency as a measurable outcome

Committing `package-lock.json` for both workspaces (`backend` and `frontend`) is
only useful if the lock file actually stays consistent with the `package.json`
manifests and is verified on every change. The **outcome target** of this
project's dependency-management effort is therefore stated in measurable terms
rather than as "keep dependencies tidy":

- **Outcome target (measurable):** reduce dependency-inconsistency errors to
  **zero** — every CI/CD run installs from the committed lock file with
  `npm ci` (which fails if `package.json` and `package-lock.json` have drifted),
  and a scheduled `npm audit` keeps the count of unaddressed **critical**
  advisories in the shipped (production) dependency tree at zero (dev-only
  tooling is reported but not a release gate).
- **Effectiveness metric (`outcome_rate`):** dependency consistency =
  `consistent_checks / total_checks` over the dependency-consistency invariants
  (lock file is valid JSON, every registry-resolved package carries an
  `integrity` hash, and each workspace `package.json` is represented in the lock
  file). The end-to-end test
  `tests/test_dependency_consistency.py::test_e2e_outcome` computes this rate,
  logs it (e.g. `outcome_rate (dependency consistency): 1.00`) so the metric is
  observable in CI/production test logs, and fails if it drops below 100%. The
  same `dependency_inconsistency` signal is emitted at runtime by
  `backend/app/monitoring.py` and `frontend/src/utils/logger.js` so a regression
  is greppable in production logs, not just in CI.
- **Where it runs:** the `.github/workflows/ci.yml` pipeline performs the
  `npm ci` dependency check and the `npm audit` vulnerability scan on every push
  and pull request (and on a weekly schedule), turning "are our dependencies
  consistent and safe?" into an objective, regression-guarded check.

## Testing

The Python test suite (pytest) exercises the Node backend and the build:

```bash
pytest            # repo-level suite in tests/
cd backend && python -m pytest   # backend-scoped suite
```

## Documentation coverage as a measurable outcome

The **outcome target** of the project's documentation effort is stated in
measurable terms rather than as "add some comments": every key component file
must carry a purpose header so a new developer can understand its role without
reverse-engineering it.

- **Outcome target (measurable):** 100% of the key component files
  (`frontend/src/App.jsx`, `backend/server.js`, `frontend/index.html`) expose a
  3–5 line purpose header describing what the file does and its upstream /
  downstream dependencies.
- **Effectiveness metric (`outcome_rate`):** documentation coverage =
  `documented_key_files / total_key_files`. The end-to-end test
  `tests/e2e/test_outcome_measurement.py::test_outcome_measurable` computes this
  rate, logs it (e.g. `outcome_rate (documentation coverage): 1.00`) so the
  metric is observable in CI/production test logs, and fails if coverage drops
  below 100%. This turns "is the code documented?" into an objective,
  regression-guarded check.

## Product KPIs as a measurable outcome

Beyond technical health (`error_rate`, `warn_count`, `info_count`), the app
measures whether users actually succeed. The **outcome target** is stated in
measurable Persian KPIs (full definitions and targets in
[`docs/outcome_target.md`](docs/outcome_target.md)):

- **نرخ موفقیت چت** (`chat_success_rate`) — هدف ≥ ۰٫۸۰
- **میانگین زمان پاسخ** (`avg_response_time`) — هدف ≤ ۲۰۰۰ms
- **نرخ تعامل کاربر** (`user_engagement_rate`) — هدف ≥ ۰٫۶۰
- **نرخ تبدیل** (`conversion_rate`) — هدف ≥ ۰٫۲۵

These blend into a single `outcome_rate`. The frontend tracker
(`frontend/src/analytics.js`) posts session summaries to `POST /api/analytics`,
where `backend/services/analyticsService.js` computes the KPIs; the Python
verify/measurement layer (`backend/app/analytics.py`) mirrors the computation
and logs each metric via the `analytics_log` logger so `outcome_rate` is
observable in CI/production. The end-to-end test
`tests/e2e/test_outcome_metrics.py::test_outcome_metrics_collected` feeds
synthetic sessions and asserts every KPI is collected.

The critical `verify_failed` event now alerts via
`backend/app/notifications.py` (Persian message, `priority="high"`,
`silent=False`; delivered to Telegram when `NOTIFY_TELEGRAM_*` env vars are set,
otherwise logged).

## Two-way Telegram bot (optional)

The backend ships an optional two-way Telegram bot that adds: **notifications**
(registration, errors, uploads, practice events), **remote control** of courses
and content (list / add / edit / delete / upload from chat), and **AI-teacher
practice** (pick a topic, chat by text, or send a voice message that is
transcribed and answered with both text and a synthesized voice reply).

It is **off by default**: with no `TELEGRAM_BOT_TOKEN` the bot stays dormant and
the server runs normally. To enable it, create a bot via
[@BotFather](https://t.me/BotFather) and set the `TELEGRAM_*` variables
(documented in `backend/.env.example`). The bot supports long polling (default)
or webhook mode (`TELEGRAM_WEBHOOK_URL` + `TELEGRAM_WEBHOOK_SECRET`).

- Endpoints: `POST /api/telegram/webhook` (secret-validated, bypasses the API
  rate limiter), `POST /api/telegram/link` (authenticated account linking),
  `GET /api/telegram/status`.
- Implementation lives in `backend/services/telegram/`; tests in
  `backend/tests/test_telegram_service.js` and `test_telegram_commands.js`
  (run with `cd backend && node --test 'tests/test_*.js'`).
- **Full Persian user guide:** [`docs/telegram-user-guide.md`](docs/telegram-user-guide.md)
  — setup, account linking, every command, the practice flow, and
  troubleshooting.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE)
file for details. The `license` field is set to `MIT` in the root, `backend/`
and `frontend/` `package.json` files.
