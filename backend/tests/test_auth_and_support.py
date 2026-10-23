import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_api_root_and_health():
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["platform"] == "ATHLETEBRIDGE — Inclusive Athlete Development Platform"

    res_h = client.get("/health")
    assert res_h.status_code == 200
    assert res_h.json()["status"] == "healthy"

def test_demo_users_listed():
    res = client.get("/api/auth/demo-users")
    assert res.status_code == 200
    users = res.json()
    assert len(users) >= 4
    names = [u["display_name"] for u in users]
    assert any("Jordan Reed" in n for n in names)
    assert any("Marcus Vance" in n for n in names)

def test_athlete_can_fetch_own_profile_and_support_prefs():
    res = client.get("/api/profile/me", headers={"X-Demo-User-Id": "1", "X-Demo-Role": "athlete"})
    assert res.status_code == 200
    data = res.json()
    assert data["profile"]["primary_sport"] == "Track & Field"
    assert data["support_preference"]["is_private"] is True

def test_staff_queue_forbidden_for_regular_athlete():
    # Attempting to access staff queue as athlete role must yield 403 Forbidden
    res = client.get("/api/support/staff-queue", headers={"X-Demo-User-Id": "1", "X-Demo-Role": "athlete"})
    assert res.status_code == 403
    assert "Forbidden" in res.json()["detail"]

def test_staff_queue_accessible_for_staff():
    res = client.get("/api/support/staff-queue", headers={"X-Demo-User-Id": "3", "X-Demo-Role": "staff"})
    assert res.status_code == 200
    queue = res.json()
    assert isinstance(queue, list)
    assert len(queue) >= 1

def test_athlete_support_request_creation_and_tracking():
    # Athlete creates new request
    payload = {
        "category": "assistive_tech",
        "concise_description": "Screen-reader compatible digital course pack for Physics syllabus.",
        "date_needed": "2026-11-01",
        "preferred_comm_method": "In-App Notification"
    }
    res = client.post(
        "/api/support/requests",
        json=payload,
        headers={"X-Demo-User-Id": "1", "X-Demo-Role": "athlete"}
    )
    assert res.status_code == 201
    created = res.json()
    req_id = created["id"]
    assert created["status"] == "submitted"
    assert len(created["history"]) == 1

    # Staff updates status
    update_payload = {
        "status": "under_review",
        "note": "Assigned to digital accessibility technician to convert LaTeX equations."
    }
    res_update = client.put(
        f"/api/support/requests/{req_id}/status",
        json=update_payload,
        headers={"X-Demo-User-Id": "3", "X-Demo-Role": "staff"}
    )
    assert res_update.status_code == 200
    assert res_update.json()["new_status"] == "under_review"

    # Athlete checks their updated requests
    res_my = client.get("/api/support/my-requests", headers={"X-Demo-User-Id": "1", "X-Demo-Role": "athlete"})
    assert res_my.status_code == 200
    my_requests = res_my.json()
    matching = [r for r in my_requests if r["id"] == req_id]
    assert len(matching) == 1
    assert matching[0]["status"] == "under_review"
    assert len(matching[0]["history"]) >= 2


def test_onboarding_standard_perspective():
    payload = {
        "display_name": "Alex Morgan",
        "age": 20,
        "education_level": "College student",
        "primary_sport": "Soccer",
        "skill_level": "School or college level",
        "primary_goal": "Balance education and sports",
        "accessibility_status": "no_support",
        "accommodations": [],
        "availability_schedule": "Evening",
        "support_preferences": ["Study planning", "Training reminders"]
    }
    res = client.post(
        "/api/profile/onboarding",
        json=payload,
        headers={"X-Demo-User-Id": "2", "X-Demo-Role": "athlete"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["perspective"] == "standard"
    assert data["user"]["display_name"] == "Alex Morgan"
    assert data["profile"]["primary_sport"] == "Soccer"
    assert data["profile"]["academic_level"] == "College student"


def test_onboarding_accessible_perspective():
    payload = {
        "display_name": "Jordan Reed",
        "age": 19,
        "education_level": "College student",
        "primary_sport": "Track & Field",
        "skill_level": "National or international level",
        "primary_goal": "All of the above",
        "accessibility_status": "requires_support",
        "accommodations": [
            "Wheelchair-accessible venues",
            "Adaptive sports equipment"
        ],
        "other_accommodations": "Secured equipment trailer space",
        "availability_schedule": "Morning",
        "support_preferences": ["Competition scheduling", "Academic resource recommendations"]
    }
    res = client.post(
        "/api/profile/onboarding",
        json=payload,
        headers={"X-Demo-User-Id": "1", "X-Demo-Role": "athlete"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["perspective"] == "accessible"
    assert data["user"]["display_name"] == "Jordan Reed"
    assert "Wheelchair-accessible venues" in data["support_preference"]["optional_needs_description"]
    assert "Secured equipment trailer space" in data["support_preference"]["optional_needs_description"]
