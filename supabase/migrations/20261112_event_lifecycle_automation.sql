-- Event lifecycle automation (Asia/Jakarta)
-- Existing events remain manual; new events default to automatic status.
-- Effective automatic status is derived at read time, so no cron job is needed.

begin;

alter table public.events
  add column if not exists status_mode text not null default 'manual',
  add column if not exists planning_start_date date,
  add column if not exists preparation_start_date date,
  add column if not exists evaluation_end_date date;

-- The ADD COLUMN default above backfills existing rows as manual.
-- Only future inserts receive automatic mode by default.
alter table public.events
  alter column status_mode set default 'automatic';

alter table public.events
  drop constraint if exists events_status_check;

alter table public.events
  add constraint events_status_check
  check (
    status in (
      'draft',
      'planned',
      'planning',
      'preparation',
      'ongoing',
      'evaluation',
      'completed',
      'cancelled'
    )
  );

alter table public.events
  add constraint events_status_mode_check
  check (status_mode in ('automatic', 'manual'));

alter table public.events
  add constraint events_planning_dates_check
  check (
    (
      planning_start_date is null
      and preparation_start_date is null
    )
    or (
      planning_start_date is not null
      and preparation_start_date is not null
      and planning_start_date < preparation_start_date
      and preparation_start_date < start_date
    )
  );

alter table public.events
  add constraint events_evaluation_end_date_check
  check (
    evaluation_end_date is null
    or evaluation_end_date > coalesce(end_date, start_date)
  );

comment on column public.events.status_mode is
  'automatic derives the effective status from lifecycle dates; manual uses status as selected by the Owner.';
comment on column public.events.planning_start_date is
  'Optional start date for the planning phase; must precede preparation_start_date.';
comment on column public.events.preparation_start_date is
  'Optional start date for the preparation phase; must precede the event start_date.';
comment on column public.events.evaluation_end_date is
  'Optional final day of the evaluation phase; must be after the effective event end date.';

commit;
