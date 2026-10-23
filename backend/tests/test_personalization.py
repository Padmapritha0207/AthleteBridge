import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_profile_a_college_badminton_personalization():
    # User 5 is Alex Chen (Profile A: College Badminton Player)
    res = client.get("/api/profile/me", headers={"X-Demo-User-Id": "5", "X-Demo-Role": "athlete"})
    assert res.status_code == 200
    data = res.json()
    prof = data["profile"]
    assert prof["primary_sport"] == "Badminton"
    assert "College" in prof["academic_level"]
    assert "Business" in prof["academic_major"]
    assert "Midterms" in prof["exam_period"]

    # Check that events are for Badminton and Evening Training
    ev_res = client.get("/api/schedule/events", headers={"X-Demo-User-Id": "5", "X-Demo-Role": "athlete"})
    assert ev_res.status_code == 200
    events = ev_res.json()
    assert any("Badminton" in e["title"] for e in events)
    assert any(e["start_time"] == "17:30" for e in events)

    # Check Coach recommendations for Badminton
    coach_res = client.get("/api/coaches?sport=Badminton")
    assert coach_res.status_code == 200
    coaches = coach_res.json()
    assert len(coaches) >= 1
    assert any(c["full_name"] == "Coach David Tan" for c in coaches)

    # Check Opportunities for Badminton
    opp_res = client.get("/api/opportunities?sport=Badminton")
    assert opp_res.status_code == 200
    opps = opp_res.json()
    assert len(opps) >= 1
    assert any("Badminton" in o["title"] for o in opps)


def test_profile_b_school_swimmer_personalization():
    # User 6 is Samira Patel (Profile B: School Swimmer)
    res = client.get("/api/profile/me", headers={"X-Demo-User-Id": "6", "X-Demo-Role": "athlete"})
    assert res.status_code == 200
    prof = res.json()["profile"]
    assert prof["primary_sport"] == "Swimming"
    assert "School" in prof["academic_level"]

    # Check that events are for Morning Swimming (06:00) and High School classes
    ev_res = client.get("/api/schedule/events", headers={"X-Demo-User-Id": "6", "X-Demo-Role": "athlete"})
    assert ev_res.status_code == 200
    events = ev_res.json()
    assert any("Swim" in e["title"] for e in events)
    assert any(e["start_time"] == "06:00" for e in events)
    assert any("High School" in e["title"] for e in events)

    # Check Coach recommendations for Swimming
    coach_res = client.get("/api/coaches?sport=Swimming")
    assert coach_res.status_code == 200
    coaches = coach_res.json()
    assert any("Sterling" in c["full_name"] for c in coaches)

    # Check Interscholastic Swimming Opportunities
    opp_res = client.get("/api/opportunities?sport=Swimming")
    assert opp_res.status_code == 200
    opps = opp_res.json()
    assert any("Swimming" in o["title"] for o in opps)


def test_profile_c_pwd_wheelchair_basketball_personalization():
    # User 7 is Tariq Malik (Profile C: PwD Wheelchair Basketball)
    res = client.get("/api/profile/me", headers={"X-Demo-User-Id": "7", "X-Demo-Role": "athlete"})
    assert res.status_code == 200
    data = res.json()
    prof = data["profile"]
    supp = data["support_preference"]
    assert prof["primary_sport"] == "Wheelchair Basketball"
    assert "ramp" in supp["optional_needs_description"].lower() or "basketball" in supp["equipment_notes"].lower()

    # Check events have 25m+ buffers and wheelchair court sessions
    ev_res = client.get("/api/schedule/events", headers={"X-Demo-User-Id": "7", "X-Demo-Role": "athlete"})
    assert ev_res.status_code == 200
    events = ev_res.json()
    assert any("Wheelchair Basketball" in e["title"] for e in events)
    assert all(e["buffer_minutes"] >= 25 for e in events)

    # Check Coach recommendations for Wheelchair Basketball
    coach_res = client.get("/api/coaches?sport=Wheelchair%20Basketball")
    assert coach_res.status_code == 200
    coaches = coach_res.json()
    assert any("Jerome Washington" in c["full_name"] for c in coaches)

    # Check Opportunities for Wheelchair Basketball (NWBA)
    opp_res = client.get("/api/opportunities?sport=Wheelchair%20Basketball")
    assert opp_res.status_code == 200
    opps = opp_res.json()
    assert any("NWBA" in o["title"] or "Wheelchair Basketball" in o["title"] for o in opps)


def test_profile_d_pwd_visual_accessibility_personalization():
    # User 8 is Zoe Rivera (Profile D: PwD Visual Accessibility)
    res = client.get("/api/profile/me", headers={"X-Demo-User-Id": "8", "X-Demo-Role": "athlete"})
    assert res.status_code == 200
    data = res.json()
    supp = data["support_preference"]
    assert "screen-reader" in supp["optional_needs_description"].lower() or "guide" in supp["optional_needs_description"].lower()

    # Check events include screen-reader and guide synchrony
    ev_res = client.get("/api/schedule/events", headers={"X-Demo-User-Id": "8", "X-Demo-Role": "athlete"})
    assert ev_res.status_code == 200
    events = ev_res.json()
    assert any("Guide" in e["title"] or "T12" in e["title"] for e in events)
    assert any("Screen-Reader" in e["title"] for e in events)

    # Check Coach recommendations for Para Running / Guide
    coach_res = client.get("/api/coaches?q=Guide")
    assert coach_res.status_code == 200
    coaches = coach_res.json()
    assert any("Maya Patel" in c["full_name"] for c in coaches)
