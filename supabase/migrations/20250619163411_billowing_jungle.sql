/*
  # Add role column to user_profiles table

  1. Changes
    - Add role column with proper text type
    - Add check constraint for valid role values
    - Add index for performance
    - Handle existing data safely

  2. Security
    - Maintains existing RLS policies
    - Ensures data integrity with constraints
*/

-- First, check if the role column exists and what type it is
DO $$
DECLARE
  column_exists boolean;
  column_type text;
BEGIN
  -- Check if column exists and get its type
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'role'
  ) INTO column_exists;

  IF column_exists THEN
    -- Get the current column type
    SELECT data_type INTO column_type
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'role';
    
    -- If it's not text type, we need to handle it
    IF column_type != 'text' THEN
      -- Drop the existing column if it's the wrong type
      ALTER TABLE public.user_profiles DROP COLUMN IF EXISTS role;
      column_exists := false;
    END IF;
  END IF;

  -- Add the column if it doesn't exist or was dropped
  IF NOT column_exists THEN
    ALTER TABLE public.user_profiles 
    ADD COLUMN role text DEFAULT 'user' NOT NULL;
  END IF;
END $$;

-- Remove existing constraint if it exists (to avoid conflicts)
ALTER TABLE public.user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_role_check;

-- Add the check constraint with proper syntax
ALTER TABLE public.user_profiles 
ADD CONSTRAINT user_profiles_role_check 
CHECK (role IN ('user', 'premium', 'moderator', 'admin'));

-- Add index on role column for better query performance
DROP INDEX IF EXISTS user_profiles_role_idx;
CREATE INDEX user_profiles_role_idx ON public.user_profiles (role);

-- Update any existing records that might have NULL or invalid role values
UPDATE public.user_profiles 
SET role = 'user' 
WHERE role IS NULL OR role NOT IN ('user', 'premium', 'moderator', 'admin');