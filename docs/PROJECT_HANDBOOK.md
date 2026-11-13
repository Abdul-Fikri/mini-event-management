# Project Handbook — Mini Event Management System

Dokumen utama untuk memahami produk, arsitektur, fitur, dan cara kerja aplikasi.

- Repository: https://github.com/Abdul-Fikri/mini-event-management
- Last reviewed: 13 November 2026
- Active app root: repository root
- Source directory: \`src/\`

## 1. Tujuan produk

Mini Event Management membantu Owner/organisasi mengelola kebutuhan event skala kecil dalam satu tempat. Data organisasi dan event dipisahkan: seseorang bisa menjadi anggota organisasi, tetapi belum tentu menjadi panitia untuk setiap event.

Prinsip domain terpenting:

- \`groups\` mewakili organisasi/grup Owner.
- \`members\` adalah direktori orang/anggota dalam grup.
- \`events\` adalah event milik grup.
- \`event_members\` adalah daftar anggota yang benar-benar ditugaskan pada event tertentu.
- \`event_divisions\` adalah master divisi khusus per event; penugasan panitia memilih divisi dari daftar tersebut, bukan mengetik nama divisi bebas.
- Hanya anggota dengan relasi \`event_members\` pada event yang sama yang boleh dipilih sebagai PIC/petugas rundown, tugas, dan pengadaan.


### Aturan tanggal event dan histori operasional

Tanggal hari ini untuk aturan event menggunakan zona waktu **Asia/Jakarta (WIB)** agar konsisten dengan tanggal yang dipilih pengguna.

- Saat membuat event, tanggal mulai wajib hari ini atau setelahnya. Tanggal selesai bersifat opsional; jika diisi, tanggalnya wajib hari ini atau setelahnya dan tidak boleh sebelum tanggal mulai.
- Saat mengedit event lama, tanggal lampau yang sudah tersimpan boleh dipertahankan tanpa perubahan. Jika tanggal mulai atau selesai diubah, nilai barunya wajib hari ini atau setelahnya.
- Tanggal rundown (`schedule_items.item_date`) harus berada di dalam rentang tanggal event. Tanggal lampau tetap boleh dicatat jika masih berada dalam rentang event, termasuk untuk histori event yang sudah berjalan/selesai.
- Deadline tugas (`tasks.due_date`) bersifat opsional dan fleksibel: dapat diisi tanggal lampau, hari ini, atau mendatang, serta dapat diubah kapan saja. Tidak ada batas minimum/maksimum tanggal; deadline lampau dapat digunakan untuk mencatat tugas terlambat.
- Tanggal transaksi (`transactions.trx_date`) boleh lampau untuk pencatatan histori keuangan.
- Semua input nominal rupiah (target anggaran event, anggaran kategori, transaksi, dan harga satuan pengadaan) otomatis menampilkan pemisah ribuan titik saat diketik, misalnya `500000` menjadi `500.000`. Validator menerima angka biasa maupun format bertitik, lalu menormalisasikannya menjadi number sebelum disimpan. Anggaran kategori boleh bernilai 0; nominal transaksi harus lebih dari 0.
- Setelah CRUD data panitia, rundown, tugas, pengadaan, atau keuangan berhasil, pengguna dikembalikan ke subhalaman event yang sama tempat aksi dilakukan (bukan selalu ke Overview). Nilai `return_to` divalidasi di Server Action dan hanya menerima rute subhalaman dalam event yang sama.
- Tanggal pembelian pengadaan (procurement_items.purchased_date) boleh lampau untuk mencatat tanggal pembelian sebenarnya. Saat item baru dibuat sebagai Sudah dibeli/Siap digunakan atau status berubah ke salah satu status tersebut, tanggal kosong otomatis memakai hari ini di Asia/Jakarta. Untuk item lama yang sudah berstatus dibeli tetapi belum memiliki tanggal, sistem tidak menebak tanggal; isi tanggal sebenarnya sebelum sinkronisasi manual.

### Integrasi Pengadaan dan Keuangan

Pengadaan dan Keuangan tetap merupakan dua halaman dengan tanggung jawab berbeda, tetapi memakai transaksi yang saling terhubung:

- **Diminta** berarti kebutuhan diajukan, belum menjadi komitmen dan belum menjadi pengeluaran.
- **Dipesan** berarti pesanan sudah dikonfirmasi. Nilai estimasi totalnya masuk ke komitmen anggaran, tetapi belum mengurangi saldo kas dan belum dihitung sebagai pengeluaran aktual.
- Data lama dengan status `requested` tetap dianggap Diminta setelah migration; ubah manual menjadi Dipesan jika pesanan tersebut sebenarnya sudah dikonfirmasi.
- **Sudah dibeli** atau **Siap digunakan** berarti pembelian telah terjadi. Harga aktual satuan wajib lebih dari Rp0; database otomatis membuat atau memperbarui satu transaksi bertipe expense pada tabel transactions.
- Total transaksi pembelian dihitung dari harga aktual satuan dikali jumlah dan dibulatkan ke Rupiah terdekat. Tanggal transaksi mengikuti tanggal pembelian; jika kosong, tanggal hari ini Asia/Jakarta digunakan.
- Pengadaan dapat memilih kategori anggaran. Kategori, deskripsi, tanggal, supplier/referensi, dan nominal transaksi otomatis mengikuti perubahan pada item pengadaan.
- Transaksi yang berasal dari Pengadaan diberi penanda sumber dan dikelola dari halaman Pengadaan. Transaksi manual yang dibuat langsung dari Keuangan tetap dapat diedit/dihapus.
- Constraint unik pada transactions.procurement_item_id mencegah satu item pengadaan membuat transaksi otomatis lebih dari satu kali.
- Jika item Pengadaan dihapus setelah dibeli, transaksi pengeluarannya tetap disimpan sebagai histori; relasi item dilepas dan referensi sumber Pengadaan tetap ada.
- Item berstatus Dipesan ditampilkan di Keuangan sebagai komitmen. Rumus sisa setelah komitmen = total anggaran kategori dikurangi pengeluaran aktual dikurangi komitmen. Saldo kas tetap = pemasukan dikurangi pengeluaran aktual.
- Item lama yang sudah dibeli sebelum integrasi tidak di-backfill otomatis. Item tersebut dapat disinkronkan satu per satu dari halaman Pengadaan setelah pengguna memastikan pembelian belum dicatat manual di Keuangan. Jika tanggal pembelian lama belum tersedia, isi tanggal sebenarnya pada form sebelum sinkronisasi; sistem tidak menebak tanggal histori.

Aturan validasi tanggal mulai/selesai dari PR #18 diterapkan melalui atribut `min` pada form dan validasi Zod di Server Action; aturan itu sendiri tidak memerlukan migration atau rewrite data. Fitur siklus hidup/status otomatis menambahkan kolom timeline dan mode status melalui migration `20261112_event_lifecycle_automation.sql`; lihat bagian siklus hidup di bawah.

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
- Mengelola master divisi khusus per event pada tab Panitia, lalu menambahkan anggota grup dan memilih divisinya dari dropdown.
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
| Susunan Panitia | CRUD master divisi per event; menugaskan anggota grup ke event dan memilih divisi dari dropdown, lalu mengatur jabatan/tanggung jawab |
| Rundown | CRUD agenda/timeline kegiatan dan PIC |
| Tugas | Kanban pekerjaan dengan empat kolom status, drag-and-drop, pilihan status alternatif, serta CRUD pekerjaan, PIC, deadline, dan prioritas |
| Pengadaan | CRUD kebutuhan, kuantitas, estimasi/aktual, supplier, PIC, kategori, tanggal dan status; Dipesan menjadi komitmen dan Sudah dibeli otomatis membuat pengeluaran |
| Keuangan | Kategori anggaran, seluruh transaksi pemasukan/pengeluaran, komitmen pembelian dari Pengadaan, dan saldo kas |
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
- \`src/actions/event-divisions.js\`: CRUD master divisi event dengan validasi Owner dan scope grup/event.

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
| \`event_members\` | Assignment anggota ke event, termasuk referensi divisi yang dipilih |
| \`event_divisions\` | Master divisi yang dikelola Owner untuk masing-masing event |
| \`schedule_items\` | Rundown |
| \`tasks\` | Daftar tugas |
| \`procurement_items\` | Pengadaan |
| \`budget_categories\` | Kategori anggaran |
| \`transactions\` | Pemasukan/pengeluaran |

Migration menambahkan relasi akun Panitia dan invitation, dukungan logo grup/Storage policy, serta integrasi Pengadaan–Keuangan: kategori/tanggal pembelian pada item pengadaan, relasi transaksi ke item, dan trigger sinkronisasi otomatis. Detail dan prosedur operasional ada di [Database & Migrations](DATABASE_AND_MIGRATIONS.md).

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
- [Event Lifecycle Requirements](EVENT_LIFECYCLE_REQUIREMENTS.md)
- [Event Divisions Requirements](EVENT_DIVISIONS_REQUIREMENTS.md)
- [Resources](RESOURCES.md)
- [Role Owner dan Panitia](ROLE-OWNER-PANITIA.md)
- [Undangan Panitia](UNDANGAN-PANITIA.md)
- [Implementasi Rubrik UAS](IMPLEMENTASI-RUBRIK-UAS.md)

## 13. Siklus hidup dan mode status event

Status event memiliki dua mode yang dapat dipilih Owner:

- **Otomatis**: status efektif dihitung dari tanggal timeline dalam zona waktu Asia/Jakarta. Event baru menggunakan mode ini secara default.
- **Manual**: status yang dipilih Owner tetap digunakan dan tidak berubah hanya karena tanggal berganti. Event yang sudah ada sebelum migration tetap berada pada mode ini agar status historisnya tidak berubah.

Timeline mendukung tanggal mulai perencanaan (opsional), mulai persiapan (opsional), mulai event (wajib), selesai event (opsional), dan akhir evaluasi (opsional). Tanggal perencanaan dan persiapan harus diisi bersama dan berurutan sebelum event dimulai. Jika tanggal selesai event kosong, event dianggap berlangsung satu hari. Jika akhir evaluasi diisi, status Evaluasi berlaku sampai tanggal tersebut; setelahnya status menjadi Selesai.

Urutan status otomatis: Direncanakan → Perencanaan → Persiapan → Berlangsung → Evaluasi (jika digunakan) → Selesai. Status Dibatalkan dipilih secara manual dengan mengubah mode ke Manual. Mengubah kembali ke Otomatis akan melanjutkan perhitungan berdasarkan timeline.

Status otomatis dihitung saat data dibaca oleh resolver bersama; tidak memerlukan cron atau perubahan status berkala di database. Dashboard, daftar event, ruang kerja Owner, dan tampilan event Panitia harus memakai resolver yang sama. Rincian aturan dan acceptance criteria ada di `docs/EVENT_LIFECYCLE_REQUIREMENTS.md`.


## 14. Master divisi per event

Divisi dikelola sebagai master data khusus untuk satu event, bukan daftar global grup. Dengan begitu, satu grup dapat memakai susunan divisi yang berbeda pada event yang berbeda.

- Owner mengelola divisi dari bagian Kelola divisi pada tab Panitia event: tambah, lihat, ubah nama/deskripsi, dan hapus.
- Form penugasan anggota memilih divisi dari dropdown master data. Nama divisi tidak lagi diketik bebas pada form penugasan.
- Nama divisi harus unik tanpa membedakan huruf besar/kecil dalam event yang sama.
- Saat divisi diubah namanya, label pada penugasan, workspace Panitia, dan ekspor CSV ikut diperbarui.
- Saat divisi dihapus, referensi master pada penugasan dilepas, tetapi teks nama lama tetap disimpan sebagai label historis agar tampilan Panitia dan CSV tidak kehilangan informasi.
- Migration 20261112_event_divisions.sql membuat tabel event_divisions, menambahkan event_members.division_id, dan mengonversi nilai divisi lama menjadi master data tanpa menghilangkan labelnya.
- CRUD divisi hanya tersedia bagi Owner. Panitia tetap read-only dan hanya dapat membaca metadata divisi untuk event yang memang ditugaskan.
- Daftar Kelola divisi menyediakan pencarian berdasarkan nama dan deskripsi divisi.
- Susunan panitia menyediakan filter berdasarkan divisi (semua divisi, divisi tertentu, atau tanpa divisi aktif) dan pencarian berdasarkan nama anggota, kontak, divisi, jabatan, serta tanggung jawab.
- Pencarian dan filter dapat digunakan bersamaan; jumlah hasil ditampilkan dan tersedia pesan ketika tidak ada data yang cocok.
- Daftar divisi dan susunan panitia menampilkan maksimal lima data per halaman dengan navigasi Sebelumnya/Berikutnya. Perubahan pencarian/filter mengembalikan daftar ke halaman pertama.
- Tombol Lihat semua membuka halaman khusus sesuai daftar yang dipilih: hanya divisi atau hanya susunan panitia. Halaman khusus tetap memiliki pencarian/filter dan pagination lima data per halaman.
- Filter dan kata kunci susunan panitia dibawa ke halaman khusus saat Lihat semua dipilih. Tersedia tautan kembali ke tab Panitia, dan aksi simpan/hapus kembali ke halaman tempat aksi dilakukan.


## 15. Pagination daftar pengelolaan event

Agar halaman pengelolaan tetap ringkas saat jumlah data bertambah, daftar operasional event menggunakan batas tampilan lima data per halaman. Pengecualian untuk Tugas: halaman utamanya menampilkan seluruh tugas yang dimuat dalam kolom Kanban sesuai status.

- Rundown menampilkan maksimal lima kegiatan per halaman. Tombol **Lihat semua rundown** membuka `/events/[id]/rundown/all`.
- Halaman Tugas utama (`/events/[id]/tugas`) menampilkan Kanban dengan empat kolom status: Belum dikerjakan, Sedang dikerjakan, Selesai, dan Terhambat. Setiap kolom memiliki warna dan ikon pembeda; kartu dapat dipindahkan dengan drag-and-drop untuk memperbarui status.
- Setiap kartu Kanban menyediakan aksi edit dan hapus, serta tombol **Tambah tugas** tersedia di bagian atas papan. Pilihan status pada kartu juga tersedia sebagai alternatif drag-and-drop untuk perangkat sentuh atau navigasi keyboard.
- Tombol **Detail seluruh tugas** membuka `/events/[id]/tugas/all`, yaitu halaman daftar lengkap dengan ringkasan jumlah per status, deskripsi/catatan, CRUD tugas, dan pagination maksimal lima data per halaman.
- Pengadaan menampilkan maksimal lima kebutuhan per halaman. Tombol **Lihat semua pengadaan** membuka `/events/[id]/pengadaan/all`.
- Keuangan menerapkan pagination secara terpisah untuk kategori anggaran, riwayat transaksi, dan rincian komitmen pengadaan. Masing-masing memiliki halaman khusus: `/events/[id]/keuangan/categories`, `/events/[id]/keuangan/transactions`, dan `/events/[id]/keuangan/commitments`.
- Setiap halaman khusus hanya menampilkan jenis data yang dipilih dan tetap membatasi tampilan lima data per halaman.
- Halaman khusus menyediakan tautan kembali ke halaman pengelolaan induk. Form edit dan aksi hapus/sinkronisasi mempertahankan halaman asal melalui `return_to` yang divalidasi di Server Action.
- Untuk Rundown, Pengadaan, dan Keuangan, form tambah tetap berada di halaman pengelolaan utama; halaman khusus berfokus pada daftar yang dipilih. Tugas menyediakan form tambah serta aksi edit/hapus baik pada Kanban maupun halaman Detail seluruh tugas.
- Pagination ini hanya mengubah tampilan data yang telah dimuat dan diotorisasi di server. Tidak ada perubahan schema, migration, RLS, atau aturan otorisasi.


## 16. Pagination daftar manajemen Owner

Agar daftar tetap mudah dipindai, halaman daftar Event dan Anggota grup juga menggunakan pola pagination yang sama dengan modul operasional event.

- Halaman `/events` menampilkan maksimal lima event per halaman. Tombol **Lihat semua event** membuka `/events/all`, yang hanya menampilkan daftar event dan tetap memakai lima data per halaman.
- Halaman `/members` menampilkan maksimal lima anggota grup per halaman. Tombol **Lihat semua anggota** membuka `/members/all`, yang hanya menampilkan direktori anggota dan tetap memakai lima data per halaman.
- Halaman khusus menyediakan tautan kembali ke daftar induk. Jika anggota diedit atau dihapus dari `/members/all`, pengguna dikembalikan ke daftar khusus tersebut; halaman daftar biasa tetap kembali ke `/members`.
- Label status pada daftar Event tetap dihitung menggunakan resolver status efektif yang sama dengan halaman Event lainnya.
- Pagination adalah perilaku tampilan di atas data yang telah dimuat dan dibatasi berdasarkan grup Owner di server. Ini tidak mengubah otorisasi, RLS, schema, atau data.


## 17. Responsivitas perpindahan status Kanban

Perubahan status tugas di Kanban menggunakan pola optimistic UI agar kartu tidak menunggu round-trip Server Action untuk berpindah secara visual.

- Saat kartu di-drag ke kolom lain atau status dipilih melalui dropdown, state lokal langsung diperbarui dan kartu langsung tampil di kolom tujuan.
- Penyimpanan ke Supabase berjalan di belakang layar. Kartu yang sedang disimpan menampilkan spinner kecil dan status "Menyimpan status…".
- Status pending berlaku per kartu, sehingga tugas lain tetap dapat dipindahkan tanpa menunggu penyimpanan kartu sebelumnya.
- Jika penyimpanan gagal atau request melempar error, kartu dikembalikan ke status sebelumnya dan pesan error ditampilkan.
- Interaksi ini tidak menjalankan `router.refresh()` dan tidak me-revalidate route Kanban yang sedang dibuka. Server Action tetap menginvalidasi halaman ringkasan event dan daftar seluruh tugas agar tampilan server-rendered lain mengambil data terbaru.
- Optimistic UI tidak menggantikan validasi server. Server Action tetap memeriksa status allowlist, identitas Owner, group, event, dan task.

UAT: uji drag-and-drop serta dropdown status; pastikan perpindahan langsung terlihat, spinner muncul hanya pada kartu yang sedang disimpan, tugas lain tetap interaktif, kegagalan mengembalikan status lama, dan status tersimpan terlihat setelah membuka ulang halaman atau daftar seluruh tugas.
