# Inspector Bridge — Commit & Code Audit

**Audit date:** 2026-06-02
**Scope:** History of the repeated `Add Inspector Bridge Script` commits, the
content they introduced, conventional-commit compliance of recent history, and
the current production state of the affected code.
**Nature:** Diagnostic. This document records findings; it does not rewrite git
history. Per-commit diffs are saved under
[`docs/inspector-bridge-diffs/`](inspector-bridge-diffs/).

---

## 1. Suspicious commits with duplicated messages

Eight commits over 2026-02-06 → 2026-02-07 repeatedly add and remove the same
"Inspector Bridge" tracking script. Six of them share two near-identical,
non-conventional subjects.

| # | Hash | Date | Subject | File touched | Lines |
|---|------|------|---------|--------------|-------|
| 1 | `b9494e5` | 2026-02-07 | `🌉 Add Inspector Bridge Script (JS version)` | `frontend/src/App.jsx` | +31 |
| 2 | `4b6a071` | 2026-02-06 | `🌉 Add Inspector Bridge Script (JS version)` | `frontend/src/App.jsx` | +119/−… |
| 3 | `e374c41` | 2026-02-06 | `🌉 Add Inspector Bridge Script (JS version)` | `frontend/src/App.jsx` | +53 |
| 4 | `f90cee1` | 2026-02-06 | `🌉 Add Inspector Bridge Script (JS version)` | `frontend/src/main.jsx` | +53 |
| 5 | `d214ff5` | 2026-02-06 | `🌉 Add Inspector Bridge Script for live tracking` | `frontend/index.html` | +173 |
| 6 | `9d61c99` | 2026-02-06 | `🔧 Remove Inspector Bridge Script` | `frontend/index.html` | −170 |
| 7 | `65ae85c` | 2026-02-06 | `🌉 Add Inspector Bridge Script for live tracking` | `frontend/index.html` | +173 |
| 8 | `e16892d` | 2026-02-06 | `🔧 Remove Inspector Bridge Script` | `frontend/index.html` | −170 |

**Pattern:** the same payload was added (`65ae85c`), removed (`e16892d` /
`9d61c99`), and re-added (`d214ff5`) within hours, then ported into JS modules
(`f90cee1`, `e374c41`, `4b6a071`, `b9494e5`). Five commits carry the *exact*
same message, which makes the history unreadable — you cannot tell from the log
which change did what.

Reproduce the list:

```bash
git log --oneline --all -i --grep="Inspector Bridge"
for h in b9494e5 4b6a071 e374c41 f90cee1 d214ff5 9d61c99 65ae85c e16892d; do
  git show "$h" > "docs/inspector-bridge-diffs/commit_$h.diff"
done
```

---

## 2. What the script did (content analysis)

The script introduced by `d214ff5` / `65ae85c` into `frontend/index.html`
(≈170 lines, injected as an inline IIFE in the page `<head>`) was a
**client-side user-activity tracker**:

- Registered capture-phase listeners on `click`, `scroll`, `input`, and
  `focus` for the whole `document`.
- For every event it called `sendToInspector(action, data)`, which built a
  message containing the element tag, an element descriptor, scroll/cursor
  position, **`window.location.href`**, and a timestamp.
- It shipped that message with **`window.parent.postMessage(message, '*')`** —
  a wildcard target origin, so *any* embedding parent frame could read it.
- It logged progress to the console (`console.log('🌉 Inspector Bridge: …')`)
  on startup and on every message sent.

### Risk assessment

| Concern | Severity | Detail |
|---------|----------|--------|
| Privacy / data exfiltration | **High** | Every click, scroll, keystroke event, focus, and the full page URL were emitted to the parent frame with no consent and no auth. |
| Wildcard `postMessage` origin (`'*'`) | **High** | Any parent window could intercept the stream; no origin allow-list. |
| Debug code in production | Medium | Inline `console.log` calls ran for all end users; the page is served statically, so the script reached production. |
| Add/remove churn | Medium | The same code was added and removed repeatedly, indicating it was never meant to be permanent — exactly the kind of thing that should never land on `main`. |

The script had **no connection to a hard-coded external HTTP/HTTPS endpoint**;
exfiltration was via `postMessage` to the embedding frame, not a `fetch`/`XHR`
to a third-party domain.

---

## 3. Conventional-commits compliance (last 100 commits)

Scan command and pattern:

```bash
git log --format='%s' -100 \
  | grep -cE '^(feat|fix|chore|docs|refactor|test|style|perf|ci|build|revert)(\(.+\))?(!)?: .+'
```

| Metric | Count |
|--------|-------|
| Total commits scanned | 100 |
| Conventional-compliant | 89 |
| **Non-compliant** | **11** |

(Counts are over the trailing 100 commits at audit time and drift as new
commits land; re-run the scan command below for current figures.)

The duplicated `🌉 Add Inspector Bridge Script …` commits are the archetype of
the violation: an emoji prefix instead of a `type:` prefix, no scope, and a
non-descriptive repeated subject. Many other non-compliant entries are
`[task_…]`-prefixed automation commits that likewise skip the conventional
`type:` prefix.

List the offenders:

```bash
git log --format='%h %s' -100 \
  | grep -vE '^[0-9a-f]+ (feat|fix|chore|docs|refactor|test|style|perf|ci|build|revert)(\(.+\))?(!)?: .+'
```

---

## 4. Current production state (already remediated)

The dangerous code has **already been removed** from production in commit
`acf9983` ("حذف Inspector Bridge از production و افزودن تست بیلد"). Verified at
audit time:

| Check | Command | Result |
|-------|---------|--------|
| Tracking script gone from `index.html` | `grep -in "inspector\|postMessage" frontend/index.html` | **clean** — no matches |
| No leftover `console.log` in `index.html` | `grep -c console.log frontend/index.html` | **0** |
| No `GEMINI_API_KEY` prefix leak in responses | `grep -rn "keyPrefix\|API_KEY.substring" backend/` | **clean** — no matches |
| `/ws/live` socket purpose | `grep -n "ws/live" backend/server.js` | legitimate Gemini Live API proxy, not a tracking sink |

A new, **safe** `frontend/src/components/InspectorBridge.jsx` now exists. Despite
the shared name it is a different thing: a non-rendering React guard that
validates AI-issued DOM commands (selector / URL sanitisation) arriving over the
app's own Live Voice WebSocket. It explicitly uses **no external WebSocket and
no cross-origin `postMessage`** (see the module header comment). It is not a
tracker and is not a regression of the audited script.

**Net result:** the privacy/exfiltration risk is closed. No code change is
required by this audit.

---

## 5. Recommendations

### 5a. Future commit hygiene (conventional commits)
- Adopt [Conventional Commits](https://www.conventionalcommits.org/): every
  subject must start with `feat|fix|chore|docs|refactor|test|style|perf|ci|build|revert`,
  optional `(scope)`, then `: <imperative summary>`.
- Examples for the audited changes:
  - `🌉 Add Inspector Bridge Script (JS version)` → `feat(frontend): add inspector bridge tracking script`
  - `🔧 Remove Inspector Bridge Script` → `chore(frontend): remove inspector bridge tracking script from production`
- Enforce it in CI/local with tooling — see
  [`docs/audit-report.md`](audit-report.md) §3 for a `commitlint` + `husky`
  setup sketch.

### 5b. History clean-up (recommendation only — NOT performed here)
The duplicated history could be squashed into one or two well-described commits.
This audit deliberately does **not** rewrite history because:
- it requires a force-push to `main`, which is destructive and rewrites shared
  history other branches/clones depend on; and
- the harmful code is already removed from the current tree, so the only
  remaining cost is log readability — not a functional or security problem.

If the team decides the churn must be collapsed, do it on a dedicated branch
with an interactive rebase and an explicit, coordinated force-push — never
silently on `main`.

### 5c. Prevent recurrence
- Keep debug/monitoring instrumentation out of `index.html`; gate any such code
  behind an env flag (`import.meta.env.DEV`) so it can never reach production.
- Never use `postMessage(..., '*')`; always pass an explicit target origin.
