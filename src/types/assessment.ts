export interface BoundingBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

export interface DamageItem {
  id: string;
  location: string;
  damage: string;
  estimatedCost: number;
  adjustedCost?: number;
  adjustmentReason?: string;
}

export interface PhotoAssessment {
  photoIndex: number;
  photoUrl: string;
  boundingBoxes: BoundingBox[];
  damages: DamageItem[];
  agentNotes: string;
}

export interface ClaimAssessment {
  claimNumber: string;
  photos: PhotoAssessment[];
  totalEstimate: number;
  totalAdjusted: number;
}
