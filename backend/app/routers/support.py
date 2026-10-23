from typing import List
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, SupportRequest, SupportRequestHistory, Notification
from ..schemas import (
    SupportRequestOut, SupportRequestCreate, SupportRequestStatusUpdate, SupportRequestHistoryOut
)
from ..auth import get_current_user, require_staff_role

router = APIRouter(prefix="/api/support", tags=["SupportBridge Accommodation Requests"])

@router.get("/my-requests", response_model=List[SupportRequestOut])
def get_my_support_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    requests = db.query(SupportRequest).filter(
        SupportRequest.athlete_id == current_user.id
    ).order_by(SupportRequest.created_at.desc()).all()

    result = []
    for r in requests:
        history = db.query(SupportRequestHistory).filter(
            SupportRequestHistory.request_id == r.id
        ).order_by(SupportRequestHistory.created_at.asc()).all()
        req_out = SupportRequestOut.model_validate(r)
        req_out.history = [SupportRequestHistoryOut.model_validate(h) for h in history]
        result.append(req_out)

    return result

@router.post("/requests", response_model=SupportRequestOut, status_code=status.HTTP_201_CREATED)
def create_support_request(
    payload: SupportRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_req = SupportRequest(
        athlete_id=current_user.id,
        athlete_name=current_user.display_name,
        category=payload.category,
        concise_description=payload.concise_description,
        date_needed=payload.date_needed,
        preferred_comm_method=payload.preferred_comm_method,
        status="submitted",
        staff_notes="Received by Cascadia Athletics Support Office. Pending staff assignment."
    )
    db.add(new_req)
    db.commit()
    db.refresh(new_req)

    # Initial history log
    hist = SupportRequestHistory(
        request_id=new_req.id,
        changed_by_user_id=current_user.id,
        changed_by_name=f"{current_user.display_name} (Athlete)",
        status_from="none",
        status_to="submitted",
        note="Initial accommodation request submitted by athlete."
    )
    db.add(hist)

    # In-app notification
    notif = Notification(
        user_id=current_user.id,
        title="SupportBridge Request Logged",
        message=f"Request #{new_req.id} for {new_req.category.replace('_', ' ')} has been submitted. Review will begin shortly.",
        notification_type="support_update"
    )
    db.add(notif)
    db.commit()

    req_out = SupportRequestOut.model_validate(new_req)
    req_out.history = [SupportRequestHistoryOut.model_validate(hist)]
    return req_out

@router.get("/staff-queue", response_model=List[SupportRequestOut])
def get_staff_support_queue(
    current_user: User = Depends(require_staff_role),
    db: Session = Depends(get_db)
):
    requests = db.query(SupportRequest).order_by(SupportRequest.updated_at.desc()).all()
    result = []
    for r in requests:
        history = db.query(SupportRequestHistory).filter(
            SupportRequestHistory.request_id == r.id
        ).order_by(SupportRequestHistory.created_at.asc()).all()
        req_out = SupportRequestOut.model_validate(r)
        req_out.history = [SupportRequestHistoryOut.model_validate(h) for h in history]
        result.append(req_out)
    return result

@router.put("/requests/{request_id}/status")
def update_support_request_status(
    request_id: int,
    payload: SupportRequestStatusUpdate,
    current_user: User = Depends(require_staff_role),
    db: Session = Depends(get_db)
):
    req = db.query(SupportRequest).filter(SupportRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Support request not found")

    valid_statuses = ["submitted", "under_review", "info_needed", "approved", "declined", "resolved"]
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    old_status = req.status
    req.status = payload.status
    req.staff_notes = payload.note
    req.updated_at = datetime.datetime.utcnow()

    # Create history entry
    hist = SupportRequestHistory(
        request_id=req.id,
        changed_by_user_id=current_user.id,
        changed_by_name=f"{current_user.display_name} (Staff)",
        status_from=old_status,
        status_to=payload.status,
        note=payload.note
    )
    db.add(hist)

    # Notify athlete
    notif = Notification(
        user_id=req.athlete_id,
        title=f"SupportBridge Request #{req.id} Updated",
        message=f"Status changed to '{payload.status.replace('_', ' ').title()}'. Note: {payload.note}",
        notification_type="support_update"
    )
    db.add(notif)
    db.commit()

    return {
        "status": "success",
        "message": f"Updated request #{req.id} to {payload.status}",
        "new_status": req.status,
        "note": payload.note
    }
