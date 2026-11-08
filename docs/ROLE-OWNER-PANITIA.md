# Fondasi Role Owner dan Panitia

Dokumen ini menjelaskan tahap fondasi role. Implementasi login/invitation dan UI berbasis role merupakan tahap berikutnya; jangan menganggap role Panitia sudah aktif hanya karena migration tersedia.

## Model akun
- **Owner** tetap memakai `auth.users` dan relasi `groups.owner_id` yang sudah ada.
- **Panitia** tetap direpresentasikan oleh baris `members`, lalu dapat dihubungkan ke akun Supabase Auth melalui kolom nullable `members.auth_user_id`.
- Kolom nullable dan foreign key `ON DELETE SET NULL` menjaga seluruh data anggota lama tetap valid. Akun Auth yang dihapus tidak menghapus data anggota.
- Unique partial index mencegah satu akun Auth ditautkan ke lebih dari satu baris anggota.

## Batas akses yang disiapkan

| Area | Owner | Panitia yang ditugaskan |
|---|---|---|
| Grup dan direktori anggota | Kelola | Baca |
| Event | Kelola | Baca event yang ditugaskan |
| Susunan panitia event | Kelola | Baca |
| Rundown, tugas, pengadaan | Kelola | Kelola dalam event yang ditugaskan |
| Kategori anggaran dan transaksi | Kelola | Kelola dalam event yang ditugaskan |

Panitia tidak diberi izin untuk membuat/menghapus event, mengubah anggota grup, atau mengelola susunan panitia. Izin keuangan pada migration ini masih CRUD untuk event yang ditugaskan; jika perlu pembatasan tambahan, kebijakannya harus ditentukan sebelum akun Panitia digunakan.

## Migration
File: `supabase/migrations/20261108_owner_panitia_foundation.sql`

Migration bersifat aditif: tidak menghapus data, mempertahankan policy Owner, menambahkan relasi akun Panitia, dan memberi akses berdasarkan assignment pada `event_members`. Fungsi pemeriksaan akses memakai `SECURITY DEFINER`, fixed `search_path`, dan hak execute terbatas.

**Belum dijalankan ke database.** Review lalu jalankan secara manual melalui Supabase SQL Editor. Jangan jalankan ulang initial `supabase/schema.sql`.

## Status implementasi
1. [x] Audit skema Owner-only dan RLS awal.
2. [x] Siapkan migration fondasi relasi akun Panitia dan RLS event-scoped.
3. [ ] Jalankan migration setelah review dan persetujuan pemilik database.
4. [ ] Tambahkan alur undangan/tautan akun Panitia ke baris `members`.
5. [ ] Tambahkan helper otorisasi server untuk Owner vs Panitia.
6. [ ] Tambahkan dashboard dan navigasi sesuai role.
7. [ ] Uji akses lintas grup/event, termasuk akses URL langsung dan Server Actions.

Migration tidak membuat akun Auth otomatis. Pembuatan akun dan penautan `auth_user_id` dilakukan melalui alur undangan yang diverifikasi pada tahap berikutnya.
