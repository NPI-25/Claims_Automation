import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Claim {
  id: string;
  claim_number: string;
  policy_number: string;
  policyholder_name: string;
  policyholder_email: string | null;
  policyholder_phone: string | null;
  accident_date: string;
  license_plate: string | null;
  vehicle_vin: string | null;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  status: 'in_progress' | 'under_review' | 'approved' | 'rejected';
  estimated_repair_cost: number | null;
  final_approved_amount: number | null;
  incident_description: string | null;
  created_at: string;
  updated_at: string;
  assigned_to: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
}

export interface AIAssessment {
  id: string;
  claim_id: string;
  assessment_timestamp: string;
  damage_type: string;
  damage_severity: string;
  affected_parts: string[];
  estimated_cost: number;
  confidence_score: number;
  ai_model_version: string;
  raw_ai_response: any;
}

export interface ClaimNote {
  id: string;
  claim_id: string;
  note_text: string;
  created_by: string;
  created_at: string;
  note_type: string;
}

export interface DamageImage {
  id: string;
  claim_id: string;
  image_url: string;
  upload_timestamp: string;
  image_type: string | null;
  order_index: number;
}
