# Catatan produksi - Sirin smol and jaket

Lane produksi: `cha_sirin_jaket_01`.

Aturan umum yang lahir dari rombak ini dan dipakai semua draft berikutnya: `docs/aturan-produksi.md`.

## Riwayat revisi draft

**v1:** Sirin berdiri diam, badan terangkat saat menarik resleting -> minim gerak.

**v2:** Dia berjalan sambil menarik. Tapi render `00001` menunjukkan **resleting dibuka-tutup
berkali-kali** (tutup 0-4s, buka 4-6s, tutup 6-8s, buka lebar 8-12s, tutup lagi 12-15s).

**v3:** Satu arah saja - buka sekali, jaket dibiarkan terbuka. Freeze hilang (mean motion 7.89,
low 1%), tapi render `00002` menemukan dua masalah baru:

1. Kepala **menunduk lama** 5-10 dtk, muka tertutup rambut.
2. Dari POV atas, hoodie **tertutup vs terbuka nyaris tidak beda** - dua-duanya garis hitam,
   jadi payoff "kebuka" tidak terbaca.

## Aturan final (v4)

- **Satu arah: buka sekali, tidak pernah ditutup.** Jangan tulis siklus buka-tutup.
- **Muka selalu terangkat ke lensa.** Kalau perlu cek zipper, cukup `chin dip` beberapa senti,
  jangan tunduk penuh dan jangan sampai rambut menutupi muka.
- **Hoodie harus kebaca sebagai DUA PANEL**, bukan satu objek hitam:
  - tertutup = `one narrow black line` dari leher ke pinggang, kerah putih cuma sliver di atas
  - terbuka = `wide open V` yang memperlihatkan kemeja putih + dasi dari kerah sampai pinggang
- Payoff = **satu tarikan keras** (bukan dua) supaya tidak jadi loop.
- Kedua kaki menapak; usaha ditandai condong ke belakang, bukan badan terangkat.
- Kamera selalu bergerak (ikut jalan -> turun saat berhenti -> naik saat jalan pergi).

## Peta beat -> segmen (~2,5 dtk/segmen, 6 segmen = 15 dtk)

1. berjalan, hoodie tertutup satu garis, tangan di tarikan
2. tarik pertama gagal sambil jalan
3. berhenti, tarik dua tangan, badan condong ke belakang, muka tetap ke POV
4. chin dip sedikit, tatap tarikan, angkat dagu lagi
5. satu tarikan keras -> dua panel robek terbuka jadi V lebar (kemeja + dasi kelihatan)
6. jaket dibiarkan menganga, shrug, jalan pergi

## Opsi caption post-produksi (4-7 kata)

1. "resleting 1, sirin 0"
2. "buka sekali, selesai"
3. "perjuangan paling tidak perlu"

## Aset

`E:\Sanctuary\Cha Sirin Jaket 01\` - world ruang tengah + look tarik resleting dengan **hoodie
terbuka V** (supaya target visual payoff jelas untuk model).
