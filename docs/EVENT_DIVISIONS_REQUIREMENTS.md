# Event Divisions — Requirements & Acceptance Criteria

## Goal

Provide a consistent, reusable division list for each event. The Owner manages the list once and assigns committee members through a dropdown instead of typing free-text division names repeatedly.

## Scope and ownership

- Divisions are scoped to an individual event, not shared globally across the Owner's group.
- Only the Owner can create, read, update, or delete division master records for an event in their group.
- Panitia remains read-only. Panitia can see the division label attached to their own event assignment.
- A group may use different division structures for different events.

## Data model

- `event_divisions`: `id`, `group_id`, `event_id`, `name`, optional `description`, timestamps.
- Division names are unique within one event without case sensitivity.
- `event_members.division_id` references a division from the same event and group using a composite foreign key.
- Existing `event_members.division` text is retained as a synchronized snapshot for current Panitia pages and CSV exports.
- Existing free-text values are backfilled into event-specific master rows by migration.
- Renaming a division updates assignment snapshots. Deleting a division clears its master reference but preserves the previous text label as historical information.

## Owner workflow

1. Open an event and select the Panitia tab.
2. Use Kelola divisi to add a division name and optional description.
3. Edit a division to change its name/description.
4. Delete a division when it is no longer needed; already assigned members retain the old label as historical text.
5. Add or edit a committee assignment and select a division from the dropdown. A division is optional.

## Validation and security

- Name is required, trimmed, and limited to 80 characters.
- Description is optional and limited to 250 characters.
- Duplicate names within the same event are rejected case-insensitively.
- Server Actions verify Owner group, event ownership, and that a selected division belongs to the same event and group.
- RLS remains enabled. Owner policies scope records to the Owner's group; Panitia has read-only policy access only for assigned events.
- No service-role key or privileged client is needed.

## Acceptance criteria

- [ ] Owner can create a division from the event Panitia page.
- [ ] Owner can view all divisions for that event.
- [ ] Owner can edit a division name and description.
- [ ] Renaming a division updates all assigned committee labels and Panitia-facing snapshots.
- [ ] Owner can delete a division; existing assignments retain the old label as historical text and lose only the master reference.
- [ ] Division names are unique case-insensitively within an event.
- [ ] The committee assignment form uses a dropdown and no longer accepts arbitrary free-text division names.
- [ ] A division from another event or group is rejected by Server Action validation and the composite foreign key.
- [ ] Existing free-text division values are backfilled without losing their labels.
- [ ] Existing Panitia home/detail pages and committee CSV export continue showing division labels.
- [ ] Panitia cannot create, edit, or delete division master records.
- [ ] RLS remains enabled and Owner/Panitia access is isolated by group/event.
- [ ] The migration is reviewed and applied to the intended Supabase environment before runtime UAT.

## Verification notes

The feature is implemented in PR #22 but is not merged. The migration is authored but not applied by the assistant. Local lint/build and browser E2E were not run in this environment; record their actual results before describing the feature as verified.
