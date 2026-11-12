# Management List Pagination Requirements

## Goal

Keep event management pages compact when lists grow while still allowing the Owner to open a focused page for the complete list they selected.

## Shared behavior

- Every list shows no more than five records at a time.
- Lists with more than five records provide Previous/Next controls and a visible current-page/total-page indicator.
- Each parent management page provides a **Lihat semua** link for each supported list.
- The dedicated view displays only the selected data type, retains five-record pagination, and provides a link back to its parent page.
- Create forms normally remain on the parent management page. The Tugas module is an exception: the Kanban board and its dedicated all-tasks view both provide create/edit/delete controls. Edit/delete/sync actions initiated from a dedicated view return to that same view.
- Return destinations are validated server-side through the event return-path allowlist. UI pagination is not an authorization boundary; existing authenticated group/event queries and Server Action validation remain authoritative.

## Supported lists and routes

| Parent page | List | Dedicated view |
|---|---|---|
| `/events` | Group events | `/events/all` |
| `/members` | Group member directory | `/members/all` |
| `/events/[id]/rundown` | Rundown activities | `/events/[id]/rundown/all` |
| `/events/[id]/tugas` | Tasks | `/events/[id]/tugas/all` |
| `/events/[id]/pengadaan` | Procurement items | `/events/[id]/pengadaan/all` |
| `/events/[id]/keuangan` | Budget categories | `/events/[id]/keuangan/categories` |
| `/events/[id]/keuangan` | Transactions | `/events/[id]/keuangan/transactions` |
| `/events/[id]/keuangan` | Ordered procurement commitments | `/events/[id]/keuangan/commitments` |

The Panitia tab has its own search/filter/pagination requirements in [Event Divisions Requirements](EVENT_DIVISIONS_REQUIREMENTS.md).

## Task Kanban behavior

- The main route `/events/[id]/tugas` is a Kanban board with the existing task statuses: `todo` (Belum dikerjakan), `in_progress` (Sedang dikerjakan), `done` (Selesai), and `blocked` (Terhambat).
- Each status column has its own visual color and icon. Task cards can be dragged between columns; dropping a card persists the selected status through a Server Action.
- A status selector on each card provides a keyboard/touch-friendly alternative to drag-and-drop.
- The Kanban board provides a create-task button and edit/delete controls on every task card.
- **Detail seluruh tugas** opens `/events/[id]/tugas/all`, which contains the full task list, status counts, descriptions/notes, create/edit/delete forms, and five-record pagination.
- Status updates validate the allowed status and scope the mutation to the authenticated Owner group and the selected event/task. Existing event-roster PIC validation on task create/edit remains unchanged.


## Top-level Owner management lists

- `/events` shows at most five group events at a time and provides **Lihat semua event** for `/events/all`.
- `/members` shows at most five group members at a time and provides **Lihat semua anggota** for `/members/all`.
- Both dedicated pages show only their selected data type, keep five-record pagination, and provide a link back to their parent page.
- Editing or deleting a member from `/members/all` returns to `/members/all`; normal member creation and edits from `/members` return to `/members`.
- Event status labels continue to use the shared effective-status resolver in both event-list views.

## Acceptance criteria

- [ ] Group event list shows at most five events; pagination and `/events/all` work.
- [ ] Dedicated event view contains only events, links back to `/events`, and keeps the effective status label.
- [ ] Group member list shows at most five members; pagination and `/members/all` work.
- [ ] Dedicated member view contains only members, links back to `/members`, and edit/delete return to the dedicated view.
- [ ] Rundown main page shows at most five activities; pagination and the dedicated all-rundown route work.
- [ ] Dedicated rundown view contains only activities, links back to Rundown, and edit/delete return to the dedicated view.
- [ ] Tugas main page displays the four existing statuses as a colored/icon Kanban board with correct counts and empty states.
- [ ] Drag a task between all four status columns and confirm the status persists after refresh; invalid status submissions are rejected server-side.
- [ ] Change task status using the card selector as a keyboard/touch alternative to drag-and-drop.
- [ ] Kanban cards provide create, edit, and delete actions; save/delete returns to the Kanban page.
- [ ] **Detail seluruh tugas** opens the dedicated full-list view, displays status counts/details, and paginates at five records per page.
- [ ] Dedicated tasks view links back to the Kanban board; create/edit/delete actions return to the dedicated view.
- [ ] Pengadaan main page shows at most five items; pagination and the dedicated all-procurement route work.
- [ ] Dedicated procurement view contains only procurement items, links back to Pengadaan, and edit/delete/finance-sync return to the dedicated view.
- [ ] Finance categories, transactions, and commitments each paginate independently at five records per page on the parent page.
- [ ] Each Finance dedicated route displays only its selected list and provides a link back to Keuangan.
- [ ] Editing/deleting a category or manual transaction from its dedicated view returns to that same view.
- [ ] Procurement-linked transactions remain read-only in Finance and continue to be managed from Pengadaan.
- [ ] All dedicated routes retain authenticated Owner and group/event data scoping.
- [ ] No database schema, migration, RLS, or production data change is introduced by this UI/routing feature.
