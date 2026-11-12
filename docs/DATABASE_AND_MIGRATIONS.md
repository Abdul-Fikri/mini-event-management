# Database & Migrations — Supabase PostgreSQL

Panduan database untuk Mini Event Management. Dokumen ini menjelaskan keadaan repository dan prosedur yang aman; bukan bukti bahwa semua migration sudah diterapkan ke production.

## 1. Database stack saat ini

- Database: Supabase PostgreSQL.
- Auth: Supabase Auth (\`auth.users\`).
- Storage: Supabase Storage (bucket \`group-logos\`).
- Data access: \`@supabase/supabase-js\` dan \`@supabase/ssr\`.
- ORM: tidak ada Prisma/Drizzle/Eloquent dalam dependencies saat ini.
- Migration files: SQL di \`supabase/migrations/\`.
- Initial schema: \`supabase/schema.sql\`.

Next.js tidak menyediakan ORM atau migration command bawaan. Supabase Client digunakan untuk query dari aplikasi, sedangkan schema/migration dikelola terpisah.

## 2. Initial schema vs migration

### \`supabase/schema.sql\`

Ini adalah schema awal untuk membuat objek inti database pada database kosong. File ini berisi tabel, constraint, index, trigger, grants, dan RLS awal.

**Jangan jalankan file ini pada database yang sudah berisi tabel project.** File ini bukan migration incremental dan memiliki pemeriksaan konflik yang memang menghentikan eksekusi jika objek sudah ada.

### \`supabase/migrations/\`

Folder ini berisi perubahan bertahap setelah schema awal. File yang saat ini ada:

| File | Tujuan berdasarkan isi file |
|---|---|
| \`20261108_owner_panitia_foundation.sql\` | Menambah \`members.auth_user_id\`, helper membership, dan RLS read untuk Panitia per event |
| \`20261109_member_invitations.sql\` | Tabel undangan, token hash, masa berlaku, RPC \`claim_member_invitation\` |
| \`20261110_group_logos.sql\` | Kolom \`groups.logo_url\` dan policy Storage untuk bucket logo |
| \`20261111_group_logo_bucket.sql\` | Memastikan bucket publik \`group-logos\` tersedia dengan batas 2 MB dan MIME JPG/PNG/WebP; tidak mengubah policy akses |
| `20261111_procurement_finance_integration.sql` | Menambah status Dipesan, kategori/tanggal pembelian, relasi transaksi ke item, dan trigger otomatis sinkronisasi pengeluaran; mempertahankan kolom kompatibel yang sudah ada dan memvalidasi tipenya |
| `20261112_event_divisions.sql` | Membuat master divisi per event, menambahkan `event_members.division_id`, memigrasikan label divisi lama, dan menjaga snapshot label untuk Panitia/CSV |
| `20261112_event_lifecycle_automation.sql` | Menambah mode status otomatis/manual, tanggal fase perencanaan/persiapan/evaluasi, dan constraint urutan tanggal |

Migration tambahan yang sudah masuk `main`: `20261111_procurement_finance_integration.sql` menambah status Dipesan, kategori/tanggal pembelian, relasi item pengadaan ke transaksi, dan trigger otomatis pencatatan pengeluaran. Migration `20261112_event_divisions.sql` menambahkan master divisi khusus event dan relasi penugasan panitia. Migration event lifecycle `20261112_event_lifecycle_automation.sql` menambah mode status otomatis/manual dan tanggal timeline. Urutan migration: foundation → invitations → group logo policies → group logo bucket → procurement-finance integration → event divisions → event lifecycle automation. Periksa isi migration dan status remote sebelum menjalankan apa pun.

**Penting:** file SQL di GitHub tidak membuktikan migration sudah dijalankan. Status migration production belum dianggap terkonfirmasi sampai diperiksa pada Supabase project yang benar.

`supabase/schema.sql` juga memuat struktur Procurement–Finance dan master divisi event untuk instalasi database baru. Master divisi memakai tabel `event_divisions`; `event_members.division_id` menjadi referensi utama, sedangkan kolom teks `event_members.division` dipertahankan sebagai snapshot tampilan/ekspor. Jangan jalankan ulang `schema.sql` pada database yang sudah berisi tabel project.

## 3. Cara manual melalui Supabase SQL Editor

Ini cara paling sederhana untuk belajar dan mengelola SQL secara manual.

1. Buka Supabase Dashboard dan pilih project yang benar.
2. Buka **SQL Editor**.
3. Klik **New Query**.
4. Buka file migration yang memang belum diterapkan dari repository.
5. Review seluruh SQL dan prasyaratnya.
6. Copy SQL ke SQL Editor.
7. Klik **Run**.
8. Periksa hasil sukses/error.
9. Verifikasi objek yang diharapkan di Table Editor/SQL Editor.
10. Catat tanggal, nama file, environment, dan hasil penerapan.

Jika SQL Editor melaporkan `42701: column ... already exists`, jangan hapus kolom tersebut. Migration Procurement–Finance kini menggunakan `ADD COLUMN IF NOT EXISTS` untuk kolom integrasi dan memeriksa tipe `uuid`/`date` yang diharapkan. Ambil file terbaru dari `main`, review kembali objek terkait, lalu jalankan hanya jika migration memang belum berhasil diterapkan. Percobaan yang gagal bukan bukti bahwa migration sudah selesai.

Jangan menjalankan migration lama berulang kali. Beberapa statement mungkin memakai \`IF NOT EXISTS\`, tetapi itu tidak menjamin keseluruhan migration aman diulang karena bisa ada policy/function/constraint yang berubah.

## 4. Supabase CLI (workflow yang bisa dipakai kemudian)

Supabase CLI memberikan workflow yang lebih mirip \`php artisan migrate\`. CLI bukan ORM.

Contoh alur standar setelah project dikonfigurasi:

\`\`\`bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase migration list --remote
npx supabase db push --dry-run
npx supabase db push
\`\`\`

Untuk membuat migration baru:

\`\`\`bash
npx supabase migration new descriptive_migration_name
\`\`\`

Lalu tulis SQL ke file yang dibuat. Sebelum push, periksa remote migration history dan review SQL.

Catatan project saat ini:
- \`supabase\` CLI belum tercatat sebagai dependency di \`package.json\`.
- Tidak ada \`supabase/config.toml\` pada tree yang diperiksa.
- Karena itu, jangan menganggap workflow CLI sudah dikonfigurasi atau siap dipakai tanpa setup.
- Gunakan versi CLI yang didukung dokumentasi Supabase saat setup nanti.

## 5. Migration history dan perubahan manual

Supabase CLI menggunakan migration history remote untuk mengetahui file mana yang sudah diterapkan. Jika schema pernah diubah langsung melalui SQL Editor, history CLI bisa tidak sinkron dengan kondisi database.

Sebelum mulai menggunakan \`db push\` pada project yang sebelumnya dikelola manual:

1. Periksa tabel migration history pada database remote.
2. Bandingkan dengan file di \`supabase/migrations/\`.
3. Periksa schema aktual.
4. Tentukan migration mana yang sudah diterapkan.
5. Sinkronkan history dengan prosedur resmi Supabase hanya setelah memastikan kondisi database; jangan menandai migration sebagai applied berdasarkan tebakan.

\`supabase db pull\` dapat membantu menangkap perubahan schema remote, tetapi hasilnya perlu direview. Jangan menjalankan \`db reset\` pada database remote/production.

## 6. Prinsip membuat migration baru

- Buat satu file untuk satu perubahan logis.
- Gunakan prefix timestamp dan nama deskriptif.
- Pilih perubahan additive jika memungkinkan.
- Pertimbangkan data lama, default, nullability, foreign key, unique constraint, index, trigger, grants, dan RLS.
- Untuk perubahan destruktif, buat rencana backup, migrasi data, recovery, dan persetujuan.
- Gunakan transaksi bila sesuai dengan operasi SQL yang dilakukan.
- Pastikan migration aman terhadap urutan dan dependency.
- Jangan hardcode data rahasia.
- Perbarui dokumentasi database dan AI context.

Contoh migration sederhana:

\`\`\`sql
begin;

alter table public.members
  add column phone_number text;

commit;
\`\`\`

Contoh ini hanya ilustrasi. Jangan jalankan di production sebelum memeriksa apakah kolom sudah ada dan apakah perubahan sesuai kebutuhan.

## 7. Verifikasi setelah migration

- Periksa tabel/kolom/constraint/function/policy yang diharapkan.
- Periksa error SQL Editor dan migration history.
- Uji query melalui aplikasi dengan role Owner dan Panitia.
- Uji akses yang seharusnya ditolak.
- Jangan menonaktifkan RLS sebagai shortcut.
- Pastikan aplikasi dan database menggunakan schema yang sama.

## 8. Data model inti

- \`groups\`: grup Owner.
- \`members\`: anggota grup; dapat ditautkan ke Auth lewat \`auth_user_id\`.
- \`events\`: event milik grup.
- `event_members`: assignment anggota ke event; `division_id` mengarah ke master divisi event.
- `event_divisions`: master divisi per event, unik berdasarkan nama tanpa membedakan kapitalisasi di dalam event yang sama.
- \`schedule_items\`: rundown.
- \`tasks\`: tugas.
- `procurement_items`: kebutuhan/pengadaan; migration integrasi menambahkan `category_id`, `purchased_date`, dan status `ordered`.
- \`budget_categories\`: kategori anggaran.
- `transactions`: transaksi pemasukan/pengeluaran; migration integrasi menambahkan `procurement_item_id` yang unik dan nullable.
- \`member_invitations\`: undangan akun Panitia (migration).
- \`storage.objects\`: objek logo pada bucket \`group-logos\`.

Relasi Pengadaan–Keuangan: satu item pengadaan maksimal memiliki satu transaksi pengeluaran otomatis. Foreign key komposit menjaga item dan transaksi tetap berada pada event/grup yang sama. Penghapusan item pengadaan melepas relasi tetapi mempertahankan transaksi sebagai histori. Trigger membuat transaksi saat item baru dibuat berstatus purchased/ready atau saat status berubah dari status non-pembelian ke purchased/ready; perubahan berikutnya pada item yang sudah terhubung menyinkronkan nominal, kategori, tanggal, deskripsi, dan referensi. Item lama tidak di-backfill otomatis dan memerlukan aksi sinkronisasi eksplisit. Trigger/helper berjalan sebagai invoker dan tetap tunduk pada policy RLS Owner yang sudah ada; migration tidak mengubah policy RLS.

Relasi penting: \`event_members\` menghubungkan \`members\` dengan \`events\`. Jangan menyamakan anggota grup dengan anggota event.

## 9. Keamanan

- Jangan pernah menaruh service-role key di browser.
- Gunakan publishable key pada aplikasi browser.
- RLS harus aktif dan policy ditinjau.
- Batasi mutasi dari server berdasarkan Owner/grup/event.
- Function \`SECURITY DEFINER\` harus memiliki \`search_path\` aman dan hak execute terbatas.
- Jangan mencetak token undangan mentah atau credential di log.
- Jangan menyalin nilai environment variable ke dokumentasi.


## 10. Group logo Storage dan upload server-side

Bucket `group-logos` digunakan untuk menyimpan logo per grup dengan pola object path `GROUP_UUID/random-file-name.ext`.

### Bucket dan policy

- Migration `20261110_group_logos.sql` menambahkan `groups.logo_url` dan policy owner-only pada `storage.objects`.
- Migration `20261111_group_logo_bucket.sql` memastikan bucket `group-logos` tersedia sebagai public bucket dengan batas 2 MB dan MIME JPG/PNG/WebP.
- Public bucket berarti gambar dapat diambil melalui public URL. Itu **tidak** berarti pengunjung anonim boleh mengunggah atau menghapus objek.
- PR #16 tidak mengubah schema, bucket, atau policy RLS dan tidak menambahkan migration SQL.

### Alur aplikasi saat ini

1. `src/components/settings/GroupLogoForm.js` mengirim file ke Server Action `uploadGroupLogo()`; browser tidak melakukan upload langsung ke Storage.
2. `src/actions/group-logo.js` memanggil `requireGroup()` sebelum operasi Storage. Identitas Owner dan grup diambil dari sesi/database server, bukan dari `group_id` yang dikirim browser.
3. Server memvalidasi ukuran, MIME type, dan signature file.
4. `src/lib/supabase/admin.js` membuat client privileged dengan import `server-only`. Client ini hanya dipakai di server untuk upload dan cleanup objek Storage.
5. URL logo disimpan ke `public.groups.logo_url` memakai Supabase server client berbasis sesi Owner, dengan filter `id` grup dan `owner_id` Owner.
6. Saat penggantian/penghapusan, file lama dibersihkan setelah metadata grup berhasil diperbarui.

### Environment variable

Sediakan salah satu key berikut pada environment server (lokal/Vercel):

- `SUPABASE_SECRET_KEY` (pilihan utama untuk secret key baru), atau
- `SUPABASE_SERVICE_ROLE_KEY` (kompatibilitas key legacy).

Jangan menambahkan prefix `NEXT_PUBLIC_`. Jangan pernah menaruh nilai key di browser, dokumentasi, commit, screenshot, log, atau chat.

### Implikasi keamanan

Privileged key melewati RLS Storage. Karena itu, setiap jalur pemakaian wajib memverifikasi Owner dan grup di server terlebih dahulu. Jangan menghapus RLS, membuat bucket write-public, mengimpor admin client ke Client Component, atau memakai privileged client sebagai pengganti otorisasi. Metadata grup tetap ditulis dengan client session Owner agar kebijakan `groups` tetap berlaku.

Pemilik mengonfirmasi upload logo berhasil setelah PR #16 merged. Penghapusan logo sudah diimplementasikan pada jalur server yang sama, tetapi hasil uji penghapusan setelah perubahan final perlu dicatat terpisah.

## 11. Event lifecycle dan status mode

Migration `20261112_event_lifecycle_automation.sql` menambahkan:

- `events.status_mode` dengan nilai `automatic` atau `manual`.
- `events.planning_start_date`, `events.preparation_start_date`, dan `events.evaluation_end_date`.
- Constraint untuk mode status, urutan tanggal perencanaan/persiapan, serta akhir evaluasi setelah tanggal selesai event.
- Nilai status tambahan: `planning`, `preparation`, dan `evaluation`.

Kolom `status_mode` sengaja ditambahkan dengan default sementara `manual` agar seluruh event yang sudah ada tetap manual. Setelah backfill implisit oleh PostgreSQL, default kolom diubah menjadi `automatic` untuk event baru. Migration tidak mengubah nilai status yang sudah tersimpan dan tidak mengubah RLS/policy.

Status otomatis dihitung oleh aplikasi pada saat membaca data berdasarkan tanggal Asia/Jakarta; migration ini tidak membuat cron, trigger, atau scheduled job. Kolom `status` tetap menyimpan status manual atau snapshot status saat penyimpanan, sedangkan tampilan mode otomatis wajib menggunakan resolver aplikasi.

`supabase/schema.sql` juga diperbarui agar instalasi database baru memiliki struktur yang sama dengan skema setelah migration.

**Status migration:** file SQL sudah dibuat di branch fitur, tetapi belum diterapkan ke Supabase. Owner harus meninjau dan menerapkannya ke database yang dituju sebelum runtime testing. Keberadaan file di Git bukan bukti migration sudah diterapkan.


## 12. Master divisi per event

Migration `20261112_event_divisions.sql` menambahkan pengelolaan divisi sebagai master data yang scope-nya satu event:

- `event_divisions` menyimpan `group_id`, `event_id`, nama, dan deskripsi divisi.
- Unique index pada `(event_id, lower(btrim(name)))` mencegah nama divisi duplikat dengan perbedaan kapitalisasi pada event yang sama.
- `event_members.division_id` menghubungkan penugasan ke master divisi melalui foreign key komposit `(division_id, event_id, group_id)`, sehingga divisi dari event/grup lain tidak dapat dipakai.
- Migration melakukan backfill dari teks `event_members.division` yang sudah ada. Kolom teks tersebut tetap dipertahankan sebagai snapshot agar workspace Panitia dan ekspor CSV lama tetap kompatibel.
- Trigger menyinkronkan snapshot teks saat Owner mengubah nama divisi. Jika master divisi dihapus, referensi `division_id` menjadi NULL tetapi label lama tetap disimpan sebagai histori.
- RLS tetap aktif. Owner dapat CRUD divisi dalam grup miliknya; Panitia hanya mendapat akses baca untuk event yang memang ditugaskan melalui helper `is_event_member`.
- Migration harus ditinjau dan diterapkan pada database target sebelum fitur CRUD divisi dipakai. Keberadaan file di GitHub tidak membuktikan penerapannya.
