# Development Rules

## Architecture
- Follow existing App Router route groups, layouts, and naming conventions.
- Keep private data access and authorization on the server where practical.
- Use Client Components only for browser state, event handlers, and client hooks.
- Keep mutations in `src/actions/`, reusable UI in `src/components/`, and shared logic in `src/lib/`.
- Preserve existing conventions before adding dependencies or abstractions.
- Keep the root app structure; do not recreate the deleted nested legacy folder.

## Security and data boundaries
- Verify the authenticated Supabase user and group ownership on the server.
- Scope queries by authenticated group and validated event.
- Panitia access must be checked against linked Auth identity and `event_members`.
- Server Actions and Route Handlers must independently validate authorization and relationships.
- Keep RLS enabled. Never expose service-role credentials to the browser.
- Never log credentials, cookies, raw invitation tokens, or sensitive personal data.

## Forms and UI
- Use existing Zod validators where appropriate.
- Validate submitted IDs and relationships server-side.
- Preserve pending, success, and error feedback patterns.
- Follow existing Tailwind conventions and responsive behavior.
- Use semantic controls, labels, and accessible status feedback.

## Performance
- Preserve dynamic rendering and private cache policy for user-specific pages.
- Do not weaken `no-store` or other private cache controls to chase Lighthouse scores.
- Measure the exact route and test conditions before optimizing.
- Do not treat Chrome-extension overhead as application JavaScript.

## Database
- Read `.ai/DATABASE_RULES.md` before changing schema or migrations.
- `supabase/schema.sql` is initial schema, not a repeatable migration.
- Add incremental SQL under `supabase/migrations/`.
- Review constraints, indexes, triggers, grants, RLS, and existing-data impact.
- Never apply production SQL or destructive changes without explicit approval.
- Record whether a migration is authored, applied locally, or confirmed in production.

## Verification
Run relevant checks when possible:
```cmd
npm run lint
npm run build
```
For behavior changes, test affected flows and authorization boundaries. Report checks that were not run and distinguish local/owner-reported results from independently verified results.
