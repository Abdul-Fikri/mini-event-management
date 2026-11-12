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
6. Search the division list by name or description when it becomes long.
7. Search committee assignments by member name, contact, division, position, or responsibility; optionally combine the search with a division filter.

## Search and filtering

- Kelola divisi provides an in-page search over division name and description.
- Susunan panitia provides a division filter with Semua divisi, each event master division, and Tanpa divisi aktif.
- Committee search matches member name, contact, division label, position title, and responsibility.
- Search and division filter are combined, and the UI displays the number of matching assignments plus a clear empty state.
- A reset control clears both the search query and division filter.
- These controls only filter data already authorized and loaded for the current Owner event page; they do not replace server-side authorization or RLS.

## Pagination and dedicated list views

- The embedded Kelola divisi and Susunan panitia lists show at most five records per page.
- Each list has previous/next pagination controls and resets to page one when its search or filter changes.
- Each list provides a Lihat semua link that opens a dedicated route for only that data type: `/events/[id]/panitia/divisions` or `/events/[id]/panitia/committee`.
- Dedicated views retain the relevant search/filter controls and five-record pagination. Committee view carries the current search query and division filter from the embedded list.
- Dedicated views provide a return link to the main Panitia page. Save/delete actions return to the view where the action was initiated; return paths are validated server-side.

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
- [ ] Owner can search the Kelola divisi list by division name or description.
- [ ] Owner can filter Susunan panitia by every event division, all divisions, and assignments without an active division.
- [ ] Owner can search committee assignments by member name, contact, division label, position, and responsibility.
- [ ] Search and division filter work together, update the visible result count, and show a useful empty state when no rows match.
- [ ] Reset control clears both the committee search and selected division filter.
- [ ] Kelola divisi displays no more than five records per page and pagination navigates through the filtered result set.
- [ ] Susunan panitia displays no more than five records per page and pagination navigates through the filtered result set.
- [ ] Changing search or division filter resets pagination to the first page.
- [ ] Lihat semua divisi opens a dedicated view containing only the division list, with search and pagination.
- [ ] Lihat semua susunan panitia opens a dedicated view containing only committee assignments, with search, division filter, and pagination.
- [ ] Current committee search and division filter are preserved when opening the dedicated committee view.
- [ ] Dedicated views provide a return link to the main Panitia page; create/edit/delete actions return to the same dedicated view.
- [ ] A division from another event or group is rejected by Server Action validation and the composite foreign key.
- [ ] Existing free-text division values are backfilled without losing their labels.
- [ ] Existing Panitia home/detail pages and committee CSV export continue showing division labels.
- [ ] Panitia cannot create, edit, or delete division master records.
- [ ] RLS remains enabled and Owner/Panitia access is isolated by group/event.
- [ ] The migration is reviewed and applied to the intended Supabase environment before runtime UAT.

## Verification notes

Event-specific division CRUD and its database migration were merged in PR #22 (merge commit `20ca806309629eace877536f245409e546824fac`). Division/committee search and filters, five-record pagination, and dedicated list views are being added in PR #23. The migration's application to the target Supabase database is not confirmed. Local lint/build and browser E2E were not run in this environment; record their actual results before describing the features as runtime-verified.
