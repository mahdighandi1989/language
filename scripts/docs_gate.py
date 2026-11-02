#!/usr/bin/env python3
"""Docs gate — makes the multi-agent documentation rules fail the ship.

Offline, no credentials, standard library only. Run from anywhere:

    python3 scripts/docs_gate.py

Exits 1 (listing every problem) when:
  1. an agent entry file is missing or does not point back to AGENTS.md;
  2. AGENTS.md does not name every command the verification entry point
     (scripts/ship.sh) actually runs — parsed from the script, not hard-coded;
  3. a path in the docs map (the '## ساختار' table in CLAUDE.md) does not resolve;
  4. the NEWEST entry of docs/WORKLOG.md (bottom of the file) has no signature;
  5. a file in experiences/ lacks the frontmatter required by experiences/README.md
     or names this project (lessons must be project-agnostic);
  6. FRESHNESS: code/config changed relative to origin/main but docs/WORKLOG.md or
     docs/handbook/PROGRESS.md did not change in the same change set;
  7. the owner's external-tool folders (prompt/, TO-DO/) were modified;
  8. the supervisor prompt is versioned (frontmatter version/supersedes/archive).

Warnings (printed, not fatal): the Stop hook is not registered in
.claude/settings.json (that file can only be written with the owner's approval).
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
problems: list[str] = []
warnings: list[str] = []


def fail(msg: str) -> None:
    problems.append(msg)


def read(rel: str) -> str | None:
    p = ROOT / rel
    return p.read_text(encoding="utf-8") if p.is_file() else None


def git(*args: str) -> list[str]:
    try:
        out = subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True, check=True).stdout
    except (OSError, subprocess.CalledProcessError):
        return []
    return [line for line in out.splitlines() if line.strip()]


# --- 1. entry files and cross-references -------------------------------------
ENTRY_FILES = {
    "AGENTS.md": None,
    "CLAUDE.md": "AGENTS.md",
    "GEMINI.md": "AGENTS.md",
    ".github/copilot-instructions.md": "AGENTS.md",
}
agents = read("AGENTS.md") or ""
for rel, must_mention in ENTRY_FILES.items():
    text = read(rel)
    if text is None:
        fail(f"[entry] missing agent entry file: {rel}")
    elif must_mention and must_mention not in text:
        fail(f"[entry] {rel} does not point to {must_mention}")
for rel in ("CLAUDE.md", "GEMINI.md", ".github/copilot-instructions.md"):
    if agents and rel not in agents:
        fail(f"[entry] AGENTS.md does not reference {rel}")

# --- 2. verification commands named in AGENTS.md ------------------------------
ship = read("scripts/ship.sh") or ""
commands: set[str] = set()
for line in ship.splitlines():
    code = line.split("#", 1)[0]
    if re.search(r"-m pytest\b", code):
        commands.add("pytest")
    for m in re.finditer(r"\bnpm (ci|test|run [\w:-]+)", code):
        commands.add(f"npm {m.group(1)}")
    for m in re.finditer(r"\bscripts/[\w.-]+\.(?:py|sh)\b", code):
        commands.add(m.group(0))
if not ship:
    fail("[verify] verification entry point scripts/ship.sh not found")
if ship and "--force" in ship.replace("--force-with-lease", ""):
    fail("[verify] scripts/ship.sh must never force-push")
for cmd in sorted(commands):
    if cmd not in agents:
        fail(f"[verify] AGENTS.md does not name the verification command `{cmd}` (run by scripts/ship.sh)")

# --- 3. docs map paths resolve -------------------------------------------------
tracked = git("ls-files", "--cached", "--others", "--exclude-standard")


def resolves(token: str) -> bool:
    tok = token.strip().rstrip("/")
    if not tok or any(c in tok for c in "*<>{} ") or tok.startswith(("http", "$")):
        return True  # globs, placeholders, commands: not paths to check
    if (ROOT / tok).exists():
        return True
    for f in tracked:
        if f == tok or f.endswith("/" + tok) or f.startswith(tok + "/") or ("/" + tok + "/") in ("/" + f):
            return True
    return False


claude = read("CLAUDE.md") or ""
section = re.search(r"^## ساختار\s*$(.*?)(?=^## )", claude, re.S | re.M)
if not section:
    fail("[map] docs map (the '## ساختار' table in CLAUDE.md) not found")
else:
    for row in section.group(1).splitlines():
        if not row.startswith("|") or set(row) <= set("|- "):
            continue
        cells = row.strip("|").split("|")
        if len(cells) < 2:
            continue
        for token in re.findall(r"`([^`]+)`", cells[1]):
            if not resolves(token):
                fail(f"[map] path in CLAUDE.md docs map does not resolve: {token}")

# --- 4. newest work-log entry is signed ----------------------------------------
worklog = read("docs/WORKLOG.md")
SIGNATURE = re.compile(r"^>\s*\*\*(?:امضا|Signed)[^*]*:\*\*\s*`[^`]+`\s*·\s*\d{4}-\d{2}-\d{2}\s*·\s*\S", re.M)
if worklog is None:
    fail("[log] docs/WORKLOG.md missing")
else:
    entries = re.split(r"^## ", worklog, flags=re.M)
    if len(entries) < 2:
        fail("[log] docs/WORKLOG.md has no entries")
    elif not SIGNATURE.search(entries[-1]):
        title = entries[-1].splitlines()[0][:80]
        fail(f"[log] newest WORKLOG entry is not signed: '## {title}' "
             "(needs '> **امضا:** `agent-id` · YYYY-MM-DD · how verified')")
for rel in ("docs/handbook/HANDBOOK.md", "docs/handbook/PROGRESS.md"):
    if read(rel) is None:
        fail(f"[handbook] {rel} missing")

# --- 5. experiences frontmatter -------------------------------------------------
REQUIRED = [
    "title", "tags", "topic_canonical", "source", "created_at", "updated_at",
    "merged_from", "resolution_status", "recurrence_count", "user_confirmed", "agents",
]
# Lessons are reusable elsewhere: they must not name this project.
PROJECT_NAMES = re.compile(r"lebanese|labaneseapp|language-k4q9|لهجهٔ? لبنانی", re.I)
exp_dir = ROOT / "experiences"
if not exp_dir.is_dir():
    fail("[lessons] experiences/ folder missing")
else:
    for f in sorted(exp_dir.glob("*.md")):
        if f.name == "README.md":
            continue
        text = f.read_text(encoding="utf-8")
        m = re.match(r"---\n(.*?)\n---\n", text, re.S)
        if not m:
            fail(f"[lessons] {f.name}: no YAML frontmatter")
            continue
        keys = set(re.findall(r"^([A-Za-z_]+):", m.group(1), re.M))
        for k in REQUIRED:
            if k not in keys:
                fail(f"[lessons] {f.name}: frontmatter missing '{k}'")
        if PROJECT_NAMES.search(text):
            fail(f"[lessons] {f.name}: names this project — lessons must be project-agnostic")

# --- 6/7. freshness and owner folders (relative to origin/main) ---------------
base = git("merge-base", "HEAD", "origin/main")
changed: set[str] = set()
if base:
    changed.update(git("diff", "--name-only", base[0], "HEAD"))
changed.update(git("diff", "--name-only", "HEAD"))
changed.update(git("ls-files", "--others", "--exclude-standard"))
DOC_ONLY = re.compile(r"^(docs/|experiences/|README\.md|TESTING\.md|AGENTS\.md|CLAUDE\.md|GEMINI\.md|\.github/copilot-instructions\.md)")
code_changed = sorted(p for p in changed if not DOC_ONLY.match(p) and not p.startswith(("prompt/", "TO-DO/")))
if code_changed:
    for rel in ("docs/WORKLOG.md", "docs/handbook/PROGRESS.md"):
        if rel not in changed:
            fail(f"[fresh] code changed ({', '.join(code_changed[:4])}{' …' if len(code_changed) > 4 else ''}) "
                 f"but {rel} was not updated in the same change")
touched_owner = sorted(p for p in changed if p.startswith(("prompt/", "TO-DO/")))
if touched_owner and base:
    # Changes that arrived from main itself (owner's own sync commits) are fine;
    # only our side of the diff counts.
    ours = set(git("diff", "--name-only", base[0], "HEAD")) | set(git("diff", "--name-only", "HEAD"))
    ours |= set(git("ls-files", "--others", "--exclude-standard"))
    bad = sorted(p for p in ours if p.startswith(("prompt/", "TO-DO/")))
    if bad:
        fail(f"[owner] prompt/ and TO-DO/ belong to the owner's external tool — do not modify: {', '.join(bad[:5])}")

# --- 8. supervisor prompt versioning --------------------------------------------
for rel in ("docs/supervisor/PROMPT.md", "docs/supervisor/URGENT_PROMPT.md"):
    text = read(rel)
    if text is None:
        continue
    fm = re.match(r"---\n(.*?)\n---\n", text, re.S)
    if not fm:
        fail(f"[supervisor] {rel}: no frontmatter")
        continue
    ver = re.search(r"^version:\s*(\d+)", fm.group(1), re.M)
    if not ver:
        fail(f"[supervisor] {rel}: frontmatter has no integer 'version'")
        continue
    if int(ver.group(1)) > 1:
        sup = re.search(r"^supersedes:\s*(\S+)", fm.group(1), re.M)
        if not sup or not (ROOT / sup.group(1)).is_file():
            fail(f"[supervisor] {rel}: version > 1 but 'supersedes' does not point to an archived file")
for rel in ("docs/supervisor/RUNLOG.md", "docs/supervisor/OPEN_ITEMS.md", "docs/supervisor/archive"):
    if (ROOT / "docs/supervisor/PROMPT.md").is_file() and not (ROOT / rel).exists():
        fail(f"[supervisor] {rel} missing")

# --- warnings --------------------------------------------------------------------
settings = read(".claude/settings.json")
try:
    hooks = json.loads(settings or "{}").get("hooks", {}).get("Stop")
except json.JSONDecodeError:
    hooks = None
if not hooks:
    warnings.append(".claude/settings.json does not register the Stop hook (.claude/hooks/ensure-shipped.sh); "
                    "the owner must approve copying docs/claude/settings.example.json there")

for w in warnings:
    print("  ⚠", w)
if problems:
    print(f"docs gate: {len(problems)} problem(s)")
    for p in problems:
        print("  ✗", p)
    sys.exit(1)
print("docs gate: OK")
