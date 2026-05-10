
-- Tighten: only allow creating a couple if user has none yet
drop policy "any auth can create couple" on public.couples;
create policy "create couple if none"
  on public.couples for insert
  to authenticated
  with check (public.get_user_couple_id(auth.uid()) is null);

-- Restrict function execution
revoke execute on function public.get_user_couple_id(uuid) from public, anon;
grant execute on function public.get_user_couple_id(uuid) to authenticated;
