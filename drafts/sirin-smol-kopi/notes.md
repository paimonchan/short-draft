# Catatan produksi · Sirin smol and kopi

Hook (0–2,2 dtk): muka Sirin + cangkir di frame pertama. Premisnya kebaca tanpa
penjelasan — kopi = energi, muka dia = nol energi. Kontradiksi visualnya jatuh
di seruput pertama (detik ~2): tidak ada perubahan apa pun di wajahnya.

Running gag (3 kemunculan): getaran — (1) tangan bergetar, (2) ahoge ikut
bergetar, (3) cangkir di meja bergeser. Tiap kemunculan lebih besar dari
sebelumnya, muka tetap datar. Itu leluconnya: badan bereaksi, muka tidak.

Button (callback): begitu kopinya habis, getarannya berhenti seketika dan dia
kembali malas — persis state frame pertama, jadi loop-nya mulus.

Peta beat → segmen (~5 dtk/segmen, 3 segmen ≈ 15 dtk):
1. beat 1–2 (duduk + seruput pertama) · 2. beat 3–4 (seruput kedua + getar mulai) ·
3. beat 5–6 (getaran puncak + berhenti).

Batasan H3 yang dipegang (docs/02 story-draft):
- **Kamera jangan ikut bergetar.** Getaran = gerak objek di dalam frame, bukan
  gerak kamera. Kalau kamera ikut, model akan memotong atau bikin cam_sd tinggi.
- Maks 1 gerak kamera kecil per segmen; framing ladder maks 1 level per segmen.
- Jangan tulis kosakata shot-type (`zoom`, `close-up`, `cut to`) — tulis gerak fisik.
- Amplitudo getaran ditulis kecil dan naik bertahap; lonjakan besar = risiko artefak.
- "Cangkir bergeser" harus punya kontak jelas dengan meja (kontak ≠ cut).

Opsi potong (kalau harus ≤10 dtk): buang beat 3, langsung dari seruput pertama
ke getaran puncak; payoff tetap di detik ~8 (kopi habis, berhenti seketika).

Opsi caption post-produksi (4–7 kata, teks di luar frame render):
1. "ekspresinya nggak pernah berubah"
2. "kopi: nol efek ke muka"
3. "badan bereaksi, muka tidak"

Aset: cangkir kecil (skala smol), kopi gelap yang kelihatan di dalam cangkir,
meja kayu. Semua ref satu geometri kamera dengan take.

Lane produksi: **belum ada** (calon nama: `cha_sirin_kopi_01`).
Kalau mau jadi cerita panjang dengan Kanglim: itu lane story-draft, bukan sini.
