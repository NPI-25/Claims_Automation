/*
  # Add license plate and additional fields for grid view
  
  1. Changes
    - Add license_plate column to claims table
    - Add vehicle_vin column for VIN tracking
    - Update existing claims with sample license plate data
  
  2. Notes
    - License plate format varies by state
    - VIN is optional but useful for verification
*/

-- Add new columns
ALTER TABLE claims
ADD COLUMN IF NOT EXISTS license_plate text,
ADD COLUMN IF NOT EXISTS vehicle_vin text;

-- Update existing claims with sample license plate data
UPDATE claims
SET license_plate = CASE claim_number
  WHEN 'CLM-2024-001' THEN 'ABC-1234'
  WHEN 'CLM-2024-002' THEN 'XYZ-5678'
  WHEN 'CLM-2024-003' THEN 'DEF-9012'
  WHEN 'CLM-2024-004' THEN 'GHI-3456'
  WHEN 'CLM-2024-005' THEN 'JKL-7890'
  ELSE 'UNK-0000'
END
WHERE license_plate IS NULL;
