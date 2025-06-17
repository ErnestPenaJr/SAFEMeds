/*
  # Authentication System Setup

  1. New Tables
    - `user_profiles`
      - `id` (uuid, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `email_verification_codes`
      - `id` (uuid, primary key)
      - `email` (text)
      - `code` (text, 6 digits)
      - `expires_at` (timestamp)
      - `used` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for user data access
    - Add policies for verification codes

  3. Functions
    - Function to generate verification codes
    - Function to verify codes
    - Function to clean up expired codes
*/

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create email verification codes table
CREATE TABLE IF NOT EXISTS email_verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_codes ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Verification codes policies (more restrictive)
CREATE POLICY "Users can read own verification codes"
  ON email_verification_codes
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt() ->> 'email');

-- Function to generate verification code
CREATE OR REPLACE FUNCTION generate_verification_code(user_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  verification_code text;
BEGIN
  -- Generate 6-digit code
  verification_code := LPAD(floor(random() * 1000000)::text, 6, '0');
  
  -- Insert verification code
  INSERT INTO email_verification_codes (email, code)
  VALUES (user_email, verification_code);
  
  RETURN verification_code;
END;
$$;

-- Function to verify code
CREATE OR REPLACE FUNCTION verify_email_code(user_email text, input_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  code_record record;
BEGIN
  -- Find valid, unused code
  SELECT * INTO code_record
  FROM email_verification_codes
  WHERE email = user_email
    AND code = input_code
    AND expires_at > now()
    AND used = false
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF code_record IS NULL THEN
    RETURN false;
  END IF;
  
  -- Mark code as used
  UPDATE email_verification_codes
  SET used = true
  WHERE id = code_record.id;
  
  RETURN true;
END;
$$;

-- Function to clean up expired codes (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM email_verification_codes
  WHERE expires_at < now() - interval '1 hour';
END;
$$;

-- Create trigger to update user_profiles.updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();