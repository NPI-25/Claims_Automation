/*
  # Add Unique Constraint to Claim Assessment Details

  ## Overview
  Prevents duplicate assessment records for the same claim by adding a unique constraint
  on the claim_id column.

  ## Changes
  1. Add unique constraint on claim_id in claim_assessment_details table
  2. This ensures each claim can only have one assessment record

  ## Security
  - Maintains data integrity by preventing duplicate assessments
*/

-- Add unique constraint to prevent duplicate assessments per claim
ALTER TABLE claim_assessment_details 
ADD CONSTRAINT claim_assessment_details_claim_id_key UNIQUE (claim_id);