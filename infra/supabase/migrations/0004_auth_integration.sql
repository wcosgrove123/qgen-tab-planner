-- 0004_auth_integration.sql
-- Connect Supabase Auth with our people table

-- Add auth_user_id to people table to link with auth.users
ALTER TABLE people ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_people_auth_user_id ON people(auth_user_id);

-- Create a function to automatically create a person record when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- When a new user is created in auth.users, create a corresponding person record
  -- We'll extract organization from email domain or use a default
  DECLARE
    org_id UUID;
    email_domain TEXT;
  BEGIN
    -- Extract domain from email
    email_domain := split_part(NEW.email, '@', 2);

    -- Try to find existing organization by domain
    SELECT id INTO org_id FROM organizations WHERE domain = email_domain;

    -- If no organization found, create a default one or use first available
    IF org_id IS NULL THEN
      SELECT id INTO org_id FROM organizations LIMIT 1;

      -- If still no organization, create a default one
      IF org_id IS NULL THEN
        INSERT INTO organizations (name, domain)
        VALUES ('Default Organization', email_domain)
        RETURNING id INTO org_id;
      END IF;
    END IF;

    -- Create person record
    INSERT INTO people (auth_user_id, organization_id, name, email, role)
    VALUES (
      NEW.id,
      org_id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      NEW.email,
      'User'
    );

    RETURN NEW;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run this function when new users sign up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create RLS policies for people table
ALTER TABLE people ENABLE ROW LEVEL SECURITY;

-- Users can read their own record and others in same organization
CREATE POLICY "Users can view people in their organization" ON people
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      auth_user_id = auth.uid() OR
      organization_id IN (
        SELECT organization_id FROM people WHERE auth_user_id = auth.uid()
      )
    )
  );

-- Users can update their own record
CREATE POLICY "Users can update their own profile" ON people
  FOR UPDATE USING (auth_user_id = auth.uid());

-- Function to get current user's person record
CREATE OR REPLACE FUNCTION public.get_current_user_person()
RETURNS TABLE (
  id UUID,
  organization_id UUID,
  name TEXT,
  email TEXT,
  role TEXT,
  settings JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.organization_id, p.name, p.email, p.role, p.settings, p.created_at, p.updated_at
  FROM people p
  WHERE p.auth_user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, UPDATE ON people TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_user_person() TO authenticated;