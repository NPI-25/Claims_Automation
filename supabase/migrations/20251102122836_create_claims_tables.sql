/*
  # Claims Management System - Initial Schema

  ## Overview
  This migration creates the foundational tables for the AI-powered insurance claims management system.

  ## New Tables

  ### `claims`
  Core claims table containing all claim information
  - `id` (uuid, primary key) - Unique claim identifier
  - `claim_number` (text, unique) - Human-readable claim number (e.g., CLM-2024-001)
  - `policy_number` (text) - Associated policy number
  - `policyholder_name` (text) - Name of the policyholder
  - `policyholder_email` (text) - Contact email
  - `policyholder_phone` (text) - Contact phone
  - `accident_date` (date) - Date of accident
  - `vehicle_make` (text) - Vehicle manufacturer
  - `vehicle_model` (text) - Vehicle model
  - `vehicle_year` (integer) - Vehicle year
  - `status` (text) - Claim status: pending_review, under_review, approved, rejected, requires_manual_review
  - `priority` (text) - Priority level: low, medium, high, urgent
  - `ai_confidence_score` (numeric) - AI assessment confidence (0-100)
  - `estimated_repair_cost` (numeric) - AI-generated cost estimate
  - `final_approved_amount` (numeric) - Final approved amount
  - `incident_description` (text) - Description of the accident
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  - `assigned_to` (text) - Claims agent assigned
  - `reviewed_by` (text) - Agent who reviewed
  - `reviewed_at` (timestamptz) - Review timestamp

  ### `damage_images`
  Stores uploaded damage images for claims
  - `id` (uuid, primary key) - Unique image identifier
  - `claim_id` (uuid, foreign key) - Associated claim
  - `image_url` (text) - URL/path to stored image
  - `upload_timestamp` (timestamptz) - Upload time
  - `image_type` (text) - Type: front, rear, side, interior, detail
  - `order_index` (integer) - Display order

  ### `ai_assessments`
  AI-generated damage assessments
  - `id` (uuid, primary key) - Unique assessment identifier
  - `claim_id` (uuid, foreign key) - Associated claim
  - `assessment_timestamp` (timestamptz) - When assessment was generated
  - `damage_type` (text) - Type: scratch, dent, structural, paint, glass, mechanical
  - `damage_severity` (text) - Severity: minor, moderate, severe, total_loss
  - `affected_parts` (jsonb) - Array of affected vehicle parts
  - `estimated_cost` (numeric) - Estimated repair cost for this damage
  - `confidence_score` (numeric) - Confidence in this assessment (0-100)
  - `ai_model_version` (text) - Version of AI model used
  - `raw_ai_response` (jsonb) - Full AI response data

  ### `claim_notes`
  Notes and comments added by claims agents
  - `id` (uuid, primary key) - Unique note identifier
  - `claim_id` (uuid, foreign key) - Associated claim
  - `note_text` (text) - Note content
  - `created_by` (text) - Agent who created note
  - `created_at` (timestamptz) - Creation timestamp
  - `note_type` (text) - Type: general, follow_up, decision, internal

  ### `claim_history`
  Audit trail of all claim changes
  - `id` (uuid, primary key) - Unique history identifier
  - `claim_id` (uuid, foreign key) - Associated claim
  - `changed_by` (text) - User who made change
  - `changed_at` (timestamptz) - Change timestamp
  - `action` (text) - Action: created, updated, approved, rejected, reassigned
  - `field_changed` (text) - Which field was modified
  - `old_value` (text) - Previous value
  - `new_value` (text) - New value

  ## Security
  - RLS enabled on all tables
  - Policies restrict access to authenticated users only
  - Claims agents can view all claims
  - Claims agents can update claims and add notes
  - Full audit trail maintained
*/

-- Create claims table
CREATE TABLE IF NOT EXISTS claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_number text UNIQUE NOT NULL,
  policy_number text NOT NULL,
  policyholder_name text NOT NULL,
  policyholder_email text,
  policyholder_phone text,
  accident_date date NOT NULL,
  vehicle_make text NOT NULL,
  vehicle_model text NOT NULL,
  vehicle_year integer NOT NULL,
  status text NOT NULL DEFAULT 'pending_review',
  priority text NOT NULL DEFAULT 'medium',
  ai_confidence_score numeric(5,2),
  estimated_repair_cost numeric(10,2),
  final_approved_amount numeric(10,2),
  incident_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  assigned_to text,
  reviewed_by text,
  reviewed_at timestamptz,
  CONSTRAINT valid_status CHECK (status IN ('pending_review', 'under_review', 'approved', 'rejected', 'requires_manual_review')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  CONSTRAINT valid_confidence CHECK (ai_confidence_score >= 0 AND ai_confidence_score <= 100),
  CONSTRAINT valid_year CHECK (vehicle_year >= 1900 AND vehicle_year <= 2100)
);

-- Create damage_images table
CREATE TABLE IF NOT EXISTS damage_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id uuid NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  upload_timestamp timestamptz DEFAULT now(),
  image_type text,
  order_index integer DEFAULT 0,
  CONSTRAINT valid_image_type CHECK (image_type IN ('front', 'rear', 'side', 'interior', 'detail', 'other'))
);

-- Create ai_assessments table
CREATE TABLE IF NOT EXISTS ai_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id uuid NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  assessment_timestamp timestamptz DEFAULT now(),
  damage_type text NOT NULL,
  damage_severity text NOT NULL,
  affected_parts jsonb DEFAULT '[]'::jsonb,
  estimated_cost numeric(10,2) NOT NULL,
  confidence_score numeric(5,2) NOT NULL,
  ai_model_version text DEFAULT 'v1.0',
  raw_ai_response jsonb,
  CONSTRAINT valid_damage_type CHECK (damage_type IN ('scratch', 'dent', 'structural', 'paint', 'glass', 'mechanical', 'other')),
  CONSTRAINT valid_severity CHECK (damage_severity IN ('minor', 'moderate', 'severe', 'total_loss')),
  CONSTRAINT valid_confidence CHECK (confidence_score >= 0 AND confidence_score <= 100)
);

-- Create claim_notes table
CREATE TABLE IF NOT EXISTS claim_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id uuid NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  note_text text NOT NULL,
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now(),
  note_type text DEFAULT 'general',
  CONSTRAINT valid_note_type CHECK (note_type IN ('general', 'follow_up', 'decision', 'internal'))
);

-- Create claim_history table
CREATE TABLE IF NOT EXISTS claim_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id uuid NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  changed_by text NOT NULL,
  changed_at timestamptz DEFAULT now(),
  action text NOT NULL,
  field_changed text,
  old_value text,
  new_value text,
  CONSTRAINT valid_action CHECK (action IN ('created', 'updated', 'approved', 'rejected', 'reassigned', 'status_changed', 'note_added'))
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_priority ON claims(priority);
CREATE INDEX IF NOT EXISTS idx_claims_assigned_to ON claims(assigned_to);
CREATE INDEX IF NOT EXISTS idx_claims_created_at ON claims(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_claims_claim_number ON claims(claim_number);
CREATE INDEX IF NOT EXISTS idx_damage_images_claim_id ON damage_images(claim_id);
CREATE INDEX IF NOT EXISTS idx_ai_assessments_claim_id ON ai_assessments(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_notes_claim_id ON claim_notes(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_history_claim_id ON claim_history(claim_id);

-- Enable Row Level Security
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE damage_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for claims table
CREATE POLICY "Claims agents can view all claims"
  ON claims FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Claims agents can insert claims"
  ON claims FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Claims agents can update claims"
  ON claims FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for damage_images table
CREATE POLICY "Claims agents can view all damage images"
  ON damage_images FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Claims agents can insert damage images"
  ON damage_images FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for ai_assessments table
CREATE POLICY "Claims agents can view all AI assessments"
  ON ai_assessments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Claims agents can insert AI assessments"
  ON ai_assessments FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for claim_notes table
CREATE POLICY "Claims agents can view all notes"
  ON claim_notes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Claims agents can insert notes"
  ON claim_notes FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for claim_history table
CREATE POLICY "Claims agents can view claim history"
  ON claim_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Claims agents can insert claim history"
  ON claim_history FOR INSERT
  TO authenticated
  WITH CHECK (true);