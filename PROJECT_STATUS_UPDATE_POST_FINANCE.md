# PROJECT STATUS UPDATE — Post Finance Module

Tanggal update: 8 November 2026

Dokumen ini melengkapi instruksi proyek dan status update sebelumnya. Jika status implementasi berbeda dengan dokumen lama, gunakan update ini untuk progres kode terbaru. Keputusan produk, stack, keamanan, dan batasan MVP sebelumnya tetap berlaku.

## Repository dan branch

- Repository: https://github.com/Abdul-Fikri/mini-event-management
- Branch aktif: `hari-1-auth-dashboard`
- Commit terbaru: `a68766c2ba86fdf589fb6ca7ab48ba1ca6dac5a3`
- Aplikasi aktif berada di root repository; gunakan `src/`, bukan folder salinan lama `event-management/`.
- Jangan push/merge ke `main` tanpa instruksi pemilik.
- Jangan commit `.env.local` atau secret Supabase.

## Stack dan keputusan yang tetap berlaku

- Next.js App Router 16, JavaScript, Tailwind CSS, npm.
- Supabase PostgreSQL dengan `@supabase/ssr` dan `@supabase/supabase-js`.
- Zod untuk validasi server, Server Actions untuk mutasi, Server Components untuk pembacaan.
- Satu role login: Owner. Anggota panitia hanya record pada tabel `members`, bukan akun login.
- Data di-scope berdasarkan grup Owner dan event.
- Tidak ada perubahan schema yang diperlukan untuk modul-modul yang sudah dibuat; schema final tetap 9 tabel yang sudah ada.
- Jangan meminta pemilik mengulang setup awal atau menjalankan ulang audit SQL tanpa error konkret.

## Status implementasi

Sudah tersedia di branch aktif:
1. Autentikasi Owner: registrasi, login, logout, onboarding grup.
2. Dashboard Owner dan statistik dasar.
3. CRUD event: daftar, tambah, detail, edit, hapus.
4. CRUD data anggota panitia.
5. Penugasan anggota ke event melalui `event_members`.
6. Rundown/jadwal event melalui `schedule_items`.
7. Manajemen tugas melalui `tasks`.
8. Pengadaan/perlengkapan melalui `procurement_items`.
9. Manajemen anggaran dan keuangan melalui `budget_categories` dan `transactions` (commit terbaru).

## Modul anggaran dan keuangan — implementasi terbaru

File baru:
- `src/lib/validators/finance.js`
- `src/actions/finance.js`
- `src/components/events/BudgetCategoryForm.js`
- `src/components/events/TransactionForm.js`
- `src/components/events/FinanceSection.js`

File yang diperbarui:
- `src/app/(app)/events/[id]/page.js`

Fitur:
- CRUD kategori anggaran: nama kategori dan nominal rencana.
- CRUD transaksi: pemasukan/pengeluaran, tanggal, deskripsi, nominal, kategori opsional, pencatat opsional, referensi opsional.
- Ringkasan target anggaran event, total anggaran kategori, pemasukan, pengeluaran, sisa anggaran kategori, dan saldo kas.
- Perbandingan rencana dan pengeluaran aktual per kategori.
- Riwayat transaksi diurutkan dari tanggal terbaru.
- Validasi Zod dan pengecekan kepemilikan event, kategori, dan anggota pada server.
- Penghapusan kategori yang masih direferensikan transaksi ditangani dengan pesan yang ramah.
- Semua data menggunakan tabel dan constraint schema yang sudah ada; tidak perlu SQL tambahan.

Rumus yang wajib dipertahankan:
- Sisa anggaran kategori = total anggaran kategori − pengeluaran aktual.
- Saldo kas = pemasukan − pengeluaran.
- Target anggaran event ditampilkan sebagai angka terpisah dari total anggaran kategori.

## Status pengujian

- Pemilik sebelumnya telah mengonfirmasi pengujian lokal auth/dashboard, Event CRUD, penugasan, rundown, dan task sebagai aman pada iterasi terdahulu.
- Procurement dan finance baru ditulis ke GitHub; jangan mengklaim lint, build, atau pengujian manualnya sudah lulus sampai pemilik menjalankannya.
- Setelah pull, jalankan lint dan build, lalu uji alur procurement serta finance dengan data uji.

## Langkah lokal berikutnya

```bash
git pull origin hari-1-auth-dashboard
npm run lint
npm run build
npm run dev
```

Uji finance:
1. Buka detail salah satu event.
2. Tambahkan beberapa kategori dengan anggaran rencana.
3. Tambahkan transaksi pemasukan dan pengeluaran, masing-masing dengan dan tanpa kategori.
4. Pastikan total pemasukan, total pengeluaran, sisa anggaran, dan saldo kas sesuai rumus.
5. Edit dan hapus transaksi.
6. Coba hapus kategori yang sudah dipakai transaksi; pastikan muncul pesan bahwa kategori masih digunakan.
7. Uji juga tambah/edit/hapus kebutuhan pengadaan karena modul procurement ditambahkan pada iterasi sebelumnya.

## Batasan dan prioritas lanjutan

- Jangan mengubah stack, model Owner, atau schema tanpa alasan kuat dan persetujuan pemilik.
- Fitur CSV export masih menjadi kandidat lanjutan sesuai prioritas MVP; XLSX tetap opsional.
- Pemilik berencana menambahkan kebutuhan khusus untuk tugas kuliah secara manual nanti. Saat itu, berikan instruksi/panduan langkah demi langkah dan jangan mengambil alih bagian yang ingin dikerjakan sendiri oleh pemilik.
- Lanjutkan pengembangan setelah hasil uji lokal dikonfirmasi. Hindari mengulang discovery dan audit yang sudah selesai.
