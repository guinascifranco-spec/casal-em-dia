
drop policy if exists "members read couple" on public.couples;
drop policy if exists "create couple if none" on public.couples;
drop policy if exists "members read expenses" on public.expenses;
drop policy if exists "members insert expenses" on public.expenses;
drop policy if exists "creator makes invites for own couple" on public.couple_invites;
drop policy if exists "read own couple members" on public.couple_members;

create policy "members read couple"
  on public.couples for select
  to authenticated
  using (exists (select 1 from public.couple_members cm where cm.couple_id = couples.id and cm.user_id = auth.uid()));

create policy "create couple if none"
  on public.couples for insert
  to authenticated
  with check (not exists (select 1 from public.couple_members cm where cm.user_id = auth.uid()));

create policy "members read expenses"
  on public.expenses for select
  to authenticated
  using (exists (select 1 from public.couple_members cm where cm.couple_id = expenses.couple_id and cm.user_id = auth.uid()));

create policy "members insert expenses"
  on public.expenses for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and exists (select 1 from public.couple_members cm where cm.couple_id = expenses.couple_id and cm.user_id = auth.uid())
    and exists (select 1 from public.couple_members cm2 where cm2.couple_id = expenses.couple_id and cm2.user_id = expenses.paid_by)
  );

create policy "creator makes invites for own couple"
  on public.couple_invites for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and exists (select 1 from public.couple_members cm where cm.couple_id = couple_invites.couple_id and cm.user_id = auth.uid())
  );

create policy "read own couple members"
  on public.couple_members for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (select 1 from public.couple_members me where me.couple_id = couple_members.couple_id and me.user_id = auth.uid())
  );

drop function if exists public.get_user_couple_id(uuid);
