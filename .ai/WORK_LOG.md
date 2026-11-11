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
- PR #19: fix rupiah integer validation, add reusable automatic rupiah formatting, and preserve originating event subpages after CRUD — merged to `main`.
- PR #17: refresh README, Project Handbook, Database & Migrations, Implementation Status, and shared AI context after PR #16 — merged to `main`.
- PR #20: integrate Procurement and Finance — merged to `main` on 11 November 2026 (merge commit `a71611b1cdc78ea3030040c6559979858ddca1d4`). `ordered` items count as estimated budget commitments; newly created/transitioned `purchased`/`ready` items create or update one linked expense through a database trigger. Migration remains unapplied; local lint/build/browser E2E were not run by the assistant.

## PR #22 — documentation synchronization (in progress)

- Created branch `docs/sync-status-after-pr-21` from verified `main` HEAD `a87556aa24480cd8e0e9d83f22409a7f9fb2ab80`.
- Updated `.ai/PROJECT_STATUS.md` to record PR #21 as merged, correct the current main SHA, and distinguish repository migration files from confirmed Supabase application.
- This PR is documentation-only. No application source, SQL migration, RLS policy, production data, or deployment configuration is changed.

## Maintenance
Update this file after substantial work. Keep public product/engineering documentation in `docs/` and AI-specific working context in `.ai/`. Record verification accurately and distinguish owner-reported results from independently run checks.

- PR #21: event lifecycle automation — merged to `main` on 11 November 2026 at `a87556aa24480cd8e0e9d83f22409a7f9fb2ab80`. Added automatic/manual status mode, optional planning/preparation/evaluation dates, the shared Asia/Jakarta resolver, Owner/Panitia status updates, migration `20261112_event_lifecycle_automation.sql`, schema alignment, and lifecycle requirements/UAT. New events default to automatic; existing events are migrated to manual to preserve their saved status. The PR's synchronized Preview check reported `build-rate-limit` (Preview quota), not an application compilation result. The migration's application to Supabase is not confirmed. Local lint/build/browser E2E were not run by the assistant.
