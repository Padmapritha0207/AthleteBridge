import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Calendar, AlertTriangle, CheckCircle2, Clock, MapPin,
  Plus, Sparkles, Filter, Check, X, ArrowRight, RefreshCw, Trash2
} from 'lucide-react';
import {
  ScheduleEvent, ScheduleConflictReport, RescheduleSuggestionResponse,
  AlternativeSlot, EventType
} from '../types';

interface BalanceAIPageProps {
  setActiveTab?: (tab: string) => void;
}

export const BalanceAIPage: React.FC<BalanceAIPageProps> = ({ setActiveTab }) => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [conflictReport, setConflictReport] = useState<ScheduleConflictReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'week'>('list');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [selectedEventForReschedule, setSelectedEventForReschedule] = useState<ScheduleEvent | null>(null);
  const [suggestions, setSuggestions] = useState<RescheduleSuggestionResponse | null>(null);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [rescheduleSuccessMsg, setRescheduleSuccessMsg] = useState<string | null>(null);

  // New Event Form
  const [formData, setFormData] = useState({
    title: '',
    event_type: 'training' as EventType,
    date: new Date().toISOString().split('T')[0],
    start_time: '16:00',
    end_time: '17:30',
    is_fixed: false,
    priority: 'medium' as 'high' | 'medium' | 'low',
    buffer_minutes: 20,
    deadline: '',
    location: 'Varsity Training Center',
    notes: ''
  });

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const [evList, confReport] = await Promise.all([
        api.getEvents(),
        api.getConflicts()
      ]);
      setEvents(evList);
      setConflictReport(confReport);
    } catch (err) {
      console.error('Failed to load schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, [currentUser?.id]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createEvent({
        title: formData.title,
        event_type: formData.event_type,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        is_fixed: formData.is_fixed,
        priority: formData.priority,
        buffer_minutes: Number(formData.buffer_minutes),
        deadline: formData.deadline || undefined,
        location: formData.location,
        notes: formData.notes
      });
      setShowAddModal(false);
      setFormData({
        title: '',
        event_type: 'training',
        date: new Date().toISOString().split('T')[0],
        start_time: '16:00',
        end_time: '17:30',
        is_fixed: false,
        priority: 'medium',
        buffer_minutes: 20,
        deadline: '',
        location: 'Varsity Training Center',
        notes: ''
      });
      await loadSchedule();
    } catch (err: any) {
      alert(`Error creating event: ${err.message}`);
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!window.confirm('Delete this event from your schedule?')) return;
    try {
      await api.deleteEvent(id);
      await loadSchedule();
    } catch (err: any) {
      alert(`Failed to delete event: ${err.message}`);
    }
  };

  const handleOpenSuggestions = async (event: ScheduleEvent) => {
    setSelectedEventForReschedule(event);
    setShowSuggestionsModal(true);
    setSuggestionsLoading(true);
    setRescheduleSuccessMsg(null);
    try {
      const res = await api.suggestAlternatives(event.id);
      setSuggestions(res);
    } catch (err: any) {
      console.error('Failed to get suggestions:', err);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const handleApplySlot = async (slot: AlternativeSlot) => {
    if (!selectedEventForReschedule) return;
    try {
      const res = await api.applyAlternative({
        event_id: selectedEventForReschedule.id,
        target_date: slot.date,
        target_start_time: slot.start_time,
        target_end_time: slot.end_time
      });
      setRescheduleSuccessMsg(res.message);
      setConflictReport(res.conflict_report);
      await loadSchedule();
      setTimeout(() => {
        setShowSuggestionsModal(false);
        setRescheduleSuccessMsg(null);
      }, 1500);
    } catch (err: any) {
      alert(`Failed to apply schedule alternative: ${err.message}`);
    }
  };

  const filteredEvents = events.filter(e => {
    if (typeFilter !== 'all' && e.event_type !== typeFilter) return false;
    return true;
  });

  // Group events by date
  const eventsByDate = filteredEvents.reduce<Record<string, ScheduleEvent[]>>((acc, ev) => {
    acc[ev.date] = acc[ev.date] || [];
    acc[ev.date].push(ev);
    return acc;
  }, {});

  const datesSorted = Object.keys(eventsByDate).sort();

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>BalanceAI: Academic + Athletic Schedule</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-semibold border border-sky-200">
              Dual-Career Optimizer
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Detects overlaps, travel buffer violations, and suggests conflict-free candidate slots.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-xl border border-slate-200 bg-white p-1 text-xs font-semibold shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === 'list' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              List View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === 'week' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Timeline View
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs sm:text-sm shadow-sm transition focus-visible:ring-2 focus-visible:ring-sky-600"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Conflict Detection Banner */}
      {conflictReport && (
        <section
          className={`p-4 sm:p-5 rounded-2xl border transition shadow-xs ${
            conflictReport.has_conflicts
              ? 'bg-amber-50/90 border-amber-200 text-amber-950'
              : 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
          }`}
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            {conflictReport.has_conflicts ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h3 className="font-bold text-sm sm:text-base">
                {conflictReport.status_summary}
              </h3>

              {conflictReport.has_conflicts && (
                <>
                  <ul className="mt-2.5 space-y-1.5 text-xs text-amber-900">
                    {conflictReport.conflicts.map((c, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-white/70 p-2.5 rounded-xl border border-amber-200/80">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          c.severity === 'critical' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {c.conflict_type.replace('_', ' ')}
                        </span>
                        <span className="flex-1 leading-relaxed">{c.description}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 pt-3 border-t border-amber-200/80 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-amber-900">
                      Need a faculty letter, exam reschedule, or travel adjustment for a competition?
                    </p>
                    {setActiveTab && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('support-bridge')}
                        className="px-3 py-1.5 rounded-lg bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold shadow-2xs transition"
                      >
                        Request SupportBridge Accommodation
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['all', 'academic', 'exam', 'training', 'competition', 'travel', 'rest'].map(type => (
          <button
            key={type}
            type="button"
            onClick={() => setTypeFilter(type)}
            className={`px-3 py-1.5 rounded-xl font-medium transition capitalize shrink-0 ${
              typeFilter === type
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Schedule Content */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Loading schedule...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No events found</h3>
          <p className="text-xs text-slate-500 mt-1">Try selecting a different filter or add a commitment.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {datesSorted.map(dateKey => {
            const dayEvents = eventsByDate[dateKey] || [];
            return (
              <div key={dateKey} className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100/80 px-3 py-1.5 rounded-lg w-fit">
                  <Calendar className="w-3.5 h-3.5 text-sky-600" />
                  <span>{new Date(dateKey + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span className="text-slate-400 font-normal">({dayEvents.length} items)</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {dayEvents.map(ev => {
                    const typeColors: Record<string, string> = {
                      academic: 'border-l-sky-500 bg-sky-50/30',
                      exam: 'border-l-rose-500 bg-rose-50/40',
                      training: 'border-l-emerald-500 bg-emerald-50/30',
                      competition: 'border-l-purple-500 bg-purple-50/30',
                      travel: 'border-l-indigo-500 bg-indigo-50/30',
                      rest: 'border-l-slate-400 bg-slate-50'
                    };

                    const borderClass = typeColors[ev.event_type] || 'border-l-slate-400 bg-white';

                    return (
                      <div
                        key={ev.id}
                        className={`p-4 rounded-xl bg-white border border-slate-200 border-l-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${borderClass}`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-slate-900">{ev.title}</span>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              {ev.event_type}
                            </span>
                            {ev.is_fixed ? (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-white">
                                Fixed Locked
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                Flexible Slot
                              </span>
                            )}
                            <span className="text-[10px] text-slate-500">
                              Buffer: {ev.buffer_minutes}m
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap">
                            <span className="flex items-center gap-1 font-mono font-medium">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {ev.start_time} - {ev.end_time}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {ev.location}
                            </span>
                            {ev.notes && (
                              <span className="italic text-slate-500 truncate max-w-xs">
                                “{ev.notes}”
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Event Actions */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          {!ev.is_fixed && (
                            <button
                              type="button"
                              onClick={() => handleOpenSuggestions(ev)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-semibold border border-sky-200 transition focus-visible:ring-2 focus-visible:ring-sky-600"
                              title="Search conflict-free alternatives that respect transit buffers and recovery rest"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                              <span>Suggest Alternatives</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteEvent(ev.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            aria-label={`Delete event ${ev.title}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Alternative Suggestions Modal */}
      {showSuggestionsModal && selectedEventForReschedule && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="suggestion-modal-title"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  <span>BalanceAI Reschedule Engine</span>
                </div>
                <h3 id="suggestion-modal-title" className="text-lg font-bold text-slate-900">
                  Alternative Slots for: “{selectedEventForReschedule.title}”
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Currently scheduled: {selectedEventForReschedule.date} at {selectedEventForReschedule.start_time}-{selectedEventForReschedule.end_time}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSuggestionsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                aria-label="Close suggestions"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {rescheduleSuccessMsg ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-base">Schedule Successfully Updated</h4>
                <p className="text-xs text-emerald-800">{rescheduleSuccessMsg}</p>
              </div>
            ) : suggestionsLoading ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin text-sky-600 mx-auto mb-2" />
                Evaluating conflict matrix and travel buffers...
              </div>
            ) : suggestions ? (
              <div className="space-y-4">
                {/* Constraints considered info */}
                <div className="p-3.5 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1 border border-slate-200">
                  <span className="font-bold text-slate-800 block">Algorithmic Constraints Evaluated:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-500">
                    {suggestions.constraints_considered.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>

                {!suggestions.feasible_slots_found ? (
                  <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-center">
                    <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                    <h4 className="font-bold text-sm">No Feasible Slot Found</h4>
                    <p className="text-xs mt-1 text-amber-800">{suggestions.notes}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Conflict-Free Alternative Slots ({suggestions.alternatives.length}):
                      </h4>
                      <span className="text-[11px] text-slate-500">
                        Preserves 25m+ transition buffer
                      </span>
                    </div>

                    {suggestions.alternatives.map((slot, idx) => (
                      <div
                        key={slot.slot_id}
                        className="p-4 rounded-xl border border-slate-200 hover:border-sky-300 bg-slate-50/50 hover:bg-sky-50/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              {slot.date} ({slot.start_time} - {slot.end_time})
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                              Fit Score: {slot.score}/100
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {slot.explanation}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleApplySlot(slot)}
                          className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition shadow-xs self-end sm:self-center shrink-0 focus-visible:ring-2 focus-visible:ring-sky-600"
                        >
                          Apply Slot
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Add Commitment Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-modal-title"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 id="add-modal-title" className="text-lg font-bold text-slate-900">
                Add Academic or Athletic Commitment
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-800 mb-1" htmlFor="ev-title">
                  Event Title *
                </label>
                <input
                  id="ev-title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Sprints Track Workout or Physics Exam"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1" htmlFor="ev-type">
                    Category *
                  </label>
                  <select
                    id="ev-type"
                    value={formData.event_type}
                    onChange={e => setFormData({ ...formData, event_type: e.target.value as EventType })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-600 capitalize"
                  >
                    <option value="academic">Academic Lecture/Lab</option>
                    <option value="exam">Fixed Exam</option>
                    <option value="assignment">Assignment Work</option>
                    <option value="training">Athletic Training</option>
                    <option value="competition">Competition / Meet</option>
                    <option value="travel">Team Travel</option>
                    <option value="rest">Recovery & Rest</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1" htmlFor="ev-date">
                    Date *
                  </label>
                  <input
                    id="ev-date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1" htmlFor="ev-start">
                    Start Time (24h) *
                  </label>
                  <input
                    id="ev-start"
                    type="time"
                    required
                    value={formData.start_time}
                    onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1" htmlFor="ev-end">
                    End Time (24h) *
                  </label>
                  <input
                    id="ev-end"
                    type="time"
                    required
                    value={formData.end_time}
                    onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1" htmlFor="ev-buffer">
                    Travel / Prep Buffer (mins)
                  </label>
                  <input
                    id="ev-buffer"
                    type="number"
                    min="0"
                    max="120"
                    value={formData.buffer_minutes}
                    onChange={e => setFormData({ ...formData, buffer_minutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1" htmlFor="ev-location">
                    Location
                  </label>
                  <input
                    id="ev-location"
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Athletic Center or Hall 202"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="ev-fixed"
                  type="checkbox"
                  checked={formData.is_fixed}
                  onChange={e => setFormData({ ...formData, is_fixed: e.target.checked })}
                  className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
                />
                <label htmlFor="ev-fixed" className="font-semibold text-slate-800 text-xs">
                  Fixed commitment (cannot be automated or shifted)
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1" htmlFor="ev-notes">
                  Notes
                </label>
                <textarea
                  id="ev-notes"
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional details or gear checklist..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-xs"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
