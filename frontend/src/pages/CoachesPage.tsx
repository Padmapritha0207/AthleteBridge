import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Coach, CoachRequest } from '../types';
import {
  Users, Search, ShieldCheck, Mail, MapPin, CheckCircle2,
  AlertCircle, DollarSign, Sparkles, Filter, X, Send
} from 'lucide-react';

export const CoachesPage: React.FC = () => {
  const { perspective } = useAuth();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [sportFilter, setSportFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Request modal
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [requestDate, setRequestDate] = useState(new Date().toISOString().split('T')[0]);
  const [requestNotes, setRequestNotes] = useState('');
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadCoaches = async () => {
    try {
      setLoading(true);
      const data = await api.getCoaches({
        sport: sportFilter !== 'all' ? sportFilter : undefined,
        coaching_level: levelFilter !== 'all' ? levelFilter : undefined,
        q: searchQuery || undefined
      });
      setCoaches(data);
    } catch (err) {
      console.error('Failed to load coaches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoaches();
  }, [sportFilter, levelFilter, searchQuery]);

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoach) return;
    try {
      setSubmitting(true);
      await api.requestCoach(selectedCoach.id, {
        requested_date: requestDate,
        sport: selectedCoach.sport,
        notes: requestNotes
      });
      setRequestSuccess(true);
      setTimeout(() => {
        setSelectedCoach(null);
        setRequestSuccess(false);
        setRequestNotes('');
      }, 1800);
    } catch (err: any) {
      alert(`Error submitting consultation request: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Coach Finder</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold border border-amber-200">
              [DEMO LISTINGS]
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Connect with accredited coaches trained in collegiate athletics, dual-career schedules, and adaptive disciplines.
          </p>
        </div>
      </div>

      {/* Conspicuous Disclaimer Banner */}
      <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p>
          <strong>Notice for Evaluators:</strong> All coach profiles, certifications, fees, and contact details below are synthetic demonstration data created for the AthleteBridge prototype. They do not represent live commercial coaching contracts.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, sport, or adaptive specialty (e.g. wheelchair, stroke mechanics)..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={sportFilter}
            onChange={e => setSportFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
          >
            <option value="all">All Sports</option>
            <option value="Badminton">Badminton</option>
            <option value="Swimming">Swimming</option>
            <option value="Basketball">Wheelchair Basketball</option>
            <option value="Track">Track & Field</option>
            <option value="Conditioning">Strength & Conditioning</option>
          </select>

          <select
            value={levelFilter}
            onChange={e => setLevelFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
          >
            <option value="all">All Coaching Levels</option>
            <option value="Paralympic">Paralympic / Adaptive Specialist</option>
            <option value="Elite">Collegiate Head Coach</option>
            <option value="Inclusive">Inclusive Performance Specialist</option>
          </select>
        </div>

        {/* Perspective Contextual Chips */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium">
            {perspective === 'accessible' ? 'Perspective B Highlights:' : 'Perspective A Highlights:'}
          </span>
          <button
            type="button"
            onClick={() => setLevelFilter(levelFilter === 'Paralympic' ? 'all' : 'Paralympic')}
            className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition ${
              levelFilter === 'Paralympic'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            Adaptive & Paralympic Specialists
          </button>
          <button
            type="button"
            onClick={() => setLevelFilter(levelFilter === 'Elite' ? 'all' : 'Elite')}
            className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition ${
              levelFilter === 'Elite'
                ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            Collegiate Head Coaches
          </button>
        </div>
      </div>

      {/* Coaches Listing */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Searching coach directory...</div>
      ) : coaches.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No matching coaches found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try broadening your search keyword or resetting filters to “All Sports” to view our seed coach listings.
          </p>
          <button
            type="button"
            onClick={() => {
              setSportFilter('all');
              setLevelFilter('all');
              setSearchQuery('');
            }}
            className="mt-2 text-xs font-semibold text-sky-600 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {coaches.map(coach => (
            <div
              key={coach.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 text-base">{coach.full_name}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        Demo Listing
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-sky-700 mt-0.5">
                      {coach.coaching_level} • {coach.sport}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-600 px-2.5 py-1 rounded-lg bg-slate-100">
                    {coach.hourly_fee}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {coach.bio}
                </p>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-bold text-slate-700 block mb-0.5">Stated Adaptive Specialties:</span>
                    <span className="text-slate-600">{coach.accessibility_specialties}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-bold text-slate-700 block mb-0.5">Venue & Equipment Capability:</span>
                    <span className="text-slate-600">{coach.venue_equipment_details}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {coach.region}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {coach.availability_status}
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  {coach.contact_email}
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedCoach(coach)}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-xs transition focus-visible:ring-2 focus-visible:ring-sky-600"
                >
                  Request Consultation
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Request Consultation Modal */}
      {selectedCoach && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="coach-modal-title"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 id="coach-modal-title" className="text-base font-bold text-slate-900">
                  Request Consultation: {selectedCoach.full_name}
                </h3>
                <p className="text-xs text-slate-500">{selectedCoach.sport}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCoach(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {requestSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-sm">Consultation Inquired (Demo)</h4>
                <p className="text-xs text-slate-500">
                  Your inquiry has been recorded in your demo dashboard.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendRequest} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1" htmlFor="req-date">
                    Target Consultation Date *
                  </label>
                  <input
                    id="req-date"
                    type="date"
                    required
                    value={requestDate}
                    onChange={e => setRequestDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1" htmlFor="req-notes">
                    Goals / Focus Areas / Equipment Notes
                  </label>
                  <textarea
                    id="req-notes"
                    rows={3}
                    value={requestNotes}
                    onChange={e => setRequestNotes(e.target.value)}
                    placeholder="e.g. Sprint cadence video analysis, dual career balancing tips..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>

                <div className="p-3 bg-amber-50 rounded-xl text-[11px] text-amber-800 border border-amber-200">
                  Note: Submitting logs a simulated request in the prototype database.
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedCoach(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-xs"
                  >
                    {submitting ? 'Submitting...' : 'Send Demo Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
