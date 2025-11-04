import { X, ChevronLeft, ChevronRight, Edit2, Check, ImageOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PhotoAssessment, DamageItem } from '../types/assessment';

interface DamageAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmit: (assessments: PhotoAssessment[]) => void;
  claimNumber: string;
  assessments: PhotoAssessment[];
}

export default function DamageAssessmentModal({
  isOpen,
  onClose,
  onReviewSubmit,
  claimNumber,
  assessments: initialAssessments
}: DamageAssessmentModalProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [assessments, setAssessments] = useState<PhotoAssessment[]>(initialAssessments);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [editingDamageId, setEditingDamageId] = useState<string | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState<string>('');
  const [adjustmentReason, setAdjustmentReason] = useState<string>('');

  useEffect(() => {
    if (initialAssessments.length > 0) {
      setAssessments(initialAssessments);
      setCurrentPhotoIndex(0);
    }
  }, [initialAssessments]);

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

  if (!isOpen || !assessments || assessments.length === 0) {
    console.log('DamageAssessmentModal not rendering:', { isOpen, assessments: assessments?.length });
    return null;
  }

  console.log('DamageAssessmentModal rendering with:', { isOpen, assessmentsCount: assessments.length });

  const currentAssessment = assessments[currentPhotoIndex];
  const isLastPhoto = currentPhotoIndex === assessments.length - 1;
  const isFirstPhoto = currentPhotoIndex === 0;

  const handleNext = () => {
    if (!isLastPhoto) {
      setCurrentPhotoIndex(prev => prev + 1);
      resetEditState();
    }
  };

  const handlePrevious = () => {
    if (!isFirstPhoto) {
      setCurrentPhotoIndex(prev => prev - 1);
      resetEditState();
    }
  };

  const resetEditState = () => {
    setEditingDamageId(null);
    setAdjustmentAmount('');
    setAdjustmentReason('');
  };

  const handleNotesChange = (notes: string) => {
    const updatedAssessments = [...assessments];
    updatedAssessments[currentPhotoIndex].agentNotes = notes;
    setAssessments(updatedAssessments);
  };

  const startEditingDamage = (damage: DamageItem) => {
    setEditingDamageId(damage.id);
    setAdjustmentAmount(damage.adjustedCost?.toString() || damage.estimatedCost.toString());
    setAdjustmentReason(damage.adjustmentReason || '');
  };

  const saveAdjustment = (damageId: string) => {
    const updatedAssessments = [...assessments];
    const damageIndex = updatedAssessments[currentPhotoIndex].damages.findIndex(d => d.id === damageId);

    if (damageIndex !== -1) {
      const newCost = parseFloat(adjustmentAmount) || 0;
      updatedAssessments[currentPhotoIndex].damages[damageIndex].adjustedCost = newCost;
      updatedAssessments[currentPhotoIndex].damages[damageIndex].adjustmentReason = adjustmentReason;
      setAssessments(updatedAssessments);
    }

    resetEditState();
  };

  const calculateTotalEstimate = () => {
    return currentAssessment.damages.reduce((sum, damage) => {
      return sum + (damage.adjustedCost ?? damage.estimatedCost);
    }, 0);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl mx-4 max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Claim {claimNumber}: Photo {currentPhotoIndex + 1}/{assessments.length}
            </h2>
            <p className="text-sm text-gray-600 mt-1">AI Damage Assessment</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Damage Detection</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm text-gray-600">Show Bounding Boxes</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={showBoundingBoxes}
                      onChange={(e) => setShowBoundingBoxes(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`w-11 h-6 rounded-full transition-colors ${
                        showBoundingBoxes ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                          showBoundingBoxes ? 'transform translate-x-5' : ''
                        }`}
                      />
                    </div>
                  </div>
                </label>
              </div>

              <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-[4/3]">
                {currentAssessment.photoUrl && !currentAssessment.photoUrl.startsWith('blob:') ? (
                  <>
                    <img
                      src={currentAssessment.photoUrl}
                      alt={`Damage photo ${currentPhotoIndex + 1}`}
                      className="w-full h-full object-contain"
                    />
                    {showBoundingBoxes && (
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        {currentAssessment.boundingBoxes.map((box) => (
                          <g key={box.id}>
                            <rect
                              x={`${box.x}%`}
                              y={`${box.y}%`}
                              width={`${box.width}%`}
                              height={`${box.height}%`}
                              fill="none"
                              stroke="#ef4444"
                              strokeWidth="3"
                              opacity="0.8"
                            />
                            <rect
                              x={`${box.x}%`}
                              y={`${box.y}%`}
                              width={`${box.width}%`}
                              height="20"
                              fill="#ef4444"
                              opacity="0.8"
                            />
                            <text
                              x={`${box.x + 1}%`}
                              y={`${box.y}%`}
                              dy="15"
                              fill="white"
                              fontSize="12"
                              fontWeight="bold"
                            >
                              {box.label}
                            </text>
                          </g>
                        ))}
                      </svg>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800">
                    <ImageOff className="w-16 h-16 text-gray-500 mb-3" />
                    <p className="text-gray-400 text-sm">Photo stored</p>
                    <p className="text-gray-500 text-xs mt-1">Preview not available</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Damage Assessment</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                          Location on Vehicle
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                          Identified Damage
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                          Repair Estimate
                        </th>
                        <th className="px-4 py-3 w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentAssessment.damages.map((damage) => (
                        <tr key={damage.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{damage.location}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{damage.damage}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="space-y-1">
                              <div className={damage.adjustedCost ? 'text-gray-500 line-through' : 'font-semibold text-gray-900'}>
                                ${damage.estimatedCost.toLocaleString()}
                              </div>
                              {damage.adjustedCost && (
                                <div className="font-semibold text-indigo-600">
                                  ${damage.adjustedCost.toLocaleString()}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => startEditingDamage(damage)}
                              className="text-indigo-600 hover:text-indigo-700"
                              title="Adjust estimate"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-semibold">
                        <td colSpan={2} className="px-4 py-3 text-sm text-gray-900">
                          Total for this photo
                        </td>
                        <td className="px-4 py-3 text-sm text-indigo-600">
                          ${calculateTotalEstimate().toLocaleString()}
                        </td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {editingDamageId && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Adjust Estimate</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Estimate
                      </label>
                      <input
                        type="number"
                        value={adjustmentAmount}
                        onChange={(e) => setAdjustmentAmount(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter new amount"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reason for Adjustment
                      </label>
                      <textarea
                        value={adjustmentReason}
                        onChange={(e) => setAdjustmentReason(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        placeholder="Explain why you adjusted the estimate..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveAdjustment(editingDamageId)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Save Adjustment
                      </button>
                      <button
                        onClick={resetEditState}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Additional Notes
                </label>
                <p className="text-sm text-gray-600 italic mb-2">
                  Any additional notes from the claims agent
                </p>
                <textarea
                  value={currentAssessment.agentNotes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Add any observations, concerns, or additional information..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={isFirstPhoto}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            {isLastPhoto ? (
              <button
                onClick={() => onReviewSubmit(assessments)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Review and Submit
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Next Photo
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
