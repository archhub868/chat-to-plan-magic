DROP POLICY IF EXISTS "Public can read review content" ON public.reviews;
REVOKE SELECT ON public.reviews FROM anon;
GRANT SELECT ON public.public_reviews TO anon, authenticated;