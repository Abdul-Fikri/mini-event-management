# Project Status

Last updated: 11 November 2026 — PR #21 merged; main HEAD `a87556aa24480cd8e0e9d83f22409a7f9fb2ab80`

## Owner-reported verification
- App is deployed on Vercel: https://mini-event-management-gules.vercel.app
- Owner reported the latest local `npm run build` completed successfully.
- Owner reported testing global loading feedback for navigation, form submission, and delete.
- Owner confirmed in the latest project conversation that group-logo upload now succeeds after PR #16. The final removal/old-object cleanup path should still be checked separately.
- Recent Lighthouse Performance on Vercel was reported as 82; exact route and test conditions were not recorded.
- Earlier observations: Dashboard Performance 96; Event/Panitia route Performance 91. Do not compare scores without matching route and test conditions.

## GitHub state at this review
- Current `main` head: `a87556aa24480cd8e0e9d83f22409a7f9fb2ab80` — merge commit for PR #21.
- PR #20 (Procurement–Finance integration): merged on 11 November 2026; merge commit `a71611b1cdc78ea3030040c6559979858ddca1d4`.
- PR #21 (automatic/manual event lifecycle): merged on 11 November 2026; merge commit `a87556aa24480cd8e0e9d83f22409a7f9fb2ab80`.
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

## Event lifecycle automation — PR #21 merged

- PR #21: https://github.com/Abdul-Fikri/mini-event-management/pull/21 — closed and merged to `main` on 11 November 2026. Merge commit: `a87556aa24480cd8e0e9d83f22409a7f9fb2ab80`.
- Current `main` HEAD was independently checked against GitHub and matches that merge commit.
- Implemented and merged: automatic/manual status mode, optional planning/preparation/evaluation dates, timeline validation, shared Asia/Jakarta resolver, and consistent effective-status display in Dashboard, Owner event views, and Panitia event views.
- New events default to `status_mode=automatic`. Existing rows are made `manual` by the migration so their saved statuses are preserved.
- Migration `20261112_event_lifecycle_automation.sql` is present in `main`, but its application to the target Supabase database is **not confirmed**. Do not infer migration history from repository files.
- The earlier Procurement–Finance migration `20261111_procurement_finance_integration.sql` is also present in `main`; its application to Supabase is **not confirmed**.
- PR #21's Vercel Preview check reported `build-rate-limit` after synchronization with `main`. This is a Preview deployment quota/rate-limit result, not evidence of application compilation failure or success.
- The assistant has not run local `npm run lint`, `npm run build`, or browser E2E for PR #20/#21. Runtime UAT for the two migrations remains dependent on confirming and applying the relevant migration(s) to the intended database.
- No Production deployment was independently verified. The Production URL remains owner-reported; deployment is managed by the Owner.

## Next recommended work

1. Confirm actual remote migration history for the Procurement–Finance and event lifecycle migrations without repeating the previously passed schema/RLS audits.
2. Review and apply only genuinely pending SQL through the Owner's approved manual Supabase SQL Editor workflow.
3. Run focused Owner and Panitia UAT, including Procurement → Finance linked transactions and automatic/manual event lifecycle boundaries.
4. Record actual results for auth/session, group/event isolation, invitation claims, CRUD, logo upload/replace/delete cleanup, CSV exports, and loading/error/empty states.
5. Fix only concrete issues found during UAT; avoid adding broad new features before stabilization.
