-- ── Automation file uploads (private storage bucket) ─────────────────
-- Files a user attaches in the Automations chat are stored under a
-- folder named after their user id: "<user_id>/<uuid>-<filename>".
insert into storage.buckets (id, name, public)
values ('automation-uploads', 'automation-uploads', false)
on conflict (id) do nothing;

-- Each user can only read/write/delete objects inside their own folder.
drop policy if exists "automation uploads: read own"   on storage.objects;
drop policy if exists "automation uploads: insert own" on storage.objects;
drop policy if exists "automation uploads: delete own" on storage.objects;

create policy "automation uploads: read own" on storage.objects
  for select to authenticated
  using (bucket_id = 'automation-uploads' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "automation uploads: insert own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'automation-uploads' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "automation uploads: delete own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'automation-uploads' and (storage.foldername(name))[1] = auth.uid()::text);

-- ── Automation credits ledger ────────────────────────────────────────
-- One row per consumed credit. Monthly usage = count of rows this month;
-- the per-plan limit lives in the app. Written by the chat function
-- (service role) when a user applies a configuration change.
create table if not exists automation_usage (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  kind       text        not null default 'apply',
  created_at timestamptz not null default now()
);

create index if not exists automation_usage_user_time_idx
  on automation_usage (user_id, created_at desc);

alter table automation_usage enable row level security;

-- Users can read their own usage; inserts happen via the service role.
create policy "User reads own automation usage" on automation_usage
  for select to authenticated
  using (user_id = auth.uid());
