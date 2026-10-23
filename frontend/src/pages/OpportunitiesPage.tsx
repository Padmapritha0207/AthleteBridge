import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Opportunity } from '../types';
import {
  Compass, Search, Bookmark, BookmarkCheck, CheckCircle2,
  AlertTriangle, ExternalLink, Calendar, MapPin, Sparkles, Filter, Check
} from 'lucide-react';

interface OpportunitiesPageProps {
  setActiveTab?: (tab: string) => void;
}

export const OpportunitiesPage: React.FC<OpportunitiesPageProps> = ({ setActiveTab }) => {
  const { perspective } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [registeredIds, setRegisteredIds] = useState<Set<number>>(new Set());
  const [scheduledIds, setScheduledIds] = useState<Set<number>>(new Set());
  const [scheduledNotice, setScheduledNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Details modal
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [opps, savedList] = await Promise.all([
        api.getOpportunities({
          type: typeFilter !== 'all' ? typeFilter : undefined,
          verification_state: verificationFilter !== 'all' ? verificationFilter : undefined,
          q: searchQuery || undefined
        }),
        api.getMySavedOpportunities()
      ]);
      setOpportunities(opps);
      setSavedIds(new Set(savedList.map(s => s.id)));
    } catch (err) {
      console.error('Failed to load opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [typeFilter, verificationFilter, searchQuery]);

  const handleToggleSave = async (opp: Opportunity) => {
    try {
      const res = await api.toggleSaveOpportunity(opp.id);
      setSavedIds(prev => {
        const next = new Set(prev);
        if (res.saved) next.add(opp.id);
        else next.delete(opp.id);
        return next;
      });
    } catch (err: any) {
      alert(`Error bookmarking opportunity: ${err.message}`);
    }
  };

  const handleRegister = async (opp: Opportunity) => {
    try {
      await api.registerOpportunity(opp.id);
      setRegisteredIds(prev => new Set(prev).add(opp.id));
      alert(`Demo registration confirmed for: ${opp.title}`);
    } catch (err: any) {
      alert(`Error registering: ${err.message}`);
    }
  };

  const handleAddToSchedule = async (opp: Opportunity) => {
    try {
      await api.createEvent({
        title: opp.title,
        event_type: 'competition',
        date: opp.start_date,
        start_time: '09:00',
        end_time: '13:00',
        is_fixed: true,
        priority: 'high',
        buffer_minutes: 30,
        location: opp.location,
        notes: `Registered via AccessMatch. Accessibility: ${opp.access_details}`
      });
      setScheduledIds(prev => new Set(prev).add(opp.id));
      setScheduledNotice(`"${opp.title}" was added to your BalanceAI schedule for ${opp.start_date}. Transition buffers protected.`);
      setTimeout(() => setScheduledNotice(null), 5000);
    } catch (err: any) {
      alert(`Could not add to schedule: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>AccessMatch: Sports Opportunities</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
              Verified Accessibility
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Discover collegiate camps, meets, and open showcases with transparent physical and sensory accessibility standards.
          </p>
        </div>
      </div>

      {/* Notification Toast */}
      {scheduledNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-medium flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{scheduledNotice}</span>
          </div>
          {setActiveTab && (
            <button
              type="button"
              onClick={() => setActiveTab('balance-ai')}
              className="text-xs font-semibold text-emerald-800 hover:underline shrink-0"
            >
              Open Schedule →
            </button>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by event title, organizer, location, or access requirement..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-600 capitalize"
          >
            <option value="all">All Types</option>
            <option value="competition">Competition / Invitational</option>
            <option value="camp">Training Camp</option>
            <option value="program">Dual Career Fellowship</option>
            <option value="event">Open Showcase</option>
          </select>

          <select
            value={verificationFilter}
            onChange={e => setVerificationFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
          >
            <option value="all">All Access States</option>
            <option value="Verified Accessible Venue">Verified Accessible Venue</option>
            <option value="Unverified Access Details">Unverified Access Details</option>
          </select>
        </div>

        {/* Perspective Contextual Chips */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium">
            {perspective === 'accessible' ? 'Perspective B Highlights:' : 'Perspective A Highlights:'}
          </span>
          <button
            type="button"
            onClick={() => setVerificationFilter(verificationFilter === 'Verified Accessible Venue' ? 'all' : 'Verified Accessible Venue')}
            className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition ${
              verificationFilter === 'Verified Accessible Venue'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            Verified Accessible Venues
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter(typeFilter === 'competition' ? 'all' : 'competition')}
            className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition ${
              typeFilter === 'competition'
                ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            Competitions & Meets
          </button>
        </div>
      </div>

      {/* Listings */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Searching opportunities...</div>
      ) : opportunities.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
          <Compass className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No matching opportunities</h3>
          <p className="text-xs text-slate-500">Try broadening your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {opportunities.map(opp => {
            const isSaved = savedIds.has(opp.id);
            const isRegistered = registeredIds.has(opp.id);
            const isVerified = opp.verification_state === 'Verified Accessible Venue';

            return (
              <div
                key={opp.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {opp.type}
                        </span>
                        {isVerified ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Verified Accessible
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Unverified Venue
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 text-base mt-1.5">{opp.title}</h3>
                      <p className="text-xs text-slate-500">{opp.organizer}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleSave(opp)}
                      className={`p-2 rounded-xl border transition ${
                        isSaved ? 'bg-sky-50 text-sky-600 border-sky-200' : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600'
                      }`}
                      aria-label={isSaved ? 'Remove bookmark' : 'Bookmark opportunity'}
                    >
                      {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{opp.start_date} to {opp.end_date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{opp.location}</span>
                    </div>
                  </div>

                  {/* Accessibility & Eligibility Highlights */}
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="font-bold text-slate-700 block mb-0.5">Accessibility & Entry Infrastructure:</span>
                      <p className="text-slate-600 leading-relaxed">{opp.access_details}</p>
                    </div>

                    {opp.transport_notes && (
                      <div className="p-2.5 rounded-xl bg-sky-50/50 border border-sky-100">
                        <span className="font-bold text-sky-900 block mb-0.5">Transport & Equipment Notes:</span>
                        <p className="text-sky-800 leading-relaxed">{opp.transport_notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-slate-700">{opp.cost}</span>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddToSchedule(opp)}
                      disabled={scheduledIds.has(opp.id)}
                      className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1 transition ${
                        scheduledIds.has(opp.id)
                          ? 'bg-slate-100 text-slate-500 border-slate-200'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                      title="Add to BalanceAI calendar to check for academic conflicts"
                    >
                      <Calendar className="w-3.5 h-3.5 text-sky-700" />
                      <span>{scheduledIds.has(opp.id) ? 'On Calendar' : 'Add to Schedule'}</span>
                    </button>

                    {setActiveTab && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('support-bridge')}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition"
                        title="Request travel or disability accommodation for this meet"
                      >
                        Request Support
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRegister(opp)}
                      className={`px-3.5 py-1.5 rounded-lg font-semibold transition ${
                        isRegistered
                          ? 'bg-emerald-600 text-white'
                          : 'bg-sky-700 hover:bg-sky-800 text-white shadow-2xs'
                      }`}
                    >
                      {isRegistered ? 'Registered' : 'Demo Register'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
