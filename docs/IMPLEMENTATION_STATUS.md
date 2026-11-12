# Implementation Status — Mini Event Management System

Last reviewed: 12 November 2026
Repository: https://github.com/Abdul-Fikri/mini-event-management  
Source reviewed: `main` after PR #22 merge plus the unmerged Panitia and event-management pagination implementation in PR #23.

> Status labels describe what was found in source, not proof of production runtime correctness. Distinguish implemented, merged, deployed, and verified.

## 1. Feature inventory

| Module | Source-level implementation | Notes |
|---|---|---|
| Authentication | Register/login, Supabase session, redirect | Verify with real Owner/Panitia accounts |
| Onboarding/group | Group setup and group settings | Owner group context |
| Dashboard | Dynamic server-rendered dashboard and summary queries | User-reported Lighthouse Performance 96 |
| Group members | Create/read/update/delete member directory; five-record pagination and dedicated all-members view | Group-level directory; edit/delete preserve the dedicated view when opened from `/members/all` |
| Events | Create/read/update/delete events; five-record pagination and dedicated all-events view | Dynamic route `/events/[id]`; event status labels use the effective-status resolver |
| Event committee | Add/remove member assignment; event-scoped division CRUD; division dropdown; search/filter committee by division and text; search division master list | `event_divisions` master data + `event_members` assignment |
| Rundown | Create/update/delete schedule items; five-record pagination and dedicated all-items view | PIC restricted to current event roster |
| Tasks | Create/update/delete tasks; five-record pagination and dedicated all-items view | Assignee restricted to current event roster; optional deadline accepts past, current, or future dates on create/update |
| Procurement | Create/update/delete procurement items; five-record pagination and dedicated all-items view; assign budget category; separate requested/ordered/purchased/ready states | PIC restricted to current event roster; ordered items become budget commitments; purchased/ready items automatically create or update one linked finance expense |
| Finance | Budget categories, manual income/expense transactions, procurement-linked expenses, and ordered-item commitments | Linked procurement expenses are managed from Procurement; manual finance transactions remain editable; historical transaction dates remain allowed |
| CSV export | Committee, schedule, tasks, procurement, finance, members | \`members\` export is group-wide |
| Invitations | Create email-bound token and claim through RPC | Requires migration and correct email |
| Panitia workspace | List assigned events and read event/rundown/tasks/procurement | Read-only in current UI |
| Group logo | Upload/remove through Owner-authorized Server Actions and server-only Supabase admin client | Max 2 MB; JPG/PNG/WebP; Owner verified with \`requireGroup()\`; metadata update uses Owner session client. Owner confirms upload now succeeds after PR #16. Re-test removal separately. |
| Public catalog | Static \`/contoh-event\` page | Public content |
| Event subnavigation | Active tab based on pathname; event CRUD returns to the same subpage after success | Overview, Panitia, Rundown, Tugas, Pengadaan, Keuangan, Ekspor |

## 2. Important domain behavior

### Group member vs event committee member

- \`members\` stores people in the Owner's group.
- \`event_members\` stores the subset assigned to a specific event.
- Being in \`members\` does not imply assignment to every event.
- Rundown, task, and procurement forms query the current event's \`event_members\` roster for PIC/assignee options.
- Server Actions \`saveScheduleItem\`, \`saveTask\`, and \`saveProcurementItem\` validate the selected member against the same event and group.
- This behavior was introduced/fixed in PR #5, merged to \`main\` (merge commit \`71d7c95ad0ab8f822faaec5170a5022730c71ca8\`).


### Event-specific division master data

- Divisions are managed by the Owner per event from the Panitia tab; they are not a group-global list.
- Owner can create, list, edit, and delete division master records. Committee assignment forms select from that event's division dropdown instead of accepting free text.
- `event_members.division_id` is validated against the same event and group. Existing `event_members.division` text is backfilled and retained as a synchronized snapshot for Panitia pages and CSV exports.
- Renaming a master updates assignment snapshots. Deleting a master clears the reference but preserves the old label as historical text.
- Migration: `20261112_event_divisions.sql`. Authored in PR #22; not confirmed applied to Supabase.

### Event dates vs operational history

- New events require a start date on or after today in Asia/Jakarta. An optional end date must also be on or after today and cannot precede the start date.
- When editing an existing event, a past start/end date may remain unchanged. Any changed date must be today or later. The Server Action loads the stored values before applying this comparison.
- Rundown dates remain constrained to the event's inclusive start/end range. Past dates within an existing event are allowed for historical rundown records.
- Task deadlines are optional and fully flexible: create/update accepts past, current, or future dates; no minimum/maximum date rule is applied.
- Finance transaction dates may be in the past for historical bookkeeping.
- Procurement currently has no user-entered date field affected by this rule.
- The event form's HTML `min` attributes improve the input experience; Zod validation in the Server Action remains authoritative. No database migration or historical data rewrite is required.

## 3. Pagination and dedicated list views\n\nPR #23 source now applies five-record pagination and dedicated **Lihat semua** routes to the group Event and Member lists, in addition to Panitia, Rundown, Tugas, Pengadaan, and the three Keuangan lists. Group-level routes are `/events/all` and `/members/all`. The member edit/delete flow validates and preserves `/members/all` as a return destination. These are UI/routing changes over group-scoped server queries; no database changes are introduced. Runtime verification remains pending until Preview is available and the Owner completes UAT.\n\n## 4. Architecture notes

- Next.js 16.4.5 App Router, React 19.3.0, JavaScript, Tailwind CSS 4.
- Root source is \`src/\`; do not recreate nested legacy \`event-management/\`.
- \`src/proxy.js\` is the Next.js 16 Proxy convention.
- Supabase browser/server clients live in \`src/lib/supabase/\`.
- Auth helpers live in \`src/lib/auth.js\`.
- Zod schemas live in \`src/lib/validators/\`.
- Server Actions live in \`src/actions/\`.
- Static route: \`/contoh-event\` uses \`dynamic = "force-static"\`.
- Private Dashboard: \`/dashboard\` uses \`dynamic = "force-dynamic"\`.

## 5. Merged improvements

| PR | Summary | Status |
|---|---|---|
| #2 | Event subnavigation active state and docs | Merged |
| #3 | Dashboard data-query/payload improvements | Merged |
| #4 | Disable eager prefetch on Dashboard and primary Owner navigation links | Merged |
| #5 | Restrict event PIC/assignee selection to event committee membership; server-side validation | Merged |
| #8 | Add Lottie route-level loading animation | Merged |
| #9 | Add global loading feedback for navigation and shared form actions | Merged |
| #10 | Public project documentation and UAS rubric mapping | Merged |
| #11 | Shared AI project context and agent instructions | Merged |
| #16 | Move group-logo Storage upload/removal to Owner-authorized server actions | Merged; final logo upload path; owner reports upload now succeeds |
| #20 | Integrate Procurement with Finance: ordered commitments and linked purchase expenses | Merged 11 Nov 2026; migration application to Supabase is not confirmed |
| #21 | Automate event lifecycle status with automatic/manual modes | Merged 11 Nov 2026 at `a87556aa24480cd8e0e9d83f22409a7f9fb2ab80`; migration application to Supabase is not confirmed |

Confirm PR state on GitHub before assuming any later work is merged/deployed.

## 6. Lighthouse observations (user-reported)

- Dashboard previously reached Performance 96 after PR #4 was merged/deployed.
- A more recent Lighthouse run on the Vercel deployment was reported at Performance 82; the exact route and test conditions were not specified. Do not treat any one route's score as a global application score.
- An event/Panitia route screenshot showed Performance 91, Accessibility 100, Best Practices 100, SEO 100.
- Unused JavaScript diagnostics attributed the majority of transfer to Chrome extensions (one extension about 789.4 KiB and another about 28.1 KiB). First-party Vercel chunk shown was about 71.6 KiB, estimated savings 29.3 KiB.
- Panitia route bfcache diagnostic reported \`Cache-Control: no-store\` and a JavaScript resource with \`no-store\`. This is not actionable in Lighthouse; do not weaken private-page cache policy just to increase score.
- Scores are environment-dependent. Repeat with extensions disabled/incognito if comparing application bundle performance.

## 7. Known limitations / decisions

1. Panitia workspace is read-only in the current UI; no Panitia task-status mutation was found.
2. CSV export type \`members\` queries all group members, not only event-assigned members. Product intent must be confirmed before changing.
3. Removing a person from \`event_members\` while that person is assigned to existing rundown/tasks/procurement deserves a product/data-integrity decision. Do not silently delete or reassign related work.
4. Migration production status must be checked in the target Supabase project's migration history/schema. Repository files alone are not proof.
5. No Prisma/Drizzle ORM or Supabase CLI project configuration was found in \`package.json\`/repository tree reviewed.

## 8. Validation status

PR #18, PR #19, PR #20, and PR #21 are merged to `main`. PR #20 adds ordered procurement commitments plus database-triggered finance expenses for purchased/ready items. PR #21 adds automatic/manual event lifecycle status. The SQL files for PR #20 (`20261111_procurement_finance_integration.sql`) and PR #21 (`20261112_event_lifecycle_automation.sql`) are present in `main`, but application to the target Supabase database is **not confirmed**. PR #20 Vercel Preview succeeded before merge; PR #21 Preview later reported `build-rate-limit`, a deployment quota/rate-limit result rather than an application compile result. Neither Preview result proves Production deployment or runtime database behavior. The assistant has not run local `npm run lint`, `npm run build`, or browser E2E for PR #20/#21.

Use this checklist for future UAT:

- [ ] Owner register/login/logout and session refresh.
- [ ] Onboarding and group settings.
- [ ] Member CRUD and group scoping.
- [ ] Event CRUD and cross-group URL access rejection; confirm target budget input formats `500000` as `500.000` and normalizes it to a numeric value.
- [ ] After create/edit/delete in Panitia, Rundown, Tugas, Pengadaan, and Keuangan, confirm the app returns to the same active event subpage rather than Overview.
- [ ] Creating an event with a past start date is rejected.
- [ ] Creating an event with a past end date is rejected; an end date before the start date is rejected.
- [ ] Editing a legacy event while keeping its existing past dates unchanged is allowed.
- [ ] Changing a legacy event's start/end date to another past date is rejected; changing it to today/future is allowed when the date range remains valid.
- [ ] Rundown dates inside the event range are accepted even when historical; dates outside the event range are rejected.
- [ ] Task deadline is optional and accepts past/current/future dates on both create and update.
- [ ] Past finance transaction dates remain accepted.
- [ ] New event defaults to `status_mode=automatic`.
- [ ] Existing events remain in manual mode after migration and retain their saved status.
- [ ] Planning and preparation dates are both optional but must be supplied together; their order must be planning < preparation < event start.
- [ ] Automatic status transitions follow Asia/Jakarta calendar boundaries: Direncanakan → Perencanaan → Persiapan → Berlangsung → Evaluasi (if configured) → Selesai.
- [ ] Event end date is inclusive; a one-day event is ongoing on its start date and completed the following day unless evaluation is configured.
- [ ] Evaluation remains active through `evaluation_end_date` inclusive and becomes completed the next day.
- [ ] Manual status does not change when dates pass; cancellation is available only in manual mode.
- [ ] Switching automatic → manual preserves the currently effective status as the initial manual selection; switching back resumes timeline-derived status.
- [ ] Dashboard, event list, Owner workspace, and Panitia views display the same effective status.
- [ ] Forged hidden/browser status values cannot override server-side lifecycle resolution.
- [ ] Invalid timeline values are rejected by Server Action validation and database constraints after the migration is applied.
- [ ] Add/remove event committee assignment.
- [ ] Create, list, edit, and delete event-specific division master records as Owner.
- [ ] Confirm duplicate division names are rejected case-insensitively within one event but allowed in another event.
- [ ] Confirm committee assignment uses the division dropdown and rejects a forged division ID from another event/group.
- [ ] Rename a division and confirm Owner committee list, Panitia home/detail labels, and committee CSV reflect the new name.
- [ ] Delete a division and confirm the old assignment label remains as historical text while its master reference is cleared.
- [ ] Confirm legacy free-text division values are backfilled by migration without losing labels.
- [ ] Confirm Panitia cannot mutate division master records and RLS limits read access to assigned events.
- [ ] Search Kelola divisi by name and description; confirm matching records remain and non-matching records are hidden.
- [ ] Filter Susunan panitia by each master division and confirm only assignments for the selected division are shown.
- [ ] Select Tanpa divisi aktif and confirm assignments without a current `division_id` are shown, including historical labels after a master division is deleted.
- [ ] Search committee by member name, contact, division label, position, and responsibility.
- [ ] Combine text search and division filter; verify result count, no-match state, and reset behavior.
- [ ] Verify Kelola divisi and Susunan panitia each display at most five records per page.
- [ ] Navigate previous/next pages and confirm page count and visible range are correct.
- [ ] Change search/filter while on a later page and confirm pagination resets to page one.
- [ ] Open Lihat semua divisi and confirm the dedicated view contains only the division list, with search and five-record pagination.
- [ ] Open Lihat semua susunan panitia and confirm the dedicated view contains only committee assignments, with search, division filter, and five-record pagination.
- [ ] Confirm committee search and division filter are preserved when navigating to its dedicated view.
- [ ] Confirm back navigation returns to the main Panitia tab.
- [ ] Create/edit/delete a division from the dedicated division view and confirm redirect remains on that view.
- [ ] Edit/remove a committee assignment from the dedicated committee view and confirm redirect remains on that view.
- [ ] Rundown main page shows at most five schedule items; navigate pages and open the dedicated all-rundown view.
- [ ] Dedicated rundown view contains only schedule items, links back to Rundown, and edit/delete actions return to that view.
- [ ] Tasks main page shows at most five tasks; navigate pages and open the dedicated all-tasks view.
- [ ] Dedicated tasks view contains only task records, links back to Tugas, and edit/delete actions return to that view.
- [ ] Procurement main page shows at most five items; navigate pages and open the dedicated all-procurement view.
- [ ] Dedicated procurement view contains only procurement items, links back to Pengadaan, and edit/delete/sync actions return to that view.
- [ ] Finance categories, transactions, and commitments each show at most five records on the main page and have independent pagination.
- [ ] Open each dedicated Finance view and confirm it contains only the selected list: categories, transactions, or commitments.
- [ ] Edit/delete a category or manual transaction from its dedicated view and confirm the action returns to the same view; confirm linked Procurement transactions remain read-only.
- [ ] Confirm all dedicated event-management views link back to the correct parent subpage and are restricted to the current Owner's event/group.
- [ ] Confirm non-assigned group member is absent from Rundown PIC dropdown.
- [ ] Add member to event and confirm they appear in Rundown PIC dropdown.
- [ ] Repeat assignment test for Task and Procurement.
- [ ] Confirm forged Server Action submissions are rejected for non-event-members.
- [ ] Test rundown date boundaries and time validation.
- [ ] Test task status/priority/deadline and task deletion.
- [ ] Test procurement quantities, price fields, status, and deletion; confirm estimated/actual unit prices format with thousand separators and are normalized to numeric values.
- [ ] Test procurement category mapping and purchase date; verify all statuses (Belum dimulai, Diminta, Dipesan, Sudah dibeli, Siap digunakan, Tidak diperlukan).
- [ ] Confirm Dipesan contributes to commitment totals but not cash expenses; verify category-level and overall remaining-after-commitment calculations.
- [ ] Confirm changing an item to Sudah dibeli with a positive actual price creates exactly one linked expense in Keuangan; saving it again or changing price/quantity/category/date updates the same transaction rather than duplicating it.
- [ ] Confirm Sudah dibeli/Siap digunakan without a positive actual price is rejected and does not partially save the item.
- [ ] Confirm linked procurement expenses are read-only in Keuangan and direct Server Action edits/deletes are rejected; manual finance transactions remain editable.
- [ ] Delete a purchased procurement item and confirm its expense remains in Keuangan with a Pengadaan-origin reference.
- [ ] For pre-integration purchased items, review whether they were already manually recorded before using Catat ke Keuangan; if the purchase date is blank, enter the actual historical date before syncing.
- [ ] Test budget category amount: typing `500000` displays `500.000` and is normalized to numeric `500000`; decimal and negative values are rejected (zero is allowed for a planned category).
- [ ] Test transaction amount: typing `500000` displays `500.000` and is normalized to numeric `500000`; zero, decimal, and negative values are rejected.
- [ ] Test invitation with correct email, wrong email, expired token, and reused token.
- [ ] Confirm Panitia only sees assigned events and direct URL to unassigned event is rejected.
- [ ] Confirm Panitia workspace remains read-only unless product requirements change.
- [ ] Download each CSV type and verify rows, encoding, and scope.
- [x] Test logo upload: owner confirmed successful after PR #16.
- [ ] Test logo removal after PR #16 and confirm old Storage object cleanup.
- [ ] Confirm missing server-only key produces a safe configuration error without exposing credentials.
- [ ] Check responsive layout, empty/loading/error/success states.
- [ ] Run \`npm run lint\` and \`npm run build\` locally.
- [ ] Verify Vercel production deployment after merge.

## 8. Next priorities

1. Complete focused end-to-end UAT for Owner and Panitia, especially invitations, event membership, direct-URL access, and cross-group isolation.
2. Confirm logo removal and replacement cleanup after the PR #16 server-side upload change.
3. Fix only UX/functional issues found during those real workflows.
4. Decide how to handle removing an event committee member who still owns rundown/task/procurement records.
5. Avoid broad rewrites or additional performance tuning without evidence.

## 9. Event lifecycle automation — PR #21 merged

- PR #21: https://github.com/Abdul-Fikri/mini-event-management/pull/21 — closed and merged to `main` on 11 November 2026.
- PR #21 merge commit: `a87556aa24480cd8e0e9d83f22409a7f9fb2ab80` (historical merge SHA; not the current `main` HEAD).
- Event baru default ke `status_mode=automatic`; event lama menjadi `manual` saat migration agar status tersimpan tidak berubah.
- Timeline: tanggal mulai perencanaan dan persiapan opsional tetapi harus berpasangan; tanggal mulai event wajib; tanggal selesai dan akhir evaluasi opsional.
- Urutan status otomatis berbasis tanggal kalender Asia/Jakarta: Direncanakan → Perencanaan → Persiapan → Berlangsung → Evaluasi (opsional) → Selesai. Tanggal akhir event dan evaluasi bersifat inklusif. Event satu hari dianggap berlangsung pada tanggal mulai.
- Dibatalkan hanya dipilih dalam mode manual. Status otomatis dihitung saat data dibaca; tidak memerlukan cron/background job.
- Resolver bersama: `src/lib/events/status.js`. Dashboard, daftar event, workspace Owner, dan tampilan event Panitia harus memakai resolver yang sama.
- Server Action menghitung status otomatis di server dan tidak mempercayai hidden field dari browser. Migration tidak mengubah RLS.
- Migration: `supabase/migrations/20261112_event_lifecycle_automation.sql`. Keberadaan file di `main` **tidak membuktikan migration diterapkan**. Penerapan pada Supabase target belum terkonfirmasi.
- Migration PR #20 `20261111_procurement_finance_integration.sql` juga ada di `main`; status penerapannya pada Supabase target belum terkonfirmasi.
- Vercel Preview PR #21 melaporkan `build-rate-limit` setelah sinkronisasi branch. Ini adalah hasil pembatasan kuota Preview, bukan bukti compile aplikasi gagal atau berhasil.
- Assistant belum menjalankan lint, build, atau browser E2E untuk PR #20/#21. Runtime UAT harus menunggu verifikasi migration history dan penerapan migration yang memang masih pending.
- Checklist acceptance criteria rinci tetap berada di [Event Lifecycle Requirements](EVENT_LIFECYCLE_REQUIREMENTS.md).

## 10. Next priorities

1. Verifikasi migration history aktual untuk kedua migration PR #20/#21 tanpa mengulang audit schema/RLS lama yang sudah dinyatakan lulus.
2. Review dan terapkan hanya migration yang benar-benar pending melalui workflow manual Supabase SQL Editor yang disetujui Owner.
3. Jalankan UAT Owner dan Panitia, terutama invitation flow, direct URL authorization, Procurement → Finance linked transaction, dan automatic/manual event lifecycle.
4. Uji upload, replace, delete, dan cleanup logo; uji CSV exports serta loading/error/empty states.
5. Perbaiki masalah konkret yang ditemukan. Hindari penambahan fitur besar sebelum stabilisasi.


## 11. Event division management — PR #22 merged

- PR #22: https://github.com/Abdul-Fikri/mini-event-management/pull/22 — merged to `main` on 12 November 2026.
- Merge commit: `20ca806309629eace877536f245409e546824fac`.
- Owner manages event-specific division master data from the Panitia tab: create, list, edit, and delete.
- Committee assignment uses a dropdown and validates `division_id` on the server against the same event and group.
- Existing free-text labels are backfilled into `event_divisions`; the legacy `event_members.division` text remains as a synchronized display/export snapshot.
- Migration: `supabase/migrations/20261112_event_divisions.sql`; its application to the target Supabase database is not confirmed.
- `supabase/schema.sql` includes the same structure for fresh database setup.
- Owner has CRUD; Panitia remains read-only and receives only assigned-event read access.

## 12. Panitia division search, filters, pagination, and dedicated views — PR #23 in progress

- Branch: `feat/panitia-division-filters-search`, created from `main` after PR #22 merge.
- Kelola divisi adds client-side search across division name and description.
- Susunan panitia adds a division selector (all, a specific event division, or no active division) and text search across member name, contact, division label, position, and responsibility.
- Search and division filter combine; visible result count, no-match feedback, and reset controls are included.
- Both embedded lists display a maximum of five records per page, with previous/next controls. Search/filter changes reset pagination to page one.
- Each Lihat semua link opens a dedicated route containing only the selected data type: `/events/[id]/panitia/divisions` or `/events/[id]/panitia/committee`. Dedicated views retain five-record pagination and the relevant search/filter controls.
- The committee view carries the current search and division filter into its dedicated route. Both dedicated views link back to the main Panitia tab.
- Save/delete actions on dedicated views preserve the current view through a server-validated `return_to` path.
- This is a UI/routing change only: no database schema, migration, RLS, or server authorization behavior is changed.
- Source-level checks cover five-record slicing, Panitia search/filter, all dedicated management routes, query-state transfer, and validated return paths. Latest Vercel status for PR head `db308b7bdae6f4cea52b09dcc5b884f2a4973eea` reports `failure` with a `build-rate-limit` target URL (Preview quota/rate limit, not an application compile result). Local lint/build and browser E2E have not been run by the assistant; Owner Preview UAT remains required.


## 13. Event management list pagination and dedicated views — PR #23 in progress

- Rundown, Tugas, and Pengadaan each show at most five records on their parent management page and provide a dedicated `/all` route for the selected list.
- Keuangan paginates three independent lists: categories, transactions, and ordered procurement commitments. Each has a dedicated route that displays only that selected data type.
- Dedicated views provide a back link and preserve their route after supported edit/delete/sync actions using the server-validated event `return_to` allowlist.
- Add forms remain on the parent management pages. Existing server-side event/group authorization, event-roster PIC validation, and Procurement–Finance linked-transaction rules remain unchanged.
- Pagination is client-side over data loaded by the existing server-scoped queries. No database migration, schema, RLS, or production data changes are included.
- Source-level checks cover all six additional list views and their five-record pagination. Vercel status check for the latest PR #23 head (`7d797a29f1dbc6c320cb1563f7b22d8fad3d3faf`) reported success. Local lint/build/browser E2E have not been run by the assistant; Owner Preview UAT remains required.


## 9. PR #23 — management list pagination (open)

PR #23 adds five-record pagination and dedicated **Lihat semua** views to Panitia, group Event and Member lists, Rundown, Tugas, Pengadaan, and Finance categories/transactions/commitments. The dedicated pages display only the selected data type and link back to the parent page. Member edits/deletes preserve the `/members/all` return destination through server-side allowlisting. No database migration, schema, RLS, production data, or deployment configuration changes are included.

Vercel currently reports `build-rate-limit` (Preview quota/rate limit); the assistant has not run local lint/build/browser E2E. Owner Preview UAT is pending. The PR remains open and has not been merged.
