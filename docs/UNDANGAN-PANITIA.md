# Undangan Akun Panitia

Migration ini melanjutkan `20261108_owner_panitia_foundation.sql`.

## Alur
1. Owner membuat undangan untuk satu data anggota dan memasukkan email calon Panitia.
2. Server membuat token acak, menyimpan SHA-256 token saja, lalu menampilkan tautan undangan satu kali kepada Owner.
3. Calon Panitia membuka tautan dan membuat akun / masuk menggunakan email yang sama.
4. Server memanggil RPC `claim_member_invitation`; database mencocokkan hash token, email JWT, masa berlaku, dan status pemakaian secara atomik.
5. Akun terhubung ke `members.auth_user_id`; RLS membatasi data sesuai event assignment.

## Keamanan
- Token mentah tidak disimpan di database.
- Token kedaluwarsa setelah 48 jam (masa berlaku ditentukan server saat membuat undangan).
- Undangan terikat ke email dan hanya dapat digunakan sekali.
- RPC hanya dapat dipanggil oleh pengguna terautentikasi; token tidak memberikan akses sebelum sesi login tersedia.
- Jangan pernah menggunakan service-role key di browser.

## Catatan
Migration membutuhkan extension `pgcrypto` yang menyediakan `digest` melalui schema `extensions` pada Supabase. Jika extension berada di schema berbeda pada project database, sesuaikan pemanggilan fungsi setelah memeriksa instalasi extension.
