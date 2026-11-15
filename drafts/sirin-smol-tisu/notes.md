# Catatan produksi - Sirin smol and tisu

Lane produksi: **`cha_sirin_tisu_01`** — template siap (2026-11-15).

Draft ini ditulis pakai `docs/aturan-produksi.md` (aturan hasil rombak eskrim v4 / jaket v5 / sandal v3).

## Hook (frame 1)

Ekornya sudah ada sejak frame pertama: strip tisu yang **menyeret di lantai** di belakang kakinya.
Itu memanfaatkan kamera POV atas - jejak di lantai justru hal yang paling kebaca dari ketinggian,
sementara objek yang disembunyikan di bawah badan (pelajaran draft sandal v2) mati total.

Pertanyaannya visual: sadar nggak? Dia baru sadar di beat 3, setelah strip-nya jadi dua kali
lebih panjang.

## Running gag (3 kemunculan)

Ekornya makin panjang: (1) satu langkah di frame pertama, (2) makin panjang sambil dia tetap
jalan dengan muka yang sama, (3) putus dan tinggal di lantai saat dia pergi.

## Button

Dia tidak membereskan apa pun: strip yang putus ditinggal di lantai, gulungan tisunya masih di
tangan, lalu dia lanjut jalan dengan muka dan langkah yang sama seperti frame pertama.

## Peta beat -> segmen (~2,5 dtk/segmen, 6 segmen = 15 dtk)

1. beat 1 - berjalan, strip sudah menyeret (kamera ikut jalan)
2. beat 2 - strip makin panjang, muka tetap ke POV
3. beat 3 - berhenti, kaki menapak, badan diputar setengah ke belakang
4. beat 4 - chin dip, menatap strip; kamera geser sedikit mengikuti putaran
5. beat 5 - satu tarikan kuat, strip putus
6. beat 6 - badan diputar balik ke depan, angkat bahu, lanjut jalan; kamera naik lagi

## Aturan yang dipegang

- **Objek kebaca dari POV atas**: stripnya ada di lantai **di belakang** kakinya, bukan di bawah
  badannya; gulungannya dipegang rendah di samping badan (aturan yang sama dengan es krim).
- **Melihat ke belakang = putar badan**, bukan cuma kepala (pelajaran draft sandal v3: putaran
  badan kebaca, putaran kepala saja tidak).
- **Tanpa aksi mulut**, **tanpa instruksi diam**, **kaki menapak** sepanjang take.
- **Muka tetap ke lensa** selama dia menghadap POV; saat memutar badan, putarannya setengah saja,
  muka tidak boleh ketutup rambut (pelajaran jaket v3).
- **Satu arah, payoff sekali**: satu tarikan keras sampai putus, bukan tarik berkali-kali.
- **Kamera selalu bergerak**: ikut jalan -> geser mengikuti putaran badan -> naik lagi saat dia
  jalan pergi. Maks 1 gerak kamera kecil per segmen.
- Jangan tulis negasi berulang dan jangan tulis kosakata shot-type.

## Batasan H3 yang dipegang

Satu lokasi, satu take kontinu. Kontak eksplisit: strip tisu **menyeret di lantai**, tangan
**menarik** sampai strip **putus** dan **jatuh rata**.

## Opsi potong (kalau harus <=10 dtk)

Buang beat 2, langsung dari berjalan ke dia berhenti dan memutar badan.

## Opsi caption post-produksi (4-7 kata)

1. "ekornya makin panjang"
2. "sadar: telat"
3. "ditinggal di lantai"

## Aset

World ruang tengah + lantai kayu polos, satu gulungan tisu dapur. Semua ref satu geometri kamera
dengan take (POV atas ~50 derajat).

## Risiko / belum terbukti

- Strip tisu itu objek tipis dan panjang: kalau model bikin panjangnya berubah-ubah sendiri atau
  malah menghilang, ganti jadi kain/saputangan dengan warna kontras (aturan yang sama: tetap
  menyeret di lantai di belakang kakinya).
- Jangan menambah gulungan kedua atau tisu berserakan: satu objek kontinu lebih aman daripada
  banyak lembar kecil (pelajaran draft lalat yang gugur: objek kecil bergerak = artefak).

## Status produksi (2026-11-15)

Lane `cha_sirin_tisu_01` sudah dibuild di repo produksi: **5 template** (turbo 8-step + nolora
20-step + pika8 PikaFlex 8-step HD + refine HD + audiorefine), prompt NOBGM **12.786** char,
544x960 / 15 dtk / NO-BGM, model Singularity V1.3 int8 + video VAE int8.

**Geometri kamera:** sama seperti lane `apel` — kamera **DI DEPAN** dia (pelajaran render `eskrim`
`00005`), bukan di belakang. Arah ditulis relatif ke tubuhnya: strip tisu menyeret di lantai
**belakang tumitnya**, roll di tangan **kiri**.

**Look ref digenerate 2x:** versi pertama menaruh strip di **depan** kaki (fisikanya salah — dia
akan menginjak tisunya sendiri); versi v2 menaruhnya di belakang tumit, sesuai naskah.

**Fisika tarikan dikoreksi:** strip sudah rata di lantai, jadi setelah putus stripnya **slip dan
tetap rata** — bukan jatuh dari udara. Satu tarikan, bukan tarik berkali-kali.

**Belum dirender.**
