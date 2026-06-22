
-- 1) Move has_role to a private schema (out of API exposure)
CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 2) Recreate policies that referenced public.has_role to use private.has_role
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can delete any review" ON public.reviews;
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.sessions;
DROP POLICY IF EXISTS "Admins can delete any session" ON public.sessions;
DROP POLICY IF EXISTS "Admins can view all tasks" ON public.tasks;
DROP POLICY IF EXISTS "Admins can delete any task" ON public.tasks;
DROP POLICY IF EXISTS "Admins can view all reminders" ON public.reminders;
DROP POLICY IF EXISTS "Admins can delete any reminder" ON public.reminders;

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all reviews" ON public.reviews
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete any review" ON public.reviews
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all sessions" ON public.sessions
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete any session" ON public.sessions
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all tasks" ON public.tasks
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete any task" ON public.tasks
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all reminders" ON public.reminders
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete any reminder" ON public.reminders
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

-- 3) Drop the public-schema has_role now that nothing references it
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

-- 4) user_roles: restrict INSERT/UPDATE/DELETE to admins only
CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete roles" ON public.user_roles
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

-- 5) reviews: stop exposing user_id publicly
DROP POLICY IF EXISTS "Reviews are publicly readable" ON public.reviews;

-- Authenticated users may read their own full row (needed for "already reviewed" check)
CREATE POLICY "Users can view own review" ON public.reviews
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Public sanitized view (no user_id). security_invoker=false so anon can read
-- through the view without needing a direct table SELECT policy.
DROP VIEW IF EXISTS public.public_reviews;
CREATE VIEW public.public_reviews
WITH (security_invoker = false) AS
SELECT id, display_name, rating, body, created_at
FROM public.reviews;

REVOKE ALL ON public.public_reviews FROM PUBLIC;
GRANT SELECT ON public.public_reviews TO anon, authenticated;
