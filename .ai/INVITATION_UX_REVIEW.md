# Invitation UX Review — PR #38

Reviewed: 28 November 2026
Branch: `feat/member-account-management`

## Existing flow inspected

- Owner creates an invitation from a member that has no `auth_user_id`.
- `src/actions/invitations.js` generates a random token, stores only its SHA-256 hash, and returns a copyable `/join?token=...` URL. The Owner sends this URL manually; no email delivery provider is integrated.
- The invitation is email-bound, single-use, and expires after 48 hours.
- `/join` directs a logged-out invitee to register or log in with `next=/join?token=...`.
- When email confirmation is enabled in Supabase, signup may return without a session. The invitee must confirm the email, log in, and revisit the original invitation URL.
- The logged-in invitee claims the invitation through the `claim_member_invitation` RPC. The database validates token hash, JWT email, expiry, and acceptance state before linking the member.

## UX issues addressed

1. Claim action previously redirected on both success and failure. Failure was only represented as a generic query-string alert; success relied entirely on a server-action redirect, which appeared not to navigate reliably in the reported browser session.
2. Claim action now returns a structured result. The client form shows pending feedback, disables duplicate submission, displays the error inline, and navigates/refreshes after success. A direct fallback link to Panitia is shown.
3. The join page now presents the registration/confirmation/login/reopen sequence and explains that the invite is email-bound and expires after 48 hours.
4. The member modal's Batal link navigated to the same route while the modal was controlled by local state, so it did not close the modal. The inert link was removed; the header × remains the close action.
5. Member account creation/update now requires password confirmation whenever a password is being set. Password fields are not included in returned form values.

## Manual verification checklist (not yet run)

- Owner creates a link for an unlinked member; link is copied and manually shared.
- Open link logged out; register using exact invitation email.
- If email confirmation is enabled, confirm, log in, and reopen same link.
- Accept invite: pending state appears; success leads to `/panitia`; refresh confirms the member remains linked.
- Test mismatched account email, expired token, reused token, malformed token, and already-linked member; each should show an inline error without silently changing route.
- Open Add/Edit member modal; × closes it; no inert Batal button is present.
- New member account: matching password confirmation succeeds; mismatched confirmation fails; linked member can leave both password fields blank.
- Run local lint/build and browser E2E before merge. These checks have not been executed by this review.
