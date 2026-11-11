# Event Lifecycle Automation — Requirements & Acceptance Criteria

## Goal

Allow an Owner to choose either automatic or manual event status management. Automatic mode derives the current phase from the event timeline so the Owner does not need to remember to update the status. Manual mode preserves direct Owner control.

## Status mode

- New events default to `automatic`.
- Existing events are migrated to `manual` so the feature does not unexpectedly change statuses that Owners already selected.
- The Owner can switch an existing event between automatic and manual from the event edit form.
- In automatic mode, the effective status is calculated from the saved dates using the Asia/Jakarta calendar date. It is not based on the browser clock or UTC date.
- In manual mode, the saved `status` value is authoritative and date changes do not change the displayed status.
- Switching from automatic to manual preselects the current calculated status so the Owner can keep it or choose another status.
- To cancel an event, switch to manual mode and select `Dibatalkan`. Switching back to automatic resumes date-based status.

## Timeline fields

- `planning_start_date`: optional first day of planning.
- `preparation_start_date`: optional first day of preparation.
- `start_date`: required first day of the event.
- `end_date`: optional last day of the event; when empty, the event is treated as a one-day event ending on `start_date`.
- `evaluation_end_date`: optional final day of evaluation.

Planning and preparation dates must be provided together and follow this strict order:

`planning_start_date < preparation_start_date < start_date`

The evaluation end date, when provided, must be after the effective event end date (`end_date` or `start_date`).

Planning, preparation, and evaluation dates may be in the past so historical events can describe their real timeline. The existing event start/end date validation policy remains unchanged: new or changed start/end dates cannot be before today in Asia/Jakarta; an unchanged historical start/end date may remain.

## Automatic status rules

All date comparisons use the calendar date in Asia/Jakarta.

| Condition | Effective status |
|---|---|
| Before `planning_start_date`, or before event start when planning dates are omitted | Direncanakan |
| From `planning_start_date` through the day before `preparation_start_date` | Perencanaan |
| From `preparation_start_date` through the day before `start_date` | Persiapan |
| From `start_date` through `end_date` inclusive (or `start_date` for a one-day event) | Berlangsung |
| From the day after event end through `evaluation_end_date` inclusive, when supplied | Evaluasi |
| After event end when no evaluation date exists, or after `evaluation_end_date` | Selesai |

Automatic status is resolved when data is read. No cron job, scheduled database write, or background worker is required. The Owner UI, dashboard, and Panitia event views must use the same resolver.

## Manual status options

- Draf
- Direncanakan
- Perencanaan
- Persiapan
- Berlangsung
- Evaluasi
- Selesai
- Dibatalkan

## Acceptance criteria

- [ ] A newly created event starts in automatic mode by default.
- [ ] Existing events retain their previously selected status after migration because their mode is manual.
- [ ] The Owner can switch an event to manual mode and select any supported status.
- [ ] The Owner can switch back to automatic mode and see the date-derived status.
- [ ] Automatic phase boundaries are inclusive/exclusive exactly as specified in the table.
- [ ] A one-day event is ongoing on its start date and completes on the following day unless evaluation is configured.
- [ ] An event with an evaluation end date remains in Evaluasi through that date and becomes Selesai the next day.
- [ ] Omitting both planning dates keeps the pre-event status as Direncanakan.
- [ ] Supplying only one planning/preparation date is rejected.
- [ ] Invalid planning/preparation order and an evaluation end date on/before event end are rejected by both form feedback and database constraints.
- [ ] Existing Asia/Jakarta start/end date validation behavior remains intact.
- [ ] Dashboard counts, event list, event workspace header, and Panitia event views display the same effective status.
- [ ] The automatic status is computed on the server; a forged browser status cannot override it.
- [ ] RLS and Owner/Panitia authorization boundaries remain unchanged.
- [ ] The migration is reviewed and applied to the intended Supabase environment before runtime testing.

## Verification notes

The implementation PR must record the exact source checks, lint/build results, Preview status, and manual UAT results. Do not describe the feature as runtime-verified until the migration has been applied to the test/target database and the flows have been exercised.
