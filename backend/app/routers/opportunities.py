from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Opportunity, SavedOpportunity, Notification
from ..schemas import OpportunityOut, OpportunityCreate
from ..auth import get_current_user, require_staff_role

router = APIRouter(prefix="/api/opportunities", tags=["AccessMatch Sports Opportunities"])

@router.get("", response_model=List[OpportunityOut])
def list_opportunities(
    type: Optional[str] = Query(None, description="camp, club, competition, program, event"),
    sport: Optional[str] = Query(None, description="Filter by sport"),
    verification_state: Optional[str] = Query(None, description="Verified Accessible Venue, Self-Reported Access, Unverified Access Details"),
    is_online: Optional[bool] = Query(None),
    q: Optional[str] = Query(None, description="Keyword search"),
    db: Session = Depends(get_db)
):
    query = db.query(Opportunity)
    if type and type.lower() != "all":
        query = query.filter(Opportunity.type.ilike(f"%{type}%"))
    if sport and sport.lower() != "all":
        query = query.filter(
            Opportunity.title.ilike(f"%{sport}%") |
            Opportunity.eligibility.ilike(f"%{sport}%") |
            Opportunity.access_details.ilike(f"%{sport}%")
        )
    if verification_state and verification_state.lower() != "all":
        query = query.filter(Opportunity.verification_state == verification_state)
    if is_online is not None:
        query = query.filter(Opportunity.is_online == is_online)
    if q:
        query = query.filter(
            Opportunity.title.ilike(f"%{q}%") |
            Opportunity.location.ilike(f"%{q}%") |
            Opportunity.organizer.ilike(f"%{q}%") |
            Opportunity.access_details.ilike(f"%{q}%")
        )
    return query.all()

@router.get("/{opp_id}", response_model=OpportunityOut)
def get_opportunity(opp_id: int, db: Session = Depends(get_db)):
    opp = db.query(Opportunity).filter(Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return opp

@router.post("/{opp_id}/save")
def toggle_save_opportunity(
    opp_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(SavedOpportunity).filter(
        SavedOpportunity.athlete_id == current_user.id,
        SavedOpportunity.opportunity_id == opp_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"status": "unbookmarked", "saved": False}
    else:
        new_save = SavedOpportunity(
            athlete_id=current_user.id,
            opportunity_id=opp_id,
            status="saved"
        )
        db.add(new_save)
        db.commit()
        return {"status": "saved", "saved": True}

@router.get("/saved/my")
def get_my_saved_opportunities(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    saved_items = db.query(SavedOpportunity).filter(SavedOpportunity.athlete_id == current_user.id).all()
    opp_ids = [s.opportunity_id for s in saved_items]
    if not opp_ids:
        return []
    opportunities = db.query(Opportunity).filter(Opportunity.id.in_(opp_ids)).all()
    return opportunities

@router.post("/{opp_id}/register")
def demo_register_opportunity(
    opp_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    opp = db.query(Opportunity).filter(Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    saved = db.query(SavedOpportunity).filter(
        SavedOpportunity.athlete_id == current_user.id,
        SavedOpportunity.opportunity_id == opp_id
    ).first()

    if not saved:
        saved = SavedOpportunity(athlete_id=current_user.id, opportunity_id=opp_id, status="registered")
        db.add(saved)
    else:
        saved.status = "registered"

    notif = Notification(
        user_id=current_user.id,
        title="Opportunity Registration Confirmed (Demo)",
        message=f"You have registered for '{opp.title}'. Access details and transport notes are saved to your passport.",
        notification_type="opportunity_registered"
    )
    db.add(notif)
    db.commit()

    return {"status": "registered", "message": f"Successfully registered for {opp.title}"}

@router.post("", response_model=OpportunityOut, status_code=status.HTTP_201_CREATED)
def create_opportunity(
    payload: OpportunityCreate,
    current_user: User = Depends(require_staff_role),
    db: Session = Depends(get_db)
):
    new_opp = Opportunity(**payload.model_dump())
    db.add(new_opp)
    db.commit()
    db.refresh(new_opp)
    return new_opp
