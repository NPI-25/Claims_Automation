import { useState, useEffect } from 'react';
import { supabase, Claim } from '../lib/supabase';
import { Search, AlertCircle, CheckCircle2, Clock, XCircle, Settings, Plus } from 'lucide-react';
import ClaimsGrid from './ClaimsGrid';
import SettingsModal from './SettingsModal';
import NewClaimModal, { ClaimMetadata } from './NewClaimModal';
import PhotoUploadModal from './PhotoUploadModal';
import DamageAssessmentModal from './DamageAssessmentModal';
import ClaimReviewModal from './ClaimReviewModal';
import { generateClaimNumber } from '../lib/claimUtils';
import { generateMockAssessment } from '../lib/mockAssessment';
import { PhotoAssessment } from '../types/assessment';

export default function ClaimsDashboard() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showNewClaim, setShowNewClaim] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showDamageAssessment, setShowDamageAssessment] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewMode, setReviewMode] = useState<'new' | 'view'>('new');
  const [currentClaimMetadata, setCurrentClaimMetadata] = useState<ClaimMetadata | null>(null);
  const [currentClaimNumber, setCurrentClaimNumber] = useState<string>('');
  const [currentAssessments, setCurrentAssessments] = useState<PhotoAssessment[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    fetchClaims();
  }, []);

  useEffect(() => {
    filterAndSortClaims();
  }, [claims, searchQuery, statusFilter, sortBy, sortDirection]);

  useEffect(() => {
    if (currentAssessments.length > 0 && !showPhotoUpload && !showReview) {
      console.log('Opening damage assessment modal with assessments:', currentAssessments.length);
      setShowDamageAssessment(true);
    }
  }, [currentAssessments, showPhotoUpload, showReview]);

  const fetchClaims = async () => {
    try {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClaims(data || []);
    } catch (error) {
      console.error('Error fetching claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortClaims = () => {
    let filtered = [...claims];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(claim =>
        claim.claim_number.toLowerCase().includes(query) ||
        claim.policyholder_name.toLowerCase().includes(query) ||
        claim.policy_number.toLowerCase().includes(query) ||
        claim.vehicle_make.toLowerCase().includes(query) ||
        claim.vehicle_model.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(claim => claim.status === statusFilter);
    }

    filtered.sort((a, b) => {
      let aVal: any = a[sortBy as keyof Claim];
      let bVal: any = b[sortBy as keyof Claim];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    setFilteredClaims(filtered);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'under_review':
        return <Clock className="w-5 h-5 text-indigo-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusCount = (status: string) => {
    return claims.filter(c => c.status === status).length;
  };

  const statusStats = [
    { label: 'In Progress', status: 'in_progress', count: getStatusCount('in_progress'), color: 'bg-gray-100 text-gray-800' },
    { label: 'Under Review', status: 'under_review', count: getStatusCount('under_review'), color: 'bg-indigo-100 text-indigo-800' },
    { label: 'Approved', status: 'approved', count: getStatusCount('approved'), color: 'bg-green-100 text-green-800' },
    { label: 'Claims Returned', status: 'rejected', count: getStatusCount('rejected'), color: 'bg-red-100 text-red-800' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading claims...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Claims Dashboard</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Manage and review insurance claims with AI-powered assessments</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNewClaim(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <Plus className="w-5 h-5" />
              New Claim
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-gray-800"
              title="Settings"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {statusStats.map((stat) => (
            <div key={stat.status} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stat.count}</p>
                </div>
                {getStatusIcon(stat.status)}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by claim number, name, policy, or vehicle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full lg:w-48 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="in_progress">In Progress</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Claims Returned</option>
              </select>
            </div>
          </div>

          <ClaimsGrid
            claims={filteredClaims}
            onClaimClick={(claim) => {
              setSelectedClaim(claim);
              setCurrentClaimNumber(claim.claim_number);
              setReviewMode('view');
              setShowReview(true);
            }}
            onEdit={(claim) => {
              console.log('Dashboard received edit request for claim:', claim.claim_number);
              setSelectedClaim(claim);
              setCurrentClaimNumber(claim.claim_number);
              setShowPhotoUpload(true);
            }}
            onSort={handleSort}
            sortField={sortBy}
            sortDirection={sortDirection}
          />
        </div>
      </div>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      <NewClaimModal
        isOpen={showNewClaim}
        onClose={() => setShowNewClaim(false)}
        onSubmit={async (metadata) => {
          const claimNumber = generateClaimNumber();
          setCurrentClaimNumber(claimNumber);
          setCurrentClaimMetadata(metadata);

          try {
            const { data: claimData, error } = await supabase
              .from('claims')
              .insert([{
                claim_number: claimNumber,
                policy_number: metadata.policyNumber,
                policyholder_name: metadata.claimantName,
                accident_date: metadata.accidentDate,
                vehicle_make: metadata.vehicleMake,
                vehicle_model: metadata.vehicleModel,
                vehicle_year: parseInt(metadata.vehicleYear),
                license_plate: metadata.licensePlate,
                incident_description: metadata.description,
                status: 'in_progress'
              }])
              .select()
              .single();

            if (error) throw error;

            setSelectedClaim(claimData);
            setShowNewClaim(false);
            setShowPhotoUpload(true);
            fetchClaims();
          } catch (error) {
            console.error('Error creating claim:', error);
            alert('Error creating claim. Please try again.');
          }
        }}
      />

      <PhotoUploadModal
        isOpen={showPhotoUpload}
        onClose={() => setShowPhotoUpload(false)}
        claimNumber={currentClaimNumber}
        onManualAssessment={(photos) => {
          console.log('Manual assessment selected', { currentClaimMetadata, photos });
          setShowPhotoUpload(false);
        }}
        onGenerateAssessment={async (photos) => {
          console.log('Generate clicked with photos:', photos.length);
          const assessments = await generateMockAssessment(photos);
          console.log('Generated assessments:', assessments);
          setShowPhotoUpload(false);
          setCurrentAssessments(assessments);
        }}
      />

      <DamageAssessmentModal
        isOpen={showDamageAssessment}
        onClose={() => {
          setShowDamageAssessment(false);
          setCurrentAssessments([]);
        }}
        claimNumber={currentClaimNumber}
        assessments={currentAssessments}
        onReviewSubmit={(assessments) => {
          setCurrentAssessments(assessments);
          setShowDamageAssessment(false);
          setReviewMode('new');
          setShowReview(true);
        }}
      />

      <ClaimReviewModal
        isOpen={showReview}
        mode={reviewMode}
        onClose={() => {
          setShowReview(false);
          setSelectedClaim(null);
          setCurrentAssessments([]);
        }}
        onBack={reviewMode === 'new' ? () => {
          setShowReview(false);
          setShowDamageAssessment(true);
        } : undefined}
        onSubmit={reviewMode === 'new' ? async () => {
          if (!selectedClaim) return;

          try {
            const allDamageItems = currentAssessments.flatMap(assessment => assessment.damages);
            const totalEstimate = allDamageItems.reduce((sum, item) => sum + (item.adjustedCost || item.estimatedCost), 0);

            const { error: claimError } = await supabase
              .from('claims')
              .update({
                estimated_repair_cost: totalEstimate,
                status: 'under_review'
              })
              .eq('id', selectedClaim.id);

            if (claimError) throw claimError;

            const { error: assessmentError } = await supabase
              .from('claim_assessment_details')
              .upsert({
                claim_id: selectedClaim.id,
                assessment_data: currentAssessments
              }, {
                onConflict: 'claim_id'
              });

            if (assessmentError) throw assessmentError;

            // Clear all modal states
            setShowReview(false);
            setShowDamageAssessment(false);
            setShowPhotoUpload(false);
            setSelectedClaim(null);
            setCurrentAssessments([]);
            setCurrentClaimMetadata(null);
            setCurrentClaimNumber('');
            setSuccessMessage('Claim Submitted for Approval');

            setTimeout(() => {
              setSuccessMessage('');
            }, 5000);

            fetchClaims();
          } catch (error) {
            console.error('Error submitting claim:', error);
            alert('Error submitting claim. Please try again.');
          }
        } : undefined}
        claimNumber={currentClaimNumber}
        claimMetadata={currentClaimMetadata || undefined}
        assessments={currentAssessments}
        existingClaim={reviewMode === 'view' ? selectedClaim || undefined : undefined}
      />
    </div>
  );
}
