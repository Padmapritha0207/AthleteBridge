import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  ShieldAlert, ShieldCheck, CheckCircle2, History,
  Compass, Users, AlertTriangle, Sparkles, Plus, Check
} from 'lucide-react';
import { SupportRequest, Opportunity } from '../types';

export const StaffDashboardPage: React.FC = () => {
  const { activeRole } = useAuth();
  const [overviewData, setOverviewData] = useState<any | null>(null);
  const [supportQueue, setSupportQueue] = useState<SupportRequest[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  // Status review modal
  const [activeReviewReq, setActiveReviewReq] = useState<SupportRequest | null>(null);
  const [statusChoice, setStatusChoice] = useState('approved');
  const [statusNote, setStatusNote] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [overview, queue, opps] = await Promise.all([
        api.getStaffOverview(),
        api.getStaffSupportQueue(),
        api.getOpportunities()
      ]);
      setOverviewData(overview);
      setSupportQueue(queue);
      setOpportunities(opps);
    } catch (err) {
      console.error('Failed to load staff dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeRole === 'staff') {
      loadData();
    }
  }, [activeRole]);

  if (activeRole !== 'staff') {
    return (
      <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-4 max-w-lg mx-auto mt-8">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-slate-900 text-lg">Staff Role Required</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          The Staff Institutional Dashboard is restricted to authorized Athletics Accommodation Coordinators.
          To view this module, use the <strong>Persona Switcher</strong> in the top header and switch to <strong>Marcus Vance (Staff)</strong>.
        </p>
      </div>
    );
  }

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReviewReq) return;
    try {
      await api.updateSupportRequestStatus(activeReviewReq.id, {
        status: statusChoice,
        note: statusNote || 'Updated by staff coordinator.'
      });
      setActiveReviewReq(null);
      setStatusNote('');
      await loadData();
    } catch (err: any) {
      alert(`Error updating request: ${err.message}`);
    }
  };

  const handleVerifyVenue = async (oppId: number) => {
    try {
      await api.verifyOpportunityVenue(oppId);
      await loadData();
    } catch (err: any) {
      alert(`Error verifying venue: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Staff Institutional Operations Dashboard</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 font-bold border border-indigo-200">
              Coordinator Portal
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review accommodation requests, monitor non-PII compliance trends, and audit accessible opportunity venues.
          </p>
        </div>
      </div>

      {/* Demo Analytics Conspicuous Notice */}
      <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl text-xs text-amber-950 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p>
          <strong>Synthetic Seed Analytics:</strong> The aggregate statistics and accommodation distributions below are derived solely from prototype seed data for evaluation.
        </p>
      </div>

      {/* Aggregate KPI Cards */}
      {overviewData && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold block">Total Accommodations</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {overviewData.support_metrics.total_requests}
            </span>
            <span className="text-[11px] text-indigo-600 font-medium mt-1 block">
              {overviewData.support_metrics.under_review} active under review
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold block">Resolved / Approved</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">
              {overviewData.support_metrics.approved + overviewData.support_metrics.resolved}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">Institutional compliance</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold block">Verified Accessible Venues</span>
            <span className="text-2xl font-black text-sky-600 mt-1 block">
              {overviewData.directory_metrics.verified_venues} / {overviewData.directory_metrics.total_opportunities}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">Zero-step entry validated</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold block">Accredited Coaches</span>
            <span className="text-2xl font-black text-purple-600 mt-1 block">
              {overviewData.directory_metrics.total_coaches}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">Collegiate & adaptive</span>
          </div>
        </div>
      )}

      {/* Two Columns: Accommodation Queue & Venue Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Support Queue (2 cols) */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-indigo-600" />
              <span>Institutional Accommodation Review Queue</span>
            </h3>
            <span className="text-xs text-slate-500">{supportQueue.length} items</span>
          </div>

          <div className="space-y-3">
            {supportQueue.map(req => (
              <div
                key={req.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        Request #{req.id}: {req.athlete_name}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 capitalize">
                        {req.category.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-slate-400 text-[11px]">Needed by: {req.date_needed}</span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-900 font-bold capitalize">
                      {req.status.replace('_', ' ')}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveReviewReq(req);
                        setStatusChoice(req.status);
                        setStatusNote('');
                      }}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold shadow-xs"
                    >
                      Process
                    </button>
                  </div>
                </div>

                <p className="text-slate-700 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-100">
                  {req.concise_description}
                </p>

                {req.staff_notes && (
                  <p className="text-indigo-900 bg-indigo-50/50 p-2 rounded-lg">
                    <strong>Current Staff Note:</strong> {req.staff_notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Venue Accessibility Verification (1 col) */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 lg:col-span-1">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Compass className="w-4 h-4 text-sky-600" />
              <span>Venue Auditing & Verification</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Review unverified sporting locations and certify accessible facilities.
            </p>
          </div>

          <div className="space-y-3">
            {opportunities.map(opp => (
              <div
                key={opp.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-slate-900">{opp.title}</h4>
                  {opp.verification_state === 'Verified Accessible Venue' ? (
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 shrink-0">
                      <Check className="w-3 h-3 text-emerald-600" />
                      Verified
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleVerifyVenue(opp.id)}
                      className="px-2 py-0.5 rounded bg-sky-600 text-white font-semibold text-[10px] shrink-0 hover:bg-sky-500"
                    >
                      Certify Venue
                    </button>
                  )}
                </div>
                <p className="text-slate-500 text-[11px]">{opp.location}</p>
                <p className="text-slate-600 line-clamp-2">{opp.access_details}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Review Modal */}
      {activeReviewReq && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Staff Decision: Request #{activeReviewReq.id}
              </h3>
              <button type="button" onClick={() => setActiveReviewReq(null)}>✕</button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold mb-1">Update Status</label>
                <select
                  value={statusChoice}
                  onChange={e => setStatusChoice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 capitalize"
                >
                  <option value="under_review">Under Review</option>
                  <option value="info_needed">More Information Needed</option>
                  <option value="approved">Approved</option>
                  <option value="declined">Declined</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Official Audit Explanation *</label>
                <textarea
                  required
                  rows={3}
                  value={statusNote}
                  onChange={e => setStatusNote(e.target.value)}
                  placeholder="Record proctoring agreement, faculty notification, or accommodation rationale..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setActiveReviewReq(null)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-semibold"
                >
                  Log Staff Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
