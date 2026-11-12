# Role Owner dan Panitia

Dokumen ini menggambarkan implementasi role yang ditemukan pada source saat ini. Status database production tetap perlu diverifikasi secara terpisah.

## 1. Model akun

- **Owner** menggunakan Supabase Auth (\`auth.users\`) dan memiliki grup melalui \`groups.owner_id\`.
- **Panitia** adalah baris pada \`members\`; akun Auth dapat dihubungkan melalui \`members.auth_user_id\`.
- Hubungan anggota dengan event disimpan pada \`event_members\`.
- Satu akun Panitia dapat melihat event yang memiliki assignment untuk anggota tersebut.

## 2. Hak dan ruang kerja

| Area | Owner | Panitia yang ditugaskan |
|---|---|---|
| Grup dan direktori anggota | Kelola | Akses terbatas sesuai RLS |
| Event | CRUD | Baca event yang ditugaskan |
| Susunan panitia event | Kelola | Baca |
| Rundown | CRUD | Baca |
| Tugas | CRUD | Baca |
| Pengadaan | CRUD | Baca |
| Keuangan | CRUD | Tidak ditampilkan pada workspace Panitia saat ini |
| Undangan anggota | Buat/kelola | Klaim undangan sendiri |

Catatan: tabel akses menggambarkan alur aplikasi/UI yang ditemukan. Policy database dan kemampuan query harus selalu diperiksa pada migration serta Supabase project yang aktual.

## 3. Alur Owner

1. Owner register/login.
2. Owner membuat atau melengkapi grup.
3. Owner mengelola direktori anggota pada menu Anggota Panitia.
4. Owner membuat event.
5. Owner membuka tab Panitia pada event, mengelola daftar divisi khusus event tersebut, lalu menambahkan anggota grup dan memilih divisi dari dropdown.
6. Owner mengisi rundown, tugas, pengadaan, dan keuangan.
7. Untuk memberikan akses workspace, Owner membuat undangan untuk data anggota dan email yang sesuai.

## 4. Alur Panitia

1. Owner membuat invitation untuk anggota dan email.
2. Server membuat token acak; database menyimpan hash SHA-256 token, bukan token mentah.
3. Calon Panitia membuka tautan, login/register dengan email yang sama, lalu mengklaim undangan.
4. RPC \`claim_member_invitation\` memvalidasi token, email, expiry, dan status penggunaan.
5. Akun terhubung ke \`members.auth_user_id\`.
6. Panitia melihat daftar event yang memiliki relasi \`event_members\` untuk anggota tersebut.

Workspace Panitia saat ini read-only: menampilkan detail event, rundown, tugas, dan pengadaan. Belum ada fitur untuk Panitia mengubah status tugas atau mengedit data operasional pada UI yang diperiksa.

## 5. Aturan keanggotaan event

Keanggotaan grup dan keanggotaan event adalah dua hal berbeda.

- Anggota yang ada pada tabel \`members\` belum otomatis menjadi panitia suatu event.
- Owner harus menambahkan anggota melalui tab Panitia event.
- Master divisi dikelola Owner per event melalui bagian Kelola divisi. Nama divisi pada form penugasan dipilih dari daftar, bukan diisi sebagai teks bebas.
- Perubahan nama master memperbarui label divisi penugasan. Penghapusan master melepas referensi tetapi mempertahankan nama lama sebagai label historis.
- Dropdown PIC rundown, assignee tugas, dan PIC pengadaan hanya menampilkan anggota yang sudah terdaftar di \`event_members\` untuk event itu.
- Server Actions juga memvalidasi assignment tersebut, jadi filter dropdown bukan satu-satunya pengaman.
- Jika anggota dikeluarkan dari susunan panitia, evaluasi assignment PIC/tugas/pengadaan yang sudah ada sebelum melakukan perubahan data terkait.

## 6. Implementasi terkait

- Auth helpers: \`src/lib/auth.js\`.
- Proxy/session: \`src/proxy.js\`, \`src/lib/supabase/proxy.js\`.
- Event assignment: \`src/actions/event-members.js\`.
- Event division CRUD: \`src/actions/event-divisions.js\` dan \`src/components/events/EventDivisionManager.js\`.
- Division migration: \`supabase/migrations/20261112_event_divisions.sql\`.
- Invitation: \`src/actions/invitations.js\`.
- Panitia home: \`src/app/(panitia)/panitia/page.js\`.
- Panitia event detail: \`src/app/(panitia)/panitia/events/[id]/page.js\`.
- RLS foundation: \`supabase/migrations/20261108_owner_panitia_foundation.sql\`.
- Invitation RPC: \`supabase/migrations/20261109_member_invitations.sql\`.

## 7. Catatan keamanan

- Jangan mengandalkan menu/navigasi untuk membatasi akses.
- Validasi role, group, dan event pada server.
- Pertahankan RLS sebagai lapisan database.
- Jangan menambahkan kemampuan edit untuk Panitia sebelum aturan produk, UI, Server Actions, dan RLS disepakati bersama.
- Jangan menyimpulkan migration sudah diterapkan hanya karena file migration tersedia di repository.
