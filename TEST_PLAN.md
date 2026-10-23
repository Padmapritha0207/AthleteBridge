# ATHLETEBRIDGE — Test Plan & Automated Verification Suite

This document records the automated and integration test cases covering core algorithmic logic, role-based authorization security, and data integrity.

---

## 1. Automated Backend Test Suite (Pytest)

All tests are implemented in [`backend/tests/`](file:///C:/Users/Hp/.gemini/antigravity/scratch/athletebridge/backend/tests) and execute via `python -m pytest tests`:

### Test Suite Execution Output
```
============================= test session starts =============================
platform win32 -- Python 3.12.7, pytest-8.0.0, pluggy-1.6.0
rootdir: C:\Users\Hp\.gemini\antigravity\scratch\athletebridge\backend
plugins: anyio-4.12.1, dash-2.18.2, langsmith-0.7.34
collected 12 items

tests\test_auth_and_support.py ......                                    [ 50%]
tests\test_scheduling.py ......                                          [100%]

======================= 12 passed in 2.11s ========================
```

---

## 2. Test Cases Specification

### Suite A: BalanceAI Algorithmic Tests (`test_scheduling.py`)

| Test Case ID | Test Name | Objective & Scenario | Expected Result | Result |
| :--- | :--- | :--- | :--- | :--- |
| **TC-SCHED-01** | `test_time_conversions` | Validates two-way conversions between `HH:MM` and integer minutes from midnight. | `07:30` converts to 450m and reverses losslessly. | **PASS** |
| **TC-SCHED-02** | `test_detect_direct_overlap` | Schedules two simultaneous events on the same day (`09:00-10:30` and `10:00-11:30`). | Generates `critical` conflict of type `direct_overlap`. | **PASS** |
| **TC-SCHED-03** | `test_detect_buffer_violation` | Schedules Event A ending at 15:30 and Event B starting at 15:40 with a 25m transit buffer requirement. | Generates `warning` conflict of type `buffer_violation` noting insufficient 10m gap. | **PASS** |
| **TC-SCHED-04** | `test_suggest_reschedule_alternatives_flexible_event` | Prompts alternative slots for a flexible practice overlapping with a fixed exam block. | Recommends viable candidate slots that cleanly avoid the exam and respect 30m buffers. | **PASS** |
| **TC-SCHED-05** | `test_cannot_automate_rescheduling_for_fixed_event` | Attempts to automatically reschedule a fixed official competition heat. | Returns `feasible_slots_found=False` with explanation that fixed events cannot be moved automatically. | **PASS** |
| **TC-SCHED-06** | `test_no_feasible_slot_when_window_saturated` | Tests a day saturated with non-negotiable fixed blocks and required rest periods. | Returns `feasible_slots_found=False` and details constraints instead of inventing an invalid slot. | **PASS** |

### Suite B: Role Security & Workflow Tests (`test_auth_and_support.py`)

| Test Case ID | Test Name | Objective & Scenario | Expected Result | Result |
| :--- | :--- | :--- | :--- | :--- |
| **TC-AUTH-01** | `test_api_root_and_health` | Queries `/` and `/health` endpoints. | Status 200, system online, database connected. | **PASS** |
| **TC-AUTH-02** | `test_demo_users_listed` | Verifies demo persona switcher options (Jordan, Maya, Marcus, Elena). | Returns populated list with athlete, staff, and coach roles. | **PASS** |
| **TC-AUTH-03** | `test_athlete_can_fetch_own_profile_and_support_prefs` | Athlete requests `/api/profile/me`. | Status 200, confidential support preference has `is_private=True`. | **PASS** |
| **TC-AUTH-04** | `test_staff_queue_forbidden_for_regular_athlete` | Athlete role requests `/api/support/staff-queue`. | **HTTP 403 Forbidden** with descriptive security detail. | **PASS** |
| **TC-AUTH-05** | `test_staff_queue_accessible_for_staff` | Staff role requests `/api/support/staff-queue`. | **HTTP 200 OK** returning queue of institutional requests. | **PASS** |
| **TC-AUTH-06** | `test_athlete_support_request_creation_and_tracking` | End-to-end lifecycle: Athlete creates accommodation request $\to$ Staff reviews and updates status with note $\to$ Athlete inspects audit trail. | Ticket status updates from `submitted` to `under_review`, preserving chronological history. | **PASS** |

---

## 3. Frontend Production Build Verification

Executed command:
```bash
npm run build
```
Result:
```
vite v8.0.10 building client environment for production...
transforming...✓ 1743 modules transformed.
rendering chunks...
dist/index.html                   1.57 kB │ gzip:  0.84 kB
dist/assets/index-JGP5jNnF.css   51.20 kB │ gzip:  9.14 kB
dist/assets/index-D8fbJaX8.js   371.07 kB │ gzip: 93.19 kB
✓ built in 1.94s with 0 errors
```
