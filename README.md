# ATHLETEBRIDGE — Inclusive Athlete Development Platform
> **“One platform for every athlete. Personalized support for every ability.”**

AthleteBridge is a full-stack, responsive, accessible web platform engineered for student-athletes with and without disabilities. It harmonizes rigorous university academic requirements with high-performance sporting demands through intelligent conflict resolution, transparent institutional support workflows, and vetted accessibility discovery.

---

## 🌟 Key Functional Highlights

1. **BalanceAI Dual-Career Scheduling**:
   - Detects direct temporal overlaps AND transit/preparation buffer violations.
   - Transparent rescheduling algorithm that scores viable candidate slots respecting fixed exams, travel cushions, and nocturnal rest windows.
2. **SupportBridge Confidential Accommodation Tickets**:
   - Private channel for student-athletes to request academic exam proctoring, ramp access, or travel logistics.
   - Institutional staff review queue with immutable status transition audit logging and in-app notifications.
3. **AccessMatch & Coach Finder**:
   - Opportunity discovery with certified accessibility tags (`Verified Accessible Venue` vs `Unverified Access Details`).
   - Accredited coaching listings with stated adaptive specialties and demo consultation requests.
4. **DualProgress & Athlete Passport**:
   - Completely decoupled academic and athletic milestone tracking (no arbitrary combined scores).
   - Provenance tracking (`verified_institutional` vs `self_entered`) and user-controlled privacy toggles.
5. **FuelRight & MindStrong (With Non-Diagnostic Health Boundaries)**:
   - Educational meal ideas and hydration tracker with explicit non-medical disclaimers.
   - Sports psychology performance coping exercises, confidential journal, and 988 lifeline safety guidance.
6. **AthleteConnect & Staff Operations**:
   - Peer sports hubs with safety reporting, user blocking, and community standards.
   - Role-gated institutional coordinator dashboard with non-PII compliance analytics.

---

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4 + Lucide React.
  - Accessible semantic HTML5 landmarks (`<main>`, `<nav>`, `<aside>`, `<header>`).
  - WCAG 2.2 compliant focus rings (`focus-visible`), skip-to-content links, high-contrast mode, and reduced motion safety.
- **Backend**: FastAPI (Python 3.12) + SQLAlchemy 2.0 ORM + Pydantic v2.
  - Type-safe, validated REST API.
  - Safe demo authentication header dependency (`X-Demo-User-Id`, `X-Demo-Role`).
- **Database**: SQLite (`athletebridge.db`) with automatic table creation and synthetic seed generator. (Direct migration path to PostgreSQL documented).

---

## 🚀 Quickstart & Setup Guide

### Prerequisites
- Python 3.10+ (Python 3.12 verified)
- Node.js v18+ (Node.js v24 verified)

### One-Click Run (Windows)
Double-click `start_all.bat` or run:
```cmd
start_all.bat
```
This launches both the FastAPI backend (`http://127.0.0.1:8000`) and the Vite frontend (`http://127.0.0.1:5173`) in separate background windows.

---

### Manual Step-by-Step Setup

#### 1. Backend Setup & Run
```bash
cd backend

# Install requirements
python -m pip install -r requirements.txt

# Start the FastAPI server on port 8000
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Backend API will be running at `http://127.0.0.1:8000` (Swagger interactive docs available at `http://127.0.0.1:8000/docs`).

#### 2. Frontend Setup & Run
Open a second terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend will be accessible at **`http://localhost:5173`**.

---

## 🧪 Running Automated Tests

To run the automated test suite covering BalanceAI schedule conflict algorithms, fixed commitment locking, buffer violations, onboarding questionnaire personalization, and role-based staff authorization:

```bash
cd backend
python -m pytest tests
```
Expected output: **18 passed**.

To run the frontend production build check:
```bash
cd frontend
npm run build
```

---

## 🎭 Benchmark Personas & Judging Guide

AthleteBridge features **two strictly separated experiences** (Standard Student-Athlete vs. Disability-Inclusive Student-Athlete) and **profile-driven content personalization**.

Use the **Persona Switcher** in the top navigation header to instantly evaluate the core benchmark profiles:

| Persona Name | Track | Primary Discipline | Experience & Key Highlights |
| :--- | :--- | :--- | :--- |
| **Profile A: Alex Chen** | Standard | College Badminton | Evening training (17:30-19:30), Business Analytics midterm preparation, Coach David Tan recommended, shuttle & court coverage tracker. |
| **Profile B: Samira Patel** | Standard | High School Swimming | Early morning training (06:00-07:30), AP Chemistry & Pre-Calculus study blocks, Coach Marcus Sterling recommended, state championship qualifiers. |
| **Profile C: Tariq Malik** | Accessible (PwD) | College Wheelchair Basketball | Afternoon training (15:30-17:30), Kinesiology student, 25m transit buffers, ramp & elevator verified venues, Coach Jerome Washington recommended, NWBA tournaments, exportable Support Passport. |
| **Profile D: Zoe Rivera** | Accessible (PwD) | College Track & Field (VI Division) | T12 sprint pacing, guide runner synchronization, auditory lane locator beacon verification, EPUB screen-reader coursepacks, Coach Maya Patel recommended. |
| **Marcus Vance** | Staff | Academic & Athletics Coordinator | Role-gated Institutional SupportBridge queue, confidential accommodation ticket approval, non-PII compliance analytics. |

---

## 🔒 Security & Privacy Principles

- **No Secrets Exposed**: `.env.example` contains only non-sensitive placeholders.
- **Strict Privacy by Default**: Accommodations, private reflections, and disability equipment notes are never displayed on public feeds or shared with peers.
- **Non-Diagnostic Disclaimer**: Nutrition, mental skills, and recovery logs explicitly state they do not replace clinical advice.
- **Conspicuous Labels**: All fictional demo coaches, opportunities, and scholarships are conspicuously tagged (`[DEMO LISTING]`, `[DEMO DATA]`).

---

## 📁 Repository Structure

```
athletebridge/
├── .env.example              # Environment variables template
├── README.md                 # Project guide & instructions
├── ARCHITECTURE.md           # Systems & algorithm specification
├── ACCESSIBILITY_TESTING.md  # WCAG 2.2 verification checklist
├── TEST_PLAN.md              # Test specifications and outputs
├── ROADMAP.md                # Shipped vs planned modules
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app & CORS setup
│   │   ├── database.py       # SQLAlchemy engine & session
│   │   ├── models.py         # Relational database models
│   │   ├── schemas.py        # Pydantic v2 schemas
│   │   ├── auth.py           # Demo role header dependency
│   │   ├── scheduling.py     # BalanceAI conflict & candidate engine
│   │   ├── seed.py           # Synthetic seed data generator
│   │   └── routers/          # 12 feature API routers
│   ├── tests/
│   │   ├── test_scheduling.py
│   │   └── test_auth_and_support.py
│   └── athletebridge.db      # SQLite persistent local database
└── frontend/
    ├── package.json
    ├── vite.config.ts        # Vite + API proxy configuration
    ├── index.html            # Semantic HTML with skip link
    └── src/
        ├── App.tsx           # Main application shell
        ├── index.css         # Tailwind & WCAG styling
        ├── types/index.ts    # TypeScript interfaces
        ├── services/api.ts   # Typed API client
        ├── context/          # Auth & Accessibility state
        ├── components/       # Header, Sidebar, Controls
        └── pages/            # 12 interactive functional modules
```
