# Aturan produksi

Aturan di bawah ini **lahir dari render nyata**, bukan dari perkiraan: semuanya datang dari
rombak 3 draft pertama (`eskrim`, `jaket`, `sandal`) yang versi awal kami ditolak H3 dengan
cara yang berbeda-beda. Catatan per draft ada di `drafts/<slug>/notes.md`; di sini
dirangkum jadi aturan yang dipakai untuk semua draft berikutnya.

Kalau aturan di sini bentrok dengan tebakan atau selera, aturan ini menang — dia sudah
dibayar dengan render gagal.

## 1. Objek kunci harus terbaca dari POV atas

Dari POV atas (~50 derajat) apa pun yang ada **di bawah badan** tidak kelihatan. Sandal yang
ditaruh di bawah telapak kaki kiri tidak pernah muncul di render — reveal-nya mati.

Pindahkan objeknya ke tempat yang menghadap lensa: sandal **nyangkut di belakang tumit** dan
menggantung dengan **sol menghadap atas** saja yang kebaca dari atas.

## 2. State awal harus eksplisit dan kebaca

Jaket versi awal mulai dengan hoodie yang sudah terbuka — padahal premisnya "tertutup dan nggak
bisa dibuka". Frame pertama harus sama dengan yang kamu pikirkan, dan ditulis apa adanya:
`hoodie TERTUTUP penuh`.

Masalah kedua: dari atas, hoodie **tertutup vs terbuka nyaris tidak beda** — dua-duanya satu
garis hitam, jadi payoff-nya tidak terbaca. Solusinya, paksa objeknya punya dua bentuk yang
beda jauh:

- tertutup = `one narrow black line` dari leher ke pinggang, kerah putih cuma sliver di atas
- terbuka = `wide open V` yang memperlihatkan kemeja putih + dasi hitam dari kerah sampai pinggang

## 3. Tidak ada aksi mulut

Es krim versi awal ditulis dengan aksi mulut (`menjilat sekali`, `menangkap gumpalan dengan
mulut`). Hasilnya: H3 **mendaur ulang gestur mulut** sepanjang klip (jilat di detik 2, jilat
lagi di detik 8, jilat lagi di detik 13 padahal cone sudah kosong) dan **menggandakan cone**.

Es krim tidak dijilat, tidak digigit, tidak ditangkap — cone dipegang **rendah di samping
badan** sepanjang klip, mulut tetap garis netral.

## 4. Tidak ada instruksi diam

Instruksi "diam" menghasilkan klip yang minim gerak. Badan harus **bergerak terus**: berjalan,
berputar kiri, lalu berputar kanan.

Dan jangan tulis negasi berulang (`tidak bergerak sama sekali`, `tidak pernah mengangkat
kaki`) — justru itu yang memunculkan konsepnya di render.

## 5. Satu arah saja, payoff sekali

Jaket versi v2 dirender jadi **buka-tutup berkali-kali** (tutup 0-4s, buka 4-6s, tutup 6-8s,
buka lebar 8-12s, tutup lagi 12-15s) — leluconnya hilang jadi loop.

Satu arah: **buka sekali, tidak pernah ditutup.** Payoff = **satu tarikan keras** (bukan dua).

## 6. Gerak besar untuk melihat sesuatu = menunduk atau putar badan

Yang gagal: "angkat kaki untuk lihat kaus kaki" → model mengangkat **lutut setinggi pinggang**
seperti senam. Yang jalan: kalau perlu melihat ke bawah, dia **menunduk** (chin tuck) dan
memutar **pergelangan kaki** sekali. Untuk mencari, dia **memutar badan**, bukan cuma kepala.

## 7. Muka tetap terangkat ke lensa

Jaket versi v3 menunduk 5-10 detik dan mukanya ketutup rambut. Kalau perlu cek objek, cukup
`chin dip` beberapa senti, lalu dagu **terangkat** kembali ke POV.

## 8. Kaki menapak sepanjang take

Tidak ada angkat kaki, tidak ada jongkok, tidak ada membungkuk. Berat badan tetap di kedua kaki.

## 9. Kamera selalu bergerak

Ikut jalan pada segmen pertama → **turun sedikit** saat dia berhenti → **naik lagi** saat dia
melanjutkan jalan. Tidak ada frame statis, tapi tetap maksimal **1 gerak kamera kecil per
segmen** (gerak besar bikin model cut).

## 10. Bahasa draft

- Jangan tulis kosakata shot-type (`zoom`, `close-up`, `cut to`) — tulis gerak fisiknya.
- Jangan tulis kata freeze (`holds`, `stops`, `stays`, `does not move`).
- Kontak harus eksplisit: tetes **mendarat di kaus kaki**, sandal **menggantung di tumit**,
  sandal **jatuh rata**, telapak kaki **masuk** ke sandal, dagu **terangkat**.

## 11. Bentuk klip

Satu lokasi, satu take kontinu, 6 beat ≈ 15 detik (~2,5 detik per segmen). Tiap draft berakhir
dengan satu gerak kecil yang khas (angkat bahu kecil) lalu dia kembali ke keadaan semula
(muka dan langkah yang sama seperti frame pertama).

## 12. Hal kanon yang sudah kepakai

- di bawah hoodie: **kemeja putih + dasi hitam**
- kaus kaki **cream**
- sandal jepit, satu pasang
- status `ongoing` = lane produksi di repo produksi sudah ada (`cha_sirin_<objek>_01`)

## Cara dokumen ini di-update

Dokumen ini hidup. Tiap kali ada draft yang dirombak (versi baru, render gagal, atau render
yang akhirnya kena), aturannya naik ke sini — jangan cuma ditinggal di `notes.md` draft itu.

- **Sebelum menulis draft baru: baca dokumen ini dulu.** Ini urutan wajibnya, bukan opsional.
- Aturan baru ditulis sebagai perintah + alasannya, dan alasannya menyebut buktinya: draft
  mana, versi berapa, apa yang gagal di render.
- Kalau aturan lama ternyata salah, **jangan dihapus** — tulis versi barunya dan sebut yang
  lama sudah tidak dipakai, biar nggak diusulkan ulang.
- Aturan yang cuma berlaku untuk satu objek (bukan umum) tetap di `notes.md` draft itu.
- Versi awal dokumen ini datang dari 3 draft: `eskrim` (v4), `jaket` (v5), `sandal` (v3).
