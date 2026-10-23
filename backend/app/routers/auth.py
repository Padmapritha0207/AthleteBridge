from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, AthleteProfile, AthleteSupportPreference, Notification
from ..schemas import UserOut, AthleteProfileOut, AthleteSupportPrefOut, NotificationOut
from ..auth import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication & Profile Context"])

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(AthleteProfile).filter(AthleteProfile.user_id == current_user.id).first()
    support = db.query(AthleteSupportPreference).filter(AthleteSupportPreference.user_id == current_user.id).first()
    unread_notifs = db.query(Notification).filter(Notification.user_id == current_user.id, Notification.is_read == False).count()

    return {
        "user": UserOut.model_validate(current_user),
        "active_role": getattr(current_user, "active_role", current_user.role),
        "profile": AthleteProfileOut.model_validate(profile) if profile else None,
        "support_preference": AthleteSupportPrefOut.model_validate(support) if support else None,
        "unread_notifications": unread_notifs,
        "demo_notice": "DEMO ENVIRONMENT: Session identity is simulated for review and local evaluation. No real personal passwords or medical data are collected."
    }

@router.get("/demo-users")
def list_demo_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "display_name": u.display_name,
            "role": u.role,
            "email": u.email,
            "avatar_initials": u.avatar_initials
        }
        for u in users
    ]

@router.get("/notifications", response_model=List[NotificationOut])
def list_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).all()

@router.post("/notifications/{notif_id}/mark-read")
def mark_notification_read(notif_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notif_id, Notification.user_id == current_user.id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"status": "success"}
