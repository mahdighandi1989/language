# AGENTS.md

All agents (Claude, Codex, Gemini, Copilot, …) working on this repository must follow
[`CLAUDE.md`](CLAUDE.md): ship every finished task with `scripts/ship.sh`, log every change in
`docs/WORKLOG.md`, keep `docs/handbook/` (handbook + progress ledger) current, record reusable
lessons in `experiences/`, and never delete a capability without the owner's approval.

---

**These rules bind ANY agent or human working here — not one tool.** `main` auto-deploys to
production on Render (web service `language`, `autoDeploy: yes` on `main`): every push to `main`
is a production change.

## 1. STOP — read these first, in this order

| # | Read | Why you cannot skip it |
|---|---|---|
| 1 | `AGENTS.md` (this file) | Shared rules for every agent; wins over any tool-specific file. |
| 2 | [`CLAUDE.md`](CLAUDE.md) | The owner's standing directives (Persian) + repo map + run commands. Auto-loaded by Claude Code only — other tools must open it themselves. |
| 3 | every file in [`experiences/`](experiences/) | Each one is a failure that already happened (a green `/health` hiding a broken flow, a `.gitignore` rule dropping a source file, a skip marker that silently stopped deploys). They are binding. |
| 4 | the **last 5 entries** of [`docs/WORKLOG.md`](docs/WORKLOG.md) — **newest is at the BOTTOM** | Where the work stopped, what is `[TODO]`/`[BLOCKED]`, what the owner last asked (`[OWNER]`). |
| 5 | [`docs/handbook/HANDBOOK.md`](docs/handbook/HANDBOOK.md) §6 (decisions) and §9 (open items) + [`docs/handbook/PROGRESS.md`](docs/handbook/PROGRESS.md) | Decisions already taken with their rejected options; the open-items list; the ledger you must extend. |
| 6 | [`docs/inspector-bridge-audit.md`](docs/inspector-bridge-audit.md) and [`docs/security.md`](docs/security.md) | «Inspector Bridge» here is an error-tracking / AI-command guard, **not** the owner's «نظارت و سرکشی» feature; its privacy history is binding context. |
| 7 | [`README.md`](README.md) | Architecture, env vars, setup. |

**State in your first message which of these you have actually read.**

## 2. Non-negotiable rules

- **`experiences/` is binding.** Read the lessons for an area before changing it.
- **Never delete a capability** (endpoint, page, button, data) — quarantine it and record it in the
  WORKLOG; deletion only with the owner's explicit approval.
- **Never delete or blindly overwrite existing user data** (Firestore, localStorage, the owner's Drive).
- **No secrets in the repo** (Gemini key, `ENCRYPTION_KEY`, `SUPERVISOR_PASSWORD`, Firebase service
  account) — only Render environment variables. The owner's admin e-mail already lives in
  `firestore.rules` (it must, to bootstrap) and is the single allowed exception.
- **`prompt/` and `TO-DO/` belong to the owner's external tooling — never modify them.**
- **Verification — what `scripts/ship.sh` runs, and what each one protects:**

  | Command (as run by `scripts/ship.sh`) | Protects what the others do not |
  |---|---|
  | the ignored-source check inside `scripts/ship.sh` | Source files that exist locally but are hidden by `.gitignore` (green local build, missing on Render). |
  | `scripts/docs_gate.py` (`python3 scripts/docs_gate.py`) | These rules: entry files, this command list, docs-map paths, signed newest WORKLOG entry, lesson frontmatter, WORKLOG/PROGRESS updated with every code change, `prompt/`+`TO-DO/` untouched, supervisor prompt versioning. |
  | `npm ci` (repo root, only when `node_modules` is missing) | The lockfile is in sync with both workspaces. |
  | `npm run test:node` (`cd backend && npm run test:node`) | Backend domain logic, Telegram bot, upload validation, env validation, inspection API rules. |
  | `pytest` (`cd backend && python3 -m pytest -q` and repo-root `python3 -m pytest -q`) | Boots the real server: routes, security headers, CORS, rate limits, error contract, build/deps invariants. |
  | `npm test` (`cd frontend && npm test`, vitest) | Frontend logic: auth/access gate, analytics, Inspector Bridge guards, WS URL/reconnect. |
  | `npm run build` (repo root → frontend workspace) | The Vite production bundle Render serves. |

- **Documentation duty after EVERY task:** (a) a new section at the bottom of `docs/WORKLOG.md` in its
  format (FINDING/DECISION/CHANGE/VERIFY/REVERT/CORRECTION/OWNER/TODO/BLOCKED), **ending with the
  signature line (§4)**; (b) a reusable lesson in `experiences/` when there is one — merge into an
  existing topic when it fits; (c) HANDBOOK + PROGRESS updated; (d) new env vars → `render.yaml`,
  `backend/.env.example`, README and HANDBOOK §4.
- **Decisions** get a `[DECISION]` line in the WORKLOG and a row in HANDBOOK §6 with the root cause **and
  the rejected options**.

## 3. Owner's standing directives (as stated in CLAUDE.md)

- **Ship automatically after every finished task:** `scripts/ship.sh "type(scope): summary"` — checks,
  commit, push the working branch, merge into `main`, push `main` (= deploy). Do not ask the owner to
  commit/push/merge by hand; do not open a PR unless asked. Never force-push; never disable a test.
  A `Stop` hook (`.claude/hooks/ensure-shipped.sh`) blocks Claude Code sessions from ending with
  unshipped work.
- **Measure before claiming.** A health ping is not evidence; exercise the real flow and read the
  Render deploy state. Read warnings.
- Reply to the owner **in Persian**, plainly and briefly. UI text is Persian with `dir="rtl"`.

## 4. Signature protocol — who did what

1. **WORKLOG:** the last line of every entry you write:
   `> **امضا:** \`<agent-id>\` · YYYY-MM-DD · <one line: how it was verified>`
   `<agent-id>` = the model/tool you actually are (e.g. `Claude Code`, `Codex CLI`, `human (owner)`).
   Sign only what you wrote.
2. **experiences/:** frontmatter field `agents:` listing who produced/merged the file; when merging into
   another agent's file, **append** yours.
3. **git commits:** a `Co-Authored-By:` trailer.

`scripts/docs_gate.py` fails the ship when the newest WORKLOG entry is unsigned.

## 5. Mistakes that already happened here

- **Undeployed for months:** 159 commits on `main` carried `[skip render]`, so production stayed on the
  2026-06-05 build. `ship.sh` now refuses skip markers; always read the Render deploy list.
- **«Admin» depended on a build-time variable** that had to match `firestore.rules` by hand; when the two
  drift the owner lands on «waiting for approval» with nobody able to approve.
- **Firestore `setDoc(..., {merge:true})` never deletes map keys** — «reset» buttons silently came back.
- **«Inspector Bridge» was once a click/scroll tracker posting to `*`** (see the audit doc); the current
  module is a different thing. Never re-add cross-origin messaging without an origin check.

## 6. Conflict rule

`CLAUDE.md` carries the same rules plus tool-specific detail (in Persian). **If the two ever disagree
about a rule, AGENTS.md wins and the drift is a bug to fix in the same commit.** Other tools' entry
files — [`GEMINI.md`](GEMINI.md), [`.github/copilot-instructions.md`](.github/copilot-instructions.md) —
only point here.
