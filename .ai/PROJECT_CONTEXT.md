# Project Context — Mini Event Management System

Last reviewed: 9 November 2026

Repository: https://github.com/Abdul-Fikri/mini-event-management
Production URL reported by owner: https://mini-event-management-gules.vercel.app

## Product
A web application for small organizations and event committees to manage members, events, committee assignments, rundown, tasks, procurement, finances, invitations, and exports.

## Stack
- Next.js 16.4.5 App Router, React 19.3.0, JavaScript.
- Tailwind CSS 4.
- Supabase Auth, PostgreSQL, and Storage.
- Supabase JS Client and `@supabase/ssr`; no Prisma/Drizzle ORM was found.
- Zod 4 and lucide-react.
- Vercel for hosting; deployment is managed by the owner.

## Repository structure
- Application root: repository root.
- Source: `src/`.
- Routes/layouts: `src/app/`.
- Server Actions: `src/actions/`.
- UI: `src/components/`.
- Auth, Supabase clients, validation, helpers: `src/lib/`.
- Next.js 16 Proxy convention: `src/proxy.js`.
- Initial schema: `supabase/schema.sql`.
- Incremental SQL: `supabase/migrations/`.
- Public product/engineering documentation: `docs/`.
- Shared AI context: `.ai/` and root `AGENTS.md`.

Do not recreate the deleted nested legacy `event-management/` directory.

## Domain model
- `groups`: Owner organization/group.
- `members`: group-wide member directory.
- `events`: events belonging to a group.
- `event_members`: members assigned to one specific event.

Being in `members` does not automatically make someone a committee member for every event. Rundown PIC, task assignee, and procurement PIC must be restricted to the current event's `event_members`, in both UI and server-side validation.

## Date behavior

- New events must start today or later in Asia/Jakarta. If supplied, the end date must also be today or later and cannot precede the start date.
- When editing an existing event, a stored past start/end date may remain unchanged; any changed date must be today or later. Server-side validation compares submitted dates with values loaded from the database.
- Rundown dates remain within the event's date range, including historical dates for an event that has already started or ended.
- Task deadlines are optional and fully flexible: past, current, and future dates are accepted when creating or editing a task; there is no minimum/maximum date rule. Finance transaction dates may also be historical for bookkeeping.
- No database migration is required for these rules.

## Roles and known behavior
- Owner authenticates with Supabase Auth and manages the group, members, events, committee, rundown, tasks, procurement, finance, exports, and settings.
- Panitia accounts are linked through `members.auth_user_id` and should only access assigned events.
- The reviewed Panitia workspace is read-only. Do not claim Panitia can edit tasks or update task status unless that behavior is implemented and verified.

## Rendering and architecture evidence
- Public `/contoh-event`: `src/app/(public)/contoh-event/page.js` uses `dynamic = "force-static"`.
- Private `/dashboard`: `src/app/(app)/dashboard/page.js` uses `dynamic = "force-dynamic"` because data is user/session-specific.
- Event details use dynamic `[id]` routes under `src/app/(app)/events/[id]/`.
- Context API provider: `src/components/layout/AppUIContext.js`.
- Root layout uses `next/font` (Geist and Geist Mono); `next/image` is used for app imagery including group logos.
- Next.js 16 uses `src/proxy.js` as the Proxy convention; do not blindly add legacy `middleware.js`.
- Group-logo upload/removal uses `src/actions/group-logo.js` and `src/lib/supabase/admin.js`; the admin client is guarded by `server-only` and must never enter browser bundles.

## Procurement and finance domain behavior

- Procurement and Finance remain separate pages with linked data.
- Status requested means requested only; ordered means confirmed order and contributes estimated cost to commitments; purchased/ready means an actual purchase and creates/updates one linked transactions expense. Existing rows that used requested before the status split remain requested/Diminta; review and change to ordered/Dipesan manually only when the order was actually confirmed.
- The database trigger is the source of truth for the automatic expense. transactions.procurement_item_id is unique and nullable; do not create a second manual expense for the same purchase.
- Procurement category, actual unit price, quantity, supplier, and purchase date synchronize to the linked finance transaction. Linked transactions are managed from Procurement, not edited/deleted from Finance.
- Deleting a purchased procurement item keeps its finance transaction as history and clears only the item link.
- Finance cash balance remains income minus actual expenses. Budget remaining after commitments is category budget minus actual expenses minus estimated costs of ordered procurement items.
- Existing purchased items from before this integration are not backfilled automatically, and editing them does not silently create a second expense. Review manual finance records before using the per-item legacy sync action; if their purchase date is unknown in the record, enter the actual date before syncing.
- Migration 20261111_procurement_finance_integration.sql must be applied to the target Supabase database before using this integration. Repository presence does not prove production application.

## Features found in source
Authentication/onboarding, dashboard, group member CRUD, event CRUD, committee assignments, rundown CRUD, task CRUD, procurement CRUD, finance categories and transactions, CSV exports, invitation token flow, Panitia read-only workspace, group logo upload/removal, and public example-event catalog.

## Known caveats
- CSV `members` export is group-wide, not limited to event-assigned members; confirm product intent before changing.
- Removing a committee member who already owns work items requires a product/data-integrity decision.
- Invitation claiming depends on the relevant migration/RPC existing in the target database.
- Group-logo upload requires `SUPABASE_SECRET_KEY` or legacy `SUPABASE_SERVICE_ROLE_KEY` as a server-only environment variable. Never use `NEXT_PUBLIC_` for it.
- The group-logo bucket is public for image delivery, not public writes. PR #16 moved Storage mutations to Server Actions after `requireGroup()`; privileged Storage operations bypass Storage RLS, so server-side Owner authorization is mandatory. Group metadata is still updated with the authenticated Owner client.
- Owner reports that logo upload now succeeds after PR #16. Re-test deletion/replacement cleanup separately.
- SQL files in Git do not prove production migrations have been applied.
- The current UI and code observations are not a substitute for end-to-end testing.

Read `docs/PROJECT_HANDBOOK.md`, `docs/DATABASE_AND_MIGRATIONS.md`, `docs/IMPLEMENTATION_STATUS.md`, and `docs/IMPLEMENTASI-RUBRIK-UAS.md` for the public project documentation.
