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
