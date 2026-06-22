
-- Switch view to security_invoker=true so it doesn't trip the
-- "security definer view" linter. Make the underlying table readable
-- by anon ONLY at the column level (excluding user_id) plus an RLS
-- policy that allows row visibility for that projection.

DROP VIEW IF EXISTS public.public_reviews;
CREATE VIEW public.public_reviews
WITH (security_invoker = true) AS
SELECT id, display_name, rating, body, created_at
FROM public.reviews;

GRANT SELECT ON public.public_reviews TO anon, authenticated;

-- Revoke any blanket table-level SELECT from anon, then grant
-- column-level SELECT on only the safe columns.
REVOKE SELECT ON public.reviews FROM anon;
GRANT SELECT (id, display_name, rating, body, created_at) ON public.reviews TO anon;
GRANT SELECT (id, display_name, rating, body, created_at) ON public.reviews TO authenticated;

-- RLS policy permitting anon to see all review rows (column GRANTs
-- already prevent user_id from being projected).
CREATE POLICY "Public can read review content" ON public.reviews
  FOR SELECT TO anon USING (true);
