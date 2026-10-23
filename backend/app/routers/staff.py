from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, SupportRequest, SupportRequestHistory, Opportunity, Coach
from ..auth import require_staff_role

router = APIRouter(prefix="/api/staff", tags=["Staff Institutional Dashboard"])

@router.get("/overview")
def get_staff_overview(
    current_user: User = Depends(require_staff_role),
    db: Session = Depends(get_db)
):
    total_requests = db.query(SupportRequest).count()
    under_review_count = db.query(SupportRequest).filter(SupportRequest.status == "under_review").count()
    approved_count = db.query(SupportRequest).filter(SupportRequest.status == "approved").count()
    resolved_count = db.query(SupportRequest).filter(SupportRequest.status == "resolved").count()
    submitted_count = db.query(SupportRequest).filter(SupportRequest.status == "submitted").count()

    # Aggregate categories anonymously (NO PII)
    category_counts = {}
    for req in db.query(SupportRequest).all():
        category_counts[req.category] = category_counts.get(req.category, 0) + 1

    total_opportunities = db.query(Opportunity).count()
    verified_opps = db.query(Opportunity).filter(Opportunity.verification_state == "Verified Accessible Venue").count()
    total_coaches = db.query(Coach).count()

    # Recent audit trail
    recent_history = db.query(SupportRequestHistory).order_by(
        SupportRequestHistory.created_at.desc()
    ).limit(8).all()

    return {
        "demo_analytics_notice": "[DEMO DATA] The following institutional metrics are derived solely from prototype seed data.",
        "support_metrics": {
            "total_requests": total_requests,
            "submitted_pending": submitted_count,
            "under_review": under_review_count,
            "approved": approved_count,
            "resolved": resolved_count,
            "category_distribution": [
                {"category": k.replace("_", " ").title(), "count": v}
                for k, v in category_counts.items()
            ]
        },
        "directory_metrics": {
            "total_opportunities": total_opportunities,
            "verified_venues": verified_opps,
            "total_coaches": total_coaches
        },
        "audit_logs": [
            {
                "id": h.id,
                "request_id": h.request_id,
                "changed_by": h.changed_by_name,
                "transition": f"{h.status_from} -> {h.status_to}",
                "note": h.note,
                "timestamp": h.created_at.isoformat()
            }
            for h in recent_history
        ]
    }

@router.post("/opportunities/{opp_id}/verify")
def verify_opportunity_venue(
    opp_id: int,
    current_user: User = Depends(require_staff_role),
    db: Session = Depends(get_db)
):
    opp = db.query(Opportunity).filter(Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    opp.verification_state = "Verified Accessible Venue"
    opp.last_verified = "2026-10-21"
    db.commit()
    return {"status": "success", "verification_state": opp.verification_state}
