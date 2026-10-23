import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Scholarship, SavedScholarship } from '../types';
import {
  Award, Search, Bookmark, BookmarkCheck, Calendar, ExternalLink,
  CheckCircle2, Clock, ListChecks, DollarSign, Sparkles, Filter
} from 'lucide-react';

export const ScholarshipsPage: React.FC = () => {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [savedRecords, setSavedRecords] = useState<Array<{
    id: number;
    scholarship_id: number;
    application_status: 'saved' | 'preparing' | 'submitted';
    notes?: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [academicFilter, setAcademicFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected for Checklist Modal
  const [activeChecklistSch, setActiveChecklistSch] = useState<Scholarship | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [schs, saved] = await Promise.all([
        api.getScholarships({
          academic_level: academicFilter !== 'all' ? academicFilter : undefined,
          q: searchQuery || undefined
        }),
        api.getMySavedScholarships()
      ]);
      setScholarships(schs);
      setSavedRecords(saved);
    } catch (err) {
      console.error('Failed to load scholarships:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [academicFilter, searchQuery]);

  const handleToggleSave = async (sch: Scholarship) => {
    try {
      await api.toggleSaveScholarship(sch.id);
      await loadData();
    } catch (err: any) {
      alert(`Error updating saved scholarships: ${err.message}`);
    }
  };

  const handleUpdateStatus = async (savedId: number, status: string) => {
    try {
      await api.updateScholarshipApplication(savedId, { application_status: status });
      await loadData();
    } catch (err: any) {
      alert(`Failed to update application progress: ${err.message}`);
    }
  };

  const savedMap = new Map(savedRecords.map(s => [s.scholarship_id, s]));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Scholarship Finder & Grant Tracker</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold border border-amber-200">
              [DEMO DATA]
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Funding opportunities for collegiate dual-career balance, STEM student-athletes, and adaptive sports excellence.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by scholarship title, provider, or criteria..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={academicFilter}
            onChange={e => setAcademicFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
          >
            <option value="all">All Academic Levels</option>
            <option value="Undergraduate">Undergraduate</option>
            <option value="Graduate">Graduate</option>
          </select>
        </div>
      </div>

      {/* Listings */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Loading scholarships...</div>
      ) : scholarships.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
          <Award className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No scholarships matched</h3>
          <p className="text-xs text-slate-500">Try broadening your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {scholarships.map(sch => {
            const savedRec = savedMap.get(sch.id);
            const isSaved = !!savedRec;
            let checklist: string[] = [];
            try {
              checklist = JSON.parse(sch.checklist_json || '[]');
            } catch {
              checklist = [];
            }

            return (
              <div
                key={sch.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          Demo Listing
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800">
                          {sch.status}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Verified: {sch.last_verified}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base mt-1.5">{sch.title}</h3>
                      <p className="text-xs text-slate-500">{sch.provider}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleSave(sch)}
                      className={`p-2 rounded-xl border transition ${
                        isSaved ? 'bg-sky-50 text-sky-600 border-sky-200' : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600'
                      }`}
                      aria-label={isSaved ? 'Remove from saved' : 'Save scholarship'}
                    >
                      {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Benefits Pill */}
                  <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-sky-900">Grant Value:</span>
                    <span className="font-bold text-sky-700">{sch.benefits}</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="font-bold text-slate-700 block mb-0.5">Eligibility Criteria:</span>
                      <p className="text-slate-600 leading-relaxed">{sch.eligibility_criteria}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                      <span className="flex items-center gap-1.5 font-medium text-rose-700">
                        <Clock className="w-3.5 h-3.5 text-rose-600" />
                        Deadline: {sch.deadline}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveChecklistSch(sch)}
                        className="flex items-center gap-1 text-sky-600 font-semibold hover:underline"
                      >
                        <ListChecks className="w-3.5 h-3.5" />
                        <span>View {checklist.length} Checklist Items</span>
                      </button>
                    </div>
                  </div>

                  {/* Application Tracker Progress */}
                  {isSaved && savedRec && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                      <span className="font-bold text-slate-700 block">My Application Status:</span>
                      <div className="flex gap-2">
                        {(['saved', 'preparing', 'submitted'] as const).map(st => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleUpdateStatus(savedRec.id, st)}
                            className={`px-2.5 py-1 rounded-lg capitalize font-semibold transition text-[11px] ${
                              savedRec.application_status === st
                                ? 'bg-sky-600 text-white shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <a
                    href={sch.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-slate-500 hover:text-slate-800 font-medium"
                  >
                    <span>Guidelines Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleToggleSave(sch)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition"
                  >
                    {isSaved ? 'Saved to Tracker' : 'Save & Track'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Checklist Modal */}
      {activeChecklistSch && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="checklist-modal-title"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 id="checklist-modal-title" className="text-base font-bold text-slate-900">
                  Application Checklist
                </h3>
                <p className="text-xs text-slate-500">{activeChecklistSch.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveChecklistSch(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {JSON.parse(activeChecklistSch.checklist_json || '[]').map((item: string, i: number) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="w-5 h-5 rounded-md bg-sky-100 text-sky-800 font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-slate-700 leading-relaxed font-medium">{item}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveChecklistSch(null)}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
