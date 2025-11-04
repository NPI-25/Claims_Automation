import { Claim } from '../lib/supabase';
import { Calendar, Car, DollarSign, User, TrendingUp, Edit } from 'lucide-react';

interface ClaimCardProps {
  claim: Claim;
  onClick: () => void;
  onEdit?: (claim: Claim) => void;
}

export default function ClaimCard({ claim, onClick, onEdit }: ClaimCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'under_review':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'requires_manual_review':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (score: number | null) => {
    if (!score) return 'text-gray-600';
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-indigo-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatStatus = (status: string) => {
    if (status === 'rejected') return 'Claim Returned';
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const canEdit = claim.status === 'in_progress' || claim.status === 'rejected';

  return (
    <div
      onClick={onClick}
      className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{claim.claim_number}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(claim.status)}`}>
                  {formatStatus(claim.status)}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(claim.priority)}`}>
                  {claim.priority.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{claim.policyholder_name}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Car className="w-4 h-4" />
                  <span>{claim.vehicle_year} {claim.vehicle_make} {claim.vehicle_model}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(claim.accident_date)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-semibold">{formatCurrency(claim.estimated_repair_cost)}</span>
                </div>
              </div>

              {claim.incident_description && (
                <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                  {claim.incident_description}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {canEdit && onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(claim);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Edit className="w-4 h-4" />
              Edit Claim
            </button>
          )}

          {claim.ai_confidence_score !== null && (
            <div className="flex items-center gap-2">
              <TrendingUp className={`w-5 h-5 ${getConfidenceColor(claim.ai_confidence_score)}`} />
              <span className={`text-sm font-semibold ${getConfidenceColor(claim.ai_confidence_score)}`}>
                {claim.ai_confidence_score.toFixed(1)}% Confidence
              </span>
            </div>
          )}

          {claim.assigned_to && (
            <div className="text-sm text-gray-600">
              Assigned to: <span className="font-medium">{claim.assigned_to}</span>
            </div>
          )}

          <div className="text-xs text-gray-500">
            Created {formatDate(claim.created_at)}
          </div>
        </div>
      </div>
    </div>
  );
}
