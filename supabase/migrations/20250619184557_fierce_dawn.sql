/*
  # Fix user_profiles INSERT policy for registration

  1. Security Policy Updates
    - Drop the existing restrictive INSERT policy
    - Create a new INSERT policy that allows authenticated users to insert their own profile
    - Ensure the policy works during the registration flow when auth.uid() matches the user ID

  2. Changes Made
    - Remove old INSERT policy that was too restrictive during registration
    - Add new INSERT policy that properly handles the registration flow
    - Maintain security by ensuring users can only insert profiles for their own user ID
*/

-- Drop the existing INSERT policy that's causing issues during registration
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Create a new INSERT policy that works properly during registration
-- This allows authenticated users to insert a profile where the id matches their auth.uid()
CREATE POLICY "Allow authenticated users to insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Ensure we also have proper SELECT and UPDATE policies
-- Drop and recreate SELECT policy to ensure consistency
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Drop and recreate UPDATE policy to ensure consistency  
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);