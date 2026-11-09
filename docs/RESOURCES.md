# Project Resources & Reference Index

Indeks untuk resource yang dipakai developer, pemilik project, dan AI assistant. Tambahkan link baru di sini ketika ada keputusan, dokumentasi, desain, atau referensi teknis baru.

## 1. Project resources

| Resource | Link / lokasi | Catatan |
|---|---|---|
| GitHub repository | https://github.com/Abdul-Fikri/mini-event-management | Source utama |
| Production app | https://mini-event-management-gules.vercel.app | Domain yang terlihat pada pengujian Lighthouse; konfirmasi ulang jika domain Vercel berubah |
| Supabase Dashboard | https://supabase.com/dashboard | Pilih project yang benar; jangan simpan credential di sini |
| Vercel Dashboard | https://vercel.com/dashboard | Deployment dikelola pemilik project |
| Source code | \`src/\` | App Router, actions, components, lib |
| Database schema awal | \`supabase/schema.sql\` | Hanya untuk initial database kosong |
| Database migrations | \`supabase/migrations/\` | SQL incremental; cek history sebelum apply |

## 2. Internal documentation

- [Project Handbook](PROJECT_HANDBOOK.md)
- [AI Working Rules](AI_WORKING_RULES.md)
- [Database & Migrations](DATABASE_AND_MIGRATIONS.md)
- [Implementation Status](IMPLEMENTATION_STATUS.md)
- [Role Owner dan Panitia](ROLE-OWNER-PANITIA.md)
- [Undangan Panitia](UNDANGAN-PANITIA.md)
- [Implementasi Rubrik UAS](IMPLEMENTASI-RUBRIK-UAS.md)
- [AI Context](../AI_CONTEXT_NEXT_SESSION.md)
- [Agent instructions](../AGENTS.md)

## 3. Official technical documentation

### Next.js

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js 16 Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)
- [App Router](https://nextjs.org/docs/app)
- [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Server Actions and Mutations](https://nextjs.org/docs/app/getting-started/updating-data)

### Supabase

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase SSR with Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Database Migrations](https://supabase.com/docs/guides/deployment/database-migrations)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control)

### UI, validation, deployment

- [React Documentation](https://react.dev/reference/react)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zod Documentation](https://zod.dev/)
- [Vercel Documentation](https://vercel.com/docs)
- [Chrome Lighthouse](https://developer.chrome.com/docs/lighthouse/overview)

## 4. Technical decisions

| Decision | Current choice | Rationale / constraint |
|---|---|---|
| Routing | Next.js App Router | Nested layouts and dynamic event routes |
| Request interception | \`src/proxy.js\` | Next.js 16 convention |
| Database | Supabase PostgreSQL | Managed relational database |
| Data access | Supabase JS Client | No ORM currently installed |
| Validation | Zod | Server-side form validation |
| Migration format | SQL files | Reviewable and versioned in Git |
| Panitia PIC eligibility | \`event_members\` | Group membership does not imply event assignment |
| Private page cache | \`no-store\` where applied | Do not weaken privacy for Lighthouse bfcache |

## 5. Resource register for future additions

Tambahkan item baru dengan format berikut:

| Date | Resource / decision | Link or path | Owner | Status |
|---|---|---|---|---|
| YYYY-MM-DD | Description | URL/path | Name/role | Proposed / Active / Archived |

Resource yang perlu dilengkapi jika tersedia:
- Link Figma/Canva atau design system final.
- Diagram ERD terbaru.
- Daftar migration yang sudah diterapkan ke production (diverifikasi dari Supabase).
- Test plan dan hasil UAT.
- URL deployment preview/staging jika dibuat.
- Keputusan produk yang belum tertulis.
- Screenshot UI final untuk dokumentasi/presentasi.

## 6. Rules for adding resources

- Utamakan dokumentasi resmi untuk referensi framework/library.
- Catat tanggal ketika referensi bersifat versi-spesifik.
- Jangan simpan password, access token, service-role key, atau isi \`.env.local\`.
- Tandai link yang sudah tidak berlaku sebagai archived; jangan diam-diam menghapus konteks keputusan lama.
- Bedakan referensi resmi, keputusan internal, dan ide yang belum disetujui.
