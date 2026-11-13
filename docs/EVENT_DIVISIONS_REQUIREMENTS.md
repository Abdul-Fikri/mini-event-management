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
2. Use the Tambah divisi button for quick creation without leaving the Panitia page. The create form opens in place and returns to the Panitia page after saving.
3. Use the Kelola divisi button to open the dedicated `/events/[id]/panitia/divisions` page for the complete division list and full CRUD.
4. On the dedicated Kelola divisi page, create, search, edit, or delete divisions. Already assigned members retain the old label as historical text if a division is deleted.
5. Return to the Panitia page and add or edit a committee assignment using the division dropdown. A division is optional.
6. Search committee assignments by member name, contact, division, position, or responsibility; optionally combine the search with a division filter.

## Search and filtering

- Kelola divisi provides an in-page search over division name and description.
- Susunan panitia provides a division filter with Semua divisi, each event master division, and Tanpa divisi aktif.
- Committee search matches member name, contact, division label, position title, and responsibility.
- Search and division filter are combined, and the UI displays the number of matching assignments plus a clear empty state.
- A reset control clears both the search query and division filter.
- These controls only filter data already authorized and loaded for the current Owner event page; they do not replace server-side authorization or RLS.

## Pagination and dedicated list views

- The main Panitia page does not embed the full division list or its search/edit/delete controls. It shows only a quick Tambah divisi button and a Kelola divisi link.
- The quick-add button opens the create form in place; a successful save returns to the main Panitia page.
- The Kelola divisi link opens `/events/[id]/panitia/divisions`, which contains the complete division list and full CRUD.
- The dedicated division list provides search by name/description and displays at most five records per page with previous/next pagination.
- Susunan panitia remains on the main Panitia page with its search/filter and five-record pagination, plus a dedicated `/events/[id]/panitia/committee` view.
- Dedicated views provide a return link to the main Panitia page. Save/delete actions return to the view where the action was initiated; return paths are validated server-side.

## Panitia UI visual design

The Owner-facing Panitia management experience uses a scoped Polar Bear palette inspired by soft ice blue and white:

- Canvas reference: `#F5F8FC`; white card surface: `#FFFFFF`.
- Subtle panel tint: `#F0F5FA`; soft blue highlight: `#EBF3FC`.
- Primary blue: `#3B82F6`; hover/darker blue: `#2563EB`; focus border: `#BFDBFE`.
- Soft border: `#E2EBF5`; stronger nested-card border: `#D7E6F5`.
- Main text: `#0F172A`; secondary text: `#64748B`.
- Visually separate the Divisi event and Susunan panitia sections. Place search/filter controls in a lightly tinted panel and give each committee record its own outlined card, with division, position, contact, and responsibility arranged as distinct information levels.
- The main Panitia page and dedicated division/committee management views share the theme. The Owner subsequently approved extending this same restrained visual language across all Owner management modules.
- The Divisi event heading starts directly with its title. Do not add a decorative ordinal tile such as `01`; this panel is a management section, not a numbered step or record.
- This is presentation-only: no data, authorization, route, or database behavior should change as part of visual refinement.

## Validation and security

- Name is required, trimmed, and limited to 80 characters.
- Description is optional and limited to 250 characters.
- Duplicate names within the same event are rejected case-insensitively.
- Server Actions verify Owner group, event ownership, and that a selected division belongs to the same event and group.
- RLS remains enabled. Owner policies scope records to the Owner's group; Panitia has read-only policy access only for assigned events.
- No service-role key or privileged client is needed.

## Acceptance criteria

- [ ] The Panitia page shows a quick Tambah divisi button that opens the create form in place and returns to Panitia after a successful save.
- [ ] The Panitia page shows a Kelola divisi link to the dedicated division CRUD page.
- [ ] The Divisi event heading has no decorative `01` ordinal tile.
- [ ] The Panitia page does not embed the full division list, search, edit, or delete controls.
- [ ] Owner can view all divisions for that event on `/events/[id]/panitia/divisions`.
- [ ] Owner can edit a division name and description.
- [ ] Renaming a division updates all assigned committee labels and Panitia-facing snapshots.
- [ ] Owner can delete a division; existing assignments retain the old label as historical text and lose only the master reference.
- [ ] Division names are unique case-insensitively within an event.
- [ ] The committee assignment form uses a dropdown and no longer accepts arbitrary free-text division names.
- [ ] Owner can search the dedicated Kelola divisi list by division name or description.
- [ ] Owner can filter Susunan panitia by every event division, all divisions, and assignments without an active division.
- [ ] Owner can search committee assignments by member name, contact, division label, position, and responsibility.
- [ ] Search and division filter work together, update the visible result count, and show a useful empty state when no rows match.
- [ ] Reset control clears both the committee search and selected division filter.
- [ ] The dedicated Kelola divisi page displays no more than five records per page and pagination navigates through the filtered result set.
- [ ] Susunan panitia displays no more than five records per page and pagination navigates through the filtered result set.
- [ ] Changing search or division filter resets pagination to the first page.
- [ ] The Kelola divisi button opens a dedicated view containing only the division list, with full CRUD, search, and pagination.
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

Event-specific division CRUD and its database migration were merged in PR #22 (merge commit `20ca806309629eace877536f245409e546824fac`). Division/committee search, filters, five-record pagination, and dedicated list views were merged in PR #23. The compact division quick-add and dedicated management navigation were merged in PR #28 (merge commit `ed00f75ec0beda51f20c8b407f7b95721ef70253`). The Polar Bear styling was merged in PR #29. PR #30 merged the shared Stitch-inspired Owner shell and global palette. The follow-up management UI consistency work is tracked in PR #31: https://github.com/Abdul-Fikri/mini-event-management/pull/31 (`feat/stitch-management-ui-polish`, open and unmerged). Migration application to the target Supabase database is not confirmed. Preview status and Production deployment must be checked separately; local lint/build and browser E2E results must be recorded before claiming runtime verification.
