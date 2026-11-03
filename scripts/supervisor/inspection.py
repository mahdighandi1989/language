#!/usr/bin/env python3
"""The supervisor's tool for «نظارت و سرکشی». Standard library only.

    python3 scripts/supervisor/inspection.py whoami   # can the supervisor sign in? (exit 3 = no)
    python3 scripts/supervisor/inspection.py file     # owner-ticked sheets → binders (every round)
    python3 scripts/supervisor/inspection.py pull     # QUEUE.md + shots/ + files/ (full text) — exit 4 = owed sheets
    python3 scripts/supervisor/inspection.py urgent   # claim ONE urgent sheet → URGENT.md (0 empty · 5 claimed · 3 error)
    python3 scripts/supervisor/inspection.py answer N --outcome fixed|partial|not-done|needs-owner \\
        --text-file answer.md --dep 'API=ok' --dep 'Firestore=risk:قوانین منتشر نشده' \\
        [--after after.png] [--commit abc1234] [--place "…"] [--no-change-reason "…"]

There is deliberately NO approve and NO delete command: the tick is the owner's,
and nothing is ever deleted. The server refuses them for this account anyway.
"""
from __future__ import annotations

import argparse
import base64
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from client import SupervisorError, api  # noqa: E402
from inspection_view import look_notes, needs_bytes  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
WORK = ROOT / "docs" / "supervisor" / "inspection"


def die(msg: str, code: int = 3) -> None:
    print(f"✗ {msg}", file=sys.stderr)
    sys.exit(code)


def ok(st: int, body, what: str):
    if st >= 400:
        die(f"{what}: HTTP {st} — {body.get('error') if isinstance(body, dict) else body}")
    return body


def read_all_files(sheet: dict) -> list[str]:
    """Read every attachment COMPLETELY (contiguous slices) and save it; open the raw bytes."""
    lines = []
    fdir = WORK / "files" / str(sheet["number"])
    fdir.mkdir(parents=True, exist_ok=True)
    for f in sheet.get("files", []):
        st, raw = api("GET", f"/api/inspection/files/{f['id']}/raw", raw=True)
        saved = fdir / f"{f['id']}-{Path(f['filename']).name}"
        look: list[str] = []
        if st == 200:
            saved.write_bytes(raw)
            # What else there is to SEE (images → PNG, zip → unpacked, video → frames, PDF → every page).
            try:
                look, _better = look_notes(saved, f["filename"], f["extractStatus"],
                                           lambda p: str(p.relative_to(WORK)) if str(p).startswith(str(WORK)) else str(p))
            except Exception as exc:  # noqa: BLE001 — a viewer failure is reported, never silent
                look = [f"آماده‌سازیِ دیدنی‌ها ناموفق بود: {type(exc).__name__}"]
        elif needs_bytes(f["filename"]):
            look = [f"⚠ بایت‌های فایل دریافت نشد (HTTP {st}) — این فایل باید دیده هم بشود"]
        if f["extractStatus"] == "ok":
            offset, chunks = 0, []
            while True:
                st, part = api("GET", f"/api/inspection/files/{f['id']}/text?offset={offset}")
                ok(st, part, f"خواندنِ متنِ {f['filename']}")
                chunks.append(part["text"])
                offset = part["end"]
                if part["done"]:
                    break
            text = "".join(chunks)
            (fdir / f"{f['id']}.txt").write_text(text, encoding="utf8")
            lines.append(f"  - 📎 {f['filename']} — متنِ کامل ({len(text)} نویسه): files/{sheet['number']}/{f['id']}.txt"
                         + (" — **بریده؛ خودِ فایل را هم ببین**" if f.get("textTruncated") else ""))
        else:
            lines.append(f"  - 📎 {f['filename']} — {f['extractStatus']}: {f.get('extractNote') or f.get('extractLabel')} "
                         f"→ خودِ فایل: files/{sheet['number']}/{f['id']}-{Path(f['filename']).name}")
        if f.get("caption"):
            lines.append(f"    توضیحِ مالک: {f['caption']}")
        for note in look:
            lines.append(f"    👁 {note}")
    return lines


def save_shot(shot_id: str | None, sheet_no: int) -> str:
    if not shot_id:
        return ""
    st, raw = api("GET", f"/api/inspection/shots/{shot_id}", raw=True)
    if st != 200:
        return f"(تصویر {shot_id} دریافت نشد: HTTP {st})"
    d = WORK / "shots"
    d.mkdir(parents=True, exist_ok=True)
    p = d / f"{sheet_no}-{shot_id}.png"
    p.write_bytes(raw)
    return f"shots/{p.name}"


def render_sheet(s: dict) -> str:
    out = [f"## برگهٔ {s['number']} — {s['title']}",
           f"- وضعیت: {s['status']} ({s['statusLabel']}) · رنگ: {s['glow'].get('label')}",
           f"- صفحه: {s.get('pageLabel') or s.get('page')} · بازگشت: `{s.get('reopen') or '—'}`",
           f"- ثبت: {s.get('createdBy')} · {s.get('createdAt')}"]
    g = s.get("geometry") or {}
    if g.get("anchor"):
        a = g["anchor"]
        out.append(f"- گره: `{a['selector']}` · جای کادر داخلِ گره (کسر از لبهٔ چپ/بالا): x={a['fx']} y={a['fy']} w={a['fw']} h={a['fh']}")
    if g.get("doc"):
        out.append(f"- مختصاتِ سند: {g['doc']} · پنجره: {g.get('viewport')} · dpr: {g.get('dpr')}")
    if s.get("domPath"):
        out.append(f"- عنصر: `{s['domPath']}`")
    if s.get("coveredText"):
        out.append(f"- متنِ زیرِ کادر: «{s['coveredText'][:400]}»")
    if s.get("urgentAt") and not s.get("urgentDoneAt"):
        out.append("- ⚡ **فوری**")
    out.append("\n### گفت‌وگو")
    for n in s.get("notes", []):
        who = {"owner": "مالک", "user": "کاربر", "reviewer": "ناظر"}.get(n["by"], n["by"])
        head = f"**{who}** · {n['at']}" + (f" · نتیجه: `{n['outcome']}`" if n.get("outcome") else "")
        out.append(f"- {head}\n\n  " + n["text"].replace("\n", "\n  "))
        if n.get("geometry"):
            out.append(f"  - کادرِ همین یادداشت (جای تازه): {json.dumps(n['geometry'], ensure_ascii=False)}")
        for label, key in (("تصویرِ پیوست", "shotId"), ("تصویرِ بعد", "afterShotId")):
            p = save_shot(n.get(key), s["number"])
            if p:
                out.append(f"  - {label}: {p} ← **بازش کن و نگاه کن**")
    files = read_all_files(s)
    if files:
        out.append("\n### پیوست‌ها (همه کامل خوانده شد؛ متن را بخوان)")
        out.extend(files)
    return "\n".join(out)


def cmd_whoami(_args) -> None:
    st, me = api("GET", "/api/inspection/me")
    ok(st, me, "whoami")
    print(json.dumps(me, ensure_ascii=False, indent=2))
    if not me.get("store", {}).get("durable"):
        print("⚠ ذخیره‌سازِ نظارت ماندگار نیست:", me["store"].get("note"))


def cmd_file(_args) -> None:
    st, body = api("POST", "/api/inspection/file-approved")
    ok(st, body, "بایگانی")
    print(f"بایگانی شد: {len(body['filed'])} برگه", json.dumps(body["filed"], ensure_ascii=False))


def cmd_pull(_args) -> None:
    st, body = api("GET", "/api/inspection/queue")
    ok(st, body, "کارتابل")
    WORK.mkdir(parents=True, exist_ok=True)
    sheets = body["sheets"]
    urgent = [s for s in sheets if s.get("urgentAt") and not s.get("urgentDoneAt")]
    ordered = urgent + [s for s in sheets if s not in urgent]
    doc = [f"# کارتابلِ ناظر — {len(sheets)} برگه", f"ذخیره‌ساز: {body['store']}", ""]
    doc += [render_sheet(s) + "\n" for s in ordered]
    (WORK / "QUEUE.md").write_text("\n".join(doc), encoding="utf8")
    print(f"{len(sheets)} برگه → {WORK / 'QUEUE.md'}")
    sys.exit(4 if sheets else 0)


def cmd_urgent(args) -> None:
    st, body = api("POST", "/api/inspection/urgent/claim", {"runId": args.run_id})
    ok(st, body, "صفِ فوری")
    s = body.get("sheet")
    if not s:
        print("صفِ فوری خالی است")
        sys.exit(0)
    WORK.mkdir(parents=True, exist_ok=True)
    (WORK / "URGENT.md").write_text(render_sheet(s), encoding="utf8")
    print(f"برگهٔ فوریِ {s['number']} برداشته شد → {WORK / 'URGENT.md'}")
    sys.exit(5)


def parse_dep(raw: str) -> dict:
    name, _, rest = raw.partition("=")
    status, _, note = rest.partition(":")
    if status not in ("ok", "missing", "risk") or not name.strip():
        die(f"وابستگیِ نامعتبر: {raw!r} (قالب: 'نام=ok|missing|risk[:توضیح]')")
    return {"name": name.strip(), "status": status, "note": note.strip()}


def cmd_answer(args) -> None:
    text = Path(args.text_file).read_text(encoding="utf8") if args.text_file else (args.text or "")
    if not text.strip():
        die("متنِ جواب خالی است (--text-file یا --text)")
    body = {"text": text, "outcome": args.outcome, "deps": [parse_dep(d) for d in args.dep],
            "commits": args.commit, "place": args.place or "", "noChangeReason": args.no_change_reason or ""}
    if args.after:
        data = Path(args.after).read_bytes()
        mime = "image/jpeg" if args.after.lower().endswith((".jpg", ".jpeg")) else "image/png"
        body["afterShot"] = f"data:{mime};base64,{base64.b64encode(data).decode()}"
    st, res = api("POST", f"/api/inspection/{args.number}/notes", body)
    ok(st, res, f"جواب به برگهٔ {args.number}")
    print(f"برگهٔ {args.number}: {res['sheet']['glow']['label']}")


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("whoami")
    sub.add_parser("file")
    sub.add_parser("pull")
    u = sub.add_parser("urgent")
    u.add_argument("--run-id", default="urgent-routine")
    a = sub.add_parser("answer")
    a.add_argument("number")
    a.add_argument("--outcome", required=True, choices=["fixed", "partial", "not-done", "needs-owner"])
    a.add_argument("--text-file")
    a.add_argument("--text")
    a.add_argument("--after", help="تصویرِ بعد (برای fixed الزامی)")
    a.add_argument("--dep", action="append", default=[], help="'نام=ok|missing|risk[:توضیح]' (حداقل یکی)")
    a.add_argument("--commit", action="append", default=[])
    a.add_argument("--place")
    a.add_argument("--no-change-reason")
    args = p.parse_args()
    try:
        {"whoami": cmd_whoami, "file": cmd_file, "pull": cmd_pull, "urgent": cmd_urgent, "answer": cmd_answer}[args.cmd](args)
    except SupervisorError as e:
        die(str(e))


if __name__ == "__main__":
    main()
