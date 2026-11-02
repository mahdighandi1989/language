#!/usr/bin/env python3
"""Shared HTTP client for the supervisor's tools — WHERE production is and HOW the
supervisor signs in, resolved without anything written in the repo.

Resolution order (first that works wins):
1. Environment: ``LANG_SUPERVISOR_API_BASE`` (e.g. ``http://localhost:3001``) and
   ``LANG_SUPERVISOR_PASSWORD`` (or ``LANG_SUPERVISOR_TOKEN``).
2. Render API: the ``language`` service's public URL and its own env var
   ``SUPERVISOR_PASSWORD``, read through api.render.com (the Claude environment's
   proxy authenticates that host; ``RENDER_API_KEY`` is used if set). The secret
   lives ONLY on Render; it is held in memory here, never printed or written.

Every failure says WHAT to fix; callers exit 3 — «could not look» must never look
like «looked and found nothing». Standard library only.
"""
from __future__ import annotations

import json
import os
import urllib.error
import urllib.parse
import urllib.request

RENDER_API = "https://api.render.com/v1"
#: the «language» web service on Render (a service id is not a secret)
SERVICE_ID = os.getenv("LANG_RENDER_SERVICE_ID", "srv-d5mhvkh4tr6s73clvkog")
TIMEOUT = float(os.getenv("LANG_SUPERVISOR_TIMEOUT", "120"))


class SupervisorError(RuntimeError):
    """Carries WHAT to fix, not just that something failed."""


def http(url: str, *, data: bytes | None = None, headers: dict | None = None, method: str = "GET",
         timeout: float = TIMEOUT) -> tuple[int, bytes, dict]:
    req = urllib.request.Request(url, data=data, headers=headers or {}, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, r.read(), dict(r.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read(), dict(e.headers or {})
    except (urllib.error.URLError, TimeoutError, OSError) as e:
        raise SupervisorError(f"به «{url.split('?')[0]}» نرسیدم ({getattr(e, 'reason', e)}) — شبکهٔ محیط یا سرور") from e


def render_get(path: str):
    headers = {"Accept": "application/json"}
    if os.getenv("RENDER_API_KEY"):
        headers["Authorization"] = f"Bearer {os.environ['RENDER_API_KEY']}"
    st, raw, _ = http(f"{RENDER_API}{path}", headers=headers)
    if st in (401, 403):
        raise SupervisorError(f"Render API پاسخِ HTTP {st} داد برای {path}: محیطِ این اجرا دسترسیِ api.render.com ندارد "
                              "(در تنظیماتِ روتین محیطی را بگذار که Render را احراز می‌کند).")
    if st != 200:
        raise SupervisorError(f"Render API پاسخِ HTTP {st} داد برای {path}")
    return json.loads(raw or b"null")


def _render_env(key: str) -> str | None:
    st_data = render_get(f"/services/{SERVICE_ID}/env-vars?limit=100") or []
    for row in st_data:
        ev = row.get("envVar") or {}
        if ev.get("key") == key:
            return ev.get("value") or None
    return None


def api_base() -> str:
    base = os.getenv("LANG_SUPERVISOR_API_BASE")
    if base:
        return base.rstrip("/")
    svc = render_get(f"/services/{SERVICE_ID}")
    url = ((svc or {}).get("serviceDetails") or {}).get("url")
    if not url:
        raise SupervisorError("آدرسِ سرویسِ language از Render خوانده نشد")
    return url.rstrip("/")


_token: str | None = None


def token() -> str:
    global _token
    if _token:
        return _token
    if os.getenv("LANG_SUPERVISOR_TOKEN"):
        _token = os.environ["LANG_SUPERVISOR_TOKEN"]
        return _token
    password = os.getenv("LANG_SUPERVISOR_PASSWORD") or _render_env("SUPERVISOR_PASSWORD")
    if not password:
        raise SupervisorError("SUPERVISOR_PASSWORD روی سرویسِ language در Render تنظیم نشده — بدونِ آن ناظر وارد نمی‌شود")
    st, raw, _ = http(f"{api_base()}/api/inspection/auth/supervisor", method="POST",
                      data=json.dumps({"password": password}).encode(), headers={"Content-Type": "application/json"})
    if st != 200:
        raise SupervisorError(f"ورودِ ناظر ناموفق (HTTP {st}): {raw[:300].decode('utf8', 'replace')}")
    _token = json.loads(raw)["token"]
    return _token


def api(method: str, path: str, body=None, *, raw: bool = False, form: tuple[bytes, str] | None = None):
    """Call the inspection API as the supervisor. Returns (status, json|bytes)."""
    headers = {"Authorization": f"Bearer {token()}"}
    data = None
    if form is not None:
        data, ctype = form
        headers["Content-Type"] = ctype
    elif body is not None:
        data = json.dumps(body).encode()
        headers["Content-Type"] = "application/json"
    st, payload, _ = http(f"{api_base()}{path}", data=data, headers=headers, method=method)
    if raw:
        return st, payload
    try:
        return st, json.loads(payload or b"null")
    except json.JSONDecodeError:
        return st, {"error": payload[:300].decode("utf8", "replace")}
