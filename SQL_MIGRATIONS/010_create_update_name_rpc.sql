-- Create RPC function for updating user name (bypasses RLS)
CREATE OR REPLACE FUNCTION update_user_name(user_id UUID, new_name TEXT)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET name = new_name,
      updated_at = now()
  WHERE id = user_id;
  
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$;

-- Grant permission to authenticated users
GRANT EXECUTE ON FUNCTION update_user_name(UUID, TEXT) TO authenticated;
