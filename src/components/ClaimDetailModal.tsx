import { useState, useEffect } from 'react';
import { X, User, Car, Calendar, DollarSign, FileText, AlertCircle, CheckCircle2, TrendingUp, MessageSquare, Clock } from 'lucide-react';
import { supabase, Claim, AIAssessment, ClaimNote } from '../lib/supabase';

interface ClaimDetailModalProps {
  claim: Claim;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ClaimDetailModal({ claim, onClose, onUpdate }: ClaimDetailModalProps) {
  const [aiAssessments, setAiAssessments] = useState<AIAssessment[]>([]);
  const [notes, setNotes] = useState<ClaimNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<'general' | 'follow_up' | 'decision' | 'internal'>('general');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchClaimDetails();
  }, [claim.id]);

  const fetchClaimDetails = async () => {
    try {
      const [assessmentsResult, notesResult] = await Promise.all([
        supabase
          .from('ai_assessments')
          .select('*')
          .eq('claim_id', claim.id)
          .order('assessment_timestamp', { ascending: false }),
        supabase
          .from('claim_notes')
          .select('*')
          .eq('claim_id', claim.id)
          .order('created_at', { ascending: false }),
      ]);

      if (assessmentsResult.data) setAiAssessments(assessmentsResult.data);
      if (notesResult.data) setNotes(notesResult.data);
    } catch (error) {
      console.error('Error fetching claim details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      const { error } = await supabase
        .from('claim_notes')
        .insert({
          claim_id: claim.id,
          note_text: newNote,
          created_by: 'Current Agent',
          note_type: noteType,
        });

      if (error) throw error;

      setNewNote('');
      setNoteType('general');
      fetchClaimDetails();
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('claims')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
          reviewed_by: 'Current Agent',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', claim.id);

      if (error) throw error;

      await supabase.from('claim_history').insert({
        claim_id: claim.id,
        changed_by: 'Current Agent',
        action: 'status_changed',
        field_changed: 'status',
        old_value: claim.status,
        new_value: newStatus,
      });

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor':
        return 'bg-indigo-100 text-indigo-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'severe':
        return 'bg-orange-100 text-orange-800';
      case 'total_loss':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'under_review':
        return 'bg-indigo-100 text-indigo-800';
      case 'requires_manual_review':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    if (status === 'rejected') return 'Claim Returned';
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{claim.claim_number}</h2>
            <p className="text-sm text-gray-600 mt-1">Policy: {claim.policy_number}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Claim Information</h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Policyholder</p>
                      <p className="font-medium text-gray-900">{claim.policyholder_name}</p>
                      {claim.policyholder_email && (
                        <p className="text-sm text-gray-600">{claim.policyholder_email}</p>
                      )}
                      {claim.policyholder_phone && (
                        <p className="text-sm text-gray-600">{claim.policyholder_phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Car className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Vehicle</p>
                      <p className="font-medium text-gray-900">
                        {claim.vehicle_year} {claim.vehicle_make} {claim.vehicle_model}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Accident Date</p>
                      <p className="font-medium text-gray-900">{formatDate(claim.accident_date)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Estimated Repair Cost</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(claim.estimated_repair_cost)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(claim.status)}`}>
                        {formatStatus(claim.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Assessment Summary</h3>

                {claim.ai_confidence_score !== null && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">AI Confidence Score</span>
                      <span className="text-2xl font-bold text-indigo-600">
                        {claim.ai_confidence_score.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${claim.ai_confidence_score}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {aiAssessments.length > 0 && (
                  <div className="space-y-3 mt-4">
                    {aiAssessments.map((assessment) => (
                      <div key={assessment.id} className="bg-white rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 capitalize">
                            {assessment.damage_type.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(assessment.damage_severity)}`}>
                            {assessment.damage_severity.toUpperCase()}
                          </span>
                        </div>

                        <div className="text-sm text-gray-600 mb-2">
                          Estimated Cost: <span className="font-semibold">{formatCurrency(assessment.estimated_cost)}</span>
                        </div>

                        {assessment.affected_parts && assessment.affected_parts.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">Affected Parts:</p>
                            <div className="flex flex-wrap gap-1">
                              {assessment.affected_parts.map((part: string, idx: number) => (
                                <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                  {part}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {claim.incident_description && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Incident Description</h3>
                <p className="text-gray-700">{claim.incident_description}</p>
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Notes & Comments
              </h3>

              <div className="space-y-3 mb-4">
                {notes.length === 0 ? (
                  <p className="text-gray-500 text-sm">No notes yet</p>
                ) : (
                  notes.map((note) => (
                    <div key={note.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-medium text-gray-900">{note.created_by}</span>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs font-medium">
                            {note.note_type}
                          </span>
                          <span className="text-xs text-gray-500">{formatDateTime(note.created_at)}</span>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm">{note.note_text}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <select
                    value={noteType}
                    onChange={(e) => setNoteType(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="general">General</option>
                    <option value="follow_up">Follow-up</option>
                    <option value="decision">Decision</option>
                    <option value="internal">Internal</option>
                  </select>
                </div>

                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />

                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Note
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>

              <div className="flex flex-wrap gap-3">
                {claim.status === 'in_progress' && (
                  <>
                    <button
                      onClick={() => handleStatusChange('under_review')}
                      disabled={updatingStatus}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      Start Review
                    </button>
                    <button
                      onClick={() => handleStatusChange('requires_manual_review')}
                      disabled={updatingStatus}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Flag for Manual Review
                    </button>
                  </>
                )}

                {claim.status === 'under_review' && (
                  <>
                    <button
                      onClick={() => handleStatusChange('approved')}
                      disabled={updatingStatus}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve Claim
                    </button>
                    <button
                      onClick={() => handleStatusChange('rejected')}
                      disabled={updatingStatus}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Return Claim
                    </button>
                    <button
                      onClick={() => handleStatusChange('requires_manual_review')}
                      disabled={updatingStatus}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Needs Manual Review
                    </button>
                  </>
                )}

                {claim.status === 'requires_manual_review' && (
                  <button
                    onClick={() => handleStatusChange('under_review')}
                    disabled={updatingStatus}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    Resume Review
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
