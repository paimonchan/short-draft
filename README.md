# Short Draft

Papan **draft pendek** buat produksi video AI (target: **MiniMax H3**): satu draft cuma
beberapa **beat** — aksi yang kelihatan kamera — plus status produksinya.

Web: **https://paimonchan.github.io/short-draft/** (read-only, tiap draft bisa dicopas)

Batasnya jelas. Repo ini **cuma nyimpen ide + beat pendek dan statusnya**. Yang bukan urusan
repo ini:

- cerita panjang / naskah lengkap → lane **[story-draft](https://paimonchan.github.io/story-draft/)**
- pemecahan jadi script per-part & prompt video → lane **prompt-script** / prompt lane
- kerjaan produksi (asset, OBVPM, iteration log) → ada di repo produksi, bukan di sini

## Struktur

```
short-draft/
├── drafts/<slug>/draft.md    ← frontmatter + daftar beat (satu beat per baris list)
├── drafts/<slug>/notes.md    ← opsional: catatan produksi
├── templates/draft-template.md
├── tools/build_index.py      ← drafts/**/draft.md → index.json + data/
├── tools/drafts.py           ← CLI: add / status / edit / beat / list
├── assets/                   ← web (zero-build: HTML/CSS/JS vanilla)
├── index.json                ← generated, jangan diedit manual
└── data/<slug>.json          ← generated (beat + catatan + markdown asli)
```

## Status draft

| Status | Ikon | Arti |
|---|---|---|
| `draft` | 📝 | ide masuk, belum digarap |
| `ongoing` | 🔧 | lagi digarap |
| `done` | ✅ | selesai |

Status inilah "checklist"-nya: satu nilai per draft, diubah dari frontmatter
(`tools/drafts.py status <slug> <status>`). Beat **tidak** punya centang sendiri.

## Nambah / ngubah draft

```bash
# draft baru (beat ditulis satu per baris di file, tanda '-' di depan boleh)
python3 tools/drafts.py add --title "Sirin smol and Cookie" \
  --series "Cha Sirin smol" --lane cha_sirin_cookie_01 \
  --setting "Rumah Sirin (kamar mandi, sofa, meja)" \
  --tags "sirin,smol,komedi,cookie" --format 9:16 --duration 15 \
  --date 2026-10-25 --beats-file beat.txt

# beat langsung dari chat (tempel lewat stdin)
python3 tools/drafts.py add --title "Sirin smol and X" --beats-file -

python3 tools/drafts.py status sirin-smol-cookie ongoing   # pindah status
python3 tools/drafts.py beat sirin-smol-cookie "sirin lalu menutup pintu"
python3 tools/drafts.py list                               # lihat semua + status
python3 tools/drafts.py edit sirin-smol-cookie --duration 20 --tags "sirin,smol"
```

Setiap perintah langsung membangun ulang `index.json` + `data/`. Manual juga boleh:
tulis `drafts/<slug>/draft.md`, lalu:

```bash
python3 tools/build_index.py           # tulis index.json + data/*.json
python3 tools/build_index.py --check   # exit 1 cuma kalau ada MASALAH SKEMA
python3 -m unittest discover -s tests -p "test_*.py"
```

Push ke `main` → GitHub Actions regenerate + deploy Pages otomatis.

## Update via chat (loop-nya)

1. Kirim draft / status baru di chat — teks bebas, bentuknya seperti yang biasa ditulis.
2. Agent bikin/ubah file-nya lewat `tools/drafts.py`, jalankan `build_index.py --check` + tests.
3. Push ke `main` → web update sendiri (±1 menit).

Jadi web-nya **read-only**: halaman cuma membaca `index.json` + `data/*.json`. Tidak ada
editor, tidak ada form — angka status di web selalu datang dari frontmatter draft.

## Frontmatter

```yaml
---
title: "Judul draft pendek"
status: draft          # draft | ongoing | done
date: 2026-11-14       # tanggal draft masuk
updated: 2026-11-14    # diisi otomatis oleh tools/drafts.py
series: "Cha Sirin smol"
lane: cha_sirin_cookie_01   # nama lane di repo produksi (informasi, bukan link)
format: "9:16"
duration: 15           # target durasi klip (detik), boleh kosong
setting: "Rumah Sirin (kamar mandi, sofa, meja)"
characters: [Cha Sirin]
logline: ""
source: "chat"
tags: [sirin, smol, komedi]
---
```

Aturan penting:

- **Kutip nilai yang mengandung `:`** (`title`, `logline`, `setting`); YAML 1.1 error dan
  `build_index.py` mati untuk seluruh repo, bukan cuma entry itu. `tools/drafts.py` selalu
  mengutip sendiri.
- Body = **daftar beat**: satu butir list = satu beat. Arahan kamera ditulis sebagai beat
  sendiri (`POV ada di atas sirin lalu zooming in`) — build mendeteksinya sebagai beat kamera
  dan menandainya 🎥 di web.
- Isinya bebas bahasa & gaya: yang penting satu beat bisa dibayangin jadi satu shot.

## Yang dihitung otomatis

`build_index.py` ngitung jumlah beat, kata, **beat kamera** (heuristik kata kunci: POV, zoom,
kamera, berputar, sudut, …), dan 9 pemeriksaan **kesiapan metadata** yang tampil di halaman
draft: judul, status valid, ≥3 beat, ada arahan kamera, setting, tag, format, durasi, lane.

`--check` (dipakai CI) gagal **hanya** untuk hal yang bikin web rusak: frontmatter nggak
kebaca, `title` kosong, `status` di luar daftar, tidak ada beat, slug duplikat. Draft yang
belum lengkap cuma jadi **peringatan** — CI tetap jalan, jadi nggak nyangkut gara-gara draft
setengah jadi.

## Web

Zero-build (HTML/CSS/JS vanilla, tanpa npm). Baca `index.json`, lalu `data/<slug>.json` saat
draft dibuka.

- **Papan**: baris draft dikelompokkan per status (📝 draft / 🔧 ongoing / ✅ done) + poster
  identitas CSS-only (warna, pola, dan monogram dibangkitkan dari slug; aspeknya ikut `format`),
  pencarian (judul, beat, tag, setting, lane), filter status & seri, tombol density, tema
  terang/gelap, dan **salin daftar** (judul + status, siap tempel).
- **Halaman draft**: beat satu per satu — **tiap beat punya tombol salin sendiri**, plus
  **Salin draft** (teks polos ala chat), **Salin markdown**, **Unduh .md**, panel kesiapan
  metadata, markdown mentah, dan pindah draft lewat tombol ←/→ (atau tombol panah di keyboard).
- Keyboard: `/` fokus pencarian, `t` tema, `d` density, `Esc` balik ke papan.

**Aturan tampil di web (penting):** `draft.md` → bagian **Beat**, `notes.md` → **Catatan
produksi**. File lain (nama bebas) **tidak akan muncul** di web; `build_index.py` cuma memberi
peringatan. Jadi kalau menambah jenis file baru, **tambahkan dulu render-nya di `assets/app.js`**
— jangan cuma taruh file lalu kasih link ke GitHub, karena halaman ini permukaan baca utamanya.
Kalau `assets/*.js`/`*.css` berubah, naikkan `?v=` di `index.html`.
