from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Event, Notification
from ..schemas import (
    EventOut, EventCreate, EventUpdate, ScheduleConflictReport,
    RescheduleSuggestionResponse, ApplyAlternativeRequest
)
from ..auth import get_current_user
from ..scheduling import detect_schedule_conflicts, suggest_reschedule_alternatives

router = APIRouter(prefix="/api/schedule", tags=["BalanceAI Schedule & Conflict Resolution"])

@router.get("/events", response_model=List[EventOut])
def get_events(
    date: Optional[str] = Query(None, description="Filter by YYYY-MM-DD"),
    event_type: Optional[str] = Query(None, description="academic, exam, training, competition, travel, rest, task"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Event).filter(Event.user_id == current_user.id)
    if date:
        query = query.filter(Event.date == date)
    if event_type:
        query = query.filter(Event.event_type == event_type)
    return query.order_by(Event.date.asc(), Event.start_time.asc()).all()

@router.post("/events", response_model=EventOut, status_code=status.HTTP_201_CREATED)
def create_event(
    payload: EventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_event = Event(
        user_id=current_user.id,
        title=payload.title,
        event_type=payload.event_type,
        date=payload.date,
        start_time=payload.start_time,
        end_time=payload.end_time,
        is_fixed=payload.is_fixed,
        priority=payload.priority,
        buffer_minutes=payload.buffer_minutes,
        deadline=payload.deadline,
        notes=payload.notes,
        location=payload.location
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)

    # Check for conflicts and notify user if conflict found
    all_events = db.query(Event).filter(Event.user_id == current_user.id).all()
    conflicts_report = detect_schedule_conflicts(all_events)
    if conflicts_report.has_conflicts:
        notif = Notification(
            user_id=current_user.id,
            title="BalanceAI Schedule Alert",
            message=f"Added '{new_event.title}', triggering {conflicts_report.total_conflicts} potential timing/buffer conflicts. View BalanceAI to optimize.",
            notification_type="schedule_conflict"
        )
        db.add(notif)
        db.commit()

    return new_event

@router.put("/events/{event_id}", response_model=EventOut)
def update_event(
    event_id: int,
    payload: EventUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    event = db.query(Event).filter(Event.id == event_id, Event.user_id == current_user.id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    update_data = payload.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        if v is not None:
            setattr(event, k, v)

    db.commit()
    db.refresh(event)
    return event

@router.delete("/events/{event_id}")
def delete_event(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    event = db.query(Event).filter(Event.id == event_id, Event.user_id == current_user.id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
    return {"status": "success", "message": f"Event '{event.title}' deleted"}

@router.get("/conflicts", response_model=ScheduleConflictReport)
def get_schedule_conflicts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    events = db.query(Event).filter(Event.user_id == current_user.id).all()
    return detect_schedule_conflicts(events)

@router.get("/suggest-alternatives/{event_id}", response_model=RescheduleSuggestionResponse)
def suggest_alternatives(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target = db.query(Event).filter(Event.id == event_id, Event.user_id == current_user.id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Target event not found")

    all_events = db.query(Event).filter(Event.user_id == current_user.id).all()
    return suggest_reschedule_alternatives(target, all_events)

@router.post("/apply-alternative")
def apply_alternative(
    payload: ApplyAlternativeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    event = db.query(Event).filter(Event.id == payload.event_id, Event.user_id == current_user.id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    old_date = event.date
    old_time = f"{event.start_time}-{event.end_time}"

    event.date = payload.target_date
    event.start_time = payload.target_start_time
    event.end_time = payload.target_end_time

    db.commit()
    db.refresh(event)

    # Re-evaluate conflicts
    all_events = db.query(Event).filter(Event.user_id == current_user.id).all()
    report = detect_schedule_conflicts(all_events)

    return {
        "status": "success",
        "message": f"Rescheduled '{event.title}' from {old_date} ({old_time}) to {event.date} ({event.start_time}-{event.end_time}).",
        "updated_event": EventOut.model_validate(event),
        "conflict_report": report
    }
