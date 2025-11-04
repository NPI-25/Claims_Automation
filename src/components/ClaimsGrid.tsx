import { Claim } from '../lib/supabase';
import { ChevronUp, ChevronDown, Edit } from 'lucide-react';

interface ClaimsGridProps {
  claims: Claim[];
  onClaimClick: (claim: Claim) => void;
  onEdit?: (claim: Claim) => void;
  onSort: (field: string) => void;
  sortField: string;
  sortDirection: 'asc' | 'desc';
}

export default function ClaimsGrid({ claims, onClaimClick, onEdit, onSort, sortField, sortDirection }: ClaimsGridProps) {
  console.log('ClaimsGrid rendered with onEdit:', !!onEdit, 'claims:', claims.length);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatStatus = (status: string) => {
    if (status === 'rejected') return 'Returned';
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'under_review':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'requires_manual_review':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc'
      ? <ChevronUp className="w-4 h-4 inline ml-1" />
      : <ChevronDown className="w-4 h-4 inline ml-1" />;
  };

  const handleHeaderClick = (field: string) => {
    onSort(field);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                onClick={() => handleHeaderClick('claim_number')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 whitespace-nowrap"
              >
                Claim # <SortIcon field="claim_number" />
              </th>
              <th
                onClick={() => handleHeaderClick('policyholder_name')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 whitespace-nowrap"
              >
                Policyholder <SortIcon field="policyholder_name" />
              </th>
              <th
                onClick={() => handleHeaderClick('license_plate')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 whitespace-nowrap"
              >
                License Plate <SortIcon field="license_plate" />
              </th>
              <th
                onClick={() => handleHeaderClick('vehicle_make')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 whitespace-nowrap"
              >
                Vehicle <SortIcon field="vehicle_make" />
              </th>
              <th
                onClick={() => handleHeaderClick('accident_date')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 whitespace-nowrap"
              >
                Accident Date <SortIcon field="accident_date" />
              </th>
              <th
                onClick={() => handleHeaderClick('status')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 whitespace-nowrap"
              >
                Status <SortIcon field="status" />
              </th>
              <th
                onClick={() => handleHeaderClick('estimated_repair_cost')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 whitespace-nowrap"
              >
                Est. Cost <SortIcon field="estimated_repair_cost" />
              </th>
              <th
                onClick={() => handleHeaderClick('created_at')}
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 whitespace-nowrap"
              >
                Created <SortIcon field="created_at" />
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {claims.map((claim) => {
              const canEdit = claim.status === 'in_progress' || claim.status === 'rejected';
              if (canEdit) {
                console.log('Claim', claim.claim_number, 'can be edited. Status:', claim.status, 'onEdit exists:', !!onEdit);
              }
              return (
              <tr
                key={claim.id}
                onClick={() => onClaimClick(claim)}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{claim.claim_number}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm text-gray-900 dark:text-gray-100">{claim.policyholder_name}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm font-mono text-gray-900 dark:text-gray-100">{claim.license_plate || '-'}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {claim.vehicle_year} {claim.vehicle_make} {claim.vehicle_model}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{formatDate(claim.accident_date)}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(claim.status)}`}>
                    {formatStatus(claim.status)}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(claim.estimated_repair_cost)}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{formatDate(claim.created_at)}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  {onEdit ? (
                    claim.status === 'in_progress' || claim.status === 'rejected' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Edit button clicked for claim:', claim.claim_number, 'Status:', claim.status);
                          onEdit(claim);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-900/50"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-600" title={`Status: ${claim.status}`}>-</span>
                    )
                  ) : (
                    <span className="text-xs text-red-500">No handler</span>
                  )}
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>
      {claims.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="text-lg font-medium">No claims found</p>
          <p className="mt-1 text-sm">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}
