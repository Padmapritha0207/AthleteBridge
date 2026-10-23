from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Scholarship, SavedScholarship, Notification
from ..schemas import ScholarshipOut, SavedScholarshipUpdate
from ..auth import get_current_user

router = APIRouter(prefix="/api/scholarships", tags=["Scholarship Finder"])

@router.get("", response_model=List[ScholarshipOut])
def list_scholarships(
    sport: Optional[str] = Query(None),
    academic_level: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Scholarship)
    if sport and sport.lower() != "all":
        query = query.filter(Scholarship.sport.ilike(f"%{sport}%"))
    if academic_level and academic_level.lower() != "all":
        query = query.filter(Scholarship.academic_level.ilike(f"%{academic_level}%"))
    if status and status.lower() != "all":
        query = query.filter(Scholarship.status == status)
    if q:
        query = query.filter(
            Scholarship.title.ilike(f"%{q}%") |
            Scholarship.provider.ilike(f"%{q}%") |
            Scholarship.eligibility_criteria.ilike(f"%{q}%")
        )
    return query.order_by(Scholarship.deadline.asc()).all()

@router.get("/{scholarship_id}", response_model=ScholarshipOut)
def get_scholarship(scholarship_id: int, db: Session = Depends(get_db)):
    item = db.query(Scholarship).filter(Scholarship.id == scholarship_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Scholarship listing not found")
    return item

@router.post("/{scholarship_id}/save")
def toggle_save_scholarship(
    scholarship_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(SavedScholarship).filter(
        SavedScholarship.athlete_id == current_user.id,
        SavedScholarship.scholarship_id == scholarship_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"status": "removed", "saved": False}
    else:
        new_save = SavedScholarship(
            athlete_id=current_user.id,
            scholarship_id=scholarship_id,
            application_status="saved",
            notes="Added to application tracker."
        )
        db.add(new_save)
        db.commit()
        return {"status": "saved", "saved": True}

@router.get("/saved/my")
def get_my_saved_scholarships(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    saved_items = db.query(SavedScholarship).filter(SavedScholarship.athlete_id == current_user.id).all()
    res = []
    for s in saved_items:
        sch = db.query(Scholarship).filter(Scholarship.id == s.scholarship_id).first()
        res.append({
            "id": s.id,
            "scholarship_id": s.scholarship_id,
            "application_status": s.application_status,
            "notes": s.notes,
            "updated_at": s.updated_at,
            "scholarship": ScholarshipOut.model_validate(sch) if sch else None
        })
    return res

@router.put("/saved/{saved_id}")
def update_application_status(
    saved_id: int,
    payload: SavedScholarshipUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    saved = db.query(SavedScholarship).filter(
        SavedScholarship.id == saved_id,
        SavedScholarship.athlete_id == current_user.id
    ).first()
    if not saved:
        raise HTTPException(status_code=404, detail="Saved scholarship record not found")

    saved.application_status = payload.application_status
    if payload.notes is not None:
        saved.notes = payload.notes

    db.commit()
    db.refresh(saved)
    return {"status": "updated", "application_status": saved.application_status, "notes": saved.notes}
