/*
  # Add medications table

  1. New Tables
    - `medications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `name` (text, medication name)
      - `dosage` (text, dosage information)
      - `frequency` (text, how often to take)
      - `notes` (text, optional additional notes)
      - `active` (boolean, whether medication is currently being taken)
      - `start_date` (date, when medication was started)
      - `end_date` (date, when medication was stopped, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `medications` table
    - Add policies for authenticated users to manage their own medications

  3. Indexes
    - Add index on user_id for efficient queries
    - Add index on active status for filtering
*/

-- Create medications table
CREATE TABLE IF NOT EXISTS medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  dosage text NOT NULL,
  frequency text NOT NULL,
  notes text,
  active boolean DEFAULT true,
  start_date date DEFAULT CURRENT_DATE,
  end_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

-- Create policies for medications
CREATE POLICY "Users can view own medications"
  ON medications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own medications"
  ON medications
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own medications"
  ON medications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own medications"
  ON medications
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medications_user_id ON medications(user_id);
CREATE INDEX IF NOT EXISTS idx_medications_active ON medications(active);
CREATE INDEX IF NOT EXISTS idx_medications_user_active ON medications(user_id, active);

-- Create trigger to update medications.updated_at
CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON medications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add constraint to ensure end_date is after start_date
ALTER TABLE medications 
ADD CONSTRAINT check_medication_dates 
CHECK (end_date IS NULL OR end_date >= start_date);