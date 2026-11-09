# AI Project Context — Mini Event Management System

> Gunakan dokumen ini sebagai konteks awal sesi AI berikutnya. Jika source code branch terbaru berbeda dari catatan ini, source code terbaru dan instruksi pemilik proyek yang berlaku.

## Project identity
- Repository: https://github.com/Abdul-Fikri/mini-event-management
- Working branch: `hari-1-auth-dashboard`
- Active app root: repository root; aplikasi berada di `src/`.
- Stack: Next.js App Router, JavaScript, React, Tailwind CSS, Supabase Auth/PostgreSQL/Storage, Zod.
- Product UI: Bahasa Indonesia.
- Owner memiliki akun login; anggota panitia dikelola sebagai data `members`. Workspace panitia menggunakan alur undangan dan klaim akun.

## Important: modules already implemented
Jangan berasumsi fitur-fitur berikut belum dibuat. Source code sudah ditemukan untuk seluruh area ini:

1. **Event CRUD** — list/create/detail/edit/delete.
2. **Anggota Panitia CRUD** — list/create/edit/delete anggota.
3. **Penugasan anggota ke event** — relasi `event_members`.
4. **Susunan Panitia** — anggota, divisi, jabatan, tanggung jawab; edit/remove assignment.
5. **Rundown** — create/update/delete schedule items.
6. **Tasks** — create/update/delete tasks, including assignee/status/priority/deadline fields.
7. **Procurement** — create/update/delete procurement items, PIC, quantity, cost and status data.
8. **Finance** — budget category and transaction CRUD; income/expense.
9. **CSV Export** — committee, schedule, tasks, procurement, finance, members.
10. **Panitia invitation/workspace** — create invitation, claim token, panitia home, assigned-event read-only detail.

Core source references are listed in `docs/IMPLEMENTATION_STATUS_2026-11-08.md`.

## Important distinction: implemented != verified
The features above are marked **implemented in source**, not automatically passed end-to-end tests. The AI must not claim that they work perfectly until tested in the running application with the relevant Owner/Panitia accounts and database.

Workspace Panitia currently appears **read-only**: it shows assigned event information, rundown, tasks and procurement. Do not claim Panitia can update task statuses unless new source code confirms it.

## Known review notes
- CSV export type `members` currently queries all members in the Owner's group, not only members assigned to the selected event. This may be intentional as a group-member export; ask/confirm product expectation before changing it.
- Invitation creation stores a SHA-256 token hash and sets 48-hour expiry; claiming calls Supabase RPC `claim_member_invitation`. The relevant database migration/RPC must exist in the connected Supabase project for this flow to work.
- Event detail subnavigation active state has been fixed on this branch. `src/components/events/EventSubnav.js` uses `usePathname()` to highlight the current tab (Overview, Panitia, Rundown, Tugas, Pengadaan, Keuangan, Ekspor), and `src/app/(app)/events/[id]/layout.js` renders it. This source change is committed on the working branch but has not yet been verified in the deployed browser.
- The nested legacy folder `event-management/` has been removed from this branch. The active Next.js app remains at repository root.

## Recent logo fix
Commit `d79f368a34c67c4d875a50c69c1c85fd5dce9d17` updates `src/components/settings/GroupLogoForm.js`. The remove button now uses `removeLogoAction` to set `remove=true` in FormData before calling the useActionState form action.

## How to continue
- Start by checking `docs/IMPLEMENTATION_STATUS_2026-11-08.md`.
- Do not rebuild existing modules.
- Prioritize manual end-to-end validation and bug fixes based on concrete user results.
- Ask for the exact error/screenshot only when a test fails; do not make the user repeat setup that is already complete.
- Do not rerun schema/migrations without a specific reason.
- Never request or expose `.env.local`.
- App root is repository root, with source in `src/`; do not recreate the removed nested legacy folder.
- Do not deploy to Vercel; the project owner handles Vercel.
- Do not commit/push additional changes unless explicitly asked or authorized.


## Dashboard performance follow-up (9 Nov 2026)
- Initial production Lighthouse screenshot showed Performance 82, Accessibility 100, Best Practices 100, SEO 100. The detailed metric values were not visible, so do not state a confirmed root cause or claim a score improvement.
- Branch `perf/dashboard-data-queries` reduces Dashboard Supabase payload: removes unused event/task columns, fetches only unfinished tasks and pending procurement rows, and restores active `force-dynamic` and Dashboard metadata exports that were accidentally escaped into a comment.
- Changes are recorded in `docs/IMPLEMENTATION_STATUS_2026-11-08.md`. Lint, production build, and post-deploy Lighthouse have not yet been verified.
