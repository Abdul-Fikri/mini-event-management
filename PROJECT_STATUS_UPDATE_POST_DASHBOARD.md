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


## UPDATE PENTING — Rubrik Penilaian Akhir/UAS

Tanggal informasi: 8 November 2026  
Bobot penilaian proyek akhir/UAS dalam RPS: **40%**.

Aplikasi wajib didemonstrasikan sebagai aplikasi web berbasis Next.js yang sudah **online di Vercel**. Kriteria yang disampaikan pemilik:

### 1. Arsitektur & Routing — 25% (CPMK131)
- Menggunakan Next.js App Router.
- Mengimplementasikan Nested Layout.
- Menggunakan Dynamic Routes dengan parameter `[id]`.
- Memisahkan Server Components dan Client Components secara tepat.

### 2. Strategi Rendering — 25% (CPMK131)
- Mengimplementasikan minimal **2 strategi pengambilan data/rendering yang berbeda**.
- Contoh dari rubrik: SSG/ISR untuk halaman katalog publik dan SSR/CSR untuk dashboard interaktif.
- Implementasi perlu menunjukkan dengan jelas halaman mana memakai strategi apa; jangan hanya mengandalkan klaim tanpa bukti saat demonstrasi.

### 3. Integrasi API CRUD, State Global, & Autentikasi — 25% (CPMK132)
- Memiliki fitur pengelolaan data CRUD.
- Memiliki state global menggunakan Context API atau Zustand.
- Memiliki proteksi halaman login menggunakan `middleware.js` (istilah persis sesuai rubrik yang diterima).

### Catatan kelengkapan rubrik
Tiga komponen bobot yang diberikan berjumlah **75%**, bukan 100%. Informasi rubrik yang diterima berhenti setelah kriteria ketiga; **sisa 25% belum diketahui**. Jangan mengarang kriteria sisanya. Minta bagian rubrik lanjutan jika diperlukan.

## Dampak terhadap kondisi proyek saat ini

Fitur CRUD inti sudah tersedia untuk event, anggota/panitia, rundown, tugas, pengadaan, dan keuangan. Dynamic route `/events/[id]` juga sudah digunakan. Dashboard dan halaman aplikasi saat ini dibangun dengan App Router serta pola Server Components untuk pengambilan data. Namun, hal-hal berikut **belum boleh dianggap terpenuhi** hanya berdasarkan fitur yang sudah ada:

- **Nested Layout:** perlu diaudit dan dipastikan struktur layout bertingkatnya benar-benar memenuhi rubrik.
- **Server/Client Components:** perlu ditinjau pemisahan tiap halaman dan komponen interaktif.
- **Dua strategi rendering:** belum ada bukti implementasi eksplisit SSG/ISR untuk katalog publik. Rencanakan satu halaman publik/katalog yang cocok untuk SSG atau ISR, lalu dokumentasikan strategi rendering dashboard/aplikasi yang dinamis.
- **Global state:** belum tercatat adanya Context API atau Zustand. Ini merupakan gap yang harus ditangani.
- **Proteksi autentikasi:** repo saat ini menggunakan `src/proxy.js` pada Next.js 16. Rubrik menyebut `middleware.js`; verifikasi kompatibilitas istilah/konvensi Next.js versi proyek dan siapkan penjelasan yang dapat dipertanggungjawabkan saat demo. Jangan menambahkan file middleware secara membabi buta atau merusak mekanisme proxy yang sudah ada.
- **Deployment Vercel:** belum ada konfirmasi aplikasi sudah berhasil dideploy dan dapat diakses online. Deployment dan verifikasi production merupakan syarat demonstrasi.

## Prioritas pengembangan berdasarkan rubrik

1. Pertahankan fitur CRUD yang sudah ada dan pastikan semua operasi bisa didemonstrasikan.
2. Audit App Router, Dynamic Routes, Nested Layout, serta batas Server/Client Components.
3. Rancang dua strategi rendering yang nyata dan mudah dibuktikan, misalnya katalog publik SSG/ISR dan dashboard dinamis.
4. Tambahkan state global yang memang digunakan aplikasi (Context API atau Zustand), bukan sekadar dipasang tanpa kebutuhan.
5. Audit proteksi route autentikasi terhadap rubrik dan Next.js 16.
6. Deploy ke Vercel, konfigurasi environment variables dengan aman, lalu uji alur utama pada URL production.
7. Minta rubrik lengkap untuk mengetahui komponen penilaian yang belum disampaikan (25%).

Rubrik ini menjadi constraint utama untuk keputusan arsitektur dan urutan pengerjaan selanjutnya. Jangan mengubah stack atau menambahkan dependensi besar tanpa alasan yang jelas.
