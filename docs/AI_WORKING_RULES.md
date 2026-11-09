# AI Working Rules — Mini Event Management

Dokumen ini adalah aturan kerja wajib untuk AI assistant dan coding agent yang membantu project ini. Baca bersama \`AGENTS.md\` dan \`AI_CONTEXT_NEXT_SESSION.md\`.

## 1. Urutan membaca konteks

Sebelum mengubah source:

1. \`AGENTS.md\`
2. \`AI_CONTEXT_NEXT_SESSION.md\`
3. \`docs/PROJECT_HANDBOOK.md\`
4. \`docs/IMPLEMENTATION_STATUS.md\`
5. Dokumen spesifik modul/database yang sedang dikerjakan.
6. Source code terbaru pada branch target.

Jika dokumentasi berbeda dari source terbaru, periksa Git history/PR dan perbarui dokumentasi. Jangan diam-diam menganggap catatan lama masih benar.

## 2. Prioritas instruksi dan fakta

- Instruksi eksplisit pemilik project yang terbaru mengatur tujuan pekerjaan.
- Jangan membuat asumsi tentang fitur, schema, status deployment, atau hasil test.
- Source code branch target adalah bukti implementasi saat ini; production database/deployment perlu diverifikasi terpisah.
- Bedakan status: **implemented in source**, **merged**, **deployed**, dan **verified in runtime**. Keempatnya tidak sama.
- Jika informasi belum diketahui, tulis "belum dikonfirmasi", bukan menebak.

## 3. Aturan Next.js dan stack

- Project menggunakan Next.js **16.4.5**, React **19.3.0**, Tailwind CSS 4, JavaScript, Supabase JS/SSR, dan Zod 4.
- Jangan menulis kode berdasarkan pola Next.js lama tanpa memeriksa versi yang terpasang.
- Untuk pekerjaan Next.js, baca dokumentasi versi terpasang di \`node_modules/next/dist/docs/\` bila tersedia.
- Next.js 16 menggunakan \`src/proxy.js\` dan export function \`proxy\`; jangan mengganti menjadi \`middleware.js\` kecuali versi framework berubah dan keputusan tersebut diverifikasi.
- Perhatikan API async Next.js 16 seperti \`params\`, \`cookies()\`, dan request APIs sesuai dokumentasi versi yang terpasang.
- Gunakan JavaScript, jangan mengonversi ke TypeScript tanpa permintaan/keputusan.
- Jangan menambah library/ORM hanya untuk menyelesaikan tugas kecil. Project saat ini tidak menggunakan Prisma/Drizzle.

## 4. Aturan domain dan produk

- \`members\` adalah direktori anggota organisasi/grup.
- \`event_members\` adalah keanggotaan/penugasan pada event tertentu.
- Anggota grup tidak otomatis menjadi panitia untuk semua event.
- PIC rundown, assignee tugas, dan PIC pengadaan hanya boleh berasal dari \`event_members\` untuk event yang sedang dikelola.
- Pertahankan validasi dropdown dan server-side pada ketiga modul tersebut.
- Workspace Panitia saat ini read-only. Jangan menjanjikan atau menambahkan kemampuan edit status tugas tanpa keputusan produk.
- Export CSV \`members\` saat ini bermakna seluruh anggota grup; jangan mengubah cakupan tanpa konfirmasi.
- Pertahankan bahasa UI Bahasa Indonesia kecuali diminta lain.
- Utamakan UX yang jelas: loading, empty, error, success, confirmation untuk tindakan destruktif, dan tampilan responsif.

## 5. Aturan keamanan wajib

- Jangan pernah meminta, mencetak, menampilkan, atau memasukkan nilai \`.env.local\`, Supabase secret/service-role key, password, token, atau credential ke dokumentasi/commit.
- Hanya publishable key yang boleh dipakai pada browser; service-role key tidak boleh masuk bundle client.
- Server Actions, Route Handlers, dan Server Components yang membaca/mengubah data harus memvalidasi sesi dan otorisasi.
- Jangan mengandalkan Proxy saja untuk keamanan.
- Jangan mengandalkan hidden input, disabled button, dropdown filter, atau validasi client sebagai satu-satunya kontrol.
- Query Owner harus dibatasi ke grup yang dimiliki Owner. Query Panitia harus dibatasi ke identitas anggota dan event assignment.
- Jangan menonaktifkan RLS atau melonggarkan policy untuk "menghilangkan error" tanpa analisis ancaman dan persetujuan.
- Jangan mengubah cache header halaman privat dari \`no-store\` demi bfcache/Lighthouse tanpa evaluasi keamanan dan persetujuan pemilik.

## 6. Aturan Supabase dan database

- Next.js bukan ORM. Project menggunakan Supabase JS Client untuk query dan PostgreSQL SQL files untuk schema/migration.
- Jangan menjalankan \`supabase/schema.sql\` pada database yang sudah berjalan. File tersebut adalah schema awal, bukan migration incremental.
- Jangan mengulang migration yang sudah diterapkan.
- Jangan menjalankan SQL langsung ke Supabase production, SQL Editor, atau CLI atas nama user tanpa persetujuan eksplisit.
- Perubahan schema harus dibuat sebagai file baru di \`supabase/migrations/\`, dengan nama timestamp dan tujuan yang jelas.
- Migration harus additive bila memungkinkan, idempotent bila sesuai, transaksional bila cocok, dan mempertimbangkan data existing, foreign key, index, RLS, grants, rollback/recovery, dan lock/downtime.
- Jelaskan prasyarat dan urutan migration. Jangan menebak migration sudah diterapkan hanya karena file ada.
- Jika user menjalankan SQL manual, minta hasil sukses/error tanpa meminta secret. Pastikan riwayat migration sinkron sebelum memakai Supabase CLI untuk push.
- Perubahan policy/RLS/function adalah perubahan keamanan dan memerlukan review ekstra.
- Jangan membuat atau menghapus data production untuk testing.

## 7. Aturan GitHub dan workflow

- Jangan commit langsung ke \`main\`.
- Buat branch kerja dengan nama deskriptif.
- Buat Pull Request ke \`main\` jika user meminta implementasi melalui GitHub.
- Pemilik project yang melakukan merge kecuali ia secara eksplisit meminta AI untuk merge.
- Jangan push, merge, reset, force-push, atau menghapus branch tanpa otorisasi eksplisit.
- Jangan melakukan deploy Vercel; pemilik project mengelolanya.
- Jangan menganggap PR merged otomatis sudah live di production.
- Sebelum membuat perubahan, periksa apakah ada PR/commit yang sudah menyelesaikan masalah yang sama.
- Hindari perubahan di luar scope permintaan.

## 8. Aturan implementasi

- Baca file dan call sites terkait sebelum mengedit.
- Ikuti pola komponen, Server Actions, validasi Zod, dan Supabase client yang sudah ada.
- Validasi input di server dengan Zod atau pola validator project.
- Tangani error Supabase secara eksplisit; jangan mengabaikan error penting.
- Hindari N+1 query jika bisa menggunakan query terkelompok/parallel tanpa mengorbankan keamanan.
- Jangan mengubah nama kolom, schema, route, role, atau perilaku bisnis tanpa alasan dan konfirmasi bila dampaknya luas.
- Jaga accessibility: label input, semantic HTML, focus state, aria attributes bila relevan.
- Hindari mengoptimasi skor Lighthouse dengan mengorbankan keamanan, fitur, atau maintainability.
- Jangan menghapus file/folder yang belum dipastikan tidak dipakai.

## 9. Testing dan pelaporan

- Jalankan \`npm run lint\` dan \`npm run build\` bila environment tersedia dan perubahan cukup relevan.
- Untuk perubahan database, lakukan review SQL dan verifikasi migration state; jangan mengklaim database production berubah jika belum dieksekusi.
- Untuk bug UI/alur, berikan skenario manual yang spesifik.
- Laporkan dengan jelas:
  - file yang diubah;
  - perilaku yang berubah;
  - PR/branch;
  - test yang benar-benar dijalankan dan hasilnya;
  - test yang belum dijalankan;
  - tindakan yang harus dilakukan Owner.
- Jangan mengklaim "berhasil", "aman", "production-ready", atau "sudah dites" tanpa bukti.
- Jika test tidak bisa dijalankan, katakan terus terang.

## 10. Dokumentasi wajib diperbarui

Setelah perubahan yang berdampak pada fitur, arsitektur, schema, keamanan, atau workflow:

- Update \`AI_CONTEXT_NEXT_SESSION.md\` untuk ringkasan singkat dan status terkini.
- Update \`docs/IMPLEMENTATION_STATUS.md\` untuk status fitur, batasan, dan verifikasi.
- Update \`docs/PROJECT_HANDBOOK.md\` atau \`docs/DATABASE_AND_MIGRATIONS.md\` bila arsitektur/operasional berubah.
- Tambahkan resource baru ke \`docs/RESOURCES.md\` jika relevan.
- Jangan membiarkan dokumen lama bertentangan dengan source terbaru.

## 11. Komunikasi

- Gunakan Bahasa Indonesia yang natural dan langsung.
- Jangan meminta user mengulang informasi yang sudah ada di dokumen/project context.
- Tanyakan hanya detail yang benar-benar menghalangi pekerjaan.
- Jangan membuat daftar instruksi troubleshooting berulang jika bukti sudah cukup.
- Pisahkan fakta, dugaan, dan rekomendasi.
