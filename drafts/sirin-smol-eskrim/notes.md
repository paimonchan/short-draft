# Catatan produksi - Sirin smol and es krim

Lane produksi: `cha_sirin_eskrim_01` (repo produksi, privat - nama lane cuma penanda).

## Perubahan draft (2026-11-14, v4)

Draft awal ditulis dengan dua aksi mulut (`menjilat sekali` + `menangkap gumpalan dengan mulut`).
Dua render pertama membuktikan itu **salah**: H3 mendaur ulang gestur mulut sepanjang klip
(jilat di detik 2, jilat lagi di detik 8, jilat lagi di detik 13 padahal cone sudah kosong) dan
menggandakan cone. Percobaan kedua mengganti jadi "angkat kaki untuk lihat kaus kaki" juga gagal:
model mengangkat **lutut setinggi pinggang** seperti senam, dan muka menunduk terus sampai detik 12.

Aturan yang akhirnya dipakai:

- **Tidak ada aksi mulut sama sekali.** Es krim tidak dijilat, tidak digigit, tidak ditangkap.
  Cone dipegang **rendah di samping badan** sepanjang klip. Mulut tetap garis netral.
- **Kedua kaki menapak sepanjang take.** Tidak ada angkat kaki/lutut. Untuk melihat kaus kaki,
  dia hanya **menunduk** (chin tuck), lalu **memutar pergelangan kaki** sekali.
- **Kamera selalu bergerak**: ikut jalan -> turun sedikit saat dia berhenti -> naik lagi saat lanjut.
  Tidak ada frame statis.
- Jangan tulis negasi berulang (`tidak pernah mengangkat kaki`), itu justru memunculkan konsepnya.

## Peta beat -> segmen (~2,5 dtk/segmen, 6 segmen = 15 dtk)

1. beat 1 - berjalan, cone di samping, tetesan siap jatuh
2. beat 2 - tetes jatuh ke kaus kaki, dia melirik sambil jalan
3. beat 3 - berhenti, kaki menapak, menunduk lihat kaus kaki
4. beat 4 - putar pergelangan kaki sekali, jari kaki bergerak
5. beat 5 - tetes kedua ke lantai, dia tetap menatap kaus kaki
6. beat 6 - angkat dagu, shrug kecil, lanjut jalan

## Batasan H3 yang dipegang

- Satu lokasi, satu take kontinu, maks 1 gerak kamera kecil per segmen.
- Jangan tulis kosakata shot-type (`zoom`, `close-up`, `cut to`) - tulis gerak fisik.
- Jangan tulis kata freeze (`holds`, `stops`, `stays`, `does not move`).
- Kontak eksplisit: tetes **mendarat di kaus kaki**, pergelangan kaki **berputar**, dagu **terangkat**.

## Opsi caption post-produksi (4-7 kata, di luar frame render)

1. "es krim 1, kaus kaki 0"
2. "dibiarin aja"
3. "usaha: nol"

## Aset

`E:\Sanctuary\Cha Sirin Eskrim 01\` - world ruang tengah + look mid-step (cone dipegang rendah).
Semua ref satu geometri kamera dengan take (POV atas ~50 derajat).
