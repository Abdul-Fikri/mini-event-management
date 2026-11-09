<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


<!-- BEGIN: project-specific-agent-rules -->

## Mini Event Management project rules

Before changing code, read:
1. \`AI_CONTEXT_NEXT_SESSION.md\`
2. \`docs/AI_WORKING_RULES.md\`
3. \`docs/PROJECT_HANDBOOK.md\`
4. \`docs/IMPLEMENTATION_STATUS.md\`
5. The module-specific documentation and source files.

Mandatory project constraints:
- App root is repository root; active source is \`src/\`. Do not recreate the deleted nested \`event-management/\` directory.
- Stack is Next.js 16.4.5, React 19.3.0, JavaScript, Tailwind CSS 4, Supabase JS/SSR, and Zod 4.
- Use \`src/proxy.js\` for Next.js 16 Proxy convention; do not revert to \`middleware.js\` based on older tutorials.
- Distinguish organization members (\`members\`) from event committee assignments (\`event_members\`). PIC/assignee options and server-side validation for rundown, tasks, and procurement must be event-scoped.
- Panitia workspace is read-only in the current implementation. Do not assume it can update task status.
- Do not expose secrets or request \`.env.local\`; never expose Supabase service-role key in browser.
- Do not execute production SQL, run migrations, change RLS, or mutate production data without explicit approval. Never rerun \`supabase/schema.sql\` on an existing database.
- Do not weaken private page cache/auth policies for Lighthouse scores.
- Do not commit directly to \`main\`, merge PRs, force-push, reset branches, or deploy Vercel unless the owner explicitly authorizes that action.
- Report exactly which checks were run. Do not claim lint/build/E2E/deployment verification without evidence.
- Update \`AI_CONTEXT_NEXT_SESSION.md\` and \`docs/IMPLEMENTATION_STATUS.md\` after meaningful work.

<!-- END: project-specific-agent-rules -->
