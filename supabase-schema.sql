create table if not exists public.fixlab_records (
  collection text not null,
  record_id text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (collection, record_id)
);

alter table public.fixlab_records enable row level security;

drop policy if exists "fixlab_records_select" on public.fixlab_records;
drop policy if exists "fixlab_records_insert" on public.fixlab_records;
drop policy if exists "fixlab_records_update" on public.fixlab_records;
drop policy if exists "fixlab_records_delete" on public.fixlab_records;

create policy "fixlab_records_select"
on public.fixlab_records for select
to anon
using (true);

create policy "fixlab_records_insert"
on public.fixlab_records for insert
to anon
with check (true);

create policy "fixlab_records_update"
on public.fixlab_records for update
to anon
using (true)
with check (true);

create policy "fixlab_records_delete"
on public.fixlab_records for delete
to anon
using (true);
