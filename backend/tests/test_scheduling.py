import pytest
from app.models import Event
from app.scheduling import (
    detect_schedule_conflicts,
    suggest_reschedule_alternatives,
    time_to_minutes,
    minutes_to_time
)

def test_time_conversions():
    assert time_to_minutes("07:30") == 450
    assert time_to_minutes("10:00") == 600
    assert minutes_to_time(450) == "07:30"
    assert minutes_to_time(600) == "10:00"

def test_detect_direct_overlap():
    e1 = Event(
        id=1, user_id=1, title="Sprint Training", date="2026-11-01",
        start_time="09:00", end_time="10:30", is_fixed=False, buffer_minutes=15
    )
    e2 = Event(
        id=2, user_id=1, title="Calculus Lecture", date="2026-11-01",
        start_time="10:00", end_time="11:30", is_fixed=True, buffer_minutes=15
    )
    report = detect_schedule_conflicts([e1, e2])
    assert report.has_conflicts is True
    assert report.total_conflicts == 1
    assert report.conflicts[0].conflict_type == "direct_overlap"
    assert report.conflicts[0].severity == "critical"

def test_detect_buffer_violation():
    e1 = Event(
        id=1, user_id=1, title="CS Lab", date="2026-11-01",
        start_time="14:00", end_time="15:30", is_fixed=True, buffer_minutes=20
    )
    e2 = Event(
        id=2, user_id=1, title="Track Practice", date="2026-11-01",
        start_time="15:40", end_time="17:00", is_fixed=False, buffer_minutes=25
    )
    report = detect_schedule_conflicts([e1, e2])
    assert report.has_conflicts is True
    assert report.total_conflicts == 1
    assert report.conflicts[0].conflict_type == "buffer_violation"
    assert report.conflicts[0].severity == "warning"

def test_suggest_reschedule_alternatives_flexible_event():
    fixed_exam = Event(
        id=10, user_id=1, title="Fixed Final Exam", date="2026-11-02",
        start_time="09:00", end_time="12:00", is_fixed=True, buffer_minutes=30
    )
    flexible_practice = Event(
        id=11, user_id=1, title="Light Cardio Drill", date="2026-11-02",
        start_time="10:00", end_time="11:00", is_fixed=False, buffer_minutes=15
    )
    
    result = suggest_reschedule_alternatives(
        flexible_practice,
        [fixed_exam, flexible_practice],
        candidate_dates=["2026-11-02"]
    )
    assert result.feasible_slots_found is True
    assert len(result.alternatives) > 0
    # None of the alternatives should overlap with the exam (09:00 - 12:00) + 30m buffer
    for alt in result.alternatives:
        alt_start = time_to_minutes(alt.start_time)
        alt_end = time_to_minutes(alt.end_time)
        # Exam is 540 to 720 with 30m buffer -> forbidden 510 to 750
        assert not (max(alt_start, 510) < min(alt_end, 750))

def test_cannot_automate_rescheduling_for_fixed_event():
    fixed_exam = Event(
        id=20, user_id=1, title="National Competition Final", date="2026-11-05",
        start_time="13:00", end_time="15:00", is_fixed=True, buffer_minutes=30
    )
    result = suggest_reschedule_alternatives(fixed_exam, [fixed_exam])
    assert result.feasible_slots_found is False
    assert any("FIXED" in c for c in result.constraints_considered)

def test_no_feasible_slot_when_window_saturated():
    # Fill the day completely with fixed events
    fixed_events = []
    # from 07:00 (420) to 21:30 (1290) in 2-hour blocks with 30m buffers
    curr = 420
    idx = 100
    while curr + 120 <= 1290:
        fixed_events.append(Event(
            id=idx, user_id=1, title=f"Block {idx}", date="2026-11-10",
            start_time=minutes_to_time(curr), end_time=minutes_to_time(curr + 120),
            is_fixed=True, buffer_minutes=30
        ))
        curr += 150
        idx += 1

    target = Event(
        id=999, user_id=1, title="Need 90m Training", date="2026-11-10",
        start_time="08:00", end_time="09:30", is_fixed=False, buffer_minutes=20
    )
    result = suggest_reschedule_alternatives(target, fixed_events + [target], candidate_dates=["2026-11-10"])
    assert result.feasible_slots_found is False
    assert len(result.alternatives) == 0
    assert "No feasible slot was found" in result.notes
