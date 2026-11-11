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

## Documentation is part of every implementation

For every meaningful implementation or behavior change, update the relevant documentation in the same branch/PR before considering the work complete:

- Requirements/specification and acceptance criteria when product behavior changes.
- `docs/PROJECT_HANDBOOK.md` for user-facing product behavior or architecture.
- `docs/IMPLEMENTATION_STATUS.md` and UAT/checklists for implementation state and verification.
- `docs/DATABASE_AND_MIGRATIONS.md`, `supabase/schema.sql`, and migration notes whenever database structure or behavior changes.
- `.ai/PROJECT_CONTEXT.md`, `.ai/PROJECT_STATUS.md`, and `.ai/WORK_LOG.md` so the next AI/agent has current architecture, status, and decision history.
- Update `AGENTS.md` or this file when a permanent workflow, safety, or engineering rule changes.

Keep documentation in the same PR as the implementation. Record what was actually tested, what remains unverified, and whether migrations were authored, applied, or confirmed in production. If a category genuinely does not apply, do not invent changes; state why in the PR summary.
