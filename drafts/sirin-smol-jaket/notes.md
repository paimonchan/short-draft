# Catatan produksi - Sirin smol and jaket

Lane produksi: `cha_sirin_jaket_01`.

## Perubahan draft (2026-11-14, v3)

Render `00001` menunjukkan masalah baru: **resleting dibuka-tutup berkali-kali**. Urutannya
tutup (0-4 dtk) -> buka (4-6) -> tutup (6-8) -> buka lebar (8-12) -> tutup lagi (12-15).
Penyebabnya: prompt v2 menulis tarikan gagal, tarikan cepat, **lalu ditutup lagi** - H3 membaca
pola itu sebagai siklus berulang, bukan urutan sekali jalan.

Aturan yang sekarang dipakai:

- **Satu arah saja: buka, lalu selesai.** Tidak ada adegan menutup kembali.
- Tarikan yang gagal ditulis sebagai **tarikan yang tidak menggerakkan zipper**, bukan "buka lalu tutup".
- Hanya **satu tarikan keras** di payoff (bukan dua kali berturut-turut) supaya tidak jadi loop.
- Setelah kebuka, jaket **tetap terbuka sampai frame terakhir**; dia shrug dan jalan pergi.
- Kedua kaki menapak; usaha ditandai condong ke belakang, bukan badan terangkat.

## Peta beat -> segmen (~2,5 dtk/segmen, 6 segmen = 15 dtk)

1. berjalan, tangan sudah di tarikan
2. tarik pertama gagal sambil jalan, tangan jatuh
3. berhenti, tarik dua tangan, badan condong ke belakang
4. menunduk lihat resleting, satu tarikan kuat
5. resleting kebuka sampai pinggang, dia melirik ke dalam jaketnya
6. jaket dibiarkan terbuka, shrug, angkat dagu, jalan pergi

## Batasan H3 yang dipegang

- Satu lokasi, satu take, maks 1 gerak kamera kecil per segmen.
- Jangan tulis kosakata shot-type (`zoom`, `close-up`, `cut to`).
- Jangan tulis kata freeze (`holds`, `stops`, `stays`, `does not move`).
- **Jangan tulis siklus buka-tutup** - model akan mengulanginya sepanjang klip.
- Kontak eksplisit: jari mencengkeram tarikan, kain mengumpul di pinggang, zipper kebuka sampai pinggang.
- Jaket tidak boleh menutup muka.

## Opsi caption post-produksi (4-7 kata)

1. "resleting 1, sirin 0"
2. "buka sekali, selesai"
3. "perjuangan paling tidak perlu"

## Aset

`E:\Sanctuary\Cha Sirin Jaket 01\` - world ruang tengah + look tarik resleting (POV atas).
Zero prop baru: jaket zip adalah aset identitas Sirin.
