
-- Drop the policy that prevents creating a couple if user already has one
DROP POLICY IF EXISTS "create couple if none" ON public.couples;

CREATE POLICY "create couple as authenticated"
ON public.couples
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Fix the broken member-count check (cm.couple_id = cm.couple_id was always true)
DROP POLICY IF EXISTS "join couple as self" ON public.couple_members;

CREATE POLICY "join couple as self"
ON public.couple_members
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND (
    SELECT count(*) FROM public.couple_members cm
    WHERE cm.couple_id = couple_members.couple_id
  ) < 2
);
