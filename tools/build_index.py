#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_index.py — scan drafts/**/draft.md → index.json (sumber data web) + data/<slug>.json.

Satu draft pendek = satu folder:

  drafts/<slug>/draft.md    ← frontmatter + daftar beat (satu beat per baris list)
  drafts/<slug>/notes.md    ← opsional: catatan produksi (referensi, aset, keputusan)

Frontmatter yang dibaca (key lain ikut diteruskan apa adanya):
  title, status (draft|ongoing|done), date, updated, series, lane, format,
  duration, setting, characters, tags, logline, source

Yang dihitung dari isi (jangan ditulis manual):
  beats        daftar beat + jumlahnya (butir list di body)
  camera_beats beat yang isinya arahan kamera/POV (heuristik kata kunci)
  checks       kelengkapan metadata (dipakai panel "Kesiapan")

Pakai:
  python3 tools/build_index.py            # tulis index.json + data/*.json
  python3 tools/build_index.py --check    # exit 1 kalau ada MASALAH SKEMA
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path

try:
    import yaml
except ImportError:  # pragma: no cover
    sys.exit("PyYAML wajib: python3 -m pip install -r requirements.txt")

ROOT = Path(__file__).resolve().parent.parent
DRAFTS_DIR = ROOT / "drafts"
OUT = ROOT / "index.json"
DATA_DIR = ROOT / "data"
REPO = "paimonchan/short-draft"

STATUSES = ("draft", "ongoing", "done")
STATUS_HINT = {
    "draft": "ide masuk, belum digarap",
    "ongoing": "lagi digarap",
    "done": "sudah selesai",
}

BEAT_RE = re.compile(r"^\s*(?:[-*•]|\d+[.)])\s+(.*)$")
HEADING_RE = re.compile(r"^#{1,6}\s+")
# arahan kamera: heuristik kata kunci, bukan penilaian mutu.
CAMERA_RE = re.compile(
    r"\bpov\b|\bkamera\b|\bcamera\b|\bzoom\b|close[- ]?up|zoom ?in|\bputar|berputar|"
    r"\bsudut\b|\bangle\b|\bframe\b|\bshot\b|ortogonal|\bdolly\b|\bpan\b|\btrack\b|"
    r"mendekat|menjauh|menyamping|overhead|bird ?eye|tilt",
    re.I,
)

# id, label, catatan singkat
CHECKS = (
    ("title", "Judul terisi", "judul yang muncul di papan"),
    ("status", "Status valid", "draft / ongoing / done"),
    ("beats", "Minimal 3 beat", "satu beat ≈ satu aksi di depan kamera"),
    ("camera", "Ada arahan kamera/POV", "biar bisa dipetakan jadi shot"),
    ("setting", "Setting terisi", "tempat kejadian"),
    ("tags", "Minimal 1 tag", "buat filter di papan"),
    ("format", "Format terisi", "9:16 buat shorts, 16:9 buat biasa"),
    ("duration", "Durasi target", "perkiraan total durasi klip (detik)"),
    ("lane", "Lane produksi", "nama lane di repo produksi, kalau ada"),
)

LIGHT_EXCLUDE = ("notes", "raw", "body")


def split_front(text: str):
    """(meta, body). meta = None kalau frontmatter ada tapi tidak terbaca."""
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    if not text.startswith("---"):
        return {}, text
    lines = text.split("\n")
    end = None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            end = i
            break
    if end is None:
        return None, text
    raw = "\n".join(lines[1:end])
    try:
        meta = yaml.safe_load(raw) or {}
    except Exception:
        return None, "\n".join(lines[end + 1:]).lstrip("\n")
    if not isinstance(meta, dict):
        return None, "\n".join(lines[end + 1:]).lstrip("\n")
    return meta, "\n".join(lines[end + 1:]).lstrip("\n")


def as_list(v) -> list:
    if v is None:
        return []
    if isinstance(v, (list, tuple)):
        return [str(x).strip() for x in v if str(x).strip()]
    return [p.strip() for p in re.split(r"[,\n]", str(v)) if p.strip()]


def is_camera(text: str) -> bool:
    return bool(CAMERA_RE.search(text or ""))


def beats_from(body: str) -> list:
    """Butir list di body = beat. Kalau tidak ada list, ambil baris non-heading."""
    bullets = [m.group(1).strip() for m in (BEAT_RE.match(l) for l in body.split("\n")) if m]
    if not bullets:
        bullets = [
            l.strip() for l in body.split("\n")
            if l.strip() and not HEADING_RE.match(l)
        ]
    beats = []
    for i, t in enumerate(bullets, 1):
        t = t.strip().strip("•").strip()
        if not t:
            continue
        beats.append(
            {
                "n": i,
                "text": t,
                "camera": is_camera(t),
                "words": len([w for w in re.split(r"\s+", t) if w]),
            }
        )
    return beats


def build_entry(path: Path) -> dict:
    """Satu fungsi yang baca disk. Semua field entry dibangun di sini."""
    slug = path.parent.name
    raw = path.read_text(encoding="utf-8")
    meta, body = split_front(raw)
    fm_ok = meta is not None
    meta = meta or {}

    notes_path = path.parent / "notes.md"
    notes = notes_path.read_text(encoding="utf-8").strip() if notes_path.exists() else ""

    title = str(meta.get("title") or "").strip()
    status = str(meta.get("status") or "draft").strip().lower()
    beats = beats_from(body)
    camera_beats = sum(1 for b in beats if b["camera"])
    words = sum(b["words"] for b in beats)
    tags = as_list(meta.get("tags"))
    characters = as_list(meta.get("characters"))
    duration = meta.get("duration")

    checks = []
    verdict = {
        "title": bool(title),
        "status": status in STATUSES,
        "beats": len(beats) >= 3,
        "camera": camera_beats >= 1,
        "setting": bool(str(meta.get("setting") or "").strip()),
        "tags": bool(tags),
        "format": bool(str(meta.get("format") or "").strip()),
        "duration": duration not in (None, "", "null"),
        "lane": bool(str(meta.get("lane") or "").strip()),
    }
    for cid, label, note in CHECKS:
        checks.append(
            {
                "id": cid,
                "label": label,
                "note": note,
                "ok": bool(verdict[cid]),
                "value": {
                    "title": title or "-",
                    "status": status,
                    "beats": len(beats),
                    "camera": camera_beats,
                    "setting": str(meta.get("setting") or "-"),
                    "tags": len(tags),
                    "format": str(meta.get("format") or "-"),
                    "duration": duration if duration not in (None, "", "null") else "-",
                    "lane": str(meta.get("lane") or "-"),
                }[cid],
            }
        )

    return {
        "slug": slug,
        "title": title,
        "status": status if status in STATUSES else "draft",
        "status_raw": status,
        "date": str(meta.get("date") or ""),
        "updated": str(meta.get("updated") or meta.get("date") or ""),
        "series": str(meta.get("series") or ""),
        "lane": str(meta.get("lane") or ""),
        "format": str(meta.get("format") or ""),
        "duration": duration if duration not in (None, "", "null") else None,
        "setting": str(meta.get("setting") or ""),
        "characters": characters,
        "tags": tags,
        "logline": str(meta.get("logline") or ""),
        "source": str(meta.get("source") or ""),
        "beats": beats,
        "beats_count": len(beats),
        "camera_beats": camera_beats,
        "words": words,
        "preview": (beats[0]["text"][:180] if beats else ""),
        "has_notes": bool(notes),
        "has_frontmatter": fm_ok,
        "ready": sum(1 for c in checks if c["ok"]),
        "ready_total": len(CHECKS),
        "checks": checks,
        "path": f"drafts/{slug}/draft.md",
        "notes_path": f"drafts/{slug}/notes.md" if notes else "",
        "data": f"data/{slug}.json",
        "url": f"https://github.com/{REPO}/blob/main/drafts/{slug}/draft.md",
        # isi yang cuma dipakai halaman detail (tidak ikut ke index.json)
        "notes": notes,
        "raw": raw,
        "body": body,
    }


def error_list(entries: list) -> tuple:
    """(errors, warnings) — error bikin web rusak, warning cuma belum lengkap."""
    errors, warnings = [], []
    seen = {}
    for e in entries:
        slug = e["slug"]
        p = f"drafts/{slug}/draft.md"
        if not e["has_frontmatter"]:
            errors.append(f"{p}: frontmatter tidak terbaca (cek kutip pada nilai yang mengandung ':')")
        if not e["title"]:
            errors.append(f"{p}: `title` kosong")
        if e["status_raw"] not in STATUSES:
            errors.append(f"{p}: status `{e['status_raw']}` di luar daftar {list(STATUSES)}")
        if not e["beats"]:
            errors.append(f"{p}: tidak ada beat (tulis butir list di body)")
        if slug in seen:
            errors.append(f"{p}: slug duplikat dengan {seen[slug]}")
        seen[slug] = p

        if not e["has_frontmatter"]:
            continue
        if len(e["beats"]) < 3:
            warnings.append(f"{p}: baru {len(e['beats'])} beat (idealnya ≥ 3)")
        if not e["camera_beats"]:
            warnings.append(f"{p}: belum ada arahan kamera/POV di beat mana pun")
        for c in e["checks"]:
            if not c["ok"] and c["id"] not in ("status",):
                warnings.append(f"{p}: {c['label'].lower()} belum diisi")
    return errors, warnings


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="exit 1 kalau ada masalah skema")
    ap.add_argument("--quiet", action="store_true")
    args = ap.parse_args()

    files = sorted(DRAFTS_DIR.glob("*/draft.md"))
    entries = [build_entry(p) for p in files]
    entries.sort(key=lambda e: (STATUSES.index(e["status"]) if e["status"] in STATUSES else 9,
                                _neg_date(e["date"]), e["slug"]))

    errors, warnings = error_list(entries)
    if args.check:
        if warnings and not args.quiet:
            print(f"PERINGATAN (tidak menggagalkan build) — {len(warnings)}")
            for w in warnings:
                print("  ·", w)
        if errors:
            print(f"\nMASALAH SKEMA — {len(errors)}")
            for x in errors:
                print("  ✗", x)
            return 1
        print(f"\nSkema OK: {len(entries)} draft, 0 masalah.")
        return 0

    statuses = {s: sum(1 for e in entries if e["status"] == s) for s in STATUSES}
    series, tags = {}, {}
    for e in entries:
        if e["series"]:
            series[e["series"]] = series.get(e["series"], 0) + 1
        for t in e["tags"]:
            tags[t] = tags.get(t, 0) + 1

    index = {
        "generated": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "repo": REPO,
        "count": len(entries),
        "beats": sum(e["beats_count"] for e in entries),
        "camera_beats": sum(e["camera_beats"] for e in entries),
        "words": sum(e["words"] for e in entries),
        "statuses": statuses,
        "status_order": list(STATUSES),
        "status_hint": STATUS_HINT,
        "series": [k for k, _ in sorted(series.items(), key=lambda kv: (-kv[1], kv[0]))],
        "tags": [k for k, _ in sorted(tags.items(), key=lambda kv: (-kv[1], kv[0]))],
        "entries": [{k: v for k, v in e.items() if k not in LIGHT_EXCLUDE} for e in entries],
    }

    OUT.write_text(json.dumps(index, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    DATA_DIR.mkdir(exist_ok=True)
    keep = set()
    for e in entries:
        keep.add(f"{e['slug']}.json")
        (DATA_DIR / f"{e['slug']}.json").write_text(
            json.dumps(
                {k: v for k, v in e.items() if k not in ("body",)},
                ensure_ascii=False, indent=1,
            ) + "\n",
            encoding="utf-8",
        )
    for stale in DATA_DIR.glob("*.json"):
        if stale.name not in keep:
            stale.unlink()
            print(f"hapus data basi: data/{stale.name}")

    if not args.quiet:
        print(f"index.json: {index['count']} draft · {index['beats']} beat · {index['words']} kata "
              f"(draft {statuses['draft']}, ongoing {statuses['ongoing']}, done {statuses['done']})")
        print(f"data/: {len(keep)} file")
        if warnings:
            print(f"peringatan: {len(warnings)} (jalankan --check buat detail)")
    return 0


def _neg_date(d: str):
    return tuple(-int(x) for x in re.findall(r"\d+", d)[:3]) if re.findall(r"\d+", d) else (0,)


if __name__ == "__main__":
    raise SystemExit(main())
