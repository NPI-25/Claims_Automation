import { X, ArrowLeft, FileCheck, ImageOff, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PhotoAssessment, DamageItem } from '../types/assessment';
import { ClaimMetadata } from './NewClaimModal';
import { Claim, supabase } from '../lib/supabase';

interface ClaimReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  onSubmit?: () => void;
  claimNumber: string;
  claimMetadata?: ClaimMetadata;
  assessments?: PhotoAssessment[];
  existingClaim?: Claim;
  mode: 'new' | 'view';
}

export default function ClaimReviewModal({
  isOpen,
  onClose,
  onBack,
  onSubmit,
  claimNumber,
  claimMetadata,
  assessments = [],
  existingClaim,
  mode
}: ClaimReviewModalProps) {
  const [loadedAssessments, setLoadedAssessments] = useState<PhotoAssessment[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (mode === 'view' && existingClaim && isOpen) {
      loadExistingClaimData();
    } else if (mode === 'new') {
      setLoadedAssessments(assessments);
    }
  }, [mode, existingClaim, isOpen, assessments]);

  const loadExistingClaimData = async () => {
    if (!existingClaim) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('claim_assessment_details')
        .select('assessment_data')
        .eq('claim_id', existingClaim.id)
        .maybeSingle();

      if (error) throw error;

      if (data?.assessment_data) {
        setLoadedAssessments(data.assessment_data as PhotoAssessment[]);
      }
    } catch (error) {
      console.error('Error loading assessment data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const displayAssessments = mode === 'view' ? loadedAssessments : assessments;
  const allDamageItems: DamageItem[] = displayAssessments.flatMap(assessment => assessment.damages);
  const totalEstimate = allDamageItems.reduce((sum, item) => sum + (item.adjustedCost || item.estimatedCost), 0);

  const isSubmittable = mode === 'new' || (existingClaim?.status === 'in_progress');

  const displayMetadata = existingClaim ? {
    policyNumber: existingClaim.policy_number,
    claimantName: existingClaim.policyholder_name,
    accidentDate: existingClaim.accident_date,
    vehicleMake: existingClaim.vehicle_make,
    vehicleModel: existingClaim.vehicle_model,
    vehicleYear: existingClaim.vehicle_year.toString(),
    licensePlate: existingClaim.license_plate || '',
    description: existingClaim.incident_description || ''
  } : claimMetadata;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600 dark:border-gray-700">
          <div className="flex items-center gap-4">
            {mode === 'new' && onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {mode === 'new' ? 'Review Claim' : 'Claim Details'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">Claim #{claimNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Claim Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Claim Information</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Policy Number</p>
                    <p className="font-medium text-gray-900 dark:text-white">{displayMetadata?.policyNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Claimant Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">{displayMetadata?.claimantName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Accident Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {displayMetadata?.accidentDate ? new Date(displayMetadata.accidentDate).toLocaleDateString() : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Vehicle</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {displayMetadata?.vehicleYear} {displayMetadata?.vehicleMake} {displayMetadata?.vehicleModel}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">License Plate</p>
                    <p className="font-medium text-gray-900 dark:text-white">{displayMetadata?.licensePlate || '-'}</p>
                  </div>
                  {existingClaim && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                      <p className="font-medium text-gray-900 capitalize">
                        {existingClaim.status.replace('_', ' ')}
                      </p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Description</p>
                    <p className="font-medium text-gray-900 dark:text-white">{displayMetadata?.description}</p>
                  </div>
                </div>
              </div>

              {/* Photo Gallery */}
              {displayAssessments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Photos ({displayAssessments.length})
                  </h3>
                  <div className="grid grid-cols-4 gap-4">
                    {displayAssessments.map((assessment, index) => {
                      const isBlobUrl = assessment.photoUrl?.startsWith('blob:');
                      const shouldShowPlaceholder = isBlobUrl || imageErrors.has(index) || !assessment.photoUrl;

                      return (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-100">
                          {shouldShowPlaceholder ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200">
                              <ImageOff className="w-12 h-12 text-gray-400 mb-2" />
                              <p className="text-xs text-gray-500 text-center px-2">
                                {mode === 'new' ? 'Preview not available' : 'Photo stored'}
                              </p>
                            </div>
                          ) : (
                            <img
                              src={assessment.photoUrl}
                              alt={`Photo ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={() => {
                                setImageErrors(prev => new Set(prev).add(index));
                              }}
                            />
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                            <p className="text-xs text-white font-medium">Photo {index + 1}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Itemized Repair Estimate */}
              {allDamageItems.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Itemized Repair Estimate</h3>
                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Location</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Damage</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Original</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Adjusted</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {allDamageItems.map((item) => {
                          const hasAdjustment = item.adjustedCost !== undefined && item.adjustedCost !== item.estimatedCost;
                          return (
                            <tr key={item.id} className="hover:bg-gray-50 dark:bg-gray-800">
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.location}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.damage}</td>
                              <td className={`px-4 py-3 text-sm text-right ${hasAdjustment ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                ${item.estimatedCost.toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">
                                ${(item.adjustedCost || item.estimatedCost).toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                {item.adjustmentReason || '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-gray-50 dark:bg-gray-700 border-t-2 border-gray-300">
                        <tr>
                          <td colSpan={3} className="px-4 py-3 text-right text-base font-semibold text-gray-900 dark:text-white">
                            Total Estimate:
                          </td>
                          <td className="px-4 py-3 text-right text-lg font-bold text-blue-600">
                            ${totalEstimate.toLocaleString()}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* Agent Notes Summary */}
              {displayAssessments.some(assessment => assessment.agentNotes) && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Agent Notes</h3>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200">
                    <ul className="space-y-2">
                      {displayAssessments.map((assessment, index) => {
                        if (!assessment.agentNotes || !assessment.agentNotes.trim()) return null;
                        return (
                          <li key={index} className="flex gap-3">
                            <span className="text-gray-600 font-medium shrink-0">Photo {assessment.photoIndex + 1}:</span>
                            <span className="text-gray-900 dark:text-white">{assessment.agentNotes}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {mode === 'new' && onBack && onSubmit && (
          <div className="border-t border-gray-200 dark:border-gray-600 p-6 bg-gray-50 dark:bg-gray-800">
            <div className="flex justify-between items-center">
              <button
                onClick={onBack}
                className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
              >
                Back to Adjustments
              </button>
              <button
                onClick={onSubmit}
                disabled={!isSubmittable}
                className={`px-8 py-3 rounded-lg transition-colors font-semibold flex items-center gap-2 ${
                  isSubmittable
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <FileCheck className="w-5 h-5" />
                Submit for Approval
              </button>
            </div>
          </div>
        )}

        {mode === 'view' && existingClaim && (
          <div className="border-t border-gray-200 dark:border-gray-600 p-6 bg-gray-50 dark:bg-gray-800">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
