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
├── docs/aturan-produksi.md   ← aturan hasil render (dipakai semua draft berikutnya)
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

`ongoing` dipakai begitu lane produksinya sudah ada di repo produksi (nama lane ditulis di
frontmatter `lane`). Kalau `lane` kosong, draft-nya masih `draft`.

## Aturan produksi

`docs/aturan-produksi.md` — aturan yang **lahir dari render nyata**, hasil rombak 3 draft
pertama. Ringkasnya:

- objek kunci harus terbaca dari **POV atas**; jangan taruh apa pun di bawah badan
- **tidak ada aksi mulut** (H3 mendaur ulang gestur mulut + menggandakan prop)
- **tidak ada instruksi diam**: badan bergerak terus (berjalan / berputar badan), kaki menapak
- **satu arah saja**, payoff sekali (jangan buka-tutup berulang)
- muka tetap terangkat ke lensa; kalau perlu lihat ke bawah cukup `chin dip` beberapa senti
- kamera selalu bergerak, tapi maksimal 1 gerak kamera kecil per segmen

Template draft baru sudah memuat ringkasan ini sebagai komentar.

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
hook: "Frame 1: ... — pertanyaan: ...?"   # apa yang sudah terjadi di frame pertama
source: "chat"
tags: [sirin, smol, komedi]
---
```

### `hook` — satu baris, isinya frame pertama

`hook` bukan ringkasan cerita. Isinya: **apa yang sudah terjadi di detik 0** (mid-failure,
bukan setup) + pertanyaan yang bikin orang berhenti scroll. Dasar aturannya ada di lane
story-draft (`docs/05-hook-retensi.md`).

Rubrik 5 cek yang dipakai di halaman draft:

1. muka karakter ada di frame pertama
2. premis kebaca tanpa penjelasan
3. ada pertanyaan yang belum dijawab di frame 1
4. masih jalan kalau dimute (caption yang bawa pertanyaannya)
5. beda dari frame 1 episode lain (novelty)

Web menghitung **isyarat hook** dari teksnya (heuristik, bukan penilaian mutu): menyebut
frame pertama, memuat pertanyaan, dan memuat gerak. Papan menampilkan baris `🎣 <hook>`
di tiap baris, satu statistik `🎣 ada hook`, dan chip filter `🎣 hook kosong N` untuk
melihat draft mana yang belum punya hook.

`3/3` bukan target wajib. Hook yang murni pertanyaan (frame pertama diam, pertanyaannya
yang bekerja) wajar dapat `2/3`; yang penting isinya bukan setup — bukan "orang berjalan
masuk lalu mulai bicara".

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
kamera, berputar, sudut, …), dan 8 pemeriksaan **kesiapan metadata** yang tampil di halaman
draft: judul, status valid, ≥3 beat, ada arahan kamera, setting, tag, format, lane. `duration`
tetap ada sebagai kolom bebas (ditampilkan kalau diisi) tapi **bukan** syarat kesiapan — draft
pendek sering belum punya target durasi, dan peringatan yang muncul di semua baris berhenti jadi
informasi.

`--check` (dipakai CI) gagal **hanya** untuk hal yang bikin web rusak: frontmatter nggak
kebaca, `title` kosong, `status` di luar daftar, tidak ada beat, slug duplikat. Draft yang
belum lengkap cuma jadi **peringatan** — CI tetap jalan, jadi nggak nyangkut gara-gara draft
setengah jadi.

## Web

Zero-build (HTML/CSS/JS vanilla, tanpa npm). Baca `index.json`, lalu `data/<slug>.json` saat
draft dibuka.

- **Papan**: baris draft dikelompokkan per status (📝 draft / 🔧 ongoing / ✅ done) + poster
  identitas CSS-only (warna, pola, dan monogram dibangkitkan dari slug; aspeknya ikut `format`),
  pencarian (judul, beat, tag, setting, lane), filter status + **⚠ kurang meta** (baris yang
  metadatanya belum lengkap), tombol density, tema terang/gelap, **⧉ salin daftar** (judul +
  status, siap tempel), dan **⧉ salin per baris** (nyalin teks satu draft tanpa membukanya).
- **Halaman draft**: beat satu per satu — **tiap beat punya tombol salin sendiri**, plus
  **Salin teks** (teks polos ala chat), **Salin markdown**, **Unduh .md**, panel kesiapan
  metadata, markdown mentah, dan pindah draft lewat tombol ←/→ (atau tombol panah di keyboard).
- Keyboard: `/` fokus pencarian, `t` tema, `d` density, `Esc` balik ke papan.

**Aturan tampil di web (penting):** `draft.md` → bagian **Beat**, `notes.md` → **Catatan
produksi**. File lain (nama bebas) **tidak akan muncul** di web; `build_index.py` cuma memberi
peringatan. Jadi kalau menambah jenis file baru, **tambahkan dulu render-nya di `assets/app.js`**
— jangan cuma taruh file lalu kasih link ke GitHub, karena halaman ini permukaan baca utamanya.
Kalau `assets/*.js`/`*.css` berubah, naikkan `?v=` di `index.html`.
