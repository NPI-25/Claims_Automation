/*
  # Add Claim Assessment Details Table

  ## Overview
  This migration adds a table to store detailed assessment data including itemized damage repairs,
  photos, and adjustments made by claims agents during the review process.

  ## New Tables
  
  ### `claim_assessment_details`
  - `id` (uuid, primary key) - Unique identifier
  - `claim_id` (uuid, foreign key) - Associated claim
  - `assessment_data` (jsonb) - Complete assessment data including photos, damages, and adjustments
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - RLS enabled
  - Policies allow authenticated users to read/write assessment details
*/

-- Create claim_assessment_details table
CREATE TABLE IF NOT EXISTS claim_assessment_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id uuid NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  assessment_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_assessment_details_claim_id ON claim_assessment_details(claim_id);

-- Enable Row Level Security
ALTER TABLE claim_assessment_details ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Claims agents can view assessment details"
  ON claim_assessment_details FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Claims agents can insert assessment details"
  ON claim_assessment_details FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Claims agents can update assessment details"
  ON claim_assessment_details FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);