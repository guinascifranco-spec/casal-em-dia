
-- Couples (shared space)
create table public.couples (
  id uuid primary key default gen_random_uuid(),
  name text,
  created_at timestamptz not null default now()
);

-- Couple members (max 2 per couple, 1 couple per user)
create table public.couple_members (
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  joined_at timestamptz not null default now(),
  primary key (couple_id, user_id),
  unique (user_id)
);

create index couple_members_couple_idx on public.couple_members(couple_id);

-- Expenses
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  description text not null,
  amount numeric(12,2) not null check (amount > 0),
  paid_by uuid not null references auth.users(id) on delete cascade,
  split_type text not null check (split_type in ('split','transfer')),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index expenses_couple_created_idx on public.expenses(couple_id, created_at desc);

-- Invites
create table public.couple_invites (
  code text primary key,
  couple_id uuid not null references public.couples(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days')
);

-- Security definer helper to avoid recursive RLS
create or replace function public.get_user_couple_id(_user_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select couple_id from public.couple_members where user_id = _user_id limit 1;
$$;

-- Enable RLS
alter table public.couples enable row level security;
alter table public.couple_members enable row level security;
alter table public.expenses enable row level security;
alter table public.couple_invites enable row level security;

-- couples: members of the couple can read; insert allowed to authenticated (creator inserts then joins)
create policy "members read couple"
  on public.couples for select
  to authenticated
  using (id = public.get_user_couple_id(auth.uid()));

create policy "any auth can create couple"
  on public.couples for insert
  to authenticated
  with check (true);

-- couple_members: a user can read members of their own couple; can insert their own membership only if couple has < 2 members
create policy "read own couple members"
  on public.couple_members for select
  to authenticated
  using (couple_id = public.get_user_couple_id(auth.uid()) or user_id = auth.uid());

create policy "join couple as self"
  on public.couple_members for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and (select count(*) from public.couple_members cm where cm.couple_id = couple_id) < 2
  );

create policy "leave couple as self"
  on public.couple_members for delete
  to authenticated
  using (user_id = auth.uid());

-- expenses: read/insert by couple members; delete by author only
create policy "members read expenses"
  on public.expenses for select
  to authenticated
  using (couple_id = public.get_user_couple_id(auth.uid()));

create policy "members insert expenses"
  on public.expenses for insert
  to authenticated
  with check (
    couple_id = public.get_user_couple_id(auth.uid())
    and created_by = auth.uid()
    and paid_by in (select user_id from public.couple_members where couple_id = expenses.couple_id)
  );

create policy "author deletes expenses"
  on public.expenses for delete
  to authenticated
  using (created_by = auth.uid());

-- invites: read code if you created it OR if you're not yet in any couple (so you can validate before joining)
create policy "creator reads own invites"
  on public.couple_invites for select
  to authenticated
  using (created_by = auth.uid());

create policy "creator makes invites for own couple"
  on public.couple_invites for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and couple_id = public.get_user_couple_id(auth.uid())
  );

create policy "creator deletes own invites"
  on public.couple_invites for delete
  to authenticated
  using (created_by = auth.uid());
