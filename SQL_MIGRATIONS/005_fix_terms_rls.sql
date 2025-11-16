-- FIX: Update RLS policies for terms_acceptance table
-- This migration fixes the issue where users couldn't insert their own acceptance record

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own terms acceptance" ON terms_acceptance;
DROP POLICY IF EXISTS "Users can insert their terms acceptance" ON terms_acceptance;
DROP POLICY IF EXISTS "Admins can read all terms acceptance" ON terms_acceptance;

-- Recreate policies with correct implementation

-- Policy 1: Users can INSERT their own acceptance
-- Must use auth.uid() = user_id constraint
CREATE POLICY "users_insert_own_terms"
  ON terms_acceptance
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 2: Users can READ their own acceptance
CREATE POLICY "users_read_own_terms"
  ON terms_acceptance
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 3: Admins can READ all acceptances
CREATE POLICY "admins_read_all_terms"
  ON terms_acceptance
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policy 4: Admins can UPDATE any acceptance
CREATE POLICY "admins_update_all_terms"
  ON terms_acceptance
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
