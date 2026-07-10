-- All admin tables are readable/writable only by authenticated LaunchPod users.
-- Client viewers never talk to Supabase directly — the private-report route
-- resolves the access token server-side with the service-role key (which
-- bypasses RLS) after validating the token, so no anon policy is needed here.

alter table clients enable row level security;
alter table reports enable row level security;
alter table report_uploads enable row level security;
alter table report_metrics enable row level security;
alter table report_observations enable row level security;
alter table report_sections enable row level security;
alter table recommendations enable row level security;

create policy "authenticated_full_access" on clients
  for all to authenticated using (true) with check (true);

create policy "authenticated_full_access" on reports
  for all to authenticated using (true) with check (true);

create policy "authenticated_full_access" on report_uploads
  for all to authenticated using (true) with check (true);

create policy "authenticated_full_access" on report_metrics
  for all to authenticated using (true) with check (true);

create policy "authenticated_full_access" on report_observations
  for all to authenticated using (true) with check (true);

create policy "authenticated_full_access" on report_sections
  for all to authenticated using (true) with check (true);

create policy "authenticated_full_access" on recommendations
  for all to authenticated using (true) with check (true);
