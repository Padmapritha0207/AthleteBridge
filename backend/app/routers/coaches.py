from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Coach, CoachRequest, Notification
from ..schemas import CoachOut, CoachRequestCreate, CoachRequestOut
from ..auth import get_current_user

router = APIRouter(prefix="/api/coaches", tags=["Coach Finder"])

@router.get("", response_model=List[CoachOut])
def list_coaches(
    sport: Optional[str] = Query(None, description="Filter by sport"),
    region: Optional[str] = Query(None, description="Filter by region"),
    coaching_level: Optional[str] = Query(None, description="Filter by level"),
    q: Optional[str] = Query(None, description="Keyword search in bio/specialties"),
    db: Session = Depends(get_db)
):
    query = db.query(Coach)
    if sport and sport.lower() != "all":
        query = query.filter(Coach.sport.ilike(f"%{sport}%"))
    if region and region.lower() != "all":
        query = query.filter(Coach.region.ilike(f"%{region}%"))
    if coaching_level and coaching_level.lower() != "all":
        query = query.filter(Coach.coaching_level.ilike(f"%{coaching_level}%"))
    if q:
        query = query.filter(
            Coach.full_name.ilike(f"%{q}%") |
            Coach.bio.ilike(f"%{q}%") |
            Coach.qualifications.ilike(f"%{q}%") |
            Coach.coaching_level.ilike(f"%{q}%") |
            Coach.accessibility_specialties.ilike(f"%{q}%")
        )
    return query.all()

@router.get("/{coach_id}", response_model=CoachOut)
def get_coach(coach_id: int, db: Session = Depends(get_db)):
    coach = db.query(Coach).filter(Coach.id == coach_id).first()
    if not coach:
        raise HTTPException(status_code=404, detail="Coach listing not found")
    return coach

@router.post("/{coach_id}/request", response_model=CoachRequestOut, status_code=status.HTTP_201_CREATED)
def request_coach_consultation(
    coach_id: int,
    payload: CoachRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    coach = db.query(Coach).filter(Coach.id == coach_id).first()
    if not coach:
        raise HTTPException(status_code=404, detail="Coach not found")

    new_request = CoachRequest(
        athlete_id=current_user.id,
        coach_id=coach_id,
        requested_date=payload.requested_date,
        sport=payload.sport,
        notes=payload.notes,
        status="pending"
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    # In-app notification
    notif = Notification(
        user_id=current_user.id,
        title="Coach Consultation Requested",
        message=f"Your demo consultation inquiry for Coach {coach.full_name} ({payload.sport}) has been logged in your AthleteBridge demo dashboard.",
        notification_type="coach_request"
    )
    db.add(notif)
    db.commit()

    return new_request

@router.get("/requests/my", response_model=List[CoachRequestOut])
def get_my_coach_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(CoachRequest).filter(CoachRequest.athlete_id == current_user.id).order_by(CoachRequest.created_at.desc()).all()
