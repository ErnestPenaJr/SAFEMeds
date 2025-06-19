/*
  # Fix user_profiles RLS policies for registration

  1. Changes
    - Drop the problematic INSERT policy that's preventing user registration
    - Create a new INSERT policy that properly allows authenticated users to insert their own profile
    - Update SELECT and UPDATE policies for consistency
    - Ensure proper security while allowing registration flow to work

  2. Security
    - Maintains proper row-level security
    - Only allows users to access their own data
*/

-- Drop the existing INSERT policy that's causing issues during registration
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert own profile" ON user_profiles;

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