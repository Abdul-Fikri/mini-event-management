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


### Aturan tanggal event dan histori operasional

Tanggal hari ini untuk aturan event menggunakan zona waktu **Asia/Jakarta (WIB)** agar konsisten dengan tanggal yang dipilih pengguna.

- Saat membuat event, tanggal mulai wajib hari ini atau setelahnya. Tanggal selesai bersifat opsional; jika diisi, tanggalnya wajib hari ini atau setelahnya dan tidak boleh sebelum tanggal mulai.
- Saat mengedit event lama, tanggal lampau yang sudah tersimpan boleh dipertahankan tanpa perubahan. Jika tanggal mulai atau selesai diubah, nilai barunya wajib hari ini atau setelahnya.
- Tanggal rundown (`schedule_items.item_date`) harus berada di dalam rentang tanggal event. Tanggal lampau tetap boleh dicatat jika masih berada dalam rentang event, termasuk untuk histori event yang sudah berjalan/selesai.
- Deadline tugas (`tasks.due_date`) boleh lampau agar tugas terlambat tetap dapat dicatat.
- Tanggal transaksi (`transactions.trx_date`) boleh lampau untuk pencatatan histori keuangan.
- Modul pengadaan saat ini tidak memiliki input tanggal manual yang perlu dibatasi.

Batasan tanggal pada event diterapkan melalui atribut `min` pada form sebagai bantuan pengguna dan validasi Zod di Server Action sebagai aturan otoritatif. Data lama tidak perlu diubah dan tidak memerlukan migration database.

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
- \`src/lib/supabase/admin.js\`: privileged Supabase client dengan guard \`server-only\`; hanya untuk operasi server yang memang membutuhkan bypass RLS.
- \`src/lib/auth.js\`: helper autentikasi/otorisasi Owner dan Panitia.
- \`src/actions/group-logo.js\`: Server Actions upload dan penghapusan logo grup.
- \`src/lib/validators/\`: schema Zod.
- \`src/actions/\`: Server Actions untuk mutasi data.

Gunakan server client dari \`src/lib/supabase/server.js\` di server. Jangan membuat Supabase client global yang menyimpan cookie/session lintas request.

Environment variable yang digunakan:

- \`NEXT_PUBLIC_SUPABASE_URL\`
- \`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY\`
- \`SUPABASE_SECRET_KEY\` **atau** \`SUPABASE_SERVICE_ROLE_KEY\` (server-only; dibutuhkan untuk upload/hapus logo grup)

Jangan menuliskan nilainya ke dokumentasi, source, issue, screenshot, atau chat. Jangan pernah mengekspos secret/service-role key ke browser atau memberi prefix \`NEXT_PUBLIC_\` pada key privileged.

### Alur logo grup

- Form \`GroupLogoForm\` memanggil \`uploadGroupLogo()\` dan \`removeGroupLogo()\`; browser tidak mengunggah langsung ke Storage.
- Server Action memanggil \`requireGroup()\` lebih dahulu untuk memastikan sesi Owner dan grup aktif.
- File dibatasi maksimal 2 MB, MIME JPG/PNG/WebP, dan signature isi file diverifikasi di server.
- \`src/lib/supabase/admin.js\` membuat client privileged yang diberi guard \`server-only\`. Key hanya digunakan di server untuk operasi Storage pada bucket \`group-logos\`.
- Setelah upload, URL disimpan ke \`groups.logo_url\` memakai Supabase server client berbasis sesi Owner, dengan filter \`group.id\` dan \`owner.id\`.
- Bucket public hanya membuat URL gambar dapat dibaca publik; upload/penghapusan tetap melalui Server Action yang memverifikasi Owner.
- Karena privileged key melewati RLS Storage, pemeriksaan Owner di Server Action adalah batas keamanan wajib. Jangan memindahkan admin client ke Client Component atau memakai key tersebut untuk operasi tanpa otorisasi.
- Perubahan final ini masuk melalui PR #16 (merge commit \`a45c594346dcedc4c993a5f0bea17543994aa6da\`). Pemilik kemudian mengonfirmasi upload logo berhasil; pengujian penghapusan setelah perubahan final tetap dicatat terpisah dalam UAT.

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
4. Dashboard pernah mencapai Performance 96 dan halaman event/Panitia pernah menunjukkan Performance 91. Pengujian Vercel terbaru dilaporkan mendapat Performance 82; route dan kondisi pengujian terbaru belum dicatat. Angka Lighthouse dapat berubah menurut device, cache, ekstensi browser, dan kondisi jaringan.
5. Lighthouse menunjukkan bfcache tidak tersedia pada halaman privat karena \`Cache-Control: no-store\`; jangan melemahkan kebijakan cache privat hanya demi skor.
6. Pada audit unused JavaScript, mayoritas transfer yang terlihat berasal dari Chrome extensions. Pengukuran harus dilakukan tanpa ekstensi untuk mengukur bundle aplikasi secara lebih representatif.

## 12. Dokumen terkait

- [Database & Migrations](DATABASE_AND_MIGRATIONS.md)
- [Implementation Status](IMPLEMENTATION_STATUS.md)
- [Resources](RESOURCES.md)
- [Role Owner dan Panitia](ROLE-OWNER-PANITIA.md)
- [Undangan Panitia](UNDANGAN-PANITIA.md)
- [Implementasi Rubrik UAS](IMPLEMENTASI-RUBRIK-UAS.md)
