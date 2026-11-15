# Catatan produksi - Sirin smol and apel

Lane produksi: **`cha_sirin_apel_01`** — template siap (2026-11-15).

Draft ini ditulis pakai `docs/aturan-produksi.md` (aturan hasil rombak eskrim v4 / jaket v5 / sandal v3).

## Hook (frame 1)

Tangan kirinya sudah memegang kantung belanjaan **rendah di samping badan** (aturan yang sama
dipakai di es krim: prop yang dipegang rendah tetap kebaca dari POV atas), dan apelnya **sudah**
menggelinding di lantai dua langkah di depan kakinya. Pertanyaannya visual: dia berhenti buat
ambil, nggak? Jawabannya baru di beat 5: tidak.

## Running gag (3 kemunculan)

Apel yang kabur: (1) menggelinding di depan kakinya sejak frame pertama, (2) didorong sekali lalu
menggelinding lagi, (3) ditinggal di lantai sampai dia keluar dari frame.

## Button

Setelah dua kali gagal "menangkap", dia tidak mengambil apelnya sama sekali - cuma angkat bahu
kecil lalu lanjut jalan dengan muka dan langkah yang sama seperti frame pertama.

## Peta beat -> segmen (~2,5 dtk/segmen, 6 segmen = 15 dtk)

1. beat 1 - berjalan, apel menggelinding di depan (kamera ikut jalan)
2. beat 2 - apel berhenti, dia ikut berhenti, kaki menapak, chin dip
3. beat 3 - dorongan pertama dengan ujung kaki, apel jalan lagi
4. beat 4 - apel berhenti lagi, dia menatap; kamera turun sedikit
5. beat 5 - dia mendekat dua langkah, tetap tidak mengambil
6. beat 6 - dagu terangkat, angkat bahu, lanjut jalan; kamera naik lagi

## Aturan yang dipegang

- **Objek kebaca dari POV atas**: apelnya ada di lantai **di depan** kakinya, bukan di bawah
  badan - jadi kebaca sejak frame pertama sampai akhir.
- **Tanpa aksi mulut**: apel tidak digigit, tidak dijilat, tidak diangkat ke muka.
- **Tanpa instruksi diam**: dia berjalan hampir sepanjang klip; saat berhenti pun tetap
  berdiri, bukan freeze.
- **Kaki menapak**, dan satu-satunya gerak kaki adalah dorongan ujung kaki kanan (minim, sama
  seperti goyangan kaki di draft sandal).
- **Muka tetap ke lensa**: untuk melihat apelnya cukup chin dip beberapa senti, tidak menunduk
  penuh.
- **Satu arah, payoff sekali**: satu dorongan, bukan tendangan berkali-kali.
- **Kamera selalu bergerak**: ikut jalan -> turun saat dia berhenti -> naik lagi saat lanjut.
- Jangan tulis negasi berulang dan jangan tulis kosakata shot-type.

## Batasan H3 yang dipegang

Satu lokasi, satu take kontinu, maks 1 gerak kamera kecil per segmen. Kontak eksplisit: ujung
kaki kanan **mendorong** apel, apel **menggelinding** dan **berhenti**.

## Opsi potong (kalau harus <=10 dtk)

Buang beat 4, langsung dari dorongan pertama ke dia mendekat dan tidak mengambil apelnya.

## Opsi caption post-produksi (4-7 kata)

1. "apelnya jalan sendiri"
2. "ditendang, ditinggal"
3. "usaha: dua langkah"

## Aset

World ruang tengah + lantai kayu polos, kantung belanjaan, satu apel. Semua ref satu geometri
kamera dengan take (POV atas ~50 derajat).

## Risiko / belum terbukti

- Apel menggelinding itu bola kecil yang bergerak: kalau model bikin apelnya berhenti-mulai
  sendiri atau berubah bentuk, ganti jadi benda **kotak** (mis. kardus kecil) supaya geraknya
  lebih mudah dibaca - tapi jangan taruh di bawah badan.
- Kantung belanjaan tidak boleh dibesarkan: kalau menutupi badannya dari atas, dia kalah kebaca
  dan seluruh hook-nya hilang.

## Status produksi (2026-11-15)

Lane `cha_sirin_apel_01` sudah dibuild di repo produksi: **5 template** (turbo 8-step + nolora
20-step + pika8 PikaFlex 8-step HD + refine HD + audiorefine), prompt NOBGM **12.726** char,
544x960 / 15 dtk / NO-BGM, model Singularity V1.3 int8 + video VAE int8.

**Geometri kamera (keputusan penting):** render `eskrim` `00005` membuktikan kameranya ada **DI
DEPAN** dia (muka selalu terlihat, lantai depan kaki di bawah frame) — bukan di belakang seperti
yang ditulis lane lama. Jadi take ini ditulis eksplisit: *"the camera is a taller person drifting
BACKWARDS in front of her, tilted down at roughly fifty degrees"*, dan semua arah ditulis relatif
ke tubuhnya: apel menggelinding **di depan sepatu kanan**, paper bag dipegang **rendah di samping
paha kiri**.

**Kenapa paper bag:** prop yang dipegang rendah tetap kebaca dari POV atas (aturan yang sama
dengan es krim), tapi tidak boleh besar — kalau menutupi badan, hook-nya hilang.

**Belum dirender.**
