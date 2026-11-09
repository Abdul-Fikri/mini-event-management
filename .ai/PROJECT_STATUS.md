# Project Status

Last updated: 9 November 2026

## Owner-reported verification
- App is deployed on Vercel: https://mini-event-management-gules.vercel.app
- Owner reported the latest local `npm run build` completed successfully.
- Owner reported testing global loading feedback for navigation, form submission, delete, and group-logo upload/removal.
- Recent Lighthouse Performance on Vercel was reported as 82; exact route and test conditions were not recorded.
- Earlier observations: Dashboard Performance 96; Event/Panitia route Performance 91. Do not compare scores without matching route and test conditions.

## GitHub state at last review
- PR #8 (Lottie route-level loading animation): merged to `main`.
- PR #9 (global loading feedback): merged to `main` on 9 November 2026.
- PR #10 (public project documentation and UAS rubric mapping): open, targeting `main`; recheck its current status before relying on this note.
- This context update is being proposed separately; recheck GitHub for its PR number/state after creation.

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
