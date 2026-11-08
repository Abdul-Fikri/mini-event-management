# Implementasi Rubrik UAS — Mini Event Management

Dokumen ini mencatat penerapan teknis yang relevan dengan tiga komponen rubrik UAS yang telah diberikan. Bagian rubrik lain yang belum diberikan tidak diasumsikan.

## 1. Arsitektur dan routing (CPMK131)

- **App Router:** seluruh halaman aktif berada di `src/app/`.
- **Root Layout:** `src/app/layout.js` menyediakan struktur HTML, font, metadata, dan CSS global.
- **Nested Layout:** `src/app/(app)/layout.js` membungkus halaman privat dengan `AppShell`; `src/app/(auth)/layout.js` menyediakan layout autentikasi tersendiri.
- **Dynamic Route:** `src/app/(app)/events/[id]/page.js` membaca parameter `id` untuk mengambil detail event. Query juga dibatasi dengan `group_id` milik Owner yang login.
- **Server/Client Components:** halaman dashboard, daftar event, detail event, dan layout mengambil data di server. Komponen yang memerlukan interaksi browser seperti form, navigasi aktif, dan Context UI menggunakan Client Components dengan direktif `"use client"`.

## 2. Strategi rendering (CPMK131)

### Katalog publik — SSG

- Route: `/contoh-event`
- File: `src/app/(public)/contoh-event/page.js`
- Menggunakan `export const dynamic = "force-static"`.
- Konten contoh event bersifat publik dan statis; tidak membaca data privat pengguna atau Supabase.
- Halaman dapat dihasilkan saat build dan disajikan sebagai konten statis.

### Dashboard — rendering dinamis

- Route: `/dashboard`
- File: `src/app/(app)/dashboard/page.js`
- Menggunakan `export const dynamic = "force-dynamic"`.
- Dashboard memerlukan sesi autentikasi dan mengambil data Supabase berdasarkan `group_id` Owner aktif.
- Halaman harus dirender dinamis agar data privat dan personalisasi pengguna tidak dibagikan melalui cache statis.

Dengan demikian terdapat dua strategi yang berbeda: SSG untuk katalog publik dan dynamic server rendering untuk dashboard privat.

## 3. CRUD, global state, dan proteksi autentikasi (CPMK132)

- CRUD inti tersedia untuk event, anggota panitia, rundown, tugas, pengadaan, dan keuangan melalui Server Actions dan Supabase.
- **Global state:** `src/components/layout/AppUIContext.js` menyediakan Context API untuk status buka/tutup navigasi mobile. Provider dipasang di `AppShell`, sehingga tombol header dan menu navigasi berbagi state.
- **Proteksi request:** `src/proxy.js` memakai konvensi Proxy Next.js 16 untuk memvalidasi sesi Supabase dan mengarahkan pengguna yang belum login ke `/login`. Pada Next.js 16, konvensi ini merupakan penerus `middleware.js`.
- **Proteksi server:** halaman dan Server Actions tetap memeriksa autentikasi/otorisasi di server; Proxy bukan satu-satunya lapisan keamanan.

## Catatan demo

1. Buka `/contoh-event` tanpa login untuk menunjukkan route publik statis.
2. Buka `/dashboard` tanpa login untuk menunjukkan redirect ke login.
3. Login dan buka dashboard untuk menunjukkan data dinamis sesuai grup pengguna.
4. Buka `/events/[id]` untuk menunjukkan dynamic route.
5. Ubah ukuran layar ke mobile dan gunakan tombol menu untuk menunjukkan state Context API.
6. Tunjukkan folder `src/app/(app)` dan `src/app/(auth)` untuk menjelaskan nested layout.

## Batas klaim

Dokumen ini menjelaskan implementasi kode. Keberhasilan lint, build, dan pengujian runtime harus dicatat berdasarkan hasil eksekusi aktual, bukan hanya keberadaan file.
