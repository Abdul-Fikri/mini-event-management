# Implementation Status — Mini Event Management System

Last reviewed: 9 November 2026  
Repository: https://github.com/Abdul-Fikri/mini-event-management  
Source branch reviewed: main at merge commit a95187e7fea0e3f6cba6808e0783d3295e666254 (PR #17)

> Status labels describe what was found in source, not proof of production runtime correctness. Distinguish implemented, merged, deployed, and verified.

## 1. Feature inventory

| Module | Source-level implementation | Notes |
|---|---|---|
| Authentication | Register/login, Supabase session, redirect | Verify with real Owner/Panitia accounts |
| Onboarding/group | Group setup and group settings | Owner group context |
| Dashboard | Dynamic server-rendered dashboard and summary queries | User-reported Lighthouse Performance 96 |
| Group members | Create/read/update/delete member directory | Group-level directory |
| Events | Create/read/update/delete events | Dynamic route `/events/[id]`; new or changed dates must be today or later (Asia/Jakarta), while unchanged historical dates remain editable |
| Event committee | Add/remove member assignment; division, position, responsibility | Uses \`event_members\` |
| Rundown | Create/update/delete schedule items | PIC restricted to current event roster |
| Tasks | Create/update/delete tasks | Assignee restricted to current event roster; optional deadline accepts past, current, or future dates on create/update |
| Procurement | Create/update/delete procurement items; assign budget category; separate requested/ordered/purchased/ready states | PIC restricted to current event roster; ordered items become budget commitments; purchased/ready items automatically create or update one linked finance expense |
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


### Event dates vs operational history

- New events require a start date on or after today in Asia/Jakarta. An optional end date must also be on or after today and cannot precede the start date.
- When editing an existing event, a past start/end date may remain unchanged. Any changed date must be today or later. The Server Action loads the stored values before applying this comparison.
- Rundown dates remain constrained to the event's inclusive start/end range. Past dates within an existing event are allowed for historical rundown records.
- Task deadlines are optional and fully flexible: create/update accepts past, current, or future dates; no minimum/maximum date rule is applied.
- Finance transaction dates may be in the past for historical bookkeeping.
- Procurement currently has no user-entered date field affected by this rule.
- The event form's HTML `min` attributes improve the input experience; Zod validation in the Server Action remains authoritative. No database migration or historical data rewrite is required.

## 3. Architecture notes

- Next.js 16.4.5 App Router, React 19.3.0, JavaScript, Tailwind CSS 4.
- Root source is \`src/\`; do not recreate nested legacy \`event-management/\`.
- \`src/proxy.js\` is the Next.js 16 Proxy convention.
- Supabase browser/server clients live in \`src/lib/supabase/\`.
- Auth helpers live in \`src/lib/auth.js\`.
- Zod schemas live in \`src/lib/validators/\`.
- Server Actions live in \`src/actions/\`.
- Static route: \`/contoh-event\` uses \`dynamic = "force-static"\`.
- Private Dashboard: \`/dashboard\` uses \`dynamic = "force-dynamic"\`.

## 4. Merged improvements

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

Confirm PR state on GitHub before assuming any later work is merged/deployed.

## 5. Lighthouse observations (user-reported)

- Dashboard previously reached Performance 96 after PR #4 was merged/deployed.
- A more recent Lighthouse run on the Vercel deployment was reported at Performance 82; the exact route and test conditions were not specified. Do not treat any one route's score as a global application score.
- An event/Panitia route screenshot showed Performance 91, Accessibility 100, Best Practices 100, SEO 100.
- Unused JavaScript diagnostics attributed the majority of transfer to Chrome extensions (one extension about 789.4 KiB and another about 28.1 KiB). First-party Vercel chunk shown was about 71.6 KiB, estimated savings 29.3 KiB.
- Panitia route bfcache diagnostic reported \`Cache-Control: no-store\` and a JavaScript resource with \`no-store\`. This is not actionable in Lighthouse; do not weaken private-page cache policy just to increase score.
- Scores are environment-dependent. Repeat with extensions disabled/incognito if comparing application bundle performance.

## 6. Known limitations / decisions

1. Panitia workspace is read-only in the current UI; no Panitia task-status mutation was found.
2. CSV export type \`members\` queries all group members, not only event-assigned members. Product intent must be confirmed before changing.
3. Removing a person from \`event_members\` while that person is assigned to existing rundown/tasks/procurement deserves a product/data-integrity decision. Do not silently delete or reassign related work.
4. Migration production status must be checked in the target Supabase project's migration history/schema. Repository files alone are not proof.
5. No Prisma/Drizzle ORM or Supabase CLI project configuration was found in \`package.json\`/repository tree reviewed.

## 7. Validation status

PR #18 and PR #19 are merged to `main`. PR #19 corrected rupiah validation/formatting and preserves the originating event subpage after panitia, rundown, task, procurement, and finance CRUD. PR #20 is open on `feat/procurement-finance-integration`; it adds ordered procurement commitments plus database-triggered finance expenses for purchased/ready items. Vercel Preview has succeeded on PR #20; check the live status of the latest head before merge. GitHub reports no merge conflict. The SQL migration has not been applied to Supabase, and the assistant has not run local `npm run lint`, `npm run build`, or browser E2E; do not treat Preview status as proof of end-to-end database behavior.

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
- [ ] Add/remove event committee assignment.
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
