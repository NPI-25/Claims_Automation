/*
  # Update Claim Status Values

  ## Overview
  This migration updates the claim status to replace "pending_review" with "in_progress".
  The "in_progress" status represents claims that have been initiated by a claims agent
  but have not yet been submitted for approval.

  ## Changes
  1. Drops the old constraint
  2. Updates existing records from 'pending_review' to 'in_progress'
  3. Adds the new constraint with updated status values
  4. Updates the default status to 'in_progress'

  ## Security
  - No RLS changes needed
*/

-- Drop the old constraint
ALTER TABLE claims DROP CONSTRAINT IF EXISTS valid_status;

-- Update any existing records with pending_review to in_progress
UPDATE claims 
SET status = 'in_progress' 
WHERE status = 'pending_review';

-- Add the new constraint with updated status values
ALTER TABLE claims ADD CONSTRAINT valid_status 
  CHECK (status IN ('in_progress', 'under_review', 'approved', 'rejected', 'requires_manual_review'));

-- Update the default status
ALTER TABLE claims ALTER COLUMN status SET DEFAULT 'in_progress';