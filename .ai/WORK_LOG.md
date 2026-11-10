# AI Project Work Log

Record significant project changes, decisions, pull requests, and verification. Keep entries concise. Never store secrets, credentials, raw tokens, or private personal data.

## Recent history
- PR #2: event subnavigation active state and docs — merged.
- PR #3: dashboard query/payload improvements — merged.
- PR #4: disable eager prefetch on Dashboard and primary Owner navigation links — merged.
- PR #5: restrict event PIC/assignee to event committee membership with server-side validation — merged.
- PR #6: project handbook and AI working rules — merged.
- PR #7: AI-specific context files were moved out of the public repository — merged at that time; this decision is superseded by the current owner request to version shared AI context in `.ai/`.
- PR #8: Lottie route-level loading animation — merged.
- PR #9: global loading feedback — merged on 9 November 2026.
- PR #10: public project documentation and UAS rubric mapping — merged.
- PR #11: shared `.ai/` context and root `AGENTS.md` — merged; this supersedes the older local-only context arrangement from PR #7.
- PR #12–#15: iterative group-logo bucket/session/RLS troubleshooting — merged.
- PR #16: final group-logo Storage upload/removal moved to Owner-authorized server actions with a server-only Supabase admin client — merged to `main` at `a45c594346dcedc4c993a5f0bea17543994aa6da`.
- Owner confirmed group-logo upload now succeeds after PR #16. Post-fix removal/cleanup still needs a separate UAT confirmation.
- PR #18: add Asia/Jakarta-aware event date validation while preserving unchanged historical event dates; keep historical rundown dates in range; task deadlines are optional and fully flexible (past/current/future values accepted on create and update); preserve historical finance transactions — merged to `main` on 10 November 2026. Owner confirmed the flexible task-deadline policy on 9 November 2026. Local lint/build/E2E were not run by the assistant.
- PR #17: refresh README, Project Handbook, Database & Migrations, Implementation Status, and shared AI context after PR #16 — merged to `main`.

## Maintenance
Update this file after substantial work. Keep public product/engineering documentation in `docs/` and AI-specific working context in `.ai/`. Record verification accurately and distinguish owner-reported results from independently run checks.
