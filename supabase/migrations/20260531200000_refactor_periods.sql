-- ============================================================
-- FULL RESET: drop existing data and recreate with new schema
-- couples (permanent) → periods (monthly subgroups) → expenses
-- ============================================================

-- Drop tables in dependency order
drop table if exists public.expenses cascade;
drop table if exists public.couple_invites cascade;
drop table if exists public.couple_members cascade;
drop table if exists public.periods cascade;
drop table if exists public.couples cascade;

-- Drop any leftover functions
drop function if exists public.get_user_couple_id(uuid);

-- ============================================================
-- 1. couples — permanent relationship between 2 people
-- ============================================================
create table public.couples (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 2. couple_members — max 2 per couple; each user belongs to 1 couple
-- ============================================================
create table public.couple_members (
  couple_id    uuid not null references public.couples(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  joined_at    timestamptz not null default now(),
  primary key (couple_id, user_id),
  unique (user_id)  -- each user belongs to at most one couple
);

create index couple_members_couple_idx on public.couple_members(couple_id);

-- ============================================================
-- 3. couple_invites — one-time invite for the partner to join
-- ============================================================
create table public.couple_invites (
  code       text primary key,
  couple_id  uuid not null references public.couples(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days')
);

-- ============================================================
-- 4. periods — monthly (or any) subgroups within a couple
-- ============================================================
create table public.periods (
  id         uuid primary key default gen_random_uuid(),
  couple_id  uuid not null references public.couples(id) on delete cascade,
  name       text not null,
  created_at timestamptz not null default now()
);

create index periods_couple_idx on public.periods(couple_id, created_at desc);

-- ============================================================
-- 5. expenses — now scoped to a period (not couple directly)
-- ============================================================
create table public.expenses (
  id          uuid primary key default gen_random_uuid(),
  period_id   uuid not null references public.periods(id) on delete cascade,
  description text not null,
  amount      numeric(12,2) not null check (amount > 0),
  paid_by     uuid not null references auth.users(id) on delete cascade,
  split_type  text not null check (split_type in ('split','transfer')),
  created_by  uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

create index expenses_period_created_idx on public.expenses(period_id, created_at desc);

-- ============================================================
-- RLS
-- ============================================================
alter table public.couples        enable row level security;
alter table public.couple_members enable row level security;
alter table public.couple_invites enable row level security;
alter table public.periods        enable row level security;
alter table public.expenses       enable row level security;

-- couples: readable by members; creatable by authenticated users
create policy "members read couple"
  on public.couples for select
  to authenticated
  using (exists (
    select 1 from public.couple_members cm
    where cm.couple_id = couples.id and cm.user_id = auth.uid()
  ));

create policy "create couple as authenticated"
  on public.couples for insert
  to authenticated
  with check (true);

-- couple_members: read own membership + co-members
create policy "read own membership and co-members"
  on public.couple_members for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.couple_members me
      where me.couple_id = couple_members.couple_id and me.user_id = auth.uid()
    )
  );

create policy "join couple as self"
  on public.couple_members for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and (
      select count(*) from public.couple_members cm
      where cm.couple_id = couple_members.couple_id
    ) < 2
  );

create policy "leave couple as self"
  on public.couple_members for delete
  to authenticated
  using (user_id = auth.uid());

-- couple_invites: creator reads/inserts; anyone authenticated can read by code
create policy "creator reads own invites"
  on public.couple_invites for select
  to authenticated
  using (created_by = auth.uid());

create policy "read invite by code lookup"
  on public.couple_invites for select
  to authenticated
  using (true);

create policy "creator makes invite for own couple"
  on public.couple_invites for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and exists (
      select 1 from public.couple_members cm
      where cm.couple_id = couple_invites.couple_id and cm.user_id = auth.uid()
    )
  );

create policy "creator deletes own invites"
  on public.couple_invites for delete
  to authenticated
  using (created_by = auth.uid());

-- periods: couple members can read and create
create policy "couple members read periods"
  on public.periods for select
  to authenticated
  using (exists (
    select 1 from public.couple_members cm
    where cm.couple_id = periods.couple_id and cm.user_id = auth.uid()
  ));

create policy "couple members create periods"
  on public.periods for insert
  to authenticated
  with check (exists (
    select 1 from public.couple_members cm
    where cm.couple_id = periods.couple_id and cm.user_id = auth.uid()
  ));

-- expenses: couple members can read/insert; only author can delete
create policy "members read expenses"
  on public.expenses for select
  to authenticated
  using (exists (
    select 1 from public.periods p
    join public.couple_members cm on cm.couple_id = p.couple_id
    where p.id = expenses.period_id and cm.user_id = auth.uid()
  ));

create policy "members insert expenses"
  on public.expenses for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and exists (
      select 1 from public.periods p
      join public.couple_members cm on cm.couple_id = p.couple_id
      where p.id = expenses.period_id and cm.user_id = auth.uid()
    )
    and exists (
      select 1 from public.periods p2
      join public.couple_members cm2 on cm2.couple_id = p2.couple_id
      where p2.id = expenses.period_id and cm2.user_id = expenses.paid_by
    )
  );

create policy "author deletes expenses"
  on public.expenses for delete
  to authenticated
  using (created_by = auth.uid());
