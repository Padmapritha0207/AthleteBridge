from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, CommunityGroup, GroupMembership, GroupPost, UserBlockReport
from ..schemas import (
    CommunityGroupOut, GroupPostOut, GroupPostCreate, UserBlockReportCreate
)
from ..auth import get_current_user

router = APIRouter(prefix="/api/community", tags=["AthleteConnect Peer Community"])

COMMUNITY_GUIDELINES = {
    "title": "AthleteBridge Community Safety & Mutual Respect Standards",
    "rules": [
        "1. Shared Platform for All: Treat every student-athlete with respect across all disciplines, classifications, and skill levels.",
        "2. Strict Privacy Protection: Never share another athlete's personal accommodation needs, medical details, schedule conflicts, or private reflections.",
        "3. Zero Tolerance: Harassment, ableist language, derogatory commentary, hate speech, or commercial spam will result in immediate suspension.",
        "4. Constructive Peer Camaraderie: Focus on dual-career advice, travel logistics, equipment tips, and supportive celebration."
    ]
}

@router.get("/guidelines")
def get_guidelines():
    return COMMUNITY_GUIDELINES

@router.get("/groups", response_model=List[CommunityGroupOut])
def list_groups(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    groups = db.query(CommunityGroup).all()
    user_memberships = {
        m.group_id for m in db.query(GroupMembership).filter(GroupMembership.user_id == current_user.id).all()
    }

    result = []
    for g in groups:
        g_out = CommunityGroupOut.model_validate(g)
        g_out.is_member = g.id in user_memberships
        result.append(g_out)
    return result

@router.post("/groups/{group_id}/join")
def join_group(
    group_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    group = db.query(CommunityGroup).filter(CommunityGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    existing = db.query(GroupMembership).filter(
        GroupMembership.group_id == group_id,
        GroupMembership.user_id == current_user.id
    ).first()

    if not existing:
        m = GroupMembership(group_id=group_id, user_id=current_user.id)
        group.member_count += 1
        db.add(m)
        db.commit()

    return {"status": "joined", "group_id": group_id, "is_member": True}

@router.post("/groups/{group_id}/leave")
def leave_group(
    group_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    group = db.query(CommunityGroup).filter(CommunityGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    existing = db.query(GroupMembership).filter(
        GroupMembership.group_id == group_id,
        GroupMembership.user_id == current_user.id
    ).first()

    if existing:
        db.delete(existing)
        group.member_count = max(0, group.member_count - 1)
        db.commit()

    return {"status": "left", "group_id": group_id, "is_member": False}

@router.get("/groups/{group_id}/posts", response_model=List[GroupPostOut])
def list_group_posts(
    group_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Exclude posts from blocked users
    blocked_user_ids = {
        b.reported_user_id
        for b in db.query(UserBlockReport).filter(
            UserBlockReport.reporter_id == current_user.id,
            UserBlockReport.report_type == "block"
        ).all()
    }

    posts = db.query(GroupPost).filter(
        GroupPost.group_id == group_id,
        GroupPost.is_flagged == False
    ).order_by(GroupPost.created_at.desc()).all()

    return [p for p in posts if p.author_id not in blocked_user_ids]

@router.post("/posts", response_model=GroupPostOut, status_code=status.HTTP_201_CREATED)
def create_group_post(
    payload: GroupPostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    group = db.query(CommunityGroup).filter(CommunityGroup.id == payload.group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    post = GroupPost(
        group_id=payload.group_id,
        author_id=current_user.id,
        author_name=f"{current_user.display_name} (Collegiate Athlete)",
        content=f"[DEMO POST] {payload.content.strip()}",
        is_flagged=False
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post

@router.post("/report")
def report_or_block(
    payload: UserBlockReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rep = UserBlockReport(
        reporter_id=current_user.id,
        reported_user_id=payload.reported_user_id,
        report_type=payload.report_type,
        reason=payload.reason
    )
    db.add(rep)
    db.commit()
    return {
        "status": "success",
        "message": f"Action '{payload.report_type}' recorded. The user will be muted from your feed."
    }
