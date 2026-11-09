# Status Implementasi — Mini Event Management System

Tanggal pemeriksaan: 8 November 2026  
Repository: https://github.com/Abdul-Fikri/mini-event-management  
Branch yang diperiksa: `hari-1-auth-dashboard`

## Ringkasan

Pemeriksaan dilakukan terhadap source code pada branch di atas. Modul-modul utama yang sebelumnya dianggap masih perlu dibuat ternyata **sudah memiliki halaman, komponen, dan/atau Server Actions**. Karena itu, pekerjaan berikutnya bukan membangun ulang fitur, melainkan validasi alur nyata, memperbaiki bug yang ditemukan, dan memastikan kesesuaian perilaku dengan kebutuhan produk.

**Penting:** status "implemented" di dokumen ini berarti implementasinya ditemukan di source code. Itu bukan klaim bahwa semua alur telah lulus pengujian end-to-end, production build, atau pengujian multi-user.

## 1. Status fitur berdasarkan source code

| Modul | Implementasi yang ditemukan | Status |
|---|---|---|
| Anggota Panitia | Daftar, tambah, edit, hapus anggota; validasi Zod; pembatasan berdasarkan grup | Implemented |
| Penugasan anggota ke event | CRUD relasi melalui `event_members`; validasi event dan anggota harus berada pada grup Owner | Implemented |
| Susunan Panitia | Halaman daftar penugasan, divisi, jabatan, tanggung jawab, edit dan keluarkan anggota | Implemented |
| Rundown | Tambah, edit, hapus; validasi tanggal terhadap rentang event; PIC anggota grup | Implemented |
| Tasks | Tambah, edit, hapus; status/prioritas/deadline; validasi PIC anggota grup | Implemented |
| Procurement | Tambah, edit, hapus kebutuhan; kuantitas, estimasi/aktual, status, supplier, PIC | Implemented |
| Finance | CRUD kategori anggaran dan transaksi; pemasukan/pengeluaran; kategori dan pencatat divalidasi | Implemented |
| CSV Export | Endpoint ekspor CSV untuk committee, schedule, tasks, procurement, finance, dan members | Implemented, perlu validasi |
| Workspace Panitia | Undangan, klaim token, daftar event yang ditugaskan, halaman detail event read-only | Implemented, perlu validasi akses |

## 2. Referensi source code yang diperiksa

### Anggota dan penugasan
- `src/app/(app)/members/page.js`
- `src/app/(app)/members/new/page.js`
- `src/app/(app)/members/[id]/edit/page.js`
- `src/actions/members.js`
- `src/components/members/MemberForm.js`
- `src/actions/event-members.js`
- `src/app/(app)/events/[id]/panitia/page.js`
- `src/components/events/EventMemberForm.js`

### Rundown, tugas, pengadaan, keuangan
- `src/app/(app)/events/[id]/rundown/page.js`
- `src/actions/schedule.js`
- `src/components/events/ScheduleSection.js`
- `src/app/(app)/events/[id]/tugas/page.js`
- `src/actions/tasks.js`
- `src/components/events/TaskSection.js`
- `src/app/(app)/events/[id]/pengadaan/page.js`
- `src/actions/procurement.js`
- `src/components/events/ProcurementSection.js`
- `src/app/(app)/events/[id]/keuangan/page.js`
- `src/actions/finance.js`
- `src/components/events/FinanceSection.js`

### Workspace dan ekspor
- `src/actions/invitations.js`
- `src/app/(public)/join/page.js`
- `src/app/(panitia)/panitia/page.js`
- `src/app/(panitia)/panitia/events/[id]/page.js`
- `src/app/api/events/[id]/export/[type]/route.js`
- `src/app/(app)/events/[id]/ekspor/page.js`

## 3. Temuan dan batasan yang perlu diperhatikan

### 3.1 Workspace Panitia bersifat read-only
Halaman workspace yang diperiksa menampilkan informasi event, rundown, tugas, dan pengadaan. Tidak ditemukan aksi bagi anggota panitia untuk mengubah status tugas atau mengedit data dari workspace. Ini konsisten dengan konsep akses baca yang tercatat pada status proyek. Jangan menganggap workspace sudah menyediakan kolaborasi/edit mandiri.

### 3.2 Jenis ekspor CSV
Endpoint saat ini mendukung:
- `committee`
- `schedule`
- `tasks`
- `procurement`
- `finance`
- `members`

**Catatan pemeriksaan:** konfigurasi ekspor `members` mengambil seluruh anggota pada grup (`group_id`), bukan hanya anggota yang ditugaskan ke event tertentu. Perlu diputuskan apakah ini memang ekspor daftar anggota grup atau seharusnya daftar anggota event. Jangan mengubahnya tanpa keputusan produk.

### 3.3 Undangan Panitia
Implementasi membuat token acak, menyimpan hash token, dan menetapkan masa berlaku 48 jam. Klaim undangan memakai RPC `claim_member_invitation`. Alur ini bergantung pada migration/RPC yang sesuai sudah diterapkan di Supabase dan perlu diuji dengan akun/email yang cocok.

### 3.4 Pengujian belum terbukti
Pemeriksaan GitHub ini membaca source code. Pemeriksaan ini tidak menjalankan browser aplikasi, Supabase project, lint, atau production build. Jadi jangan menulis bahwa semua fitur sudah lolos pengujian.

## 4. Checklist validasi yang masih disarankan

- [ ] Tambah, edit, hapus anggota dan pastikan dashboard/list ikut diperbarui.
- [ ] Tambahkan anggota ke event, edit divisi/jabatan/tanggung jawab, lalu keluarkan.
- [ ] Pastikan anggota dari grup lain tidak dapat dipilih/ditugaskan.
- [ ] Tambah, edit, hapus rundown; uji batas tanggal dan PIC.
- [ ] Tambah, edit, hapus tugas; uji PIC, deadline, status, prioritas.
- [ ] Tambah, edit, hapus item pengadaan; cek nilai estimasi dan aktual.
- [ ] Tambah kategori dan transaksi pemasukan/pengeluaran; uji kategori yang sedang dipakai agar tidak bisa dihapus sembarangan.
- [ ] Undang anggota menggunakan email uji; klaim dengan akun yang sesuai; uji token kedaluwarsa/digunakan.
- [ ] Pastikan akun panitia hanya melihat event yang ditugaskan dan tidak bisa membuka event lain dengan mengganti URL.
- [ ] Unduh setiap jenis CSV dan periksa isi, encoding, serta cakupan data.
- [ ] Jalankan lint dan production build pada environment proyek.
- [ ] Uji tampilan responsif, empty/loading/error/success state.
- [ ] Uji tab aktif pada subnavigasi event: Overview, Panitia, Rundown, Tugas, Pengadaan, Keuangan, dan Ekspor.

## 5. Arahan kerja untuk sesi berikutnya

1. Jangan membuat ulang modul-modul pada tabel status.
2. Minta hasil uji konkret atau screenshot/error jika sebuah alur gagal.
3. Perbaiki bug pada source yang ada; jangan mengubah schema/RLS tanpa alasan yang terverifikasi.
4. Jangan menjalankan ulang migration/schema yang sudah diterapkan.
5. Gunakan branch `hari-1-auth-dashboard` dan root aplikasi di `src/`; folder legacy nested `event-management/` sudah dihapus pada branch ini.
6. Jangan meminta atau menampilkan isi `.env.local`.
7. Jangan commit/push perubahan baru kecuali pemilik proyek meminta atau sudah menyetujui cara kerja tersebut.
8. Owner adalah satu-satunya role login utama; anggota panitia adalah data anggota dan dapat mengklaim undangan untuk akses workspace sesuai desain yang ada.

## 6. Perubahan logo terbaru

Perbaikan tombol hapus logo sudah dibuat pada commit:
`d79f368a34c67c4d875a50c69c1c85fd5dce9d17`

File:
`src/components/settings/GroupLogoForm.js`

Perubahan memakai handler `removeLogoAction` untuk menambahkan `remove=true` ke FormData sebelum memanggil Server Action, menghindari konflik atribut `name` dengan `formAction`.

## 7. Perbaikan subnavigasi event

Pada branch `hari-1-auth-dashboard`, subnavigasi di halaman detail event sekarang menandai tab yang sedang aktif berdasarkan pathname:
- Overview
- Panitia
- Rundown
- Tugas
- Pengadaan
- Keuangan
- Ekspor

Implementasi:
- `src/components/events/EventSubnav.js` — Client Component menggunakan `usePathname()` untuk menentukan tab aktif, memberi styling aktif, dan mengisi `aria-current="page"`.
- `src/app/(app)/events/[id]/layout.js` — menggunakan komponen `EventSubnav`.

Perubahan sudah masuk ke source branch dan PR yang terbuka. Belum diklaim lolos build atau verifikasi browser; tetap uji setelah branch dideploy.


## 8. Audit dan optimasi performa dashboard (9 November 2026)

Pengamatan awal dari screenshot Lighthouse production:
- Performance: 82
- Accessibility: 100
- Best Practices: 100
- SEO: 100

Skor 82 berada pada rentang "perlu peningkatan", bukan kategori buruk. Screenshot tidak memperlihatkan nilai detail FCP, LCP, Speed Index, Total Blocking Time, dan CLS; karena itu akar penyebab skor belum dapat dipastikan hanya dari screenshot.

Perubahan source pada branch `perf/dashboard-data-queries`:
- Memperbaiki deklarasi `dynamic = "force-dynamic"` dan metadata Dashboard yang sebelumnya tertulis sebagai teks `\\n` di dalam komentar sehingga deklarasi tersebut tidak aktif.
- Menghapus kolom `target_budget` dari query event dan `priority` dari query tugas karena tidak digunakan oleh tampilan Dashboard.
- Membatasi query tugas ke status yang belum selesai (`status != done`).
- Membatasi query pengadaan ke status tertunda (`not_started` dan `requested`).

Perubahan tersebut mengurangi kolom dan baris yang dikirim dari Supabase tanpa mengubah agregat yang ditampilkan, dengan asumsi kolom status mengikuti nilai/status yang dipakai aplikasi.

Status verifikasi:
- Source telah diperbarui dan ditinjau ulang melalui GitHub.
- Belum menjalankan `npm run lint`, `npm run build`, atau Lighthouse ulang.
- Belum mengukur dampak numerik perubahan pada Performance score.
- PR perlu di-merge dan production deployment selesai sebelum pengukuran ulang di domain production.
