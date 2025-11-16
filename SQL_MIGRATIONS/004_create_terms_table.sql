-- Terms acceptance table
CREATE TABLE public.terms_acceptance (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  accepted_at timestamp with time zone DEFAULT now(),
  version text NOT NULL DEFAULT '1.0',
  ip_address text,
  CONSTRAINT terms_acceptance_pkey PRIMARY KEY (id),
  CONSTRAINT terms_acceptance_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT terms_acceptance_user_id_unique UNIQUE(user_id)
);

-- Index for fast lookup
CREATE INDEX terms_acceptance_user_id_idx ON terms_acceptance(user_id);
CREATE INDEX terms_acceptance_accepted_at_idx ON terms_acceptance(accepted_at DESC);

-- RLS Policies
ALTER TABLE terms_acceptance ENABLE ROW LEVEL SECURITY;

-- Users can read their own acceptance
CREATE POLICY "Users can read their own terms acceptance"
  ON terms_acceptance
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their acceptance (used during signup)
CREATE POLICY "Users can insert their terms acceptance"
  ON terms_acceptance
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all acceptances
CREATE POLICY "Admins can read all terms acceptance"
  ON terms_acceptance
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );
