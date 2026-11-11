# Project Status

Last updated: 9 November 2026 — PR #18 date validation in review

## Owner-reported verification
- App is deployed on Vercel: https://mini-event-management-gules.vercel.app
- Owner reported the latest local `npm run build` completed successfully.
- Owner reported testing global loading feedback for navigation, form submission, and delete.
- Owner confirmed in the latest project conversation that group-logo upload now succeeds after PR #16. The final removal/old-object cleanup path should still be checked separately.
- Recent Lighthouse Performance on Vercel was reported as 82; exact route and test conditions were not recorded.
- Earlier observations: Dashboard Performance 96; Event/Panitia route Performance 91. Do not compare scores without matching route and test conditions.

## GitHub state at this review
- Current `main` head: `ace418aa87ecb38d89aad8668e9c6d5d3a92dfae` — merge commit for PR #18.
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

## Finance amount validation — PR #19

- PR #19 is open: https://github.com/Abdul-Fikri/mini-event-management/pull/19
- Working branch: `fix/budget-category-amount-validation`, based on the `main` head after PR #18.
- The budget category amount validator previously used a double-escaped digit regex, causing values such as `1000000` to fail. The positive-integer regex for transaction amounts had the same issue.
- Both patterns are corrected. Budget category amounts accept zero or a positive integer; transaction amounts must be positive integers. A reusable `MoneyField` automatically formats rupiah values with dot thousand separators for event target budgets, budget categories, transactions, and procurement unit prices. Shared Zod validation accepts grouped or plain-digit strings and normalizes them to numbers before persistence.
- Direct regex/formatting checks passed. Panitia, rundown, task, procurement, and finance create/edit/delete actions now carry a validated `return_to` path and redirect to the originating subpage after success. The helper only allows known routes under the same event ID. The Vercel status for the latest navigation implementation head is failure with `build-rate-limit` (preview build quota/rate limit); this is not a source compilation result. Local lint/build/browser E2E have not been run by the assistant.

## Group logo upload

- Final implementation is in PR #16, merged to `main`.
- `src/actions/group-logo.js` calls `requireGroup()` before using the privileged Storage client.
- `src/lib/supabase/admin.js` is guarded by `server-only` and reads `SUPABASE_SECRET_KEY` or legacy `SUPABASE_SERVICE_ROLE_KEY`.
- Storage upload/removal uses the privileged client; `groups.logo_url` is updated with the authenticated Owner session client and Owner/group filters.
- The bucket is public for image delivery; it is not configured for anonymous writes. Existing Storage RLS policies were not removed by PR #16.
- Upload validation: maximum 2 MB, JPG/PNG/WebP MIME and file signature.
- Owner confirms upload works after PR #16. Confirm removal and old-object cleanup separately.
- Do not expose the privileged key through `NEXT_PUBLIC_` or import the admin client into client code.

## Loading behavior
- Root `src/app/loading.js` provides a route-level Lottie fallback.
- Global loading provider tracks internal link navigation and submissions through shared Button/ConfirmDeleteButton patterns.
- Custom controls and programmatic router navigation that bypass shared patterns may not be tracked.
- Timeout fallback prevents the overlay from remaining indefinitely.

## UAS evidence
1. Architecture: App Router, nested layouts, dynamic `[id]`, Server/Client Components.
2. Rendering: static public `/contoh-event`, dynamic private `/dashboard`.
3. CRUD/state/auth: Supabase CRUD, Context API, Supabase Auth, Next.js 16 `src/proxy.js`.
4. Performance/SEO/deployment: `next/image`, `next/font`, Metadata, owner-reported successful build, and owner-reported Vercel deployment. Latest Lighthouse report was 82; no minimum score is stated in the rubric.

See `docs/IMPLEMENTASI-RUBRIK-UAS.md` for the public evidence mapping. Treat implementation notes as source observations, not as proof of end-to-end behavior.


## Next recommended work

1. Run focused manual UAT with one Owner and one Panitia account.
2. Test invitation happy path plus wrong-email, expired, reused, and already-claimed cases.
3. Test event membership boundaries, direct URL access to an unassigned event, and cross-group ID tampering.
4. Confirm logo removal/replacement cleanup after PR #16.
5. Record actual lint/build and Vercel production verification after the next code change.

## Event lifecycle automation — implementation branch

- Working branch: `feat/event-lifecycle-automation`, PR #21: https://github.com/Abdul-Fikri/mini-event-management/pull/21, based on `main` head `741ef267d36bc69aa13fdd84840de766f8af644b`. PR #21 is open and has not been merged.
- PR #20 remains open and is not part of this branch.
- Implemented in this branch: automatic/manual status mode, lifecycle dates and validation, shared Asia/Jakarta status resolver, dashboard/event list/Owner workspace/Panitia status display updates, SQL migration, initial schema update, and requirements/UAT documentation.
- New events default to automatic mode. Existing rows become manual when the migration adds `status_mode`, preserving their existing status values.
- Migration `20261112_event_lifecycle_automation.sql` has been authored but has not been applied to Supabase. Runtime behavior is therefore not yet verified.
- Vercel check pada head terbaru PR #21 berstatus success. Ini mengonfirmasi Preview check/deployment, bukan runtime database UAT; runtime tetap menunggu migration diterapkan ke database target.
- Local `npm run lint`, `npm run build`, and browser E2E have not been run by the assistant because the repository could not be cloned in the execution environment. Do not claim these checks passed.
- Review the live PR and Preview status after it is opened; do not merge or apply the migration without the Owner's explicit approval.
