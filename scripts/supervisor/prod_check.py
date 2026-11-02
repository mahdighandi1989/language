#!/usr/bin/env python3
"""Read-only production inspection over HTTPS (GET only, plus the supervisor login).

    python3 scripts/supervisor/prod_check.py     # → docs/supervisor/last_prod_check.json; exit 0 · 1 findings · 3 could not look

A green /api/health proves nothing on its own; this also checks that the SPA is
served (and is the bundle of a build, not an error page), that protected routes
really refuse anonymous callers, that server-side auth is configured, that the
supervisor can sign in and whether the inspection store is durable, and the
Render deploy state (deploys.py).
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from client import SupervisorError, api, api_base, http  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "docs" / "supervisor" / "last_prod_check.json"


def main() -> None:
    findings: list[str] = []
    result: dict = {"checked_at": datetime.now(timezone.utc).isoformat()}
    try:
        base = api_base()
        result["base"] = base
        st, raw, headers = http(f"{base}/api/health")
        result["health"] = st
        if st != 200:
            findings.append(f"P1: /api/health → {st}")
        st, raw, headers = http(f"{base}/")
        html = raw.decode("utf8", "replace")
        result["spa"] = {"status": st, "has_root": 'id="root"' in html, "assets": re.findall(r'/assets/[\w.-]+\.js', html)[:3]}
        if st != 200 or 'id="root"' not in html:
            findings.append("P1: SPA سرو نمی‌شود")
        for h in ("content-security-policy", "strict-transport-security", "cross-origin-opener-policy"):
            if h not in {k.lower() for k in headers}:
                findings.append(f"P2: هدرِ {h} نیست")
        st, raw, _ = http(f"{base}/api/inspection")
        result["inspection_anon"] = st
        if st != 401:
            findings.append(f"P1: /api/inspection بی‌توکن {st} داد (باید ۴۰۱ باشد)")
        st, raw, _ = http(f"{base}/api/gemini/status", headers={"Authorization": "Bearer invalid"})
        result["gemini_status_bad_token"] = {"status": st, "body": raw[:200].decode("utf8", "replace")}
        if "پیکربندی نشده" in raw.decode("utf8", "replace"):
            findings.append("P1: احرازِ هویتِ سمتِ سرور پیکربندی نشده (FIREBASE_PROJECT_ID روی Render)")
        try:
            st, me = api("GET", "/api/inspection/me")
            result["supervisor"] = {"status": st, "store": (me or {}).get("store")}
            if st == 200 and not me["store"]["durable"]:
                findings.append(f"P1: ذخیره‌سازِ نظارت ماندگار نیست — {me['store']['note']}")
            st, q = api("GET", "/api/inspection/queue")
            result["queue"] = len((q or {}).get("sheets", [])) if st == 200 else st
        except SupervisorError as e:
            findings.append(f"P1: ورودِ ناظر: {e}")
        dep = subprocess.run([sys.executable, str(Path(__file__).with_name("deploys.py"))], capture_output=True, text=True)
        result["deploys_exit"] = dep.returncode
        if dep.returncode == 1:
            findings.append("دیپلوی: " + "؛ ".join(json.loads(dep.stdout or "{}").get("problems", [])))
        elif dep.returncode == 3:
            findings.append("P2: وضعیتِ دیپلوی دیده نشد: " + dep.stderr.strip()[:200])
    except SupervisorError as e:
        print(f"✗ {e}", file=sys.stderr)
        sys.exit(3)
    result["findings"] = findings
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf8")
    print(json.dumps(result, ensure_ascii=False, indent=2))
    sys.exit(1 if findings else 0)


if __name__ == "__main__":
    main()
