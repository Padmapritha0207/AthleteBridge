from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, MealLog, TrainingSession, RecoveryLog
from ..schemas import (
    MealLogOut, MealLogCreate,
    TrainingSessionOut, TrainingSessionCreate,
    RecoveryLogOut, RecoveryLogCreate
)
from ..auth import get_current_user

router = APIRouter(prefix="/api/health", tags=["FuelRight & Training Recovery"])

# --- FuelRight Endpoints ---
@router.get("/meals", response_model=List[MealLogOut])
def list_meal_logs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(MealLog).filter(
        MealLog.athlete_id == current_user.id
    ).order_by(MealLog.logged_at.desc()).all()

@router.post("/meals", response_model=MealLogOut, status_code=status.HTTP_201_CREATED)
def log_meal(
    payload: MealLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    meal = MealLog(
        athlete_id=current_user.id,
        meal_type=payload.meal_type,
        description=payload.description,
        hydration_ml=payload.hydration_ml,
        timing_relative_to_training=payload.timing_relative_to_training,
        dietary_flags=payload.dietary_flags
    )
    db.add(meal)
    db.commit()
    db.refresh(meal)
    return meal

# --- Training Planner Endpoints ---
@router.get("/training", response_model=List[TrainingSessionOut])
def list_training_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(TrainingSession).filter(
        TrainingSession.athlete_id == current_user.id
    ).order_by(TrainingSession.logged_at.desc()).all()

@router.post("/training", response_model=TrainingSessionOut, status_code=status.HTTP_201_CREATED)
def log_training_session(
    payload: TrainingSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = TrainingSession(
        athlete_id=current_user.id,
        sport=payload.sport,
        duration_minutes=payload.duration_minutes,
        intensity=payload.intensity,
        equipment_used=payload.equipment_used,
        completed=payload.completed,
        notes=payload.notes
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

# --- RecoveryTracker Endpoints ---
@router.get("/recovery", response_model=List[RecoveryLogOut])
def list_recovery_logs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(RecoveryLog).filter(
        RecoveryLog.athlete_id == current_user.id
    ).order_by(RecoveryLog.logged_at.desc()).all()

@router.post("/recovery", response_model=RecoveryLogOut, status_code=status.HTTP_201_CREATED)
def log_recovery(
    payload: RecoveryLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rec = RecoveryLog(
        athlete_id=current_user.id,
        sleep_hours=payload.sleep_hours,
        fatigue_level=payload.fatigue_level,
        perceived_exertion=payload.perceived_exertion,
        rest_quality=payload.rest_quality,
        self_notes=payload.self_notes
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec
