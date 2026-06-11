create table if not exists newsletter_subscribers (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  subscribed_at timestamptz default now(),
  unsubscribed_at timestamptz
);

-- Only service role can insert (via Netlify function) — no public access
alter table newsletter_subscribers enable row level security;
