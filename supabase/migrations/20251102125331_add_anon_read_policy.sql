/*
  # Add anonymous read access for claims
  
  1. Changes
    - Add policy to allow anonymous (anon) users to read claims
    - This enables the dashboard to display claims without authentication
  
  2. Security
    - Only SELECT access is granted to anonymous users
    - INSERT, UPDATE, DELETE still require authentication
*/

-- Add policy for anonymous users to read claims
CREATE POLICY "Anyone can view claims"
  ON claims
  FOR SELECT
  TO anon
  USING (true);

-- Add policies for other tables that need anonymous access
CREATE POLICY "Anyone can view AI assessments"
  ON ai_assessments
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can view claim notes"
  ON claim_notes
  FOR SELECT
  TO anon
  USING (true);
