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

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE)
file for details. The `license` field is set to `MIT` in the root, `backend/`
and `frontend/` `package.json` files.
