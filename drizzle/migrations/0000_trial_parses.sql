CREATE TABLE public.trial_parses (
  visitor_hash text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.trial_parses TO service_role;
ALTER TABLE public.trial_parses ENABLE ROW LEVEL SECURITY;