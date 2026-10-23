from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, ProgressGoal, AthleteAchievement
from ..schemas import (
    ProgressGoalOut, ProgressGoalCreate, AchievementOut, AchievementCreate
)
from ..auth import get_current_user

router = APIRouter(prefix="/api/progress", tags=["DualProgress & Athlete Passport"])

@router.get("/goals", response_model=List[ProgressGoalOut])
def list_goals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(ProgressGoal).filter(ProgressGoal.athlete_id == current_user.id).all()

@router.post("/goals", response_model=ProgressGoalOut, status_code=status.HTTP_201_CREATED)
def create_goal(
    payload: ProgressGoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if payload.category not in ["academic", "sport"]:
        raise HTTPException(status_code=400, detail="Category must be 'academic' or 'sport'")

    goal = ProgressGoal(
        athlete_id=current_user.id,
        category=payload.category,
        title=payload.title,
        target_metric=payload.target_metric,
        current_metric=payload.current_metric,
        target_date=payload.target_date,
        status="in_progress"
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal

@router.put("/goals/{goal_id}/toggle")
def toggle_goal_status(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goal = db.query(ProgressGoal).filter(
        ProgressGoal.id == goal_id,
        ProgressGoal.athlete_id == current_user.id
    ).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    goal.status = "achieved" if goal.status == "in_progress" else "in_progress"
    db.commit()
    return {"status": "success", "new_status": goal.status}

@router.get("/achievements", response_model=List[AchievementOut])
def list_achievements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(AthleteAchievement).filter(
        AthleteAchievement.athlete_id == current_user.id
    ).order_by(AthleteAchievement.date_achieved.desc()).all()

@router.post("/achievements", response_model=AchievementOut, status_code=status.HTTP_201_CREATED)
def create_achievement(
    payload: AchievementCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ach = AthleteAchievement(
        athlete_id=current_user.id,
        title=payload.title,
        category=payload.category,
        date_achieved=payload.date_achieved,
        provenance=payload.provenance,
        verified_by=payload.verified_by or "Self-Recorded",
        is_shared_publicly=payload.is_shared_publicly
    )
    db.add(ach)
    db.commit()
    db.refresh(ach)
    return ach

@router.put("/achievements/{ach_id}/share")
def toggle_achievement_share(
    ach_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ach = db.query(AthleteAchievement).filter(
        AthleteAchievement.id == ach_id,
        AthleteAchievement.athlete_id == current_user.id
    ).first()
    if not ach:
        raise HTTPException(status_code=404, detail="Achievement not found")

    ach.is_shared_publicly = not ach.is_shared_publicly
    db.commit()
    return {"status": "success", "is_shared_publicly": ach.is_shared_publicly}
