from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Counsellor, CounsellorBooking, MoodEntry, Notification
from ..schemas import (
    CounsellorOut, CounsellorBookingOut, CounsellorBookingCreate,
    MoodEntryOut, MoodEntryCreate
)
from ..auth import get_current_user

router = APIRouter(prefix="/api/mindstrong", tags=["MindStrong Mental Skills & Wellbeing"])

# Educational coping exercises
COPING_EXERCISES = [
    {
        "id": "box_breathing",
        "title": "Box Breathing for Competition Pre-Start",
        "category": "arousal_regulation",
        "duration": "4 minutes",
        "description": "Used by Olympic and elite athletes to lower acute nervous arousal before the starting gun or exam desk.",
        "steps": [
            "Inhale smoothly through the nose for 4 seconds.",
            "Hold lungs full comfortably for 4 seconds.",
            "Exhale smoothly through the mouth for 4 seconds.",
            "Hold lungs empty comfortably for 4 seconds.",
            "Repeat cycle 4 to 6 times while anchoring focus on your center of gravity."
        ]
    },
    {
        "id": "cognitive_reframing",
        "title": "Nerves to Readiness Reframing",
        "category": "performance_mindset",
        "duration": "5 minutes",
        "description": "Physiological arousal (elevated heart rate, butterflies) is identical for panic and peak readiness. Reframe your somatic state.",
        "steps": [
            "Acknowledge the physical sensations without judgment ('My heart is beating rapidly').",
            "Say aloud: 'My body is mobilizing energy, oxygen, and alertness for this challenge.'",
            "Identify two controllables: Your breathing cadence and your immediate tactical cue.",
            "Write down one execution cue (e.g. 'Smooth turnover', 'Read question twice before calculating')."
        ]
    },
    {
        "id": "academic_athletic_boundary",
        "title": "Mental Transition Reset (Lab to Track)",
        "category": "dual_career_balance",
        "duration": "3 minutes",
        "description": "Cleanly compartmentalize demanding mental academic fatigue before stepping onto the track or into the pool.",
        "steps": [
            "Close your laptop/books intentionally.",
            "Mentally deposit remaining coursework tasks onto your BalanceAI calendar for tomorrow.",
            "Take off your academic backpack and take 3 deep grounding breaths.",
            "Step across the gym/track threshold with complete presence on physical movement."
        ]
    }
]

@router.get("/exercises")
def list_coping_exercises():
    return {
        "exercises": COPING_EXERCISES,
        "disclaimer": "These coping exercises provide educational self-regulation techniques and do not constitute clinical psychotherapy or psychiatric care."
    }

@router.get("/counsellors", response_model=List[CounsellorOut])
def list_counsellors(db: Session = Depends(get_db)):
    return db.query(Counsellor).all()

@router.post("/counsellors/{counsellor_id}/book", response_model=CounsellorBookingOut, status_code=status.HTTP_201_CREATED)
def book_counsellor_session(
    counsellor_id: int,
    payload: CounsellorBookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    counsellor = db.query(Counsellor).filter(Counsellor.id == counsellor_id).first()
    if not counsellor:
        raise HTTPException(status_code=404, detail="Counsellor not found")

    booking = CounsellorBooking(
        athlete_id=current_user.id,
        counsellor_id=counsellor_id,
        requested_slot=payload.requested_slot,
        reason_category=payload.reason_category,
        notes=payload.notes,
        status="requested"
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    notif = Notification(
        user_id=current_user.id,
        title="MindStrong Consultation Inquired",
        message=f"Consultation request with {counsellor.name} ({payload.reason_category}) recorded in your demo dashboard.",
        notification_type="counsellor_inquiry"
    )
    db.add(notif)
    db.commit()

    return booking

@router.get("/moods", response_model=List[MoodEntryOut])
def list_mood_entries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Strictly private to athlete
    return db.query(MoodEntry).filter(
        MoodEntry.athlete_id == current_user.id
    ).order_by(MoodEntry.logged_at.desc()).all()

@router.post("/moods", response_model=MoodEntryOut, status_code=status.HTTP_201_CREATED)
def log_mood_entry(
    payload: MoodEntryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry = MoodEntry(
        athlete_id=current_user.id,
        mood_score=payload.mood_score,
        reflection_notes=payload.reflection_notes,
        is_private=True
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@router.delete("/moods/{mood_id}")
def delete_mood_entry(
    mood_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry = db.query(MoodEntry).filter(
        MoodEntry.id == mood_id,
        MoodEntry.athlete_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Mood entry not found or unauthorized")
    db.delete(entry)
    db.commit()
    return {"status": "success", "message": "Private mood entry permanently deleted"}
