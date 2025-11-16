-- Migration to improve reviews table
-- Add reviewer name stored directly (denormalized from profiles)
-- This ensures reviewer name is always available even if profile is deleted

ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS reviewer_name text DEFAULT 'Anonymous';
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reviews_updated_at_trigger ON reviews;
CREATE TRIGGER reviews_updated_at_trigger
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_reviews_updated_at();

-- Create index on reviewer_name for faster searches
CREATE INDEX IF NOT EXISTS reviews_reviewer_name_idx ON reviews(reviewer_name);

-- Auto-populate reviewer_name from profiles when inserting/updating
CREATE OR REPLACE FUNCTION set_reviewer_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Get the name from profiles table
  SELECT name INTO NEW.reviewer_name FROM public.profiles WHERE id = NEW.user_id;
  -- Default to Anonymous if profile not found
  IF NEW.reviewer_name IS NULL THEN
    NEW.reviewer_name := 'Anonymous';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_reviewer_name_trigger ON reviews;
CREATE TRIGGER set_reviewer_name_trigger
BEFORE INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION set_reviewer_name();

