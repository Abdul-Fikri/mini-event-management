# Undangan Akun Panitia

Migration ini melanjutkan `20261108_owner_panitia_foundation.sql` dan `20261109_member_invitations.sql`.

## Alur undangan lama (anggota yang belum memiliki akun)

1. Owner memilih anggota yang belum terhubung, lalu membuat undangan dengan email tujuan.
2. Server membuat token acak 32 byte. Database hanya menyimpan hash SHA-256 token; tautan asli ditampilkan kepada Owner untuk disalin dan dikirim sendiri (tidak ada email otomatis).
3. Tautan berlaku 48 jam, terikat ke email tujuan, dan hanya dapat diklaim sekali.
4. Calon Panitia membuka tautan. Jika belum memiliki akun, buat akun menggunakan email undangan. Jika Supabase meminta konfirmasi email, selesaikan konfirmasi terlebih dahulu.
5. Setelah akun aktif, masuk menggunakan email undangan dan buka kembali tautan yang sama.
6. Tekan **Terima undangan**. Server menjalankan RPC `claim_member_invitation`; database memvalidasi hash token, email JWT, masa berlaku, dan status pemakaian secara atomik.
7. Setelah berhasil, `members.auth_user_id` terhubung dan aplikasi mengarahkan Panitia ke workspace Panitia.

## Perbaikan UX pada PR #38

- Tombol Terima undangan menampilkan status proses dan menonaktifkan tombol saat permintaan berlangsung.
- Kesalahan klaim ditampilkan langsung pada halaman, tidak hanya melalui redirect query yang sulit terlihat.
- Setelah klaim sukses, client melakukan navigasi ke `/panitia` dan refresh; tautan alternatif tetap tersedia jika navigasi tidak berpindah.
- Halaman undangan menjelaskan urutan buat akun → konfirmasi email (jika diminta) → login → buka kembali tautan → terima undangan.
- Modal CRUD anggota tidak lagi menampilkan tombol Batal yang hanya menavigasi ke URL yang sama; gunakan tombol × pada header modal.
- Form akun anggota memiliki konfirmasi password. Password tidak pernah dikembalikan ke form state atau disimpan di tabel anggota.

## Keamanan

- Token mentah tidak disimpan di database.
- Undangan kedaluwarsa setelah 48 jam.
- Undangan terikat ke email dan hanya dapat digunakan sekali.
- RPC hanya dapat dipanggil oleh pengguna terautentikasi; token tidak memberikan akses sebelum sesi login tersedia.
- Jangan pernah menggunakan service-role key di browser.

## Catatan

Migration membutuhkan extension `pgcrypto` yang menyediakan `digest` melalui schema `extensions` pada Supabase. Jika extension berada di schema berbeda pada project database, sesuaikan pemanggilan fungsi setelah memeriksa instalasi extension.
