# Mini Event Management System

Aplikasi web untuk membantu organisasi/kepanitiaan mengelola event skala kecil: anggota, susunan panitia, rundown, tugas, pengadaan, keuangan, dan ekspor data.

> Status: aplikasi aktif dikembangkan. Fitur yang tercatat sudah diimplementasikan tetap perlu diuji pada environment aktual sebelum dianggap terverifikasi.

## Tech stack

- Next.js 16.4.5 App Router, React 19.3.0, JavaScript.
- Tailwind CSS 4.
- Supabase Auth, PostgreSQL, Storage.
- Supabase JS Client dan \`@supabase/ssr\` untuk akses data (tanpa ORM saat ini).
- Zod 4 untuk validasi; lucide-react untuk ikon.

## Getting started

Prasyarat: Node.js yang kompatibel dengan Next.js 16, npm, dan project Supabase.

\`\`\`bash
npm install
\`\`\`

Buat \`.env.local\` di root project:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
\`\`\`

Isi sendiri dari Supabase Dashboard. Jangan commit file ini atau membagikan secret/key.

\`\`\`bash
npm run dev
\`\`\`

Buka http://localhost:3000.

## Scripts

| Command | Fungsi |
|---|---|
| \`npm run dev\` | Development server |
| \`npm run lint\` | ESLint |
| \`npm run build\` | Production build |
| \`npm run start\` | Menjalankan hasil build |

## Documentation

1. [Project Handbook](docs/PROJECT_HANDBOOK.md) — produk, fitur, arsitektur, role, dan alur.
3. [Database & Migrations](docs/DATABASE_AND_MIGRATIONS.md) — schema dan prosedur Supabase.
4. [Implementation Status](docs/IMPLEMENTATION_STATUS.md) — status implementasi, batasan, dan checklist.
5. [Rubrik UAS](docs/IMPLEMENTASI-RUBRIK-UAS.md) — pemetaan implementasi terhadap empat kriteria penilaian.
6. [Resources](docs/RESOURCES.md) — link project dan referensi resmi.

## Repository structure

\`\`\`text
src/
  actions/       # Server Actions
  app/           # App Router pages, layouts, route handlers
  components/    # UI components
  lib/           # auth, Supabase clients, validators, helpers
  proxy.js       # Next.js 16 Proxy convention
supabase/
  schema.sql     # Initial schema; bukan migration incremental
  migrations/    # Perubahan database bertahap
docs/            # Dokumentasi resmi project
\`\`\`

## Deployment

Vercel digunakan untuk deployment. Pemilik project mengelola deployment dan environment variables. Jangan melakukan deployment atau mengubah konfigurasi production tanpa instruksi eksplisit.

## Important

- Root aplikasi adalah repository root; source berada di \`src/\`.
- Jangan membuat ulang folder legacy \`event-management/\`.
- Jangan menjalankan ulang \`supabase/schema.sql\` pada database yang sudah berisi tabel.
- Jangan mengubah RLS, migration, atau data production tanpa review dan persetujuan.
- Baca \`AGENTS.md\` dan [AI Working Rules](docs/AI_WORKING_RULES.md) sebelum mengubah source.
