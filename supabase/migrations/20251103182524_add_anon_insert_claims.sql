/*
  # Add Anonymous Insert Access for Claims

  ## Overview
  This migration adds policies to allow anonymous users to insert claims and related data.
  This is necessary for the new claim workflow where claims are created immediately
  after the first step.

  ## Changes
  1. Add INSERT policy for anonymous users on claims table
  2. Add INSERT policy for anonymous users on claim_assessment_details table
  3. Add UPDATE policy for anonymous users on claims table (to update status)

  ## Security
  - Anonymous users can create and update claims
  - This allows the workflow to function without authentication
  - In production, you may want to add authentication
*/

-- Allow anonymous users to insert claims
CREATE POLICY "Anyone can insert claims"
  ON claims
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to update claims
CREATE POLICY "Anyone can update claims"
  ON claims
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Allow anonymous users to insert assessment details
CREATE POLICY "Anyone can insert assessment details"
  ON claim_assessment_details
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to view assessment details
CREATE POLICY "Anyone can view assessment details"
  ON claim_assessment_details
  FOR SELECT
  TO anon
  USING (true);