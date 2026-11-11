# Project Status

Last updated: 11 November 2026 — PR #20 merged; PR #21 event lifecycle in review

## Owner-reported verification
- App is deployed on Vercel: https://mini-event-management-gules.vercel.app
- Owner reported the latest local `npm run build` completed successfully.
- Owner reported testing global loading feedback for navigation, form submission, and delete.
- Owner confirmed in the latest project conversation that group-logo upload now succeeds after PR #16. The final removal/old-object cleanup path should still be checked separately.
- Recent Lighthouse Performance on Vercel was reported as 82; exact route and test conditions were not recorded.
- Earlier observations: Dashboard Performance 96; Event/Panitia route Performance 91. Do not compare scores without matching route and test conditions.

## GitHub state at this review
- Current `main` head: `a71611b1cdc78ea3030040c6559979858ddca1d4` — merge commit for PR #20.
- PR #8 (Lottie route-level loading animation): merged.
- PR #9 (global loading feedback): merged.
- PR #10 (public project documentation and UAS rubric mapping): merged.
- PR #11 (shared AI project context and agent instructions): merged.
- PR #16 (Owner-authorized server-side group-logo upload/removal): merged on 9 November 2026.
- GitHub PR listing showed PRs #1–#16 closed/merged at review time; recheck live state before relying on this note.
- The PR #16 merge is confirmed. Vercel deployment of that merge was not independently inspected.
- PR #17 (documentation and AI-context refresh after PR #16): merged to `main` on 9 November 2026.

## Event date validation — PR #18

- PR #18 is merged to `main` on 10 November 2026: https://github.com/Abdul-Fikri/mini-event-management/pull/18
- Its event-date rules and flexible task-deadline behavior are now part of `main`.
- New events require a start date on or after today in Asia/Jakarta; an optional end date must also be today or later and cannot precede the start date.
- When editing an existing event, stored past dates may remain unchanged. Any changed start/end date must be today or later; the Server Action loads the stored dates before validating.
- Rundown dates remain inside the event range and may be historical. Task deadlines are optional and can be created or edited to past, current, or future dates. Finance transaction dates may also be historical.
- No database migration or historical data rewrite is included.
- PR #18's earlier Vercel check was affected by `build-rate-limit`; this is a deployment quota status, not an application build result. Production deployment of the merge was not independently confirmed. The assistant did not run `npm run lint`, `npm run build`, or browser E2E tests for PR #18.

## Finance amount validation and subpage navigation — PR #19

- PR #19: https://github.com/Abdul-Fikri/mini-event-management/pull/19 — merged to `main`.
- It fixed the double-escaped integer regex for budget category and transaction amount validation, added reusable MoneyField rupiah formatting, and preserves the originating event subpage after panitia/rundown/task/procurement/finance CRUD.
- Direct regex/formatting and return-path source checks passed. The owner handles Vercel deployment; the assistant did not independently verify a production deployment or run local lint/build/browser E2E for PR #19.

## Procurement and finance integration — PR #20

- PR #20: https://github.com/Abdul-Fikri/mini-event-management/pull/20 — merged to `main` on 11 November 2026 (merge commit `a71611b1cdc78ea3030040c6559979858ddca1d4`).
- Vercel Preview succeeded before PR #20 was merged; this does not prove Production deployment or runtime database behavior.
- `requested` is only requested; `ordered` contributes estimated costs to commitments; new items created as `purchased`/`ready`, or existing items transitioned into those states, automatically create one linked expense through a database trigger.
- Procurement category, purchase date, actual unit price, quantity, name, and supplier synchronize to the linked finance transaction. The unique transaction link prevents duplicates. Linked expenses are managed from Procurement; manual Finance transactions remain editable.
- Existing purchased items are not backfilled automatically. Their edit operations do not silently create a second expense; use the per-item legacy sync action only after checking manual Finance records. If their purchase date is unknown, enter the actual date before syncing.
- Deleting a purchased procurement item preserves its expense as a historical finance transaction.
- Migration `20261111_procurement_finance_integration.sql` is committed to PR #20 but has NOT been applied to Supabase. The owner must review/apply it before runtime testing.
- The assistant has not run `npm run lint`, `npm run build`, browser E2E, or applied the database migration.

## Event lifecycle automation — implementation branch

- Working branch: `feat/event-lifecycle-automation`, PR #21: https://github.com/Abdul-Fikri/mini-event-management/pull/21, updated with `main` head `a71611b1cdc78ea3030040c6559979858ddca1d4` after PR #20 was merged. PR #21 is open and has not been merged.
- PR #20 has been merged to `main`; its Procurement–Finance changes are included in the updated base.
- Implemented in this branch: automatic/manual status mode, lifecycle dates and validation, shared Asia/Jakarta status resolver, dashboard/event list/Owner workspace/Panitia status display updates, SQL migration, initial schema update, and requirements/UAT documentation.
- New events default to automatic mode. Existing rows become manual when the migration adds `status_mode`, preserving their existing status values.
- Migration `20261112_event_lifecycle_automation.sql` has been authored but has not been applied to Supabase. Runtime behavior is therefore not yet verified.
- Pada head PR #21 sebelum sinkronisasi `main`, Vercel pernah success lalu check berikutnya gagal dengan `build-rate-limit` (kuota Preview), bukan hasil kompilasi aplikasi. Check Vercel pada head hasil sinkronisasi saat ini gagal dengan `build-rate-limit` (kuota deployment Preview), bukan kegagalan kompilasi aplikasi. Perubahan dokumentasi pada commit sesudahnya akan memicu check baru; runtime tetap menunggu migration diterapkan ke database target.
- Local `npm run lint`, `npm run build`, and browser E2E have not been run by the assistant because the repository could not be cloned in the execution environment. Do not claim these checks passed.
- Recheck Preview after the branch update. Do not merge or apply the migration without the Owner's explicit approval.
