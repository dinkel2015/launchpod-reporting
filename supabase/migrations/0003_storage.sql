-- Private bucket for uploaded source evidence (screenshots, CSVs, PDFs).
-- Never made public: client viewers must never receive a storage URL.
insert into storage.buckets (id, name, public)
values ('report-uploads', 'report-uploads', false)
on conflict (id) do nothing;

create policy "authenticated_read_report_uploads" on storage.objects
  for select to authenticated using (bucket_id = 'report-uploads');

create policy "authenticated_write_report_uploads" on storage.objects
  for insert to authenticated with check (bucket_id = 'report-uploads');

create policy "authenticated_update_report_uploads" on storage.objects
  for update to authenticated using (bucket_id = 'report-uploads');

create policy "authenticated_delete_report_uploads" on storage.objects
  for delete to authenticated using (bucket_id = 'report-uploads');
