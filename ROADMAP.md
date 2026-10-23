# ATHLETEBRIDGE — Release State & Technical Roadmap

This roadmap clearly delineates what is **shipped and functionally active**, what utilizes **synthetic demo simulation**, and what is **scheduled for subsequent phases**.

---

## 1. Shipped & Fully Functional Modules (v1.0 Hackathon Prototype)

- [x] **BalanceAI Scheduling Engine**:
  - Full CRUD operations on academic and athletic commitments.
  - Conflict detection engine identifying direct overlaps and transit buffer violations.
  - Algorithmic candidate slot suggestion generator respecting buffers, nocturnal rest, and fixed commitments.
  - One-click slot application with schedule re-computation.
- [x] **SupportBridge Accommodation Workflow**:
  - Athlete submission of confidential accommodation tickets across multiple categories.
  - Role-gated Institutional Staff review queue (`require_staff_role` with HTTP 403 enforcement).
  - Immutable status transition history log recording every staff note and timestamp.
  - Automated in-app notifications generated upon status updates.
- [x] **Coach Finder**:
  - Multi-parameter search & filtering (sport, region, level, accessibility specialties).
  - Prominently labelled demo coach cards (`[DEMO LISTING]`).
  - Interactive "Request Consultation" flow persisted to database.
- [x] **AccessMatch Sports Opportunities**:
  - Filterable directory of camps, meets, and showcases.
  - Transparent venue accessibility classification (`Verified Accessible Venue` vs `Unverified Access Details`).
  - Bookmarking and demo registration flows.
- [x] **Scholarship Finder & Grant Tracker**:
  - Filterable collegiate grants and dual-career scholarships.
  - Application checklist inspection modal.
  - Interactive progress tracker (`Saved` -> `Preparing` -> `Submitted`).
- [x] **DualProgress & Athlete Passport**:
  - Strict separation between academic milestones and athletic splits (no arbitrary combined scores).
  - Verified institutional provenance vs self-entered credentials.
  - Granular privacy toggles (private by default).
- [x] **FuelRight Nutrition & Hydration**:
  - General timing education cards (Pre-workout, Post-workout, Hydration).
  - Meal & hydration logging with medical non-diagnostic disclaimer.
- [x] **Training Planner & RecoveryTracker**:
  - Workout logger (sport, duration, intensity, equipment).
  - Self-reported subjective recovery entries (sleep, fatigue, exertion RPE).
- [x] **MindStrong Mental Skills**:
  - Step-by-step coping guides (Box Breathing, Cognitive Reframing, Boundary Reset).
  - Confidential private reflections journal with permanent deletion controls.
  - Demo sports psychology consultations booking.
  - Strict non-clinical disclaimer with 988 lifeline references.
- [x] **AthleteConnect Community**:
  - Categorized groups (Adaptive track, STEM athletes, Distance circle).
  - Demo post feed with reporting and user blocking controls.
  - Accessible community standards and safety modal.
- [x] **Staff Institutional Operations Dashboard**:
  - Non-PII aggregate telemetry (requests by category, resolution rates).
  - Venue accessibility certification action.
- [x] **Demo Persona Switcher**:
  - 1-click header switcher between Jordan Reed (Athlete), Maya Lin (Athlete), Marcus Vance (Staff), and Coach Elena.

---

## 2. Simulated Elements (Prototype Seed Telemetry)

- **Demo Auth**: Session role switching relies on `X-Demo-User-Id` and `X-Demo-Role` headers instead of live OAuth2 SSO.
- **Fictional Seed Profiles**: Coaches, grants, opportunities, and counsellors are synthetically generated for demonstration.
- **In-App Notifications**: Alerts are persisted in the local database and rendered in the notification drawer rather than triggering live outbound email/SMS gateways.

---

## 3. Future Engineering Roadmap (v2.0 & Production Hardening)

### Phase 2: Enterprise Identity & Institutional SSO
- Integrate Shibboleth, Canvas LMS, and University SAML/OIDC SSO for single sign-on.
- Implement JWT session tokens with encrypted claims.

### Phase 3: Live Calendar Synchronizations
- Two-way synchronization with Google Calendar, Microsoft Outlook 365, and Canvas LMS assignment webhooks.
- Automatic syllabus date ingestion via PDF parsing with student confirmation.

### Phase 4: Production Database & Infrastructure
- Migration from SQLite to managed PostgreSQL with Row-Level Security (RLS).
- Redis caching for opportunity and scholarship search queries.
- Cloud Object Storage (S3 / GCS) with presigned URLs for secure verification attachments.

### Phase 5: Verified Community & Safe Direct Messaging
- Double-opt-in direct messaging with institutional athlete safety filters.
- Real-time moderation queues with automated text filtering for abusive conduct.
