# PROJECT STATUS UPDATE — CSV Export

Tanggal update: 8 November 2026

Melengkapi `PROJECT_STATUS_UPDATE_POST_FINANCE.md`. Keputusan produk, stack, keamanan, dan batasan MVP sebelumnya tetap berlaku.

## Repository
- Repository: https://github.com/Abdul-Fikri/mini-event-management
- Branch: `hari-1-auth-dashboard`
- Commit implementasi: `cc467d0c4ee27560bbbefea15ab63e152eafc0d9`
- Commit perbaikan encoding CSV: `f573f8cd16f58dc6cc2c3d46137e3741befb8c94`
- Jangan push/merge ke `main` tanpa instruksi.
- Jangan commit `.env.local` atau secret.

## Fitur CSV Export

File baru:
- `src/app/api/events/[id]/export/[type]/route.js`
- `src/components/events/EventExportSection.js`

File diperbarui:
- `src/app/(app)/events/[id]/page.js`

Enam unduhan CSV terpisah tersedia dari halaman detail event:
1. Data anggota grup.
2. Susunan panitia event.
3. Rundown acara.
4. Daftar tugas.
5. Pengadaan/perlengkapan.
6. Transaksi keuangan.

Detail teknis:
- Route Handler memeriksa sesi Owner dan memastikan event milik grup Owner.
- Semua query event-scoped dibatasi dengan `event_id` dan `group_id`; data anggota menggunakan `group_id`.
- Output CSV memakai UTF-8 BOM agar lebih mudah dibuka di Excel dan CRLF untuk baris.
- Nilai di-quote dan tanda kutip di-escape.
- Nilai yang berpotensi menjadi formula spreadsheet diberi prefix apostrof untuk mengurangi risiko CSV formula injection.
- Nama file disanitasi dan respons menggunakan `Cache-Control: private, no-store`.
- Tidak ada dependency tambahan dan tidak perlu perubahan SQL.

## Status pengujian
- Pemilik telah mengonfirmasi procurement dan finance aman setelah pengujian lokal.
- CSV Export baru ditulis ke GitHub; lint/build dan unduhan aktual masih perlu diuji lokal. Jangan mengklaim fitur CSV sudah lolos pengujian sampai dikonfirmasi.

## Langkah lokal
```bash
git pull origin hari-1-auth-dashboard
npm run lint
npm run build
npm run dev
```

Buka detail event dan coba keenam tautan unduhan CSV. Periksa hasilnya di Excel atau Google Sheets, termasuk karakter Indonesia, kolom kosong, tanda kutip, dan isi data yang benar. Pastikan akun tanpa sesi tidak dapat mengunduh, serta event dari grup lain tidak bisa diakses.

## Progres keseluruhan
Auth/onboarding, dashboard, Event CRUD, anggota, susunan panitia, rundown, task, procurement, finance telah diimplementasikan. CSV export kini diimplementasikan dan menunggu pengujian lokal. Fitur khusus tugas kuliah akan dikerjakan manual oleh pemilik dengan panduan langkah demi langkah saat diminta.
