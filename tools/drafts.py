#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
drafts.py — kelola draft pendek dari terminal (dipakai juga saat update via chat).

  # lihat semua draft + statusnya
  python3 tools/drafts.py list

  # draft baru dari file beat (satu beat per baris, tanda '-' di depan boleh)
  python3 tools/drafts.py add --title "Sirin smol and Cookie" \
      --series "Cha Sirin smol" --lane cha_sirin_cookie_01 \
      --setting "Rumah Sirin (kamar mandi, sofa, meja)" \
      --tags "sirin,smol,komedi" --format 9:16 --duration 15 \
      --date 2026-10-25 --beats-file beat.txt

  # beat dari chat: tempel langsung lewat stdin
  python3 tools/drafts.py add --title "Sirin smol and X" --beats-file -

  # pindah status: draft -> ongoing -> done
  python3 tools/drafts.py status sirin-smol-cookie ongoing

  # ubah metadata / tambah beat
  python3 tools/drafts.py edit sirin-smol-cookie --duration 20 --tags "sirin,smol"
  python3 tools/drafts.py beat sirin-smol-cookie "sirin lalu menutup pintu"

Setiap perintah langsung membangun ulang index.json + data/ (build_index.py).
"""
from __future__ import annotations

import argparse
import re
import subprocess
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DRAFTS_DIR = ROOT / "drafts"
sys.path.insert(0, str(ROOT / "tools"))

STATUSES = ("draft", "ongoing", "done")
TEXT_KEYS = ("title", "status", "date", "updated", "series", "lane", "format", "setting", "logline", "source")
LIST_KEYS = ("characters", "tags")


def slugify(text: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return re.sub(r"-{2,}", "-", s) or "draft-baru"


def q(v) -> str:
    """Nilai YAML yang aman: selalu dikutip, tanda kutip dalam teks diganti apostrof."""
    return '"' + str(v).replace('"', "'").replace("\n", " ").strip() + '"'


def frontmatter(meta: dict) -> str:
    lines = ["---"]
    for k in TEXT_KEYS:
        if k in meta and meta[k] not in (None, ""):
            lines.append(f"{k}: {q(meta[k])}")
    if meta.get("duration") not in (None, "", "null"):
        lines.append(f"duration: {int(meta['duration'])}")
    for k in LIST_KEYS:
        vals = [v for v in meta.get(k, []) if v]
        if vals:
            lines.append(f"{k}: [{', '.join(vals)}]")
    lines.append("---")
    return "\n".join(lines)


def to_list(v) -> list:
    if v is None:
        return []
    if isinstance(v, (list, tuple)):
        return [str(x).strip() for x in v if str(x).strip()]
    return [p.strip() for p in re.split(r"[,\n]", str(v)) if p.strip()]


def read_beats(src: str) -> list:
    raw = sys.stdin.read() if src == "-" else Path(src).read_text(encoding="utf-8")
    beats = []
    for line in raw.replace("\r\n", "\n").split("\n"):
        t = re.sub(r"^\s*(?:[-*•]|\d+[.)])\s+", "", line).strip()
        if t:
            beats.append(t)
    return beats


def write_draft(slug: str, meta: dict, beats: list, notes: str | None = None) -> Path:
    folder = DRAFTS_DIR / slug
    folder.mkdir(parents=True, exist_ok=True)
    body = frontmatter(meta) + "\n\n" + "\n".join("- " + b for b in beats) + "\n"
    (folder / "draft.md").write_text(body, encoding="utf-8")
    if notes is not None:
        (folder / "notes.md").write_text(notes.strip() + "\n", encoding="utf-8")
    return folder / "draft.md"


def rebuild() -> int:
    r = subprocess.run([sys.executable, str(ROOT / "tools" / "build_index.py")], cwd=ROOT)
    return r.returncode


def load_meta(slug: str) -> tuple:
    """Baca frontmatter + beat dari draft.md yang ada."""
    import build_index as bi  # noqa: PLC0415

    path = DRAFTS_DIR / slug / "draft.md"
    if not path.exists():
        sys.exit(f"draft `{slug}` tidak ada di {DRAFTS_DIR.relative_to(ROOT)}/")
    meta, body = bi.split_front(path.read_text(encoding="utf-8"))
    beats = [b["text"] for b in bi.beats_from(body)]
    return (meta or {}), beats


def cmd_list(args) -> int:
    import build_index as bi  # noqa: PLC0415

    files = sorted(DRAFTS_DIR.glob("*/draft.md"))
    if not files:
        print("belum ada draft")
        return 0
    entries = [bi.build_entry(p) for p in files]
    order = {s: i for i, s in enumerate(bi.STATUSES)}
    entries.sort(key=lambda e: (order.get(e["status"], 9), e["slug"]))
    for e in entries:
        icon = {"draft": "📝", "ongoing": "🔧", "done": "✅"}.get(e["status"], "•")
        print(f"{icon} {e['status']:<8} {e['slug']:<24} {e['beats_count']:>2} beat  "
              f"{e['ready']}/{e['ready_total']} meta  {e['title']}")
    return 0


def cmd_add(args) -> int:
    slug = args.slug or slugify(args.title)
    if (DRAFTS_DIR / slug).exists():
        sys.exit(f"folder drafts/{slug} sudah ada — pakai `edit` kalau mau mengubah")
    beats = read_beats(args.beats_file) if args.beats_file else []
    if not beats:
        sys.exit("beat kosong: isi --beats-file (atau `-` buat baca stdin)")
    today = date.today().isoformat()
    meta = {
        "title": args.title,
        "status": args.status,
        "date": args.date or today,
        "updated": args.date or today,
        "series": args.series,
        "lane": args.lane,
        "format": args.format,
        "duration": args.duration,
        "setting": args.setting,
        "logline": args.logline,
        "source": args.source,
        "characters": to_list(args.characters),
        "tags": to_list(args.tags),
    }
    p = write_draft(slug, meta, beats)
    notes = None
    if args.notes_file:
        notes = Path(args.notes_file).read_text(encoding="utf-8") if args.notes_file != "-" else sys.stdin.read()
    elif args.notes:
        notes = args.notes
    if notes is not None:
        write_draft(slug, meta, beats, notes=notes)
    print(f"dibuat: {p.relative_to(ROOT)} ({len(beats)} beat)")
    return rebuild()


def cmd_status(args) -> int:
    if args.status not in STATUSES:
        sys.exit(f"status harus salah satu dari: {', '.join(STATUSES)}")
    meta, beats = load_meta(args.slug)
    meta["status"] = args.status
    meta["updated"] = date.today().isoformat()
    write_draft(args.slug, meta, beats)
    print(f"drafts/{args.slug}: status → {args.status}")
    return rebuild()


def cmd_edit(args) -> int:
    meta, beats = load_meta(args.slug)
    changed = []
    for key in TEXT_KEYS + ("duration",):
        val = getattr(args, key.replace("-", "_"), None)
        if val in (None, ""):
            continue
        if val == "-":  # kosongkan field (mis. durasi yang belum pasti)
            meta[key] = ""
            changed.append(key + " (dikosongkan)")
            continue
        meta[key] = val
        changed.append(key)
    for key in LIST_KEYS:
        val = getattr(args, key, None)
        if val:
            meta[key] = to_list(val)
            changed.append(key)
    if args.new_beats_file:
        beats = read_beats(args.new_beats_file)
        changed.append("beats")
    if not changed:
        sys.exit("tidak ada yang diubah (lihat --help)")
    meta["updated"] = date.today().isoformat()
    write_draft(args.slug, meta, beats)
    print(f"drafts/{args.slug}: diperbarui → {', '.join(changed)}")
    return rebuild()


def cmd_beat(args) -> int:
    meta, beats = load_meta(args.slug)
    if args.remove:
        n = int(args.text)
        if not 1 <= n <= len(beats):
            sys.exit(f"nomor beat {n} di luar 1..{len(beats)}")
        removed = beats.pop(n - 1)
        print(f"drafts/{args.slug}: beat {n} dihapus → {removed}")
    elif args.insert is not None:
        n = int(args.insert)
        beats.insert(max(0, min(n - 1, len(beats))), args.text)
        print(f"drafts/{args.slug}: beat disisipkan di posisi {n}")
    else:
        beats.append(args.text)
        print(f"drafts/{args.slug}: beat {len(beats)} ditambah")
    meta["updated"] = date.today().isoformat()
    write_draft(args.slug, meta, beats)
    return rebuild()


def main() -> int:
    ap = argparse.ArgumentParser(description="kelola draft pendek")
    sub = ap.add_subparsers(dest="cmd", required=True)

    sub.add_parser("list", help="daftar semua draft").set_defaults(func=cmd_list)

    a = sub.add_parser("add", help="draft baru")
    a.add_argument("--title", required=True)
    a.add_argument("--slug")
    a.add_argument("--status", default="draft", choices=STATUSES)
    a.add_argument("--date")
    a.add_argument("--series", default="")
    a.add_argument("--lane", default="")
    a.add_argument("--format", default="9:16")
    a.add_argument("--duration", default=None)
    a.add_argument("--setting", default="")
    a.add_argument("--logline", default="")
    a.add_argument("--source", default="")
    a.add_argument("--characters", default="")
    a.add_argument("--tags", default="")
    a.add_argument("--beats-file", required=True, help="file berisi beat (satu per baris) atau `-` untuk stdin")
    a.add_argument("--notes-file")
    a.add_argument("--notes")
    a.set_defaults(func=cmd_add)

    s = sub.add_parser("status", help="ubah status draft")
    s.add_argument("slug")
    s.add_argument("status")
    s.set_defaults(func=cmd_status)

    e = sub.add_parser("edit", help="ubah metadata / ganti daftar beat")
    e.add_argument("slug")
    for key in TEXT_KEYS + ("duration",):
        if key == "status":
            e.add_argument("--status", choices=STATUSES)
        else:
            e.add_argument("--" + key)
    e.add_argument("--characters")
    e.add_argument("--tags")
    e.add_argument("--new-beats-file")
    e.set_defaults(func=cmd_edit)

    b = sub.add_parser("beat", help="tambah / sisipkan / hapus beat")
    b.add_argument("slug")
    b.add_argument("text", help="teks beat, atau nomor beat kalau pakai --remove")
    b.add_argument("--insert", type=int, help="sisipkan di posisi N (1 = paling atas)")
    b.add_argument("--remove", action="store_true", help="hapus beat nomor <text>")
    b.set_defaults(func=cmd_beat)

    args = ap.parse_args()
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
