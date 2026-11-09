# Pemetaan Rubrik UAS — Mini Event Management System

Dokumen ini memetakan kriteria penilaian UAS yang diberikan untuk aplikasi Mini Event Management. Lokasi file menunjukkan implementasi pada source; status build dan deployment dicatat berdasarkan konfirmasi pengujian pemilik project.

## Ringkasan penilaian

| Komponen | Bobot | Implementasi utama |
|---|---:|---|
| Arsitektur & Routing (CPMK131) | 25% | App Router, nested layout, dynamic route, Server/Client Components |
| Strategi Rendering (CPMK131) | 25% | SSG untuk katalog publik dan dynamic rendering untuk dashboard privat |
| CRUD, State Global, & Autentikasi (CPMK132) | 25% | Supabase CRUD, Context API, autentikasi dan proteksi route |
| Performa, SEO, & Live Deployment (CPMK133) | 25% | next/image, next/font, Metadata, production build, Vercel |

## 1. Arsitektur & Routing — 25% (CPMK131)

**Kriteria:** App Router, Nested Layout, Dynamic Routes (`[id]`), serta pemisahan Server dan Client Components.

- **App Router:** seluruh route aktif berada di `src/app/`.
- **Root Layout:** `src/app/layout.js` mengatur struktur HTML, font, metadata, dan CSS global.
- **Nested Layout:** `src/app/(app)/layout.js` menyediakan shell untuk area privat; `src/app/(auth)/layout.js` menyediakan layout autentikasi.
- **Dynamic Route:** `src/app/(app)/events/[id]/` menangani halaman dan bagian detail event berdasarkan ID.
- **Server Components:** halaman dan layout mengambil data serta memeriksa akses di server jika memungkinkan.
- **Client Components:** komponen interaktif menggunakan `"use client"`, misalnya Context UI, form interaktif, dan navigasi yang membutuhkan hook browser.

**Bukti saat demo:** tunjukkan struktur `src/app/`, buka detail salah satu event, dan jelaskan kenapa halaman data privat mengambil data di server sedangkan komponen interaktif menggunakan Client Components.

## 2. Strategi Rendering — 25% (CPMK131)

**Kriteria:** minimal dua strategi pengambilan/rendering data berbeda, misalnya SSG/ISR untuk katalog publik dan SSR/CSR untuk dashboard interaktif.

### Katalog publik — SSG

- Route: `/contoh-event`
- File: `src/app/(public)/contoh-event/page.js`
- Menggunakan `export const dynamic = "force-static"`.
- Konten contoh event bersifat publik dan tidak bergantung pada sesi pengguna.

### Dashboard privat — dynamic server rendering

- Route: `/dashboard`
- File: `src/app/(app)/dashboard/page.js`
- Menggunakan `export const dynamic = "force-dynamic"`.
- Dashboard membutuhkan sesi autentikasi dan data yang dibatasi untuk grup Owner yang sedang login. Karena itu, halaman tidak boleh dibagikan sebagai hasil cache statis antar pengguna.

**Kesimpulan:** project menggunakan strategi statis untuk katalog publik dan rendering server dinamis untuk dashboard privat. Interaksi UI tertentu dilanjutkan melalui Client Components.

**Bukti saat demo:** buka katalog publik tanpa login, lalu buka dashboard dengan sesi pengguna untuk membandingkan kebutuhan data dan aksesnya.

## 3. Integrasi API CRUD, State Global, & Autentikasi — 25% (CPMK132)

**Kriteria:** pengelolaan data CRUD, state global (Context API/Zustand), serta proteksi halaman login.

### CRUD dan integrasi Supabase

Aplikasi menggunakan Supabase Auth, PostgreSQL, dan Storage melalui Supabase JavaScript Client. Modul CRUD yang tersedia pada source:

- Event.
- Direktori anggota grup.
- Penugasan anggota ke event dan susunan panitia.
- Rundown.
- Tugas.
- Pengadaan.
- Kategori anggaran dan transaksi keuangan.
- Pengaturan logo grup.

Mutasi utama ditangani melalui Server Actions dan validasi input. Relasi `event_members` membedakan anggota organisasi dari anggota yang benar-benar ditugaskan pada event.

### Global state — Context API

- File: `src/components/layout/AppUIContext.js`.
- Context membagikan state UI, termasuk status navigasi mobile, ke komponen yang membutuhkan.
- Provider dipasang pada shell aplikasi agar komponen terkait menggunakan state yang sama.

### Autentikasi dan proteksi route

- Autentikasi menggunakan Supabase Auth.
- File: `src/proxy.js` mengikuti konvensi **Proxy pada Next.js 16** untuk pemeriksaan sesi dan pengalihan pengguna.
- Pada Next.js 16, konvensi `proxy.js` merupakan penerus konvensi `middleware.js`. Nama file berbeda mengikuti versi framework yang digunakan.
- Pemeriksaan otorisasi juga dilakukan pada halaman, Server Actions, helper server, dan kebijakan RLS. Proxy bukan satu-satunya lapisan keamanan.

**Bukti saat demo:** tunjukkan login, akses dashboard setelah login, redirect ketika belum login, lalu lakukan satu alur CRUD (misalnya membuat atau mengubah event/tugas).

## 4. Optimasi Performa, SEO, & Live Deployment — 25% (CPMK133)

**Kriteria:** memanfaatkan `next/image`, `next/font`, SEO Metadata, lolos `npm run build`, dan aplikasi dapat diakses melalui URL publik Vercel.

### Optimasi aset dan font

- **`next/image`:** digunakan pada komponen gambar aplikasi, termasuk tampilan logo grup.
- **`next/font`:** font Geist dan Geist Mono diinisialisasi pada root layout melalui integrasi font Next.js.

### SEO Metadata

- Metadata dasar didefinisikan pada root layout dan metadata halaman yang relevan.
- Halaman publik dan halaman katalog memiliki metadata sesuai konteks route.
- Metadata merupakan implementasi dasar SEO; peningkatan teknis seperti sitemap, robots, canonical, dan social metadata dapat ditambahkan bila dibutuhkan.

### Build dan deployment

- **Production build:** pemilik project mengonfirmasi `npm run build` berhasil pada pengujian lokal terbaru.
- **Live deployment:** aplikasi telah dipublikasikan melalui Vercel dan dapat diakses di [https://mini-event-management-gules.vercel.app](https://mini-event-management-gules.vercel.app).
- Deployment dan environment production dikelola oleh pemilik project.

### Catatan Lighthouse

Pengujian Lighthouse terbaru yang dilaporkan pemilik project pada deployment Vercel menunjukkan Performance **82**. Skor dapat berbeda antar-route dan kondisi pengujian; rubrik tidak menetapkan ambang skor Lighthouse tertentu. Gunakan hasil aktual saat demo dan jangan mengklaim skor dari route lain sebagai skor universal aplikasi.

**Bukti saat demo:** tunjukkan aplikasi melalui URL Vercel, perlihatkan penggunaan font/gambar dan metadata pada source, lalu tunjukkan hasil `npm run build`.

## Checklist demonstrasi

- [ ] Buka URL Vercel dan tunjukkan aplikasi berjalan.
- [ ] Tunjukkan nested layout dan dynamic route event.
- [ ] Jelaskan pembagian Server Components dan Client Components.
- [ ] Bandingkan katalog publik statis dengan dashboard privat dinamis.
- [ ] Tunjukkan autentikasi dan proteksi akses.
- [ ] Lakukan demonstrasi CRUD.
- [ ] Tunjukkan Context API.
- [ ] Tunjukkan `next/image`, `next/font`, dan Metadata.
- [ ] Tunjukkan hasil `npm run build`.

## Catatan akurasi

Dokumen ini memetakan implementasi yang ditemukan pada source dan hasil pengujian yang dikonfirmasi pemilik project. Keberadaan kode tidak otomatis membuktikan semua alur telah lulus end-to-end test. Status migration Supabase production harus diverifikasi pada project database yang digunakan.
