-- Persist the model-written narrative fields alongside each analysis so a
-- stored report reads the same on reload as it did right after scanning.
alter table analyses add column if not exists verdict            text;
alter table analyses add column if not exists competitor_insight text;
alter table analyses add column if not exists action_plan        jsonb;
