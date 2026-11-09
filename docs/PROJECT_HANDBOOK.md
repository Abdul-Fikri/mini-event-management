# Project Handbook — Mini Event Management System

Dokumen utama untuk memahami produk, arsitektur, fitur, dan cara kerja aplikasi.

- Repository: https://github.com/Abdul-Fikri/mini-event-management
- Last reviewed: 9 November 2026
- Active app root: repository root
- Source directory: \`src/\`

## 1. Tujuan produk

Mini Event Management membantu Owner/organisasi mengelola kebutuhan event skala kecil dalam satu tempat. Data organisasi dan event dipisahkan: seseorang bisa menjadi anggota organisasi, tetapi belum tentu menjadi panitia untuk setiap event.

Prinsip domain terpenting:

- \`groups\` mewakili organisasi/grup Owner.
- \`members\` adalah direktori orang/anggota dalam grup.
- \`events\` adalah event milik grup.
- \`event_members\` adalah daftar anggota yang benar-benar ditugaskan pada event tertentu.
- Hanya anggota dengan relasi \`event_members\` pada event yang sama yang boleh dipilih sebagai PIC/petugas rundown, tugas, dan pengadaan.

## 2. Tech stack aktual

| Area | Teknologi |
|---|---|
| Web framework | Next.js 16.4.5, App Router |
| UI | React 19.3.0 |
| Bahasa | JavaScript |
| Styling | Tailwind CSS 4 |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| File storage | Supabase Storage |
| Database access | Supabase JS Client + \`@supabase/ssr\` |
| Validation | Zod 4 |
| Icons | lucide-react |
| Deployment | Vercel |

### ORM dan query

Project saat ini **tidak menggunakan ORM** seperti Prisma, Drizzle, atau Eloquent. Query database dilakukan melalui Supabase JavaScript Client, misalnya:

\`\`\`js
const { data, error } = await supabase
  .from("events")
  .select("id, name, status")
  .eq("group_id", group.id);
\`\`\`

Supabase Client adalah client/query builder untuk Supabase Data API, bukan ORM dengan model dan unit-of-work seperti Eloquent. Migration database dikelola sebagai file SQL.

## 3. Role dan alur pengguna

### Owner

- Login melalui Supabase Auth.
- Memiliki satu grup melalui relasi \`groups.owner_id\`.
- Mengelola anggota grup dan event.
- Menambahkan anggota grup ke event melalui tab Panitia.
- Mengelola rundown, tugas, pengadaan, dan keuangan event.
- Membuat undangan agar anggota dapat menghubungkan akun Supabase Auth dengan data anggota.

### Panitia

- Diwakili oleh baris \`members\`.
- Akun login dihubungkan melalui \`members.auth_user_id\` setelah undangan diklaim.
- Hanya melihat event tempat anggota tersebut tercatat pada \`event_members\`.
- Workspace Panitia saat ini bersifat read-only: melihat informasi event, rundown, tugas, dan pengadaan. Jangan menjanjikan fitur edit/status tugas dari akun Panitia sebelum source berubah dan diuji.

### Perbedaan anggota grup dan panitia event

Contoh: Seseorang sudah terdaftar di organisasi "Makrab", tetapi belum ditambahkan ke Event 12.

- Dia muncul di direktori Anggota Panitia grup.
- Dia belum menjadi anggota susunan panitia Event 12.
- Dia tidak boleh muncul sebagai PIC rundown, penanggung jawab tugas, atau PIC pengadaan Event 12.
- Setelah Owner menambahkannya ke tab Panitia Event 12, barulah dia tersedia pada pilihan PIC/petugas event itu.

Aturan ini sudah diterapkan pada dropdown dan Server Actions untuk rundown, tugas, serta pengadaan. Perubahan tersebut tercatat pada PR #5 yang sudah merged.

## 4. Modul aplikasi

Status rinci dan checklist pengujian berada di [Implementation Status](IMPLEMENTATION_STATUS.md).

| Modul | Fungsi |
|---|---|
| Authentication | Register/login dan pengelolaan sesi Supabase |
| Onboarding | Membuat/melengkapi grup Owner |
| Dashboard | Ringkasan event, anggota, tugas, keuangan, dan pengadaan |
| Anggota Panitia | CRUD direktori anggota grup |
| Event | CRUD event |
| Susunan Panitia | Menugaskan anggota grup ke event, mengatur divisi/jabatan/tanggung jawab |
| Rundown | CRUD agenda/timeline kegiatan dan PIC |
| Tugas | CRUD pekerjaan, PIC, deadline, prioritas, status |
| Pengadaan | CRUD kebutuhan, kuantitas, estimasi/aktual, supplier, PIC, status |
| Keuangan | Kategori anggaran dan transaksi pemasukan/pengeluaran |
| Ekspor | CSV susunan panitia, rundown, tugas, pengadaan, keuangan, anggota |
| Workspace Panitia | Melihat event yang ditugaskan dan detail operasional read-only |
| Pengaturan | Profil grup dan logo |

## 5. Arsitektur aplikasi

### App Router

Seluruh route aktif berada di \`src/app/\`.

- \`src/app/layout.js\`: root HTML layout, font, metadata, CSS global.
- \`src/app/(app)/layout.js\`: layout Owner/private app menggunakan \`AppShell\`.
- \`src/app/(auth)/layout.js\`: layout autentikasi.
- \`src/app/(panitia)/panitia/\`: workspace Panitia.
- \`src/app/(public)/contoh-event/\`: katalog publik.
- \`src/app/api/\`: Route Handlers, termasuk ekspor CSV.
- \`src/app/(app)/events/[id]/\`: dynamic route detail event dan nested section.

### Server dan Client Components

Default komponen halaman/layout adalah Server Component. Gunakan Client Component hanya saat perlu interaksi browser/state/hooks. Data privat sebaiknya diambil di server, bukan dikirim melalui fetch client tanpa alasan.

### Rendering yang sudah ditemukan

- \`/contoh-event\`: \`dynamic = "force-static"\` untuk konten publik contoh.
- \`/dashboard\`: \`dynamic = "force-dynamic"\` karena membutuhkan sesi dan data per Owner.
- Halaman event memakai dynamic route \`[id]\` dan data Supabase berdasarkan grup Owner.

### Next.js 16 Proxy

File \`src/proxy.js\` memakai konvensi Proxy Next.js 16 untuk memperbarui sesi Supabase dan redirect berdasarkan status login. Pada Next.js 16, nama konvensi \`middleware.js\` telah diganti menjadi \`proxy.js\`.

Proxy bukan satu-satunya lapisan keamanan. Server Component, Server Actions, Route Handlers, helper otorisasi, dan RLS tetap harus memvalidasi akses.

## 6. Pola Supabase di source

- \`src/lib/supabase/client.js\`: browser client, hanya publishable key.
- \`src/lib/supabase/server.js\`: server client untuk Server Components, Server Actions, dan Route Handlers.
- \`src/lib/supabase/proxy.js\`: refresh sesi dan redirect.
- \`src/lib/auth.js\`: helper autentikasi/otorisasi Owner dan Panitia.
- \`src/lib/validators/\`: schema Zod.
- \`src/actions/\`: Server Actions untuk mutasi data.

Gunakan server client dari \`src/lib/supabase/server.js\` di server. Jangan membuat Supabase client global yang menyimpan cookie/session lintas request.

Environment variable yang digunakan:

- \`NEXT_PUBLIC_SUPABASE_URL\`
- \`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY\`

Jangan menuliskan nilainya ke dokumentasi, source, issue, screenshot, atau chat. Jangan pernah mengekspos service-role key ke browser.

## 7. Keamanan dan otorisasi

- Owner harus dibuktikan melalui sesi Supabase Auth dan relasi grup miliknya.
- Panitia harus dibuktikan melalui \`members.auth_user_id\` dan assignment pada event.
- Batasi query dengan \`group_id\` dan/atau \`event_id\` yang telah diverifikasi di server.
- Server Actions wajib memvalidasi input dan otorisasi; validasi UI saja tidak cukup.
- RLS Supabase adalah lapisan pertahanan database. Jangan menonaktifkan RLS untuk memperbaiki error aplikasi.
- Jangan menganggap Proxy sebagai pengganti otorisasi server/RLS.
- Jangan mengirim token invitation mentah atau secret ke log.
- Export CSV harus tetap melalui autentikasi dan scope grup/event.

## 8. Database dan relasi inti

Schema awal berada di \`supabase/schema.sql\`. Migration incremental berada di \`supabase/migrations/\`.

Tabel utama yang ada di schema awal:

| Tabel | Kegunaan |
|---|---|
| \`groups\` | Organisasi/grup Owner |
| \`members\` | Direktori anggota grup |
| \`events\` | Event milik grup |
| \`event_members\` | Assignment anggota ke event |
| \`schedule_items\` | Rundown |
| \`tasks\` | Daftar tugas |
| \`procurement_items\` | Pengadaan |
| \`budget_categories\` | Kategori anggaran |
| \`transactions\` | Pemasukan/pengeluaran |

Migration menambahkan relasi akun Panitia dan invitation, serta dukungan logo grup/Storage policy. Detail dan prosedur operasional ada di [Database & Migrations](DATABASE_AND_MIGRATIONS.md).

**Status penerapan migration ke Supabase production harus diverifikasi melalui migration history/database aktual.** Keberadaan file SQL di GitHub tidak membuktikan bahwa SQL tersebut sudah diterapkan.

## 9. Menjalankan project

\`\`\`bash
npm install
npm run dev
\`\`\`

Environment file \`.env.local\` harus tersedia di root. Jangan commit file tersebut.

Quality checks:

\`\`\`bash
npm run lint
npm run build
\`\`\`

Jalankan keduanya setelah perubahan kode yang relevan. Catat hasil sebenarnya; jangan mengklaim lolos jika belum dieksekusi.

## 10. Deployment

Vercel digunakan untuk production. Pemilik project mengelola deployment dan environment variables. Default branch repository adalah \`main\`; pastikan deployment production mengikuti konfigurasi branch di Vercel sebelum menyimpulkan suatu PR sudah live.

Jangan deploy, mengubah env production, atau mengubah domain tanpa instruksi eksplisit pemilik project.

## 11. Batasan dan keputusan yang diketahui

1. Workspace Panitia read-only pada source yang diperiksa.
2. Export CSV tipe \`members\` mengambil semua anggota grup, bukan hanya anggota yang terdaftar pada event. Jangan ubah tanpa keputusan produk.
3. Fitur yang ditemukan di source belum otomatis berarti lulus E2E test.
4. Lighthouse pada dashboard pernah mencapai Performance 96 setelah optimasi; halaman event/Panitia pernah menunjukkan Performance 91. Angka Lighthouse dapat berubah menurut device, cache, ekstensi browser, dan kondisi jaringan.
5. Lighthouse menunjukkan bfcache tidak tersedia pada halaman privat karena \`Cache-Control: no-store\`; jangan melemahkan kebijakan cache privat hanya demi skor.
6. Pada audit unused JavaScript, mayoritas transfer yang terlihat berasal dari Chrome extensions. Pengukuran harus dilakukan tanpa ekstensi untuk mengukur bundle aplikasi secara lebih representatif.

## 12. Dokumen terkait

- [AI Working Rules](AI_WORKING_RULES.md)
- [Database & Migrations](DATABASE_AND_MIGRATIONS.md)
- [Implementation Status](IMPLEMENTATION_STATUS.md)
- [Resources](RESOURCES.md)
- [Role Owner dan Panitia](ROLE-OWNER-PANITIA.md)
- [Undangan Panitia](UNDANGAN-PANITIA.md)
- [Rubrik UAS](IMPLEMENTASI-RUBRIK-UAS.md)
