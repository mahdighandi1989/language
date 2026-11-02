#!/usr/bin/env python3
"""Is what runs on Render what `main` says? Read-only (Render API GETs).

    python3 scripts/supervisor/deploys.py          # exit 0 healthy · 1 a problem to act on · 3 could not look
    python3 scripts/supervisor/deploys.py --wait   # after a ship: wait (≤ 20 min) until the newest deploy ends

Problems: the newest deploy `build_failed`/`update_failed`/`pre_deploy_failed`/`canceled`
(without a replacing deploy); a deploy stuck «in progress» > 30 min; the live
commit is not `origin/main` while main carries code (not only prompt/, TO-DO/ or
`[skip render]` commits) for 20+ minutes. Writes docs/supervisor/last_deploys.json.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from client import SERVICE_ID, SupervisorError, render_get  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "docs" / "supervisor" / "last_deploys.json"
FAILED = {"build_failed", "update_failed", "pre_deploy_failed"}
RUNNING = {"created", "queued", "build_in_progress", "update_in_progress", "pre_deploy_in_progress"}


def t(s: str | None) -> datetime | None:
    return datetime.fromisoformat(s.replace("Z", "+00:00")) if s else None


def git(*args: str) -> str:
    try:
        return subprocess.run(["git", "-C", str(ROOT), *args], capture_output=True, text=True, timeout=60).stdout.strip()
    except (OSError, subprocess.SubprocessError):
        return ""


def check() -> tuple[int, dict]:
    deploys = [x["deploy"] for x in (render_get(f"/services/{SERVICE_ID}/deploys?limit=10") or [])]
    if not deploys:
        return 1, {"problem": "هیچ دیپلویی دیده نشد"}
    now = datetime.now(timezone.utc)
    newest = deploys[0]
    live = next((d for d in deploys if d["status"] == "live"), None)
    report = {
        "checked_at": now.isoformat(),
        "newest": {k: newest.get(k) for k in ("id", "status", "createdAt", "finishedAt")} | {"commit": (newest.get("commit") or {}).get("id", "")[:12]},
        "live_commit": ((live or {}).get("commit") or {}).get("id", "")[:12],
        "problems": [],
    }
    if newest["status"] in FAILED:
        report["problems"].append(f"P1: آخرین دیپلوی {newest['status']} — لاگِ build را بخوان و علت را رفع کن")
    if newest["status"] == "canceled":
        report["problems"].append("P2: آخرین دیپلوی لغو شد — اگر دیپلویِ تازه‌تری جایش نیامد، بررسی کن")
    if newest["status"] in RUNNING and t(newest.get("createdAt")) and (now - t(newest["createdAt"])).total_seconds() > 1800:
        report["problems"].append("P2: دیپلوی بیش از ۳۰ دقیقه در جریان است (گیر کرده؟)")
    git("fetch", "-q", "origin", "main")
    head = git("rev-parse", "origin/main")
    report["main_head"] = head[:12]
    live_full = ((live or {}).get("commit") or {}).get("id", "")
    if head and live_full and not head.startswith(live_full[:12]):
        code_commits = git("log", "--format=%H %ct %B%x00", f"{live_full}..origin/main", "--", ".", ":!prompt", ":!TO-DO")
        pending = [c for c in code_commits.split("\x00") if c.strip() and "[skip render]" not in c]
        if pending:
            oldest = min(int(c.split()[1]) for c in pending)
            age_min = (now.timestamp() - oldest) / 60
            report["undeployed_code_commits"] = len(pending)
            if age_min > 20 and newest["status"] not in RUNNING:
                report["problems"].append(f"P2: {len(pending)} کامیتِ کدیِ main پس از {age_min:.0f} دقیقه هنوز live نیست")
    return (1 if report["problems"] else 0), report


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--wait", action="store_true")
    args = p.parse_args()
    try:
        deadline = time.time() + 20 * 60
        while True:
            code, report = check()
            status = report.get("newest", {}).get("status")
            if not args.wait or status not in RUNNING or time.time() > deadline:
                break
            print(f"… دیپلوی در جریان است ({status})", flush=True)
            time.sleep(20)
    except SupervisorError as e:
        print(f"✗ {e}", file=sys.stderr)
        sys.exit(3)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    sys.exit(code)


if __name__ == "__main__":
    main()
