# GitHub Workflow

Repository: `Abdul-Fikri/mini-event-management`

## Standard workflow
1. Check `git status`, fetch the latest `main`, and inspect relevant open PRs.
2. Create a focused branch from current `main` (`feat/...`, `fix/...`, `docs/...`, or `chore/...`).
3. Keep the diff within the requested scope.
4. Run relevant checks and report actual results.
5. Review the diff and open a PR targeting `main`.
6. Do not push directly to `main`, merge PRs, or deploy without explicit user approval.
7. Before recommending merge, check PR state, mergeability, CI/Vercel checks, and changed files.
8. Update public docs for product/engineering changes and `.ai/` context for meaningful project-state changes.

## Windows Command Prompt examples
```cmd
git status
git fetch origin
git switch main
git pull origin main
git switch -c feat/short-description
npm run lint
npm run build
git diff
```

If an HTTP/2 push issue occurs, this previously worked:
```cmd
git -c http.version=HTTP/1.1 push origin <branch-name>
```

Do not assume a local branch is clean or current without checking. Do not overwrite user changes.
