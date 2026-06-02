DROP POLICY IF EXISTS "create couple as authenticated" ON public.couples;
CREATE POLICY "create couple as authenticated"
ON public.couples
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);