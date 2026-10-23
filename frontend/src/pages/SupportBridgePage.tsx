import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { SupportRequest, SupportRequestHistoryItem } from '../types';
import {
  ShieldCheck, ShieldAlert, Plus, Clock, CheckCircle2,
  AlertCircle, ChevronRight, MessageSquare, History, X, User
} from 'lucide-react';

export const SupportBridgePage: React.FC = () => {
  const { currentUser, activeRole } = useAuth();
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // New Request Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [category, setCategory] = useState('academic_exam');
  const [description, setDescription] = useState('');
  const [dateNeeded, setDateNeeded] = useState(new Date().toISOString().split('T')[0]);
  const [commMethod, setCommMethod] = useState('Email & In-App Notification');
  const [submitting, setSubmitting] = useState(false);

  // Staff Review Modal
  const [reviewRequest, setReviewRequest] = useState<SupportRequest | null>(null);
  const [newStatus, setNewStatus] = useState('under_review');
  const [staffNote, setStaffNote] = useState('');

  const loadRequests = async () => {
    try {
      setLoading(true);
      if (activeRole === 'staff') {
        const queue = await api.getStaffSupportQueue();
        setRequests(queue);
      } else {
        const myReqs = await api.getMySupportRequests();
        setRequests(myReqs);
      }
    } catch (err) {
      console.error('Failed to load support requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [activeRole, currentUser?.id]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.createSupportRequest({
        category,
        concise_description: description,
        date_needed: dateNeeded,
        preferred_comm_method: commMethod
      });
      setShowCreateModal(false);
      setDescription('');
      await loadRequests();
    } catch (err: any) {
      alert(`Error submitting accommodation request: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewRequest) return;
    try {
      await api.updateSupportRequestStatus(reviewRequest.id, {
        status: newStatus,
        note: staffNote || 'Status updated by institutional coordinator.'
      });
      setReviewRequest(null);
      setStaffNote('');
      await loadRequests();
    } catch (err: any) {
      alert(`Error updating request: ${err.message}`);
    }
  };

  const getStatusBadge = (st: string) => {
    const config: Record<string, { label: string; class: string }> = {
      submitted: { label: 'Submitted', class: 'bg-slate-100 text-slate-800' },
      under_review: { label: 'Under Review', class: 'bg-amber-100 text-amber-900 border-amber-200' },
      info_needed: { label: 'More Info Needed', class: 'bg-blue-100 text-blue-900' },
      approved: { label: 'Approved', class: 'bg-emerald-100 text-emerald-900' },
      declined: { label: 'Declined', class: 'bg-rose-100 text-rose-900' },
      resolved: { label: 'Resolved', class: 'bg-indigo-100 text-indigo-900' }
    };
    const c = config[st] || { label: st, class: 'bg-slate-100 text-slate-700' };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${c.class}`}>
        {c.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>SupportBridge: Accommodation Management</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-semibold border border-indigo-200">
              Confidential Workflow
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Formal, confidential channel to request academic rescheduling, facility access, equipment storage, and competition travel accommodations.
          </p>
        </div>

        {activeRole === 'athlete' && (
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-sm transition focus-visible:ring-2 focus-visible:ring-indigo-600"
          >
            <Plus className="w-4 h-4" />
            <span>New Accommodation Request</span>
          </button>
        )}
      </div>

      {/* Institutional Disclaimer Banner */}
      <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs text-indigo-900 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Confidentiality Assurance:</strong> Accommodation requests are handled solely between the student-athlete and authorized institutional athletics compliance staff. Requests are never publicly displayed, never shared with peers, and do not infer disability status without explicit disclosure.
        </p>
      </div>

      {/* Role Notice */}
      {activeRole === 'staff' && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
          Logged in as <strong>Institutional Staff</strong>. You have permission to view the institutional review queue and resolve accommodation cases with audit notes.
        </div>
      )}

      {/* Requests List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Loading accommodation records...</div>
      ) : requests.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
          <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No accommodation requests on file</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeRole === 'athlete'
              ? 'Submit a request whenever you need exam proctoring adjustments, accessible travel logistics, or facility adaptations.'
              : 'The staff accommodation queue is currently clear.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center">
                    #{req.id}
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base capitalize">
                      {req.category.replace('_', ' ')} Accommodation
                    </h3>
                    <p className="text-xs text-slate-500">
                      Requested by: <strong className="text-slate-700">{req.athlete_name}</strong> • Needed by: {req.date_needed}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {getStatusBadge(req.status)}
                  {activeRole === 'staff' && (
                    <button
                      type="button"
                      onClick={() => {
                        setReviewRequest(req);
                        setNewStatus(req.status);
                        setStaffNote('');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs"
                    >
                      Update Status
                    </button>
                  )}
                </div>
              </div>

              <div className="text-xs text-slate-700 space-y-2">
                <p className="leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <strong className="text-slate-900 block mb-1">Athlete Request Description:</strong>
                  {req.concise_description}
                </p>

                {req.staff_notes && (
                  <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                    <strong className="text-indigo-950 block mb-0.5">Staff Coordinator Notes:</strong>
                    <p className="text-indigo-900">{req.staff_notes}</p>
                  </div>
                )}
              </div>

              {/* Status History Audit Trail */}
              {req.history && req.history.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Transparent Audit & Decision History ({req.history.length}):
                  </span>
                  <div className="space-y-2">
                    {req.history.map((h, i) => (
                      <div key={h.id || i} className="flex items-start gap-2.5 text-xs text-slate-600">
                        <History className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-slate-800">{h.changed_by_name}</span>{' '}
                          <span className="text-slate-400">transitioned to</span>{' '}
                          <strong className="text-indigo-700 capitalize">{h.status_to.replace('_', ' ')}</strong>:{' '}
                          <span className="italic">“{h.note}”</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Request Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="req-modal-title"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 id="req-modal-title" className="text-base font-bold text-slate-900">
                Submit Accommodation Request
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-800 mb-1" htmlFor="req-cat">
                  Accommodation Category *
                </label>
                <select
                  id="req-cat"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 capitalize"
                >
                  <option value="academic_exam">Academic Exam Rescheduling / Proctoring</option>
                  <option value="training_facility">Training Facility / Weight Room Accessibility</option>
                  <option value="travel_competition">Competition Travel & Gear Transport</option>
                  <option value="assistive_tech">Assistive Technology / Course Materials</option>
                  <option value="other">Other Institutional Support</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1" htmlFor="req-date-need">
                  Date Needed By *
                </label>
                <input
                  id="req-date-need"
                  type="date"
                  required
                  value={dateNeeded}
                  onChange={e => setDateNeeded(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1" htmlFor="req-desc">
                  Concise Description & Specific Needs *
                </label>
                <textarea
                  id="req-desc"
                  required
                  rows={4}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Detail the athletic commitment and the specific accommodation requested (e.g., travel conflict for midterm, ramp clearance, proctored time)..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1" htmlFor="req-comm">
                  Preferred Communication Method
                </label>
                <select
                  id="req-comm"
                  value={commMethod}
                  onChange={e => setCommMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="Email & In-App Notification">Email & In-App Notification</option>
                  <option value="In-Person Coordinator Meeting">In-Person Coordinator Meeting</option>
                  <option value="Confidential Phone / Video Call">Confidential Phone / Video Call</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xs"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Review Modal */}
      {reviewRequest && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-modal-title"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 id="review-modal-title" className="text-base font-bold text-slate-900">
                Update Status: Request #{reviewRequest.id}
              </h3>
              <button
                type="button"
                onClick={() => setReviewRequest(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-800 mb-1" htmlFor="st-update">
                  Transition Status To *
                </label>
                <select
                  id="st-update"
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 capitalize"
                >
                  <option value="under_review">Under Review</option>
                  <option value="info_needed">More Information Needed</option>
                  <option value="approved">Approved</option>
                  <option value="declined">Declined with Explanation</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1" htmlFor="st-note">
                  Official Explanation / Coordination Note *
                </label>
                <textarea
                  id="st-note"
                  required
                  rows={3}
                  value={staffNote}
                  onChange={e => setStaffNote(e.target.value)}
                  placeholder="Provide context on faculty communication, proctoring arrangements, or reason for status update..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReviewRequest(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xs"
                >
                  Save Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
