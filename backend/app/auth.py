from fastapi import Header, HTTPException, Depends, status
from sqlalchemy.orm import Session
from .database import get_db
from .models import User

def get_current_user(
    x_demo_user_id: str = Header(default="1", alias="X-Demo-User-Id"),
    x_demo_role: str = Header(default="athlete", alias="X-Demo-Role"),
    db: Session = Depends(get_db)
) -> User:
    try:
        user_id = int(x_demo_user_id)
    except ValueError:
        user_id = 1

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        # Fallback to first user
        user = db.query(User).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No demo users seeded in the database. Please run seed script."
            )

    # Optional role override for live role testing if user exists
    if x_demo_role in ["athlete", "staff", "coach", "counsellor"]:
        user.active_role = x_demo_role
    else:
        user.active_role = user.role

    return user

def require_staff_role(current_user: User = Depends(get_current_user)) -> User:
    if getattr(current_user, "active_role", current_user.role) != "staff":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: This operation requires authorized Institutional Staff permissions."
        )
    return current_user
