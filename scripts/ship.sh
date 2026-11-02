#!/usr/bin/env bash
# Ship the current work: verify ⇒ commit ⇒ push the working branch ⇒ merge into
# main ⇒ push main. Render auto-deploys `main` (service «language»), so a
# successful run = deployed.
#
#   scripts/ship.sh "type(scope): summary"            # one-line message
#   scripts/ship.sh "$(cat /path/to/commit-message)"  # multi-line (trailers)
#
# Refuses to ship when any check fails. NEVER force-pushes, NEVER disables or
# skips a test, NEVER rewrites history. Network operations retry 4 times with
# exponential backoff (2s, 4s, 8s, 16s).
set -euo pipefail

MSG="${1:-}"
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

say() { printf '\n\033[1;36m== %s\033[0m\n' "$*"; }
die() { echo "❌ $*"; exit 1; }
retry() { # network ops: 4 retries with exponential backoff (2s, 4s, 8s, 16s)
  local n=0 delay=2
  until "$@"; do
    n=$((n + 1)); [ "$n" -ge 5 ] && return 1
    echo "retrying in ${delay}s…"; sleep "$delay"; delay=$((delay * 2))
  done
}

# A commit message carrying a Render skip marker is committed but NEVER
# deployed — 159 commits sat undeployed that way (experiences/
# render-skip-marker-hides-undeployed-work.md). Shipping means deploying.
if printf '%s' "$MSG" | grep -qiE '\[(skip render|render skip|skip ci|ci skip)\]'; then
  die "the message contains a deploy-skip marker — ship.sh always deploys; remove it"
fi

# --- 1. checks -------------------------------------------------------------
say "Source files hidden by .gitignore"
hidden="$(git ls-files --others --ignored --exclude-standard -- \
    frontend/src frontend/index.html frontend/public backend docs scripts experiences tests firestore.rules render.yaml \
  | grep -v -E '(node_modules/|__pycache__|\.pyc$|\.pytest_cache|^backend/data/|^backend/\.env$|^frontend/dist/|^docs/supervisor/inspection/(QUEUE|URGENT)\.md|^docs/supervisor/inspection/(shots|files)/|^docs/supervisor/last_[a-z_]+\.json)' || true)"
if [ -n "$hidden" ]; then
  echo "$hidden"
  die "these source files exist locally but are ignored by .gitignore — they would be missing on Render. Fix .gitignore."
fi

say "Docs gate"
python3 scripts/docs_gate.py || die "docs gate failed — not shipping"

say "Install (only when node_modules is missing)"
[ -d node_modules ] || retry npm ci --no-audit --no-fund

say "Backend unit tests (node --test)"
(cd backend && npm run test:node >/tmp/ship-node-test.log 2>&1) \
  || { tail -40 /tmp/ship-node-test.log; die "backend node tests failed — not shipping"; }

say "Backend pytest"
(cd backend && python3 -m pytest -q -p no:cacheprovider) || die "backend pytest failed — not shipping"

say "Repo pytest (boots the real server)"
python3 -m pytest -q -p no:cacheprovider || die "repo pytest failed — not shipping"

say "Frontend unit tests (vitest)"
(cd frontend && npm test >/tmp/ship-frontend-test.log 2>&1) \
  || { tail -40 /tmp/ship-frontend-test.log; die "frontend unit tests failed — not shipping"; }

say "Frontend build"
(npm run build >/tmp/ship-frontend-build.log 2>&1) \
  || { tail -40 /tmp/ship-frontend-build.log; die "frontend build failed — not shipping"; }

# --- 2. commit ---------------------------------------------------------------
BRANCH="$(git branch --show-current)"
[ -n "$BRANCH" ] || die "detached HEAD — check out a branch first"
if [ -n "$(git status --porcelain)" ]; then
  [ -n "$MSG" ] || die "uncommitted changes: pass a commit message"
  say "Commit"
  git add -A
  git commit -q -m "$MSG"
fi

# --- 3. push working branch --------------------------------------------------
if [ "$BRANCH" != "main" ]; then
  say "Push $BRANCH"
  retry git push -q -u origin "$BRANCH" || die "push of $BRANCH failed (see the error above)"
fi

# --- 4. merge into main and push (deploy) ------------------------------------
say "Merge into main"
retry git fetch -q origin main || die "fetch of main failed"
if ! git merge-base --is-ancestor origin/main HEAD; then
  echo "main has moved — merging origin/main into $BRANCH first"
  git merge -q --no-edit origin/main || die "merge conflict with main — resolve it, then re-run"
  (cd backend && npm run test:node >/tmp/ship-node-test.log 2>&1) || { tail -40 /tmp/ship-node-test.log; die "tests failed after merging main"; }
  python3 -m pytest -q -p no:cacheprovider || die "tests failed after merging main"
  if [ "$BRANCH" != "main" ]; then retry git push -q origin "$BRANCH" || die "push of $BRANCH failed"; fi
fi
retry git push -q origin HEAD:main || die "push to main failed (see the error above) — never force-push; report it"
say "Shipped $(git rev-parse --short HEAD) to main — Render (service «language») will deploy it"
echo "Next: verify the deploy itself, not just /api/health:  python3 scripts/supervisor/deploys.py --wait"
