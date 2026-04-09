-- Allow users to delete their own media + storage objects

drop policy if exists "media delete own" on media;
create policy "media delete own" on media for delete using (user_id = auth.uid());

drop policy if exists "trip-media delete own" on storage.objects;
create policy "trip-media delete own" on storage.objects for delete
  using (
    bucket_id = 'trip-media'
    and (storage.foldername(name))[2] = auth.uid()::text
  );
