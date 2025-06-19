/*
  # Fix user_profiles RLS policy for sign-up

  1. Security Changes
    - Drop existing restrictive INSERT policy on user_profiles table
    - Create new INSERT policy that allows users to insert their own profile data
    - Ensure the policy checks that the user ID matches the authenticated user's UID
    
  2. Policy Details
    - Allow INSERT operations where the id column matches auth.uid()
    - This enables users to create their profile during sign-up process
    - Maintains security by ensuring users can only create profiles for themselves
*/

-- Drop the existing INSERT policy if it exists
DROP POLICY IF EXISTS "Allow authenticated users to insert own profile" ON user_profiles;

-- Create a new INSERT policy that allows users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);