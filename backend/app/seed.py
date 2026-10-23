import datetime
from sqlalchemy.orm import Session
from .database import engine, Base, SessionLocal
from .models import (
    User, AthleteProfile, AthleteSupportPreference, Event, Coach, Opportunity,
    Scholarship, SupportRequest, SupportRequestHistory, ProgressGoal,
    AthleteAchievement, Notification, MealLog, TrainingSession, RecoveryLog,
    Counsellor, MoodEntry, CommunityGroup, GroupPost
)

def seed_database(db: Session = None):
    close_after = False
    if db is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        close_after = True

    try:
        # Check if already seeded
        if db.query(User).first():
            print("Database already contains data. Checking for enrichment...")
            seed_test_profiles_and_enrichment(db)
            return

        print("Seeding synthetic, fictional demo data for AthleteBridge...")

        # 1. Users
        jordan = User(
            id=1,
            email="jordan.reed@athletebridge.example.edu",
            display_name="Jordan Reed",
            role="athlete",
            avatar_initials="JR",
            is_demo_user=True
        )
        maya = User(
            id=2,
            email="maya.lin@athletebridge.example.edu",
            display_name="Maya Lin",
            role="athlete",
            avatar_initials="ML",
            is_demo_user=True
        )
        marcus_staff = User(
            id=3,
            email="marcus.vance@athletebridge.example.edu",
            display_name="Marcus Vance (Staff)",
            role="staff",
            avatar_initials="MV",
            is_demo_user=True
        )
        coach_elena = User(
            id=4,
            email="elena.rostova@athletebridge.example.edu",
            display_name="Coach Elena Rostova",
            role="coach",
            avatar_initials="ER",
            is_demo_user=True
        )

        db.add_all([jordan, maya, marcus_staff, coach_elena])
        db.commit()

        # 2. Athlete Profiles & Private Support Preferences
        jordan_profile = AthleteProfile(
            user_id=jordan.id,
            institution="Cascadia State University",
            academic_level="Sophomore (Undergraduate)",
            primary_sport="Track & Field",
            secondary_sports="Wheelchair Racing (T54)",
            skill_level="Collegiate / National Contender",
            academic_major="Computer Science & Data Science",
            goals="Qualify for National Collegiate Championships while maintaining Dean's List academic standing.",
            experience_type="accessible",
            preferred_training_times="Mornings (07:30-09:30), Late Afternoons (16:30-18:30)",
            region="Pacific Northwest",
            visibility_preferences="institution_only"
        )
        jordan_support = AthleteSupportPreference(
            user_id=jordan.id,
            optional_needs_description="Requires ramp-accessible athletic weight facilities and secured equipment storage for racing chair.",
            communication_preference="Email and In-App Notifications",
            equipment_notes="Racing chair requires secured trailer transport space during away competitions.",
            is_private=True
        )

        maya_profile = AthleteProfile(
            user_id=maya.id,
            institution="Cascadia State University",
            academic_level="Junior (Undergraduate)",
            primary_sport="Swimming",
            secondary_sports="Open Water Distance",
            skill_level="Varsity Division I",
            academic_major="Pre-Medicine / Biochemistry",
            goals="Achieve Olympic Trials qualifying split in 200m Freestyle while finishing Organic Chemistry lab.",
            experience_type="standard",
            preferred_training_times="Early Mornings (06:00-08:00), Afternoons (15:00-17:00)",
            region="Pacific Northwest",
            visibility_preferences="institution_only"
        )
        maya_support = AthleteSupportPreference(
            user_id=maya.id,
            optional_needs_description="Prefers visual cueing and printed race itineraries due to auditory processing preference in loud pool environments.",
            communication_preference="Written communication / In-App",
            equipment_notes="Noise-dampening prep zone before competition finals.",
            is_private=True
        )

        db.add_all([jordan_profile, jordan_support, maya_profile, maya_support])
        db.commit()

        # 3. Schedule Events for Jordan (includes an intentional buffer conflict to demonstrate BalanceAI)
        today = datetime.date.today()
        d0 = today.isoformat()
        d1 = (today + datetime.timedelta(days=1)).isoformat()
        d2 = (today + datetime.timedelta(days=2)).isoformat()
        d3 = (today + datetime.timedelta(days=3)).isoformat()

        events = [
            # Day 0 (Today)
            Event(
                user_id=jordan.id,
                title="Morning Aerobic Propulsion Drill",
                event_type="training",
                date=d0,
                start_time="07:30",
                end_time="09:00",
                is_fixed=False,
                priority="high",
                buffer_minutes=20,
                location="Varsity Track Complex",
                notes="Target heart rate zone 3; focus on stroke turnover."
            ),
            Event(
                user_id=jordan.id,
                title="CS 210: Data Structures Lecture",
                event_type="academic",
                date=d0,
                start_time="10:00",
                end_time="11:30",
                is_fixed=True,
                priority="high",
                buffer_minutes=15,
                location="Turing Hall 102",
                notes="Exam review session on tree traversals."
            ),
            # Transition conflict demonstration:
            Event(
                user_id=jordan.id,
                title="CS 210 Lab: Binary Search Trees",
                event_type="academic",
                date=d0,
                start_time="14:00",
                end_time="15:30",
                is_fixed=True,
                priority="high",
                buffer_minutes=15,
                location="Engineering Lab 4",
                notes="Mandatory in-person code evaluation."
            ),
            Event(
                user_id=jordan.id,
                title="Weight Room: Core & Shoulder Stability",
                event_type="training",
                date=d0,
                start_time="15:40",
                end_time="16:40",
                is_fixed=False,
                priority="medium",
                buffer_minutes=25,
                location="Athletic High-Performance Center",
                notes="Conflict demo: Only 10m transition between Lab and Weight Room (requires 25m transit/prep)."
            ),
            # Day 1
            Event(
                user_id=jordan.id,
                title="Rest & Mobility Session",
                event_type="rest",
                date=d1,
                start_time="08:00",
                end_time="09:00",
                is_fixed=False,
                priority="low",
                buffer_minutes=10,
                location="Home / Recovery Studio",
                notes="Foam rolling, bands, and breathwork."
            ),
            Event(
                user_id=jordan.id,
                title="MATH 308: Linear Algebra",
                event_type="academic",
                date=d1,
                start_time="11:00",
                end_time="12:20",
                is_fixed=True,
                priority="high",
                buffer_minutes=15,
                location="Science Complex 201",
                notes="Eigenvectors and quadratic forms."
            ),
            Event(
                user_id=jordan.id,
                title="Sprint Interval Pacing (400m Splits)",
                event_type="training",
                date=d1,
                start_time="16:30",
                end_time="18:00",
                is_fixed=False,
                priority="high",
                buffer_minutes=20,
                location="Outdoor Stadium Track",
                notes="Video analysis session with Coach Elena."
            ),
            # Day 2
            Event(
                user_id=jordan.id,
                title="MIDTERM EXAM: CS 210 Data Structures",
                event_type="exam",
                date=d2,
                start_time="10:00",
                end_time="12:00",
                is_fixed=True,
                priority="high",
                buffer_minutes=30,
                location="Turing Hall Auditorium",
                notes="Fixed academic exam. Accommodated desk approved."
            ),
            Event(
                user_id=jordan.id,
                title="Team Travel Briefing & Equipment Packing",
                event_type="travel",
                date=d2,
                start_time="15:00",
                end_time="16:30",
                is_fixed=True,
                priority="high",
                buffer_minutes=20,
                location="Athletic Fieldhouse",
                notes="Loading racing chairs and timing transponders."
            ),
            # Day 3
            Event(
                user_id=jordan.id,
                title="Pacific Invitational Collegiate Track Meet",
                event_type="competition",
                date=d3,
                start_time="09:00",
                end_time="16:00",
                is_fixed=True,
                priority="high",
                buffer_minutes=45,
                location="Eugene Regional Stadium",
                notes="100m, 400m, and 800m T54 heats."
            )
        ]
        db.add_all(events)
        db.commit()

        # 4. Coaches [DEMO LISTING]
        coaches = [
            Coach(
                id=1,
                full_name="Coach Elena Rostova",
                sport="Track & Field / Wheelchair Racing",
                coaching_level="Master Collegiate & Paralympic Specialist",
                hourly_fee="$75 / hr (Demo estimate)",
                availability_status="Accepting 2 Student-Athletes",
                region="Pacific Northwest / Hybrid",
                bio="Former collegiate coach with 12+ years experience mentoring both Olympic and Paralympic caliber track athletes. Specializes in aerobic capacity, race-chair ergonomics, and biomechanical video breakdown.",
                qualifications="USATF Level 3 Sprints/Hurdles, World Para Athletics Certified Coach, M.S. Exercise Physiology.",
                accessibility_specialties="Wheelchair stroke mechanics, stroke-frequency sensors, ramp-accessible training sites.",
                venue_equipment_details="Full 8-lane Mondo track with wheelchair accessible ramp portals; digital high-speed cameras.",
                is_verified_demo=True,
                contact_email="elena.rostova@athletebridge.example.edu"
            ),
            Coach(
                id=2,
                full_name="Coach Marcus Sterling",
                sport="Swimming & Endurance",
                coaching_level="Elite Collegiate Head Coach",
                hourly_fee="$80 / hr (Demo estimate)",
                availability_status="Open for Consultations",
                region="West Coast / Online Video Analysis",
                bio="Passionate about dual-career balance for varsity swimmers. Experienced in tailoring interval training around heavy academic exam blocks without sacrificing sprint speed.",
                qualifications="ASCA Level 4, Former NCAA Division I All-American, Certified Strength & Conditioning Specialist (CSCS).",
                accessibility_specialties="Visual starting strobe adaptation, individual stroke pacing models.",
                venue_equipment_details="Olympic 50m competition pool with hydraulic lift and accessible spectator/deck access.",
                is_verified_demo=True,
                contact_email="marcus.sterling@athletebridge.example.edu"
            ),
            Coach(
                id=3,
                full_name="Coach Sarah Chen",
                sport="Strength & Functional Conditioning",
                coaching_level="Inclusive Performance Specialist",
                hourly_fee="$65 / hr (Demo estimate)",
                availability_status="Available Weekday Afternoons",
                region="Pacific Northwest / On-Campus",
                bio="Focuses on injury resilience, asymmetric power balance, and individualized recovery cycles for multi-sport student athletes.",
                qualifications="NSCA-CSCS, USA Weightlifting Level 2, Adaptive Training Academy Certified.",
                accessibility_specialties="Cable-based accessible resistance machines, seated power production.",
                venue_equipment_details="Accessible universal gym, wheelchair roller ergometers, pneumatic resistance systems.",
                is_verified_demo=True,
                contact_email="sarah.chen@athletebridge.example.edu"
            )
        ]
        db.add_all(coaches)
        db.commit()

        # 5. Opportunities (AccessMatch)
        opportunities = [
            Opportunity(
                id=1,
                title="Pacific Northwest Inclusive Collegiate Track Invitational",
                type="competition",
                organizer="Cascadia Athletic Conference",
                location="Seattle Regional Track Complex, WA",
                is_online=False,
                start_date="2026-11-14",
                end_date="2026-11-15",
                cost="Covered by Institutional Athletics",
                eligibility="Collegiate varsity & club track athletes (able-bodied & Para-sport divisions).",
                access_details="Zero-step entry to track infield, wheelchair accessible locker rooms and roll-in showers, clear sightline zones, tactile track borders.",
                transport_notes="Accessible campus charter shuttle departs Cascadia Fieldhouse at 06:30 AM.",
                source_url="https://example.edu/demo-opportunities/pnw-invitational",
                verification_state="Verified Accessible Venue",
                last_verified="2026-10-14"
            ),
            Opportunity(
                id=2,
                title="Adaptive Strength & Aerobic Conditioning Summit",
                type="camp",
                organizer="National Center for Inclusive Athletics",
                location="Denver High Performance Center, CO (Hybrid streaming available)",
                is_online=False,
                start_date="2026-12-05",
                end_date="2026-12-08",
                cost="$120 (Stipends available through SupportBridge)",
                eligibility="Open to collegiate student-athletes with physical or sensory disabilities.",
                access_details="Fully accessible dorms, braille/high-contrast signage, ASL interpreters present at all lecture halls, sensory quiet rooms.",
                transport_notes="Accessible airport shuttle provided from Denver International (DEN).",
                source_url="https://example.edu/demo-opportunities/adaptive-strength-camp",
                verification_state="Verified Accessible Venue",
                last_verified="2026-10-18"
            ),
            Opportunity(
                id=3,
                title="Student-Athlete Dual Career Career & Tech Fellowship",
                type="program",
                organizer="Global Athletes in Tech Initiative",
                location="Virtual / Remote Interactive Workshops",
                is_online=True,
                start_date="2026-11-01",
                end_date="2026-12-15",
                cost="Free (Fully Funded Grant)",
                eligibility="Active student-athletes in STEM majors balancing varsity training.",
                access_details="Live closed captioning (CART), screen-reader verified workshop materials, asynchronous recording library.",
                transport_notes="Virtual attendance; no travel required.",
                source_url="https://example.edu/demo-opportunities/tech-fellowship",
                verification_state="Verified Accessible Venue",
                last_verified="2026-10-12"
            ),
            Opportunity(
                id=4,
                title="Regional Open Water Distance Showcase",
                type="event",
                organizer="Coastal Aquatics League",
                location="Lake Washington Marina, Kirkland, WA",
                is_online=False,
                start_date="2026-11-20",
                end_date="2026-11-20",
                cost="$40 entry fee",
                eligibility="Open to collegiate swimmers with qualifying 1500m times.",
                access_details="Unverified access to dock launch; gravel pathway to shore may pose difficulty for mobility equipment.",
                transport_notes="Self-transport required. Standard parking 200m from dock.",
                source_url="https://example.edu/demo-opportunities/open-water",
                verification_state="Unverified Access Details",
                last_verified="2026-10-01"
            )
        ]
        db.add_all(opportunities)
        db.commit()

        # 6. Scholarships [DEMO LISTING]
        scholarships = [
            Scholarship(
                id=1,
                title="Collegiate Dual-Career Athletic Merit Grant",
                provider="Pacific Educational & Sports Foundation",
                academic_level="Undergraduate (All Years)",
                sport="All Sports",
                eligibility_criteria="Minimum 3.2 GPA, active collegiate athletic participation, demonstrated leadership in promoting sports inclusion.",
                benefits="$6,000 / academic year + $1,000 professional development fund",
                deadline="2026-11-30",
                official_url="https://example.edu/demo-scholarships/dual-career-grant",
                status="Open",
                last_verified="2026-10-15",
                checklist_json="[\"Academic Transcript (Unofficial)\", \"Athletic Director or Coach Endorsement\", \"500-word Personal Statement on Balancing Academics and Sport\", \"Proof of Enrollment\"]"
            ),
            Scholarship(
                id=2,
                title="NextGen Adaptive Athletics Excellence Fellowship",
                provider="Endeavor Inclusive Sports Trust",
                academic_level="Undergraduate & Graduate",
                sport="Adaptive & Paralympic Sports",
                eligibility_criteria="Student-athletes competing in recognized adaptive sports categories; minimum 3.0 GPA.",
                benefits="$8,500 / academic year + customized equipment grant subsidy",
                deadline="2026-12-15",
                official_url="https://example.edu/demo-scholarships/nextgen-adaptive",
                status="Open",
                last_verified="2026-10-18",
                checklist_json="[\"Proof of competition participation\", \"Letter of Recommendation\", \"Equipment needs statement\", \"Transcript\"]"
            ),
            Scholarship(
                id=3,
                title="Women in STEM Athletics Leadership Award",
                provider="Cascadia Innovation in Sports Initiative",
                academic_level="Sophomore / Junior / Senior",
                sport="All Sports",
                eligibility_criteria="Female or non-binary student-athletes enrolled in engineering, computer science, or biological sciences.",
                benefits="$5,000 tuition grant + tech industry mentorship match",
                deadline="2026-12-01",
                official_url="https://example.edu/demo-scholarships/women-stem-athletics",
                status="Open",
                last_verified="2026-10-10",
                checklist_json="[\"STEM project portfolio / resume\", \"Coach recommendation\", \"Personal essay on innovation in training\"]"
            )
        ]
        db.add_all(scholarships)
        db.commit()

        # 7. SupportBridge Requests
        req1 = SupportRequest(
            id=1,
            athlete_id=jordan.id,
            athlete_name=jordan.display_name,
            category="academic_exam",
            concise_description="Reschedule CS 210 Midterm exam window due to travel for Pacific Invitational Track Meet.",
            date_needed="2026-10-25",
            preferred_comm_method="Email & In-App",
            status="under_review",
            staff_notes="Received official race itinerary from Cascadia Track Director. Contacted Prof. Hamilton for proctored alternative on Monday.",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=2),
            updated_at=datetime.datetime.utcnow() - datetime.timedelta(hours=6)
        )
        db.add(req1)
        db.commit()

        hist1 = SupportRequestHistory(
            request_id=req1.id,
            changed_by_user_id=jordan.id,
            changed_by_name="Jordan Reed (Athlete)",
            status_from="none",
            status_to="submitted",
            note="Request submitted with official meet schedule attached.",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=2)
        )
        hist2 = SupportRequestHistory(
            request_id=req1.id,
            changed_by_user_id=marcus_staff.id,
            changed_by_name="Marcus Vance (Staff)",
            status_from="submitted",
            status_to="under_review",
            note="Assigned to Academic Accommodations liaison. Validating course syllabus travel policy.",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=6)
        )
        db.add_all([hist1, hist2])
        db.commit()

        # 8. DualProgress Goals & Athlete Passport
        g1 = ProgressGoal(
            athlete_id=jordan.id,
            category="academic",
            title="Maintain CS Major GPA ≥ 3.7",
            target_metric="3.70 GPA",
            current_metric="3.68 GPA",
            target_date="2026-12-20",
            status="in_progress"
        )
        g2 = ProgressGoal(
            athlete_id=jordan.id,
            category="sport",
            title="Break 14.80s in 100m T54 Wheelchair Split",
            target_metric="14.80 sec",
            current_metric="15.12 sec",
            target_date="2026-11-15",
            status="in_progress"
        )
        g3 = ProgressGoal(
            athlete_id=jordan.id,
            category="academic",
            title="Complete CS 210 Tree Assignment with perfect unit tests",
            target_metric="100% test coverage",
            current_metric="85% implemented",
            target_date="2026-10-28",
            status="in_progress"
        )
        db.add_all([g1, g2, g3])

        ach1 = AthleteAchievement(
            athlete_id=jordan.id,
            title="Pac-12 All-Academic Honors Team (Sophomore)",
            category="academic",
            date_achieved="2026-06-10",
            provenance="verified_institutional",
            verified_by="Cascadia Athletics Compliance Office",
            is_shared_publicly=True
        )
        ach2 = AthleteAchievement(
            athlete_id=jordan.id,
            title="Gold Medal — 400m Wheelchair National Qualifier",
            category="sport",
            date_achieved="2026-07-22",
            provenance="verified_institutional",
            verified_by="National Para Athletics Federation",
            is_shared_publicly=True
        )
        ach3 = AthleteAchievement(
            athlete_id=jordan.id,
            title="Personal Best: 100m Split (15.12s) at Summer Invitational",
            category="sport",
            date_achieved="2026-08-14",
            provenance="self_entered",
            verified_by="Self-Recorded Training Log",
            is_shared_publicly=False
        )
        db.add_all([ach1, ach2, ach3])
        db.commit()

        # 9. Smart Notifications
        notifs = [
            Notification(
                user_id=jordan.id,
                title="BalanceAI Schedule Conflict Alert",
                message="Only 10m buffer between CS 210 Lab and Weight Room on today's schedule. Minimum required buffer is 25m. Click to suggest alternatives.",
                notification_type="schedule_conflict",
                is_read=False
            ),
            Notification(
                user_id=jordan.id,
                title="SupportBridge Status Update",
                message="Your accommodation request #1 for CS 210 Midterm was moved to 'Under Review' by Marcus Vance.",
                notification_type="support_update",
                is_read=False
            ),
            Notification(
                user_id=jordan.id,
                title="Scholarship Deadline Approaching",
                message="Collegiate Dual-Career Athletic Merit Grant deadline is in 40 days (Nov 30). 2 checklist items remaining.",
                notification_type="scholarship_deadline",
                is_read=True
            )
        ]
        db.add_all(notifs)

        # 10. FuelRight & Recovery logs
        meal1 = MealLog(
            athlete_id=jordan.id,
            meal_type="pre_training",
            description="Steel-cut oatmeal with banana, chia seeds, almond butter, and 600ml electrolyte water.",
            hydration_ml=600,
            timing_relative_to_training="2 hours before speed intervals",
            dietary_flags="Plant-rich, High Complex Carbohydrates"
        )
        meal2 = MealLog(
            athlete_id=jordan.id,
            meal_type="post_training",
            description="Grilled tofu grain bowl with quinoa, roasted sweet potatoes, greens, and pumpkin seeds.",
            hydration_ml=750,
            timing_relative_to_training="Within 45m post-workout",
            dietary_flags="High Protein Recovery"
        )
        db.add_all([meal1, meal2])

        train1 = TrainingSession(
            athlete_id=jordan.id,
            sport="Track & Field / Wheelchair Racing",
            duration_minutes=90,
            intensity="high",
            equipment_used="Carbon racing chair, roller ergometer, heart rate chest strap",
            completed=True,
            notes="6x400m intervals. Maintained consistent cadence throughout 4th and 5th sets."
        )
        db.add(train1)

        rec1 = RecoveryLog(
            athlete_id=jordan.id,
            sleep_hours=8.2,
            fatigue_level=2,
            perceived_exertion=7,
            rest_quality="good",
            self_notes="Woke up feeling energetic. Slight shoulder tightness resolved with mobility bands."
        )
        db.add(rec1)

        # 11. MindStrong
        counsellors = [
            Counsellor(
                id=1,
                name="Dr. Aris Thorne",
                specialty="Sports Psychology & Competition Mindset",
                bio="Doctor of Psychology specializing in pre-competition arousal regulation, positive visualization, and balancing demanding academic workloads with collegiate athletic pressures.",
                credentials_demo="Psy.D., CMPC (Certified Mental Performance Consultant) [Demo Listing]",
                contact_info="wellbeing.thorne@cascadia.example.edu",
                demo_notice="[DEMO LISTING] Fictional practitioner profile for prototype illustration."
            ),
            Counsellor(
                id=2,
                name="Dr. Maya Patel",
                specialty="Student-Athlete Transition & Stress Resilience",
                bio="Focuses on navigating dual-identity challenges, injury recovery resilience, and mindfulness strategies during high-stress exam weeks.",
                credentials_demo="Ph.D. Counseling Psychology, Licensed Psychologist [Demo Listing]",
                contact_info="wellbeing.patel@cascadia.example.edu",
                demo_notice="[DEMO LISTING] Fictional practitioner profile for prototype illustration."
            )
        ]
        db.add_all(counsellors)

        m1 = MoodEntry(
            athlete_id=jordan.id,
            mood_score=4,
            reflection_notes="Feeling confident about sprint cadence today. Feeling a little nervous about midterm next Wednesday, but planning study blocks helps a lot.",
            is_private=True
        )
        db.add(m1)

        # 12. Community Groups & Posts
        groups = [
            CommunityGroup(
                id=1,
                name="Collegiate Adaptive & Para Track Network",
                sport="Track & Field / Adaptive Racing",
                region="National Collegiate",
                description="A shared space for collegiate wheelchair racers, blind/low-vision athletes, and coaches to share equipment tips, race travel logistics, and pacing strategies.",
                member_count=38,
                is_adaptive_interest=True
            ),
            CommunityGroup(
                id=2,
                name="STEM Student-Athletes Hub",
                sport="Multi-Sport",
                region="Cascadia & West Coast",
                description="Balancing rigorous engineering, CS, and pre-med labs with varsity sports schedules. Tips on proctoring, exam travel, and coding on the team bus.",
                member_count=52,
                is_adaptive_interest=False
            ),
            CommunityGroup(
                id=3,
                name="Distance & Pacing Strategy Circle",
                sport="Endurance & Track",
                region="Pacific Northwest",
                description="Discussion on heart-rate zones, taper weeks, sleep tracking, and race mental preparation.",
                member_count=29,
                is_adaptive_interest=False
            )
        ]
        db.add_all(groups)
        db.commit()

        posts = [
            GroupPost(
                group_id=1,
                author_id=jordan.id,
                author_name="Jordan Reed (Sophomore, Cascadia State)",
                content="[DEMO POST] Anyone traveling to the Seattle regional meet next month? Let's coordinate on secure gear transport and accessible warm-up lane schedules!",
                is_flagged=False
            ),
            GroupPost(
                group_id=2,
                author_id=maya.id,
                author_name="Maya Lin (Junior, Cascadia State)",
                content="[DEMO POST] Pro tip for anyone taking Organic Chem or Data Structures while competing: submit your SupportBridge exam travel letters 2 full weeks before syllabus drop!",
                is_flagged=False
            )
        ]
        db.add_all(posts)
        db.commit()

        # Seed enrichment profiles and coaches
        seed_test_profiles_and_enrichment(db)

        print("Database seeding completed successfully!")

    finally:
        if close_after:
            db.close()


def seed_test_profiles_and_enrichment(db: Session):
    print("Checking enrichment test personas, coaches, and sport opportunities...")

    today = datetime.date.today()
    d0 = today.isoformat()
    d1 = (today + datetime.timedelta(days=1)).isoformat()
    d2 = (today + datetime.timedelta(days=2)).isoformat()
    d3 = (today + datetime.timedelta(days=3)).isoformat()

    if not db.query(User).filter(User.id == 5).first():
        print("Adding User 5-8 test profiles...")
        # User 5: Profile A (Alex Chen - College Badminton Player)
        alex = User(
            id=5,
            email="alex.chen@athletebridge.example.edu",
            display_name="Alex Chen (Profile A)",
            role="athlete",
            avatar_initials="AC",
            is_demo_user=True
        )
        # User 6: Profile B (Samira Patel - School Swimmer)
        samira = User(
            id=6,
            email="samira.patel@athletebridge.example.edu",
            display_name="Samira Patel (Profile B)",
            role="athlete",
            avatar_initials="SP",
            is_demo_user=True
        )
        # User 7: Profile C (Tariq Malik - PwD Wheelchair Basketball)
        tariq = User(
            id=7,
            email="tariq.malik@athletebridge.example.edu",
            display_name="Tariq Malik (Profile C)",
            role="athlete",
            avatar_initials="TM",
            is_demo_user=True
        )
        # User 8: Profile D (Zoe Rivera - PwD Visual Accessibility)
        zoe = User(
            id=8,
            email="zoe.rivera@athletebridge.example.edu",
            display_name="Zoe Rivera (Profile D)",
            role="athlete",
            avatar_initials="ZR",
            is_demo_user=True
        )

        db.add_all([alex, samira, tariq, zoe])
        db.commit()

        # Profiles & Support Preferences
        alex_prof = AthleteProfile(
            user_id=alex.id,
            institution="Cascadia State University",
            academic_level="College student",
            primary_sport="Badminton",
            secondary_sports="Table Tennis",
            skill_level="Collegiate / Regional",
            academic_major="Business Administration & Analytics",
            goals="Balance midterms and final examination prep with regional collegiate badminton varsity tournament.",
            exam_period="Midterms in 2 weeks",
            short_term_sport_goals="Improve backhand clear and court footwork reaction time.",
            long_term_sport_goals="Qualify for Inter-Collegiate Badminton Championships.",
            improvement_areas="Footwork, Technique, Consistency",
            platform_goals="Balance education and sports, Find a coach, Improve time management",
            experience_type="standard",
            preferred_training_times="Training: Evening (17:30-19:30) | Study: Morning (09:00-11:00)",
            region="Pacific Northwest",
            visibility_preferences="institution_only"
        )
        alex_supp = AthleteSupportPreference(
            user_id=alex.id,
            optional_needs_description="No specific accessibility support needed.",
            communication_preference="Email and In-App Notifications",
            equipment_notes="Custom Yonex racquet stringing setup (28 lbs).",
            is_private=True
        )

        samira_prof = AthleteProfile(
            user_id=samira.id,
            institution="Cascadia High School",
            academic_level="School student",
            primary_sport="Swimming",
            secondary_sports="Water Polo",
            skill_level="School or college level",
            academic_major="High School Honors Science Track",
            goals="Improve 100m freestyle split time to 54.2s while completing AP Chemistry and Pre-Calculus homework.",
            exam_period="High School Semester Finals in 3 weeks",
            short_term_sport_goals="Increase kickboard tempo and streamline off turns.",
            long_term_sport_goals="State Championship Podiums & College Division I Recruitment.",
            improvement_areas="Endurance, Consistency, Competition preparation",
            platform_goals="Improve sporting performance, Discover competitions, Track personal progress",
            experience_type="standard",
            preferred_training_times="Training: Morning (06:00-07:30) | Study: Afternoon (16:30-18:30)",
            region="Pacific Northwest",
            visibility_preferences="institution_only"
        )
        samira_supp = AthleteSupportPreference(
            user_id=samira.id,
            optional_needs_description="No specific accessibility support needed.",
            communication_preference="Email & In-App Alerts",
            equipment_notes="Competition tech suits and high-definition goggles.",
            is_private=True
        )

        tariq_prof = AthleteProfile(
            user_id=tariq.id,
            institution="Cascadia State University",
            academic_level="College student",
            primary_sport="Wheelchair Basketball",
            secondary_sports="Para Powerlifting",
            skill_level="District or state level",
            academic_major="Kinesiology & Sports Science",
            goals="Lead regional collegiate adaptive hoops squad and qualify for National Wheelchair Basketball League tournament.",
            exam_period="Kinesiology Anatomy Practicum",
            short_term_sport_goals="Consistent free-throw percentage under pressure and seated court agility.",
            long_term_sport_goals="Paralympic Development Team Selection.",
            improvement_areas="Coordination, Technique, Competition preparation",
            platform_goals="Find suitable training facilities, Discover inclusive sports programs, Find a coach",
            experience_type="accessible",
            preferred_training_times="Training: Afternoon (15:30-17:30) | Study: Evening (19:30-21:30)",
            region="Pacific Northwest",
            visibility_preferences="institution_only"
        )
        tariq_supp = AthleteSupportPreference(
            user_id=tariq.id,
            optional_needs_description="Requires ramp-accessible basketball courts, wide door thresholds, and secure basketball chair storage.",
            communication_preference="Email and In-App Notifications",
            equipment_notes="Per4Max custom basketball wheelchair with 16-degree camber; spare axle pins required.",
            is_private=True
        )

        zoe_prof = AthleteProfile(
            user_id=zoe.id,
            institution="Cascadia State University",
            academic_level="College student",
            primary_sport="Track & Field",
            secondary_sports="Tandem Cycling",
            skill_level="Collegiate / Regional",
            academic_major="Communications & Media Studies",
            goals="Break regional 200m T12 record with guide runner while maintaining 3.8 GPA in college coursework.",
            exam_period="Midterms in 3 weeks",
            short_term_sport_goals="Synchronize tether mechanics and audible cadence cues with guide.",
            long_term_sport_goals="World Para Athletics Championships qualification.",
            improvement_areas="Coordination, Strategic understanding, Consistency",
            platform_goals="Access learning resources, Find a coach, Balance education and sports",
            experience_type="accessible",
            preferred_training_times="Training: Morning (08:00-10:00) | Study: Afternoon (14:00-16:00)",
            region="Pacific Northwest",
            visibility_preferences="institution_only"
        )
        zoe_supp = AthleteSupportPreference(
            user_id=zoe.id,
            optional_needs_description="Requires screen-reader compatible course packs (EPUB/MathJax), audio lecture recordings, and guide runner track clearance.",
            communication_preference="In-App Audio & Screen-Reader Alerts",
            equipment_notes="Running guide tether and acoustic lane locator beacons.",
            is_private=True
        )

        db.add_all([alex_prof, alex_supp, samira_prof, samira_supp, tariq_prof, tariq_supp, zoe_prof, zoe_supp])
        db.commit()

        # Events tailored to each profile
        enrichment_events = [
            # Alex Chen (College Badminton - Evening training, Exam balance)
            Event(user_id=alex.id, title="BUS 310: Business Analytics & Decision Models", event_type="academic", date=d0, start_time="10:00", end_time="11:30", is_fixed=True, buffer_minutes=15, location="Business Hall 204"),
            Event(user_id=alex.id, title="Badminton Footwork & Shuttle Placement Drill", event_type="training", date=d0, start_time="17:30", end_time="19:30", is_fixed=False, priority="high", buffer_minutes=15, location="Fieldhouse Sprung Courts 2-3", notes="Focus on backhand recovery and front-court lunges."),
            Event(user_id=alex.id, title="Dedicated Midterm Study Block: Accounting", event_type="academic", date=d1, start_time="09:00", end_time="11:00", is_fixed=False, buffer_minutes=15, location="Library Study Room B"),
            Event(user_id=alex.id, title="Badminton Singles Tactical Match Play", event_type="training", date=d1, start_time="17:30", end_time="19:30", is_fixed=False, priority="high", buffer_minutes=15, location="Fieldhouse Sprung Court 1"),
            Event(user_id=alex.id, title="MIDTERM EXAM: Financial Accounting", event_type="exam", date=d2, start_time="10:00", end_time="12:00", is_fixed=True, priority="high", buffer_minutes=25, location="Business Hall Auditorium"),

            # Samira Patel (School Swimmer - Morning training, Performance focus)
            Event(user_id=samira.id, title="Morning Aerobic Swim Interval Set (3,000m)", event_type="training", date=d0, start_time="06:00", end_time="07:30", is_fixed=False, priority="high", buffer_minutes=15, location="Aquatics Center 50m Pool", notes="Hold 1:08 pace per 100m."),
            Event(user_id=samira.id, title="High School AP Chemistry & Pre-Calculus Block", event_type="academic", date=d0, start_time="08:30", end_time="15:00", is_fixed=True, buffer_minutes=15, location="Cascadia High Academic Wing"),
            Event(user_id=samira.id, title="Dedicated Homework & Lab Pacing", event_type="academic", date=d0, start_time="16:30", end_time="18:30", is_fixed=False, buffer_minutes=15, location="Home / Study Room"),
            Event(user_id=samira.id, title="Sprint 50m Free Interval Technique & Turns", event_type="training", date=d1, start_time="06:00", end_time="07:30", is_fixed=False, priority="high", buffer_minutes=15, location="Aquatics Center Lane 3"),
            Event(user_id=samira.id, title="High School English Literature & History", event_type="academic", date=d1, start_time="08:30", end_time="15:00", is_fixed=True, buffer_minutes=15, location="Cascadia High Room 212"),

            # Tariq Malik (PwD Wheelchair Basketball - Accessible training & Inclusive comps)
            Event(user_id=tariq.id, title="KIN 240: Biomechanics of Seated Movement", event_type="academic", date=d0, start_time="10:00", end_time="11:30", is_fixed=True, buffer_minutes=25, location="Science Complex 104 (Ramp Portal Verified)"),
            Event(user_id=tariq.id, title="Wheelchair Basketball Court Agility & Sprints", event_type="training", date=d0, start_time="15:30", end_time="17:30", is_fixed=False, priority="high", buffer_minutes=25, location="Varsity Arena (Ramp Portal 2 & Elevator Verified)", notes="Fast-break chair agility, picking angles, and shooting arc."),
            Event(user_id=tariq.id, title="Campus Library Study Session (Level Entrance 1)", event_type="academic", date=d1, start_time="13:00", end_time="14:30", is_fixed=False, buffer_minutes=25, location="Library Accessible Floor 2"),
            Event(user_id=tariq.id, title="Perimeter Shooting & Fast-Break Scrimmage", event_type="training", date=d1, start_time="15:30", end_time="17:30", is_fixed=False, priority="high", buffer_minutes=25, location="Varsity Arena Court A (Accessible Entry)"),
            Event(user_id=tariq.id, title="Kinesiology Anatomy Exam Window", event_type="exam", date=d2, start_time="10:00", end_time="12:00", is_fixed=True, priority="high", buffer_minutes=35, location="Exam Center (Accessible Desk Verified)"),

            # Zoe Rivera (PwD Visual Accessibility - College student, Screen-reader study)
            Event(user_id=zoe.id, title="T12 Sprint Pacing & Guide Synchrony Drills", event_type="training", date=d0, start_time="08:00", end_time="09:30", is_fixed=False, priority="high", buffer_minutes=25, location="Stadium Track - Lane 1 (Auditory Markers Installed)", notes="Tether tension practice and sound-beacon cornering."),
            Event(user_id=zoe.id, title="COMM 204: Media Ethics Lecture (Audio Transcript Active)", event_type="academic", date=d0, start_time="11:00", end_time="12:30", is_fixed=True, buffer_minutes=25, location="Communications Hall 110"),
            Event(user_id=zoe.id, title="Screen-Reader Study & Essay Synthesis", event_type="academic", date=d0, start_time="14:00", end_time="16:00", is_fixed=False, buffer_minutes=20, location="Digital Accessibility Lab 3"),
            Event(user_id=zoe.id, title="Strength & Starting Block Cadence with Guide", event_type="training", date=d1, start_time="08:00", end_time="09:30", is_fixed=False, priority="high", buffer_minutes=25, location="Varsity High Performance Center"),
            Event(user_id=zoe.id, title="MIDTERM EXAM: Communications Theory", event_type="exam", date=d2, start_time="10:00", end_time="12:30", is_fixed=True, priority="high", buffer_minutes=35, location="Turing Hall (Screen-Reader Station & 1.5x Time Approved)")
        ]
        db.add_all(enrichment_events)
        db.commit()

    # Additional Sport Coaches
    new_coaches = [
        Coach(
            id=4,
            full_name="Coach David Tan",
            sport="Badminton",
            coaching_level="National Collegiate & High-Performance Coach",
            hourly_fee="$65 / hr (Demo estimate)",
            availability_status="Accepting Evening Athletes",
            region="Pacific Northwest / Hybrid",
            bio="Former national badminton competitor with 10+ years coaching varsity and junior champions. Specializes in deceptive front-court placement, footwork transition recovery, and tournament match preparation.",
            qualifications="BWF Level 2 Certified Coach, Former National Doubles Finalist, M.S. Sports Coaching.",
            accessibility_specialties="Low-impact joint preservation drills, adaptive standing badminton (SU5 / SL4).",
            venue_equipment_details="6 BWF-approved wooden sprung courts, Yonex electronic stringing service on site.",
            is_verified_demo=True,
            contact_email="david.tan@athletebridge.example.edu"
        ),
        Coach(
            id=5,
            full_name="Coach Jerome Washington",
            sport="Wheelchair Basketball",
            coaching_level="Paralympic Head Coach & NWBA Specialist",
            hourly_fee="$70 / hr (Demo estimate)",
            availability_status="Open for Consultations",
            region="West Coast / Travel Clinics",
            bio="15+ years coaching wheelchair basketball at collegiate and international levels. Focuses on seated agility, chair positioning angles, fast-break transition recovery, and high-percentage perimeter shooting.",
            qualifications="NWBA Certified Coach Level 3, Paralympic Games Assistant Coach, M.S. Sports Biomechanics.",
            accessibility_specialties="Custom basketball chair strapping, camber adjustments, high/low pointer classification tactics.",
            venue_equipment_details="Zero-step entrance, hardwood court with wide baseline perimeter, roll-in locker rooms with bench seating.",
            is_verified_demo=True,
            contact_email="jerome.washington@athletebridge.example.edu"
        ),
        Coach(
            id=6,
            full_name="Coach Maya Patel",
            sport="Track & Field / Running",
            coaching_level="Certified Guide Runner & Para Athletics Coach",
            hourly_fee="$60 / hr (Demo estimate)",
            availability_status="Available Weekday Mornings",
            region="Pacific Northwest / On-Campus",
            bio="Specializes in sprint and middle-distance coaching for visually impaired athletes (T11-T13) and collegiate runners. Expert in tether communication and sound-guided approach techniques.",
            qualifications="USATF Level 2 Sprints, Certified Paralympic Guide Runner, CPR/First Aid.",
            accessibility_specialties="Tactile course orientation, auditory cueing, tether mechanics, high-contrast track markings.",
            venue_equipment_details="Tactile lane lines, quiet warm-up straightaway, accessible campus transit drop-off directly at gate.",
            is_verified_demo=True,
            contact_email="maya.patel@athletebridge.example.edu"
        )
    ]
    for c in new_coaches:
        if not db.query(Coach).filter(Coach.id == c.id).first():
            db.add(c)
    db.commit()

    # Additional Opportunities
    new_opps = [
        Opportunity(
            id=5,
            title="Inter-Collegiate Badminton Open Championship",
            type="competition",
            organizer="Cascadia Badminton Association",
            location="Seattle Badminton Center, WA",
            is_online=False,
            start_date="2026-11-28",
            end_date="2026-11-29",
            cost="$35 entry fee",
            eligibility="Collegiate & university badminton players (Singles & Doubles flights A/B/C).",
            access_details="Zero-step building entrance, accessible viewing mezzanine, non-slip hardwood sprung courts.",
            transport_notes="Light rail station 400m; university team shuttle service available.",
            source_url="https://example.edu/demo-opportunities/badminton-open",
            verification_state="Verified Accessible Venue",
            last_verified="2026-10-16"
        ),
        Opportunity(
            id=6,
            title="Cascadia Regional Youth Badminton Development Clinic",
            type="camp",
            organizer="Pacific Northwest Racquet Academy",
            location="Bellevue Community Sportsplex, WA",
            is_online=False,
            start_date="2026-12-12",
            end_date="2026-12-14",
            cost="Free for high school student-athletes",
            eligibility="High school & middle school students (Ages 13-18) seeking competitive skill development.",
            access_details="Full ground-level entrance, ADA accessible locker rooms, clear signage.",
            transport_notes="Metro bus route 245 stops directly at facility main entrance.",
            source_url="https://example.edu/demo-opportunities/youth-badminton",
            verification_state="Verified Accessible Venue",
            last_verified="2026-10-18"
        ),
        Opportunity(
            id=7,
            title="Pacific Northwest Interscholastic Swimming Championship",
            type="competition",
            organizer="Interscholastic Aquatics Board",
            location="Federal Way King County Aquatic Center, WA",
            is_online=False,
            start_date="2026-12-04",
            end_date="2026-12-06",
            cost="Covered by School Athletic Dept",
            eligibility="High school and preparatory school swimmers with state qualifying times.",
            access_details="Elevator to deck, hydraulic chair lift into warm-up pool, wheelchair spectator seating.",
            transport_notes="Team bus transportation departs school athletic center.",
            source_url="https://example.edu/demo-opportunities/interscholastic-swim",
            verification_state="Verified Accessible Venue",
            last_verified="2026-10-20"
        ),
        Opportunity(
            id=8,
            title="National Wheelchair Basketball Invitational (NWBA)",
            type="competition",
            organizer="National Wheelchair Basketball Association & Cascadia Athletics",
            location="Portland Veteran Memorial Coliseum, OR",
            is_online=False,
            start_date="2026-12-18",
            end_date="2026-12-20",
            cost="Covered by Adaptive Athletics Travel Grant",
            eligibility="Open to collegiate & division adaptive wheelchair basketball squads.",
            access_details="100% ADA compliant arena, roll-in team dressing rooms, dedicated repair station for basketball chairs.",
            transport_notes="Accessible charter coach with hydraulic wheelchair lift provided from university.",
            source_url="https://example.edu/demo-opportunities/nwba-invitational",
            verification_state="Verified Accessible Venue",
            last_verified="2026-10-19"
        ),
        Opportunity(
            id=9,
            title="Inclusive Adaptive Hoops & Skills Academy",
            type="camp",
            organizer="Endeavor Inclusive Sports Foundation",
            location="Cascadia University Arena Court A, WA",
            is_online=False,
            start_date="2026-11-21",
            end_date="2026-11-22",
            cost="Free (Stipends for travel available)",
            eligibility="Youth and collegiate adaptive athletes; basketball wheelchairs provided for beginners.",
            access_details="Level threshold court entry, visual and audio court buzzers, companion seating.",
            transport_notes="On-campus facility, accessible parking directly adjacent to West entrance.",
            source_url="https://example.edu/demo-opportunities/adaptive-hoops",
            verification_state="Verified Accessible Venue",
            last_verified="2026-10-15"
        ),
        Opportunity(
            id=10,
            title="Collegiate Inclusive Track & Field Festival (Open & Para Divisions)",
            type="competition",
            organizer="Cascade Athletics & World Para Athletics Partner",
            location="Husky Track Stadium, Seattle, WA",
            is_online=False,
            start_date="2026-11-07",
            end_date="2026-11-08",
            cost="$20 registration (Free for students with fee-waiver)",
            eligibility="Collegiate student-athletes across all abilities (Open collegiate division, Wheelchair T51-T54, Visual Impairment T11-T13 with guides).",
            access_details="Tactile track boundaries, auditory starting signals, zero-barrier infield, sign-language interpreters on site.",
            transport_notes="Accessible Light Rail direct to stadium concourse.",
            source_url="https://example.edu/demo-opportunities/inclusive-track-festival",
            verification_state="Verified Accessible Venue",
            last_verified="2026-10-21"
        )
    ]
    for o in new_opps:
        if not db.query(Opportunity).filter(Opportunity.id == o.id).first():
            db.add(o)
    db.commit()

    # Additional Scholarships
    new_schols = [
        Scholarship(
            id=4,
            title="High School Interscholastic Scholar-Athlete Award",
            provider="Pacific Prep Athletics Endowment",
            academic_level="School student (Grades 10-12)",
            sport="All Sports (Swimming, Badminton, Track, Basketball)",
            eligibility_criteria="High school student-athletes maintaining minimum 3.5 GPA while competing on school varsity or club teams.",
            benefits="$3,500 tuition/equipment stipend + academic mentorship",
            deadline="2026-12-20",
            official_url="https://example.edu/demo-scholarships/high-school-scholar-athlete",
            status="Open",
            last_verified="2026-10-18",
            checklist_json="[\"School transcript upload\", \"Athletic coach recommendation letter\", \"Personal reflection on dual-career commitment\"]"
        ),
        Scholarship(
            id=5,
            title="Adaptive Sports Equipment & Travel Endowment",
            provider="Challenger Foundation for Inclusive Athletics",
            academic_level="School & College student",
            sport="Adaptive & Paralympic Sports (Wheelchair Basketball, Para Athletics, VI Sports)",
            eligibility_criteria="Athletes with physical or sensory adaptations competing in recognized regional or national events.",
            benefits="$5,000 direct grant for custom competition equipment or travel expenses",
            deadline="2026-12-10",
            official_url="https://example.edu/demo-scholarships/adaptive-equipment-grant",
            status="Open",
            last_verified="2026-10-19",
            checklist_json="[\"Equipment quote or competition schedule\", \"Statement of athletic goals\", \"Faculty or coach endorsement\"]"
        )
    ]
    for s in new_schols:
        if not db.query(Scholarship).filter(Scholarship.id == s.id).first():
            db.add(s)
    db.commit()

    # Ensure experience_type is populated on all athlete profiles
    prof_experiences = {
        1: "accessible",
        2: "standard",
        5: "standard",
        6: "standard",
        7: "accessible",
        8: "accessible"
    }
    for uid, exp in prof_experiences.items():
        p = db.query(AthleteProfile).filter(AthleteProfile.user_id == uid).first()
        if p and (not getattr(p, "experience_type", None) or p.experience_type != exp):
            p.experience_type = exp
    db.commit()

    print("Test profiles (A, B, C, D) and rich sports enrichment seeded successfully!")

if __name__ == "__main__":
    seed_database()
