# PROJECT STATUS UPDATE — Dashboard Improvement

Tanggal update: 8 November 2026

Melengkapi status update sebelumnya. Semua keputusan stack, keamanan, dan model Owner tetap berlaku.

## Repository
- https://github.com/Abdul-Fikri/mini-event-management
- Branch: `hari-1-auth-dashboard`
- Commit dashboard: `bec59edda4f14bab79309a63926044e887adbba7`
- Jangan push/merge ke `main` tanpa instruksi.
- Jangan commit `.env.local` atau secret Supabase.

## Update pengujian sebelumnya
Pemilik telah mengonfirmasi CSV Export sudah selesai diuji lokal dan aman, setelah sebelumnya procurement dan finance juga dikonfirmasi aman.

## Dashboard yang baru diimplementasikan
File diperbarui:
- `src/app/(app)/dashboard/page.js`

Dashboard Owner sekarang menampilkan:
- Identitas grup aktif dan Owner.
- Total event, anggota, tugas belum selesai, dan pengadaan yang tertunda.
- Jumlah tugas yang melewati deadline.
- Akumulasi pemasukan, pengeluaran, saldo kas, dan rencana anggaran kategori seluruh event.
- Daftar event mendatang.
- Daftar ringkas tugas terlambat dengan tautan menuju detail event.
- Distribusi event berdasarkan status.
- Tombol cepat membuat event.

Semua query dibatasi dengan `group_id` milik Owner. Ringkasan keuangan adalah agregasi seluruh event dalam grup, bukan saldo satu event.

## Status pengujian dashboard
Dashboard baru telah ditulis ke branch GitHub, tetapi lint/build dan verifikasi UI lokal untuk perubahan dashboard masih menunggu konfirmasi pemilik. Jangan mengklaim dashboard baru sudah lulus tes sampai dikonfirmasi.

## Langkah lokal
```bash
git pull origin hari-1-auth-dashboard
npm run lint
npm run build
npm run dev
```

Periksa dashboard dengan grup yang memiliki beberapa event, tugas terlambat, transaksi pemasukan/pengeluaran, dan kategori anggaran. Pastikan angka ringkasan sesuai data dan semua tautan menuju halaman yang benar.

## Rencana restrukturisasi halaman event
Pemilik ingin mempertahankan halaman utama `/events` sebagai master/list seluruh event. Fitur di dalam setiap event akan dipisah menjadi sub-halaman dengan sub-navbar pada konteks event, bukan ditumpuk semua dalam satu halaman detail yang sangat panjang.

Rencana struktur:
- `/events` — master daftar event (tetap).
- `/events/[id]` — overview/detail utama event.
- Sub-halaman event: `panitia`, `rundown`, `tugas`, `pengadaan`, `keuangan`, dan `ekspor`.
- Sub-navbar menampilkan nama event dan navigasi antarbagian.
- Identitas event dan navigasi global tetap konsisten.
- Semua sub-halaman wajib memanggil `requireGroup()`, memverifikasi event dengan `id` dan `group_id`, dan membatasi seluruh query/mutasi pada grup serta event tersebut.
- Gunakan komponen dan Server Actions yang sudah ada; hindari menulis ulang fitur yang telah diuji.
- Rencanakan migrasi bertahap agar tidak merusak tautan, form actions, atau akses data.
- Jangan mulai restrukturisasi sampai pemilik menyetujui/meminta tahap tersebut; saat ini fokus pengujian dashboard.

## Prinsip pengerjaan tugas kuliah
Pemilik berencana mengerjakan fitur tugas kuliah secara manual. Saat diminta, berikan instruksi langkah demi langkah dan biarkan pemilik mengerjakan bagian yang ingin dilakukan sendiri.
