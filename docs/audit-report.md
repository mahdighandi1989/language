# Audit Report — Suspicious "Inspector Bridge" Commits & Production Debug Code

**Date:** 2026-06-02
**Author:** automated audit (task 92c9dd21)
**Related detail doc:** [`docs/inspector-bridge-audit.md`](inspector-bridge-audit.md)
**Raw diffs:** [`docs/inspector-bridge-diffs/`](inspector-bridge-diffs/)

This is the executive summary for the development team. It consolidates the
findings, states the current risk posture, and lists actionable
recommendations. Deep per-commit detail lives in the companion doc above.

---

## 1. Findings at a glance

| Area | Finding | Status |
|------|---------|--------|
| Duplicated commit messages | 6 of 8 "Inspector Bridge" commits share two non-conventional, emoji-prefixed subjects; 5 are byte-identical (`🌉 Add Inspector Bridge Script (JS version)`). | Confirmed |
| Suspicious script in production | A client-side tracker streamed every click/scroll/input/focus + page URL to the parent frame via `postMessage(…, '*')`. | **Already removed** (`acf9983`) |
| Debug code in production | Inline `console.log` calls in `frontend/index.html`. | **Already removed** (0 remaining) |
| Credential leak | `GEMINI_API_KEY` prefix previously echoed in API responses (`keyPrefix`). | **Already removed** (no matches in `backend/`) |
| Conventional-commits compliance | 82/100 recent commits compliant; 18 non-compliant (incl. all Inspector Bridge commits). | Reported |

**Bottom line:** the security/privacy risk that motivated this audit is
**closed in the current tree**. The remaining issue is process hygiene
(commit messages), addressed by the recommendations below.

---

## 2. The suspicious commits

Eight commits (2026-02-06 → 02-07) repeatedly add/remove the same tracker:

```
b9494e5 🌉 Add Inspector Bridge Script (JS version)        frontend/src/App.jsx
4b6a071 🌉 Add Inspector Bridge Script (JS version)        frontend/src/App.jsx
e374c41 🌉 Add Inspector Bridge Script (JS version)        frontend/src/App.jsx
f90cee1 🌉 Add Inspector Bridge Script (JS version)        frontend/src/main.jsx
d214ff5 🌉 Add Inspector Bridge Script for live tracking   frontend/index.html
9d61c99 🔧 Remove Inspector Bridge Script                  frontend/index.html
65ae85c 🌉 Add Inspector Bridge Script for live tracking   frontend/index.html
e16892d 🔧 Remove Inspector Bridge Script                  frontend/index.html
```

What the script did and why it was dangerous (privacy, wildcard `postMessage`
origin, debug logging in production) is analysed in
[`docs/inspector-bridge-audit.md`](inspector-bridge-audit.md) §2.

---

## 3. Recommendations (≥3 actionable options)

### Option A — Adopt & enforce Conventional Commits (recommended, low risk)
Add `commitlint` + `husky` so non-conventional messages are rejected before
they land. Sketch:

```bash
npm i -D @commitlint/cli @commitlint/config-conventional husky
npx husky init
echo "module.exports = { extends: ['@commitlint/config-conventional'] };" > commitlint.config.cjs
echo 'npx --no -- commitlint --edit "$1"' > .husky/commit-msg
```

Result: a commit like `🌉 Add Inspector Bridge Script` is blocked; the author
must write e.g. `feat(frontend): add inspector bridge tracking script`.
Non-destructive, applies only to future commits.

### Option B — Squash the churn into one commit (history rewrite, higher risk)
Collapse the 8 add/remove commits into a single clear commit such as
`chore(frontend): remove inspector bridge tracking script from production`.
This **rewrites history** and needs a coordinated force-push to `main`. Only do
this on a dedicated branch with team sign-off — it is *not* performed by this
audit because the harmful code is already gone and the only gain is log
readability.

### Option C — Revert-style clean tree (already effectively done)
Ensure the tracker stays out of production. This has already happened in
`acf9983`; `frontend/index.html` is clean and a *safe* replacement
(`frontend/src/components/InspectorBridge.jsx`, an AI-command guard with no
external WebSocket and no cross-origin messaging) is in place. No further action
needed — keep this state and add a regression test/grep guard if desired.

### Cross-cutting guardrails
- Never ship debug/monitoring code in `index.html`; gate it behind
  `import.meta.env.DEV`.
- Never call `postMessage(payload, '*')`; always pass an explicit origin.
- Keep redacting secrets (no `keyPrefix`/partial-key echoes in API responses).

---

## 4. Decision needed from the team
1. Approve **Option A** (commit linting) — recommended, ship it.
2. Decide on **Option B** (history squash): accept the log churn, or schedule a
   coordinated rewrite. Default: leave history as-is.
3. No action required for the security finding — already remediated (Option C).
