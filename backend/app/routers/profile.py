from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import datetime
from ..database import get_db
from ..models import User, AthleteProfile, AthleteSupportPreference, Event
from ..schemas import (
    AthleteProfileOut, AthleteProfileUpdate,
    AthleteSupportPrefOut, AthleteSupportPrefUpdate,
    OnboardingRequest, OnboardingResponse, UserOut
)
from ..auth import get_current_user

router = APIRouter(prefix="/api/profile", tags=["User Profile & Privacy"])

@router.get("/me")
def get_my_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(AthleteProfile).filter(AthleteProfile.user_id == current_user.id).first()
    support_pref = db.query(AthleteSupportPreference).filter(AthleteSupportPreference.user_id == current_user.id).first()
    
    return {
        "profile": AthleteProfileOut.model_validate(profile) if profile else None,
        "support_preference": AthleteSupportPrefOut.model_validate(support_pref) if support_pref else None,
        "privacy_note": "Accessibility preferences and support notes are strictly confidential and never displayed on public community profiles."
    }

@router.put("/me", response_model=AthleteProfileOut)
def update_profile(
    payload: AthleteProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(AthleteProfile).filter(AthleteProfile.user_id == current_user.id).first()
    if not profile:
        profile = AthleteProfile(user_id=current_user.id)
        db.add(profile)

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(profile, key, value)

    db.commit()
    db.refresh(profile)
    return profile

@router.put("/support-preferences", response_model=AthleteSupportPrefOut)
def update_support_preferences(
    payload: AthleteSupportPrefUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    support = db.query(AthleteSupportPreference).filter(AthleteSupportPreference.user_id == current_user.id).first()
    if not support:
        support = AthleteSupportPreference(user_id=current_user.id)
        db.add(support)

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(support, key, value)

    db.commit()
    db.refresh(support)
    return support


@router.post("/onboarding", response_model=OnboardingResponse)
def submit_onboarding_questionnaire(
    payload: OnboardingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Update User Identity
    if payload.display_name.strip():
        current_user.display_name = payload.display_name.strip()
        parts = [p for p in payload.display_name.strip().split() if p]
        initials = "".join([p[0] for p in parts])[:2].upper() if parts else "AB"
        current_user.avatar_initials = initials

    # 2. Update/Create AthleteProfile
    profile = db.query(AthleteProfile).filter(AthleteProfile.user_id == current_user.id).first()
    if not profile:
        profile = AthleteProfile(user_id=current_user.id)
        db.add(profile)

    profile.academic_level = payload.education_level
    profile.primary_sport = payload.primary_sport
    if payload.secondary_sport:
        profile.secondary_sports = payload.secondary_sport
    profile.skill_level = payload.skill_level

    goal_text = payload.sporting_goals or payload.primary_goal
    if payload.academic_goals:
        goal_text = f"Academic: {payload.academic_goals} | Sporting: {goal_text}"
    profile.goals = goal_text or "Balance collegiate education and sports commitments."

    profile.exam_period = payload.exam_period
    profile.short_term_sport_goals = payload.short_term_sport_goals
    profile.long_term_sport_goals = payload.long_term_sport_goals
    if payload.improvement_areas:
        profile.improvement_areas = ", ".join(payload.improvement_areas)
    if payload.platform_goals:
        profile.platform_goals = ", ".join(payload.platform_goals)

    if payload.support_subjects:
        profile.academic_major = f"{profile.academic_major or 'General Studies'} (Focus: {payload.support_subjects})"

    train_time = payload.training_availability or payload.availability_schedule or "Morning"
    study_time = payload.study_availability or "Evening"
    schedule_desc = f"Training: {train_time} | Study: {study_time}"
    if payload.support_preferences:
        schedule_desc += f" | Priorities: {', '.join(payload.support_preferences)}"
    profile.preferred_training_times = schedule_desc

    # 3. Determine Perspective & Update AthleteSupportPreference
    support = db.query(AthleteSupportPreference).filter(AthleteSupportPreference.user_id == current_user.id).first()
    if not support:
        support = AthleteSupportPreference(user_id=current_user.id)
        db.add(support)

    is_accessible = (
        payload.experience_type == "accessible" or
        payload.accessibility_status == "requires_support" or
        len(payload.accommodations) > 0
    )

    if is_accessible:
        perspective = "accessible"
        needs = ", ".join(payload.accommodations)
        if payload.other_accommodations:
            needs = f"{needs} ({payload.other_accommodations})" if needs else payload.other_accommodations
        support.optional_needs_description = needs or "User requested accessibility accommodations."
        support.is_private = True
    elif payload.accessibility_status == "prefer_not_to_say":
        perspective = "standard"
        support.optional_needs_description = "Prefer not to disclose specific accessibility details."
        support.is_private = True
    else:
        perspective = "standard"
        support.optional_needs_description = "No specific accessibility support needed."
        support.is_private = True

    profile.experience_type = perspective

    # 4. Generate Dynamically Personalized Schedule Events for this User
    db.query(Event).filter(Event.user_id == current_user.id).delete()

    today = datetime.date.today()
    d0 = today.isoformat()
    d1 = (today + datetime.timedelta(days=1)).isoformat()
    d2 = (today + datetime.timedelta(days=2)).isoformat()
    d3 = (today + datetime.timedelta(days=3)).isoformat()

    buffer_mins = 25 if is_accessible else 15
    sport_lower = payload.primary_sport.lower()

    # Determine training hours based on user's availability
    if "evening" in train_time.lower():
        t_start, t_end = "17:30", "19:00"
    elif "afternoon" in train_time.lower():
        t_start, t_end = "15:30", "17:00"
    else:
        t_start, t_end = "07:00", "08:30"

    # Determine study hours based on user's study availability
    if "morning" in study_time.lower():
        s_start, s_end = "09:00", "10:30"
    elif "afternoon" in study_time.lower():
        s_start, s_end = "15:45", "17:15"
    else:
        s_start, s_end = "19:30", "21:00"

    # Sport specific event titles and venues
    if "badminton" in sport_lower:
        e_train_title1 = "Badminton Footwork & Shuttle Placement Drill"
        e_train_venue1 = "Fieldhouse Sprung Courts 2-3"
        e_train_title2 = "Badminton Match Simulation & Tactical Sets"
        e_train_venue2 = "Fieldhouse Sprung Court 1"
    elif "swim" in sport_lower:
        e_train_title1 = "Aerobic Swim Intervals (3,000m Pace Work)"
        e_train_venue1 = "Aquatic Center 50m Pool"
        e_train_title2 = "Stroke Technique & Kickboard Volume"
        e_train_venue2 = "Aquatic Center Lane 4"
    elif "wheelchair" in sport_lower and "basketball" in sport_lower:
        e_train_title1 = "Wheelchair Basketball Court Agility & Sprints"
        e_train_venue1 = "Varsity Arena (Ramp Portal 2 & Elevator Verified)"
        e_train_title2 = "Free-Throw Accuracy & Defensive Transition"
        e_train_venue2 = "Varsity Arena Court A (Accessible Entry)"
    elif "wheelchair" in sport_lower or "para" in sport_lower:
        e_train_title1 = "Wheelchair Track Speed & Propulsion Cadence"
        e_train_venue1 = "Varsity Stadium Track (Roll-in Infield Portal)"
        e_train_title2 = "Shoulder Stability & Resistance Ergometer"
        e_train_venue2 = "Adaptive Fitness Center (Elevator Verified)"
    elif "track" in sport_lower or "run" in sport_lower:
        e_train_title1 = "Sprint Interval Pacing (400m Splits)"
        e_train_venue1 = "Outdoor Stadium Track"
        e_train_title2 = "Aerobic Base Progression & Mobility Drills"
        e_train_venue2 = "Varsity Training Complex"
    else:
        e_train_title1 = f"{payload.primary_sport} Tactical Drills & Conditioning"
        e_train_venue1 = "Athletic High-Performance Center"
        e_train_title2 = f"{payload.primary_sport} Technique & Match Simulation"
        e_train_venue2 = "Athletic High-Performance Center"

    # Education-specific classes
    is_school = "school" in payload.education_level.lower()
    subject_focus = payload.support_subjects or ("Science & Mathematics" if is_school else "Academic Major")

    new_events = [
        # Today: Academic lecture/class
        Event(
            user_id=current_user.id,
            title=f"High School: {subject_focus} Core" if is_school else f"{subject_focus} Lecture",
            event_type="academic",
            date=d0,
            start_time="09:00" if is_school else "10:00",
            end_time="11:30" if is_school else "11:30",
            is_fixed=True,
            priority="high",
            buffer_minutes=buffer_mins,
            location="High School Academic Wing" if is_school else "Academic Hall 102 (Elevator Access Verified)" if is_accessible else "Science Complex 201"
        ),
        # Today: Sport-specific training
        Event(
            user_id=current_user.id,
            title=e_train_title1,
            event_type="training",
            date=d0,
            start_time=t_start,
            end_time=t_end,
            is_fixed=False,
            priority="high",
            buffer_minutes=buffer_mins,
            location=e_train_venue1,
            notes=f"Personalized session focused on {profile.improvement_areas or 'technique and consistency'}."
        ),
        # Day 1: Academic study / problem set
        Event(
            user_id=current_user.id,
            title=f"Dedicated Study: {subject_focus} Preparation",
            event_type="academic",
            date=d1,
            start_time=s_start,
            end_time=s_end,
            is_fixed=False,
            priority="medium",
            buffer_minutes=buffer_mins,
            location="Campus Library / Quiet Study Zone"
        ),
        # Day 1: Second training session
        Event(
            user_id=current_user.id,
            title=e_train_title2,
            event_type="training",
            date=d1,
            start_time=t_start,
            end_time=t_end,
            is_fixed=False,
            priority="high",
            buffer_minutes=buffer_mins,
            location=e_train_venue2
        ),
        # Day 2: Exam / Milestone Review
        Event(
            user_id=current_user.id,
            title=f"EXAM REVIEW: {subject_focus}" if not payload.exam_period else f"EXAM WINDOW: {payload.exam_period}",
            event_type="exam",
            date=d2,
            start_time="10:00",
            end_time="12:00",
            is_fixed=True,
            priority="high",
            buffer_minutes=buffer_mins + 10,
            location="Examination Hall (Accommodated Desk Verified)" if is_accessible else "Academic Center Hall B",
            notes="Formal examination buffer protected. No overlapping training scheduled."
        )
    ]

    db.add_all(new_events)
    db.commit()
    db.refresh(current_user)
    db.refresh(profile)
    db.refresh(support)

    db.commit()
    db.refresh(current_user)
    db.refresh(profile)
    db.refresh(support)

    return OnboardingResponse(
        status="success",
        message="Personalized athlete profile generated successfully.",
        perspective=perspective,
        user=UserOut.model_validate(current_user),
        profile=AthleteProfileOut.model_validate(profile),
        support_preference=AthleteSupportPrefOut.model_validate(support)
    )
