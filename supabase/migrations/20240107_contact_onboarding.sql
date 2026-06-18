-- contact_messages: stores messages from the landing page contact form
create table if not exists contact_messages (
  id         uuid        default gen_random_uuid() primary key,
  name       text        not null,
  email      text        not null,
  subject    text,
  message    text        not null,
  created_at timestamptz default now()
);

-- Only service role can read/insert (no public access)
alter table contact_messages enable row level security;

create policy "service role only"
  on contact_messages
  using (false);

-- profiles: onboarding fields
alter table profiles add column if not exists onboarded          boolean   default false;
alter table profiles add column if not exists onboarding_brand   text;
alter table profiles add column if not exists onboarding_goals   text[];
