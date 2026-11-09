# AI Project Context

This folder contains shared working context for AI assistants and coding agents. It is versioned so assistants opening the GitHub repository can read the same project rules and current status.

## Reading order
1. `../AGENTS.md` — entry point and mandatory guardrails.
2. `PROJECT_CONTEXT.md` — product, architecture, stack, and domain model.
3. `PROJECT_STATUS.md` — current implementation and GitHub status; always recheck live PR state.
4. `DEVELOPMENT_RULES.md` — coding, security, UI, performance, and verification practices.
5. `DATABASE_RULES.md` — Supabase schema and migration safety.
6. `GITHUB_WORKFLOW.md` — branch, PR, and merge workflow.
7. `WORK_LOG.md` — concise history of significant decisions and changes.

## Maintenance
- Update status and work log after meaningful changes.
- Prefer facts from current source and live GitHub state over stale notes.
- Mark owner-reported tests as owner-reported; do not present them as independently verified.
- Never store secrets, environment values, access tokens, private personal data, or raw invitation tokens here.
- Public user/developer documentation remains in `docs/`; avoid duplicating the handbook in this folder.
