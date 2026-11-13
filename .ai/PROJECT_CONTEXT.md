# Project Context — Mini Event Management System

Last reviewed: 14 November 2026

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
- `event_divisions`: Owner-managed division master list scoped to one event. `event_members.division_id` references it; the legacy `event_members.division` text remains a synchronized display/export snapshot.

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
Authentication/onboarding, dashboard, group member CRUD, event CRUD, event-scoped division CRUD and committee assignments, rundown CRUD, task CRUD, procurement CRUD with finance-linked expenses and commitments, finance categories/manual transactions, CSV exports, invitation token flow, Panitia read-only workspace, group logo upload/removal, and public example-event catalog.

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

## Event lifecycle and status behavior

- Event status supports `automatic` and `manual` modes through `events.status_mode`.
- New events default to automatic mode. Existing rows are backfilled as manual by migration so their current status is preserved.
- Optional `planning_start_date` and `preparation_start_date` must be supplied together and satisfy planning < preparation < event start.
- `start_date` is required; `end_date` is optional and defaults conceptually to the start date for a one-day event. Optional `evaluation_end_date` must be after the effective event end.
- Automatic status is derived in Asia/Jakarta: planned, planning, preparation, ongoing, optional evaluation, then completed. Cancellation is a manual status.
- Use `src/lib/events/status.js` as the single resolver and labels source. Dashboard, Owner event list/workspace, and Panitia event views must use it instead of displaying the raw stored `status` in automatic mode.
- No cron or background job is needed; the effective status is computed when data is read. Server Actions must independently derive automatic status and must not trust a hidden browser field.
- Read `docs/EVENT_LIFECYCLE_REQUIREMENTS.md` for detailed boundaries and acceptance criteria. Migration `20261112_event_lifecycle_automation.sql` must be applied before the new schema fields can be used at runtime.


## Event division behavior

- Divisions are master data scoped to one event, not global to the Owner's group.
- Owner manages division CRUD on the dedicated `/events/[id]/panitia/divisions` page. The main Panitia tab shows a quick Tambah divisi button (opens an in-place create form) and a Kelola divisi link to that dedicated page. Assignment forms select a division ID from that event's master list.
- Server Actions validate that the selected division belongs to the same event and group.
- Migration `20261112_event_divisions.sql` backfills existing free-text division labels into `event_divisions` and adds the composite `event_members.division_id` reference.
- Keep `event_members.division` as a synchronized text snapshot for existing Panitia pages and CSV exports. Renaming a master updates the snapshot; deleting a master clears only `division_id`, preserving the old label as history.
- Owner has CRUD; Panitia remains read-only and may read division metadata only for assigned events.
- The dedicated Kelola divisi page can be searched by division name or description and shows five records per page.
- Susunan panitia supports a division filter (all, one master division, or no active division) and text search across member name, contact, division label, position, and responsibility. Search and filter combine, with result count, empty state, and reset control.
- These are client-side display filters over the event data already loaded and authorized by the server; they do not replace authorization or RLS.
- The embedded Susunan panitia list shows a maximum of five records per page with previous/next pagination; changing search/filter resets to page one. The dedicated Kelola divisi page independently uses five-record pagination.
- The Kelola divisi button opens `/events/[id]/panitia/divisions`, which contains the complete division CRUD/search/pagination view. The Susunan panitia Lihat semua action opens `/events/[id]/panitia/committee`; committee search/filter values are carried into that dedicated view.
- Dedicated views link back to the main Panitia tab. Division and committee save/delete actions use a server-validated return path so the user stays on the view where the action started.
- The migration file is not evidence that the target Supabase database has been updated.


## Event management list pagination

- Group-level `/events` and `/members` pages also show a maximum of five records per page and provide dedicated `/events/all` and `/members/all` routes. Each dedicated route contains only the selected list and links back to its parent.
- Member edits/deletes initiated from `/members/all` return to that dedicated list using a server-validated return destination; normal member flows return to `/members`.
- Rundown and Pengadaan each display at most five records per page and expose dedicated all-records routes. Tugas uses `/events/[id]/tugas` as a four-status Kanban board with drag-and-drop, an accessible status selector, and create/edit/delete controls; `/events/[id]/tugas/all` contains the complete task list, status counts, full CRUD, and five-record pagination.
- Keuangan paginates categories, transactions, and ordered procurement commitments independently. Dedicated routes are `/events/[id]/keuangan/categories`, `/events/[id]/keuangan/transactions`, and `/events/[id]/keuangan/commitments`.
- Every paginated list uses five records per page. The Tugas Kanban board displays all loaded tasks in their status columns; its dedicated detail view uses five-record pagination. Dedicated views contain only the selected data type, link back to their parent management page, and preserve their view after supported edit/delete/sync actions through the validated event return-path helper.
- Add forms stay on the parent management pages for Rundown, Pengadaan, and Finance. Tugas supports create/edit/delete on both the Kanban board and its dedicated all-tasks view. No schema, migration, or RLS changes are introduced; the task-status Server Action applies the existing Owner/group/event authorization scope and validates the status allowlist.
- Kanban status changes use optimistic client state: the card moves immediately on drop/status selection, only that card shows a saving spinner while the Server Action persists in the background, and a failed save rolls the card back with feedback. Do not call `router.refresh()` for this interaction; revalidate other server-rendered task views only. Track pending updates per task so unrelated cards remain interactive.


## Source-editing and build-verification guardrails

The production build failure after PR #23 was caused by literal backslash-n characters being inserted into JavaScript source between statements in `src/actions/events.js`. Turbopack reported `Expected unicode escape`. The same mistake appeared in two functions, so correcting only the first reported line would have left the second failure.

Prevent recurrence on every future source change:

1. **Preserve real source line breaks.** When creating or patching source through an API, use actual newline characters between JavaScript statements. Do not insert the two literal characters `\\n` where a source line break is intended. Remember that an escaped newline inside a JavaScript string literal is different from a literal backslash-n accidentally placed between source statements.
2. **Inspect the saved file, not only the patch request.** After each source write, fetch/read the resulting file at the new branch head and inspect the exact changed region. Search the changed file for suspicious escaped sequences (especially literal `\\n` between statements), stray backslashes, malformed quotes, and duplicated fragments.
3. **Check the whole affected file/function.** Search for every occurrence of the same generated pattern; fix and verify all occurrences, not only the first line mentioned by the compiler.
4. **Run validation before asking for merge.** Run the repository's lint and production build commands when a local checkout is available. If they cannot be run, state that clearly, inspect the resulting diff/source, and require the Vercel Preview build to succeed before merge. Do not claim build success from source inspection alone.
5. **Verify the exact latest commit.** Check Vercel status for the current PR head SHA after the final code and documentation commits. An earlier green deployment does not validate a later commit.
6. **Classify deployment failures from evidence.** Read the actual build log. Treat `Expected unicode escape`/compiler parser output as a source syntax failure; call it a quota/rate-limit issue only when the Vercel result explicitly reports a quota/rate limit. Do not guess based on a generic failed status.
7. **Keep production protected.** Fix through a branch and PR; do not push directly to `main`, merge, or redeploy Production without the Owner's explicit authorization.

Incident reference: PR #23 merge commit `5a2c2824623f5e2f12d4c668642511898d945c80`; source file `src/actions/events.js`; corrected on `hotfix/fix-events-revalidate-syntax` and tracked by PR #24.


## Follow-up guardrail: repository-wide escaped-newline scan

The follow-up Vercel build after the `events.js` hotfix exposed the same malformed source pattern in `src/actions/members.js`. The first hotfix corrected only the first affected action file, so a successful source check on that file was not sufficient to establish that the repository was clean.

Mandatory additions to the source-editing checklist:

1. After any API-generated or automated source edit, scan **all modified source files and the complete related feature surface**, not just the first compiler-reported file. For shared helpers or generated patterns, search the entire `src/` tree.
2. Search for literal backslash-n sequences (`\\n`) appearing between JavaScript statements. Review every match: valid escape sequences inside strings are not automatically errors, but a backslash-n outside a string where a line break is intended is invalid source.
3. Inspect every Server Action file touched by the feature, including save, delete, and secondary CRUD actions. Build failures may surface through a Client Component import trace even when the actual parser error is inside an imported Server Action module.
4. Verify the complete diff and the saved source after all edits and documentation commits. Re-run the repository-wide suspicious-sequence scan after the final source change.
5. Do not merge based only on fixing the first reported file. Require lint/build validation where available and a successful Vercel Preview for the exact latest PR head.

Incident chain:
- PR #23 merge introduced malformed escaped newlines in `src/actions/events.js` and `src/actions/members.js`.
- PR #24 corrected `events.js` but did not catch the remaining issue in `members.js`.
- PR #25 hotfix corrects both malformed sequences in `members.js` on a separate branch.


## Kanban interaction performance rule

When changing task status from the four-column Kanban, preserve the optimistic interaction contract:
- Update local board state immediately before awaiting the Server Action; never wait for the server response before moving the card.
- Keep a per-card pending indicator/spinner while persistence is in flight. Do not block all cards because one task is saving.
- If the Server Action returns failure or throws, restore the prior status and show clear feedback.
- Avoid `router.refresh()` and avoid revalidating the active `/events/[id]/tugas` route for status-only updates; they can cause a full route render and defeat the immediate interaction. Invalidate the event overview and dedicated `/tugas/all` view only.
- Preserve server-side authorization, group/event scoping, and the status allowlist. Optimistic UI is presentation only; the database remains authoritative.
- Test both drag-and-drop and the status selector, slow/pending responses, failed updates/rollback, and a second independent card while the first is pending.


## Mandatory branch and Pull Request synchronization preflight

Before starting any new feature, refactor, or hotfix that changes application source, inspect the repository's current integration state. Do not assume that `main` contains work from an open PR or that a branch seen in an earlier conversation is still current.

1. **Refresh the repository baseline.** Fetch the latest `main` commit SHA, list all open PRs, and list remote branches. Record the time/current SHA used for the task. Do not rely on remembered branch names, previous conversation summaries, or stale status documents without checking GitHub again.
2. **Inspect every open PR branch.** For each open PR, record its number/title, state/draft status, base branch and SHA, head branch and SHA, and changed-file list. Compare those changed files with the files and feature surfaces planned for the task. Inspect the full diff and saved source at the exact head SHA for any overlapping or dependent work. Even when files do not overlap, account for whether the feature depends on behavior introduced by that PR.
3. **Classify non-main branches.** Identify branches tied to open PRs, branches explicitly used as dependencies/active work, and stale or historical branches. Compare relevant branches against the latest `main` to identify unique commits and changed files. Do not assume every old remote branch is active, and do not silently ignore a known active branch just because it has no PR.
4. **Choose the correct implementation base.**
   - Independent feature: create a new branch from the latest `main`.
   - Feature that requires code from an unmerged PR: base the work on that PR's head branch and document the dependency/stacked-PR relationship, or wait for that PR to merge if appropriate.
   - If an open PR modifies the same component, Server Action, shared helper, route, schema contract, or interaction, inspect and account for its exact changes before editing. Do not recreate an older implementation from `main` and overwrite the newer PR behavior.
   - Never silently change an existing PR's branch/base or merge another PR just to make the new feature work.
5. **Re-check during longer tasks.** Before major edits and before opening/updating a PR, refresh the open-PR list and relevant head/base SHAs. Another PR may have merged or received new commits while implementation was in progress.
6. **Verify integration, not just isolated code.** Review the complete diff against the intended base, check for overlapping changes and duplicated logic, inspect the saved files, and run the available lint/build/tests. If local validation is unavailable, disclose that and require Vercel Preview success for the exact final PR head. A green Preview for an earlier SHA does not validate later commits.
7. **Preserve Owner-controlled operations.** Use a dedicated branch and PR. Do not push directly to `main`, merge/rebase branches, delete branches, or deploy Production unless the Owner explicitly authorizes that operation.

A concise pre-development note should identify: latest `main` SHA; open PRs and their head/base SHAs; relevant branches/dependencies; overlapping files/features; chosen base branch and reason. If there are no open PRs, state that explicitly. This checklist is mandatory for every new feature request, not only when a conflict is already visible.


## Panitia event visual design — Polar Bear

The Owner-facing event Panitia management pages use a scoped Polar Bear visual theme inspired by soft ice blue and white:

- App canvas/surface references: `#F5F8FC` (ice canvas), `#FFFFFF` (card surface), `#F0F5FA` (soft tinted panels), and `#EBF3FC` (active/soft blue highlights).
- Primary accent: `#3B82F6`; hover/darker accent: `#2563EB`; focus accent: `#BFDBFE`.
- Borders: `#E2EBF5` or slightly stronger `#D7E6F5` for nested data cards. Primary text: `#0F172A`; secondary text: `#64748B`.
- Use clear surface hierarchy: separate white sections, tinted filter/form panels, and individually outlined/shadowed data cards. Keep spacing and typography consistent so adjacent records do not visually blend together.
- This was the initial PR #29 scope. The Owner subsequently approved extending the same restrained design language across the entire Owner workspace; see `Owner workspace visual design system — Stitch-inspired` below.
- Keep danger actions visibly distinct with accessible red styling. Preserve keyboard focus, labels, semantic elements, responsive stacking, and pending/error feedback.
- This is a presentation-only theme. Do not change data contracts, Server Actions, authorization, group/event scoping, RLS, or database schema as part of visual-only work.


## Owner workspace visual design system — Stitch-inspired

The Owner workspace follows one consistent visual language based on the Stitch HTML reference supplied by the Owner: a clean white topbar, restrained sidebar, event header with horizontal subnavigation, and well-separated content surfaces.

- Canvas: `#F5F8FC`; primary surface: `#FFFFFF`; subtle surface: `#F8FAFC`.
- Border: `#E3ECF5`; stronger border: `#D7E3EF`.
- Primary text: `#1E293B`; secondary text: `#64748B`.
- Primary accent: `#407BB0`; hover: `#32628E`; active/soft surface: `#EDF4FA`.
- Topbar is white and compact, with group identity on the left and Owner account/logout on the right.
- Sidebar is a white panel with light icons and a soft-blue active state; mobile navigation remains accessible and horizontally scrollable when appropriate.
- Event header and event subnavigation belong in one surface. Tabs are horizontal, scrollable on small screens, and use a soft background for the active route.
- Cards and records use white surfaces, neutral thin borders, consistent spacing, and clear separation. Avoid blue shadows, glow, strong gradients, and excessive decoration.
- Shared controls use the same radius, border, typography, focus, pending, and feedback patterns. Semantic success/warning/danger colors remain distinct.
- Apply across Dashboard, Event and nested management pages, Anggota Panitia, Pengaturan Grup, and shared Owner navigation/components.

Visual-only work must preserve data contracts, Server Actions, CRUD, route/query/return-path behavior, authorization, group/event scoping, role boundaries, RLS, cache policy, and database schema.


## Owner workspace UI design system

- PR #30 merged to `main` at `6ab8e1bccd42edd65f6fef921375f252dc0a64c5`. It established the shared Stitch-inspired Owner shell: topbar, sidebar/mobile navigation, event header/subnavigation, shared controls, global soft-neutral palette, and separate member cards.
- Follow-up branch `feat/stitch-management-ui-polish` extends the same visual language across management content: Dashboard, Event lists and forms, Member lists and forms/invitations, Rundown, Tugas Kanban and full list, Pengadaan, Keuangan, Ekspor, event overview, and group settings.
- Reference language: canvas `#F5F8FC`, white surfaces, soft neutral border `#E3ECF5`, muted text `#64748B`, restrained blue accent `#407BB0` with hover `#32628E`. Use subtle neutral shadows only; no blue glow or decorative gradients.
- Reusable presentation classes in `src/app/globals.css`: `management-panel`, `management-card`, `management-stat`, `management-form`, `management-empty`, and `management-link`.
- The Divisi event heading has no decorative ordinal tile such as `01`; it is a section heading, not a numbered step or record.
- This refresh is presentation-only. Preserve Server Components/data queries, Server Actions, CRUD, search/filter, pagination, dedicated routes, validated return paths, role boundaries, event/group scoping, authorization, and RLS. No schema, migration, environment, production data, or deployment changes are part of the UI work.
- Verify local lint/build and browser behavior when a checkout is available; otherwise report the limitation and require Vercel Preview for the exact final branch head plus Owner UAT. A Preview deployment does not prove Production deployment.
