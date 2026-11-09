# AI Project Context — Mini Event Management System

> Baca dokumen ini sebagai ringkasan awal. Sebelum mengubah kode, ikuti \`AGENTS.md\` dan \`docs/AI_WORKING_RULES.md\`. Jika catatan berbeda dari source branch terbaru atau instruksi pemilik project, periksa dan perbarui catatan; jangan menebak.

## Project identity

- Repository: https://github.com/Abdul-Fikri/mini-event-management
- Current base branch: \`main\`
- Current documentation branch at update: \`docs/project-handbook-ai-rules\` (PR akan dibuat; jangan menganggap merged sebelum status GitHub dicek).
- Active app root: repository root; source di \`src/\`.
- Stack: Next.js 16.4.5 App Router, React 19.3.0, JavaScript, Tailwind CSS 4, Supabase Auth/PostgreSQL/Storage, Supabase JS/SSR, Zod 4.
- No Prisma/Drizzle ORM is installed. Queries use Supabase JS Client; database changes are SQL migrations.
- UI/product language: Bahasa Indonesia.
- Owner mengelola grup dan event. Panitia adalah data \`members\` yang dapat ditautkan ke Auth melalui invitation.

## Required reading

1. \`AGENTS.md\`
2. \`docs/AI_WORKING_RULES.md\`
3. \`docs/PROJECT_HANDBOOK.md\`
4. \`docs/IMPLEMENTATION_STATUS.md\`
5. Dokumen database atau fitur yang relevan.

## Implemented modules (source-level status)

- Authentication: register/login, session handling.
- Onboarding and group settings, including group logo.
- Event CRUD.
- Group member CRUD.
- Event committee assignment through \`event_members\` (division, position, responsibility).
- Rundown CRUD.
- Task CRUD with assignee, status, priority, and deadline.
- Procurement CRUD with PIC, quantity, estimates/actuals, and status.
- Finance categories and income/expense transactions.
- CSV export: committee, schedule, tasks, procurement, finance, and group members.
- Invitation create/claim flow and Panitia workspace.
- Event subnavigation active state using \`usePathname()\`.

Implemented in source does not mean all flows have passed browser E2E, production build, or multi-user testing.

## Critical domain rule: member vs event member

- \`members\` means a person in the organization/group.
- \`event_members\` means that person is assigned to a specific event.
- Group membership does not automatically grant membership in every event.
- Rundown PIC, task assignee, and procurement PIC options are filtered to the current event's \`event_members\`.
- Server Actions \`saveScheduleItem\`, \`saveTask\`, and \`saveProcurementItem\` revalidate assignment server-side.
- Add the person in the event's Panitia tab before assigning them to event work.
- This fix is merged through PR #5 (merge commit \`71d7c95\`). Verify current source if changing these flows.

## Roles and limitations

- Owner has the main group-management UI and CRUD workflows.
- Panitia account is linked to \`members.auth_user_id\` after invitation claim.
- Panitia workspace currently displays assigned event, rundown, tasks, and procurement read-only. Do not claim Panitia can update task status unless source is changed and verified.
- CSV export type \`members\` currently exports all group members, not only members assigned to the selected event. Do not change without product confirmation.

## Current architecture notes

- Root layout: \`src/app/layout.js\`.
- Owner app layout: \`src/app/(app)/layout.js\`.
- Auth layout: \`src/app/(auth)/layout.js\`.
- Panitia workspace: \`src/app/(panitia)/panitia/\`.
- Public catalog: \`src/app/(public)/contoh-event/\`.
- Dynamic event route: \`src/app/(app)/events/[id]/\`.
- Next.js 16 request interception: \`src/proxy.js\` exporting \`proxy()\`; do not rename to \`middleware.js\` without version-specific reason.
- Supabase clients: \`src/lib/supabase/client.js\`, \`server.js\`, \`proxy.js\`.
- Auth helpers: \`src/lib/auth.js\`.
- Validation: \`src/lib/validators/\`.
- Server Actions: \`src/actions/\`.

## Database and migration

- Initial schema: \`supabase/schema.sql\`; never rerun on an existing project database.
- Incremental SQL files: \`supabase/migrations/\`.
- Files currently in migrations: \`20261108_owner_panitia_foundation.sql\`, \`20261109_member_invitations.sql\`, \`20261110_group_logos.sql\`.
- Migration production state is not proven by repository files alone. Verify Supabase migration history/schema before running anything.
- User prefers to understand and run SQL migrations manually via Supabase SQL Editor. AI may prepare/review migration files, but must not execute production SQL or change schema without explicit approval.
- Supabase CLI is not yet configured as a project dependency; see \`docs/DATABASE_AND_MIGRATIONS.md\`.

## Recent merged work

- PR #1: initial project merge (historical).
- PR #2: active event subnavigation and project notes.
- PR #3: Dashboard query/payload improvements.
- PR #4: disables eager prefetch on Dashboard and primary Owner nav links.
- PR #5: limits event PIC/assignee dropdowns and server validation to \`event_members\`.
- PR #4 merge commit: \`904525e\`.
- PR #5 merge commit: \`71d7c95\`.
- Confirm PR state with GitHub before relying on this history.

## Performance observations (user-reported Lighthouse)

- Dashboard reached Performance 96 after the route-prefetch change.
- An event/Panitia route screenshot showed Performance 91, Accessibility 100, Best Practices 100, SEO 100.
- On that route, Lighthouse's unused-JS diagnostic attributed most transfer to Chrome extensions (about 789.4 KiB and 28.1 KiB); first-party Vercel chunk was about 71.6 KiB with estimated savings 29.3 KiB.
- Private Panitia route bfcache diagnostic reported \`Cache-Control: no-store\` and JS resource with \`no-store\`. Treat as privacy-related; do not weaken cache headers just to improve Lighthouse.
- Scores vary with device, extensions, cache, network, and route. Do not promise fixed scores.

## Environment

Required variable names only:
- \`NEXT_PUBLIC_SUPABASE_URL\`
- \`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY\`

Never request or expose \`.env.local\`, publishable key values, service-role key, passwords, or tokens.

## Workflow and constraints

- Read \`AGENTS.md\` and \`docs/AI_WORKING_RULES.md\` before code changes.
- Do not recreate deleted nested \`event-management/\`.
- Do not rebuild modules already present; inspect source first.
- Do not run schema/migrations without a concrete reason and explicit approval.
- Do not commit directly to \`main\`; use a branch and PR.
- User reviews/merges PRs unless explicitly asking AI to merge.
- User handles Vercel deployment; do not deploy.
- Never claim lint/build/E2E passed unless actually run and result is known.
- After meaningful work, update this file and \`docs/IMPLEMENTATION_STATUS.md\`.
