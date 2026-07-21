begin;

update storage.buckets
set public = false
where id = 'tv-news-media';

drop policy if exists
  "Public can read tv news media objects"
  on storage.objects;

drop policy if exists
  "Admins can read tv news media objects"
  on storage.objects;

create policy
  "Admins can read tv news media objects"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'tv-news-media'
  and (select public.is_admin())
);

commit;
