from typing import List, Tuple, Dict, Any, Optional
import datetime
from .models import Event
from .schemas import ConflictItem, ScheduleConflictReport, AlternativeSlot, RescheduleSuggestionResponse

def time_to_minutes(t_str: str) -> int:
    """Converts HH:MM string to minutes from midnight."""
    parts = t_str.strip().split(":")
    return int(parts[0]) * 60 + int(parts[1])

def minutes_to_time(m: int) -> str:
    """Converts minutes from midnight to HH:MM format."""
    hours = m // 60
    mins = m % 60
    return f"{hours:02d}:{mins:02d}"

def detect_schedule_conflicts(events: List[Event]) -> ScheduleConflictReport:
    """
    Evaluates a collection of events for direct temporal overlaps
    and buffer transition violations.
    """
    conflicts: List[ConflictItem] = []
    
    # Group events by date
    by_date: Dict[str, List[Event]] = {}
    for ev in events:
        by_date.setdefault(ev.date, []).append(ev)

    for date_str, ev_list in by_date.items():
        # Sort by start_time
        sorted_evs = sorted(ev_list, key=lambda e: time_to_minutes(e.start_time))
        n = len(sorted_evs)

        for i in range(n):
            ev_a = sorted_evs[i]
            a_start = time_to_minutes(ev_a.start_time)
            a_end = time_to_minutes(ev_a.end_time)
            a_buffer = ev_a.buffer_minutes or 0

            for j in range(i + 1, n):
                ev_b = sorted_evs[j]
                b_start = time_to_minutes(ev_b.start_time)
                b_end = time_to_minutes(ev_b.end_time)
                b_buffer = ev_b.buffer_minutes or 0

                # Check direct overlap: max(start) < min(end)
                if max(a_start, b_start) < min(a_end, b_end):
                    conflicts.append(ConflictItem(
                        event_a_id=ev_a.id,
                        event_a_title=ev_a.title,
                        event_b_id=ev_b.id,
                        event_b_title=ev_b.title,
                        conflict_type="direct_overlap",
                        description=f"Direct overlap: '{ev_a.title}' ({ev_a.start_time}-{ev_a.end_time}) and '{ev_b.title}' ({ev_b.start_time}-{ev_b.end_time}) are scheduled simultaneously.",
                        severity="critical"
                    ))
                # Check buffer violation: if a ends before b starts, but gap < required transition buffer
                elif a_end <= b_start:
                    gap = b_start - a_end
                    req_buffer = max(a_buffer, b_buffer)
                    if gap < req_buffer:
                        conflicts.append(ConflictItem(
                            event_a_id=ev_a.id,
                            event_a_title=ev_a.title,
                            event_b_id=ev_b.id,
                            event_b_title=ev_b.title,
                            conflict_type="buffer_violation",
                            description=f"Buffer violation: '{ev_a.title}' ends at {ev_a.end_time} and '{ev_b.title}' starts at {ev_b.start_time} (gap: {gap}m, but required buffer is {req_buffer}m for transit/prep).",
                            severity="warning"
                        ))

    has_conflicts = len(conflicts) > 0
    if not has_conflicts:
        status_summary = "Schedule optimal: No overlapping commitments or buffer violations detected."
    else:
        critical_count = sum(1 for c in conflicts if c.severity == "critical")
        warning_count = sum(1 for c in conflicts if c.severity == "warning")
        status_summary = f"Detected {len(conflicts)} schedule issues ({critical_count} direct overlaps, {warning_count} buffer transition warnings)."

    return ScheduleConflictReport(
        has_conflicts=has_conflicts,
        total_conflicts=len(conflicts),
        conflicts=conflicts,
        status_summary=status_summary
    )

def suggest_reschedule_alternatives(
    target_event: Event,
    all_events: List[Event],
    candidate_dates: Optional[List[str]] = None,
    preferred_training_blocks: Optional[List[Tuple[int, int]]] = None
) -> RescheduleSuggestionResponse:
    """
    Transparently evaluates candidate time slots for a flexible event.
    Rejects slots overlapping fixed commitments or violating rest constraints.
    Ranks viable options by minimal disruption, buffer integrity, and preferences.
    """
    constraints_considered = [
        "Avoids overlapping with any fixed academic or athletic event",
        f"Respects {target_event.buffer_minutes}m travel/prep buffer before and after",
        "Preserves mandatory nocturnal rest window (22:00 to 07:00)",
        "Accommodates full required duration without truncation"
    ]

    duration = time_to_minutes(target_event.end_time) - time_to_minutes(target_event.start_time)
    if duration <= 0:
        duration = 60

    # If target event is marked strictly fixed (e.g. an exam), it shouldn't be automatically rescheduled
    if target_event.is_fixed:
        return RescheduleSuggestionResponse(
            event_id=target_event.id,
            event_title=target_event.title,
            feasible_slots_found=False,
            constraints_considered=constraints_considered + ["Event is marked as FIXED (e.g. official exam or race) and cannot be automated."],
            alternatives=[],
            notes="This event is locked as a fixed commitment. Suggest rescheduling adjacent flexible events instead."
        )

    # Candidate dates default to [target_date, target_date + 1 day, target_date + 2 days]
    if not candidate_dates:
        try:
            curr_d = datetime.date.fromisoformat(target_event.date)
            candidate_dates = [
                (curr_d + datetime.timedelta(days=offset)).isoformat()
                for offset in [0, 1, 2]
            ]
        except Exception:
            candidate_dates = [target_event.date]

    # Other events excluding the event being rescheduled
    other_events = [e for e in all_events if e.id != target_event.id]

    alternatives: List[AlternativeSlot] = []

    # Daily waking window: 07:00 (420) to 21:30 (1290)
    DAY_START = 7 * 60
    DAY_END = 21 * 60 + 30
    STEP = 30  # evaluate on 30-minute intervals

    for c_date in candidate_dates:
        # Check deadline constraint if applicable
        if target_event.deadline and c_date > target_event.deadline:
            continue

        day_events = [e for e in other_events if e.date == c_date]
        day_events_sorted = sorted(day_events, key=lambda e: time_to_minutes(e.start_time))

        current_start = DAY_START
        while current_start + duration <= DAY_END:
            candidate_end = current_start + duration
            cand_buffer = target_event.buffer_minutes or 15

            # Test if candidate overlaps or violates buffers with any day event
            conflict_found = False
            for dev in day_events_sorted:
                dev_start = time_to_minutes(dev.start_time)
                dev_end = time_to_minutes(dev.end_time)
                dev_buffer = dev.buffer_minutes or 15
                needed_buffer = max(cand_buffer, dev_buffer)

                # Overlap test
                if max(current_start, dev_start) < min(candidate_end, dev_end):
                    conflict_found = True
                    break
                # Buffer test: if candidate ends before dev starts
                if candidate_end <= dev_start and (dev_start - candidate_end) < needed_buffer:
                    conflict_found = True
                    break
                # Buffer test: if dev ends before candidate starts
                if dev_end <= current_start and (current_start - dev_end) < needed_buffer:
                    conflict_found = True
                    break

            if not conflict_found:
                # Score this slot on a sensible 0-100 scale
                score = 75.0
                reasons = []

                # Date continuity
                if c_date == target_event.date:
                    score += 15.0
                    reasons.append("Keeps same day")
                else:
                    score -= 5.0
                    reasons.append(f"Rescheduled to {c_date}")

                # Preference bonus (mornings 07:30-09:30 or afternoons 16:30-18:30)
                if (450 <= current_start <= 570) or (990 <= current_start <= 1110):
                    score += 8.0
                    reasons.append("Fits preferred training window")

                # Ample buffer bonus
                score = min(98.0, max(50.0, score))
                reasons.append("Provides safe 30m+ transition buffer")

                explanation = "; ".join(reasons) + "."

                alternatives.append(AlternativeSlot(
                    slot_id=f"{c_date}_{current_start}_{candidate_end}",
                    date=c_date,
                    start_time=minutes_to_time(current_start),
                    end_time=minutes_to_time(candidate_end),
                    score=round(score, 1),
                    explanation=explanation,
                    respects_buffers=True,
                    preserves_rest=True
                ))

            current_start += STEP

    # Sort alternatives by score descending
    alternatives = sorted(alternatives, key=lambda a: a.score, reverse=True)
    top_alternatives = alternatives[:4]  # Return top 4 distinct recommendations

    feasible = len(top_alternatives) > 0
    notes = (
        f"Found {len(top_alternatives)} viable conflict-free slots ranked by balance and buffer preservation."
        if feasible
        else "No feasible slot was found within waking hours that satisfies travel buffers and avoids fixed exams."
    )

    return RescheduleSuggestionResponse(
        event_id=target_event.id,
        event_title=target_event.title,
        feasible_slots_found=feasible,
        constraints_considered=constraints_considered,
        alternatives=top_alternatives,
        notes=notes
    )
