# AI Agent Instructions

This file is the entry point for AI assistants and coding agents working in this repository.

## Read first
Before making changes, read:
1. `.ai/README.md`
2. `.ai/PROJECT_CONTEXT.md`
3. `.ai/PROJECT_STATUS.md`
4. `.ai/DEVELOPMENT_RULES.md`
5. The relevant public documentation under `docs/`; read `.ai/DATABASE_RULES.md` before database work.

## Non-negotiable project rules
- The repository root is the application root; application source is under `src/`. Never recreate the deleted nested `event-management/` directory.
- The project uses Next.js 16. Keep `src/proxy.js`; do not add `middleware.js` without verifying framework behavior and explaining why.
- `members` means group-wide membership. `event_members` means assignment to a particular event. Keep rundown PIC, task assignee, and procurement PIC scoped to that event's roster in both UI and server validation.
- Validate authorization in Server Actions and Route Handlers. UI filtering is not a security boundary. Preserve Supabase RLS.
- Never request, print, commit, or expose `.env.local`, service-role keys, tokens, or credentials.
- Never run production SQL/migrations, alter RLS, change production data, or modify deployment configuration without explicit user approval.
- Do not weaken private-page cache controls to improve Lighthouse.
- Make focused changes; avoid unrelated refactors.
- Do not claim checks passed unless they were actually run. Distinguish implemented, merged, deployed, and verified.
- Do not push directly to `main`, merge pull requests, or deploy without explicit user authorization.
- Keep this shared AI context current. Update `.ai/PROJECT_STATUS.md` and `.ai/WORK_LOG.md` after meaningful project changes.
- Documentation is part of every implementation: update applicable requirements/acceptance criteria, `docs/PROJECT_HANDBOOK.md`, `docs/IMPLEMENTATION_STATUS.md` and UAT notes, database/schema/migration docs when relevant, plus `.ai/PROJECT_CONTEXT.md`, `.ai/PROJECT_STATUS.md`, and `.ai/WORK_LOG.md` in the same PR. Update these agent instructions when a permanent workflow rule changes. Record tests and migration state accurately.

## Workflow
Use a dedicated branch from the latest `main`, review the diff, run relevant checks, and open a PR to `main`. Ask before merging. Public product/engineering documentation belongs in `docs/`; AI-specific working context belongs in `.ai/`.

Use Windows Command Prompt syntax by default when giving shell commands.
