import datetime
from app.database import SessionLocal
from app.models import User, AthleteProfile, AthleteSupportPreference, Event, Coach, Opportunity, Scholarship

def run():
    db = SessionLocal()
    try:
        today = datetime.date.today()
        d0 = today.isoformat()
        d1 = (today + datetime.timedelta(days=1)).isoformat()
        d2 = (today + datetime.timedelta(days=2)).isoformat()
        d3 = (today + datetime.timedelta(days=3)).isoformat()

        # Check users 5-8
        profiles_to_ensure = [
            (
                5,
                "Alex Chen (Profile A)",
                "College student",
                "Badminton",
                "Table Tennis",
                "Collegiate / Regional",
                "Business Administration & Analytics",
                "Balance midterms and final examination prep with regional collegiate badminton varsity tournament.",
                "Midterms in 2 weeks",
                "Improve backhand clear and court footwork reaction time.",
                "Qualify for Inter-Collegiate Badminton Championships.",
                "Footwork, Technique, Consistency",
                "Balance education and sports, Find a coach, Improve time management",
                "Training: Evening (17:30-19:30) | Study: Morning (09:00-11:00)",
                "No specific accessibility support needed.",
                "Custom Yonex racquet stringing setup (28 lbs)."
            ),
            (
                6,
                "Samira Patel (Profile B)",
                "School student",
                "Swimming",
                "Water Polo",
                "School or college level",
                "High School Honors Science Track",
                "Improve 100m freestyle split time to 54.2s while completing AP Chemistry and Pre-Calculus homework.",
                "High School Semester Finals in 3 weeks",
                "Increase kickboard tempo and streamline off turns.",
                "State Championship Podiums & College Division I Recruitment.",
                "Endurance, Consistency, Competition preparation",
                "Improve sporting performance, Discover competitions, Track personal progress",
                "Training: Morning (06:00-07:30) | Study: Afternoon (16:30-18:30)",
                "No specific accessibility support needed.",
                "Competition tech suits and high-definition goggles."
            ),
            (
                7,
                "Tariq Malik (Profile C)",
                "College student",
                "Wheelchair Basketball",
                "Para Powerlifting",
                "District or state level",
                "Kinesiology & Sports Science",
                "Lead regional collegiate adaptive hoops squad and qualify for National Wheelchair Basketball League tournament.",
                "Kinesiology Anatomy Practicum",
                "Consistent free-throw percentage under pressure and seated court agility.",
                "Paralympic Development Team Selection.",
                "Coordination, Technique, Competition preparation",
                "Find suitable training facilities, Discover inclusive sports programs, Find a coach",
                "Training: Afternoon (15:30-17:30) | Study: Evening (19:30-21:30)",
                "Requires ramp-accessible basketball courts, wide door thresholds, and secure basketball chair storage.",
                "Per4Max custom basketball wheelchair with 16-degree camber; spare axle pins required."
            ),
            (
                8,
                "Zoe Rivera (Profile D)",
                "College student",
                "Track & Field",
                "Tandem Cycling",
                "Collegiate / Regional",
                "Communications & Media Studies",
                "Break regional 200m T12 record with guide runner while maintaining 3.8 GPA in college coursework.",
                "Midterms in 3 weeks",
                "Synchronize tether mechanics and audible cadence cues with guide.",
                "World Para Athletics Championships qualification.",
                "Coordination, Strategic understanding, Consistency",
                "Access learning resources, Find a coach, Balance education and sports",
                "Training: Morning (08:00-10:00) | Study: Afternoon (14:00-16:00)",
                "Requires screen-reader compatible course packs (EPUB/MathJax), audio lecture recordings, and guide runner track clearance.",
                "Running guide tether and acoustic lane locator beacons."
            )
        ]

        for uid, name, level, sport, sec_sport, skill, major, goals, exam, short_g, long_g, areas, p_goals, times, needs, equip in profiles_to_ensure:
            # Check profile
            prof = db.query(AthleteProfile).filter(AthleteProfile.user_id == uid).first()
            if not prof:
                prof = AthleteProfile(
                    user_id=uid,
                    institution="Cascadia State University" if "College" in level else "Cascadia High School",
                    academic_level=level,
                    primary_sport=sport,
                    secondary_sports=sec_sport,
                    skill_level=skill,
                    academic_major=major,
                    goals=goals,
                    exam_period=exam,
                    short_term_sport_goals=short_g,
                    long_term_sport_goals=long_g,
                    improvement_areas=areas,
                    platform_goals=p_goals,
                    preferred_training_times=times,
                    region="Pacific Northwest",
                    visibility_preferences="institution_only"
                )
                db.add(prof)

            # Check support
            supp = db.query(AthleteSupportPreference).filter(AthleteSupportPreference.user_id == uid).first()
            if not supp:
                supp = AthleteSupportPreference(
                    user_id=uid,
                    optional_needs_description=needs,
                    communication_preference="Email and In-App Notifications",
                    equipment_notes=equip,
                    is_private=True
                )
                db.add(supp)

        db.commit()

        # Seed events for users 5, 6, 7, 8 if none exist
        for uid in [5, 6, 7, 8]:
            if db.query(Event).filter(Event.user_id == uid).count() == 0:
                if uid == 5: # Alex Chen - College Badminton
                    db.add_all([
                        Event(user_id=5, title="BUS 310: Business Analytics & Decision Models", event_type="academic", date=d0, start_time="10:00", end_time="11:30", is_fixed=True, buffer_minutes=15, location="Business Hall 204"),
                        Event(user_id=5, title="Badminton Footwork & Shuttle Placement Drill", event_type="training", date=d0, start_time="17:30", end_time="19:30", is_fixed=False, priority="high", buffer_minutes=15, location="Fieldhouse Sprung Courts 2-3", notes="Focus on backhand recovery and front-court lunges."),
                        Event(user_id=5, title="Dedicated Midterm Study Block: Accounting", event_type="academic", date=d1, start_time="09:00", end_time="11:00", is_fixed=False, buffer_minutes=15, location="Library Study Room B"),
                        Event(user_id=5, title="Badminton Singles Tactical Match Play", event_type="training", date=d1, start_time="17:30", end_time="19:30", is_fixed=False, priority="high", buffer_minutes=15, location="Fieldhouse Sprung Court 1"),
                        Event(user_id=5, title="MIDTERM EXAM: Financial Accounting", event_type="exam", date=d2, start_time="10:00", end_time="12:00", is_fixed=True, priority="high", buffer_minutes=25, location="Business Hall Auditorium")
                    ])
                elif uid == 6: # Samira Patel - School Swimming
                    db.add_all([
                        Event(user_id=6, title="Morning Aerobic Swim Interval Set (3,000m)", event_type="training", date=d0, start_time="06:00", end_time="07:30", is_fixed=False, priority="high", buffer_minutes=15, location="Aquatics Center 50m Pool", notes="Hold 1:08 pace per 100m."),
                        Event(user_id=6, title="High School AP Chemistry & Pre-Calculus Block", event_type="academic", date=d0, start_time="08:30", end_time="15:00", is_fixed=True, buffer_minutes=15, location="Cascadia High Academic Wing"),
                        Event(user_id=6, title="Dedicated Homework & Lab Pacing", event_type="academic", date=d0, start_time="16:30", end_time="18:30", is_fixed=False, buffer_minutes=15, location="Home / Study Room"),
                        Event(user_id=6, title="Sprint 50m Free Interval Technique & Turns", event_type="training", date=d1, start_time="06:00", end_time="07:30", is_fixed=False, priority="high", buffer_minutes=15, location="Aquatics Center Lane 3"),
                        Event(user_id=6, title="High School English Literature & History", event_type="academic", date=d1, start_time="08:30", end_time="15:00", is_fixed=True, buffer_minutes=15, location="Cascadia High Room 212")
                    ])
                elif uid == 7: # Tariq Malik - PwD Wheelchair Basketball
                    db.add_all([
                        Event(user_id=7, title="KIN 240: Biomechanics of Seated Movement", event_type="academic", date=d0, start_time="10:00", end_time="11:30", is_fixed=True, buffer_minutes=25, location="Science Complex 104 (Ramp Portal Verified)"),
                        Event(user_id=7, title="Wheelchair Basketball Court Agility & Sprints", event_type="training", date=d0, start_time="15:30", end_time="17:30", is_fixed=False, priority="high", buffer_minutes=25, location="Varsity Arena (Ramp Portal 2 & Elevator Verified)", notes="Fast-break chair agility, picking angles, and shooting arc."),
                        Event(user_id=7, title="Campus Library Study Session (Level Entrance 1)", event_type="academic", date=d1, start_time="13:00", end_time="14:30", is_fixed=False, buffer_minutes=25, location="Library Accessible Floor 2"),
                        Event(user_id=7, title="Perimeter Shooting & Fast-Break Scrimmage", event_type="training", date=d1, start_time="15:30", end_time="17:30", is_fixed=False, priority="high", buffer_minutes=25, location="Varsity Arena Court A (Accessible Entry)"),
                        Event(user_id=7, title="Kinesiology Anatomy Exam Window", event_type="exam", date=d2, start_time="10:00", end_time="12:00", is_fixed=True, priority="high", buffer_minutes=35, location="Exam Center (Accessible Desk Verified)")
                    ])
                elif uid == 8: # Zoe Rivera - PwD Visual Impairment
                    db.add_all([
                        Event(user_id=8, title="T12 Sprint Pacing & Guide Synchrony Drills", event_type="training", date=d0, start_time="08:00", end_time="09:30", is_fixed=False, priority="high", buffer_minutes=25, location="Stadium Track - Lane 1 (Auditory Markers Installed)", notes="Tether tension practice and sound-beacon cornering."),
                        Event(user_id=8, title="COMM 204: Media Ethics Lecture (Audio Transcript Active)", event_type="academic", date=d0, start_time="11:00", end_time="12:30", is_fixed=True, buffer_minutes=25, location="Communications Hall 110"),
                        Event(user_id=8, title="Screen-Reader Study & Essay Synthesis", event_type="academic", date=d0, start_time="14:00", end_time="16:00", is_fixed=False, buffer_minutes=20, location="Digital Accessibility Lab 3"),
                        Event(user_id=8, title="Strength & Starting Block Cadence with Guide", event_type="training", date=d1, start_time="08:00", end_time="09:30", is_fixed=False, priority="high", buffer_minutes=25, location="Varsity High Performance Center"),
                        Event(user_id=8, title="MIDTERM EXAM: Communications Theory", event_type="exam", date=d2, start_time="10:00", end_time="12:30", is_fixed=True, priority="high", buffer_minutes=35, location="Turing Hall (Screen-Reader Station & 1.5x Time Approved)")
                    ])
        db.commit()
        print("Profiles and events successfully ensured for all test personas!")
    finally:
        db.close()

if __name__ == "__main__":
    run()
