
drop policy if exists "read own couple members" on public.couple_members;
create policy "read own membership"
  on public.couple_members for select
  to authenticated
  using (user_id = auth.uid());
