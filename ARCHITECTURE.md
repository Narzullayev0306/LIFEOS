# LIFEOS — Architecture Guide

## Architectural Goal

LIFEOS is a modular personal operating system built around a shared user context: time, tasks, study, habits, goals, money and AI recommendations.

The architecture remains incremental and cohesive.

---

## Current Stack

- **Framework**: Next.js 15 (App Router), React 19
- **Language**: TypeScript (Strict Mode)
- **Database & ORM**: SQLite (`file:./lifeos.db`) with Prisma ORM
- **Authentication**: JWT-based session cookies with `bcryptjs` password hashing and `jose`
- **Testing**: Vitest for unit, calculation, and security suites
- **Styling**: Vanilla CSS with design-token architecture, dark/light themes, and glassmorphism

The exact versions and scripts are defined by `package.json` and are authoritative.

---

## Application Layers

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Browser                        │
│   (Desktop Sidebar / Mobile TabBar / Responsive Views)       │
└──────────────┬───────────────────────────────▲──────────────┘
               │ HTTP / JSON API               │ React SSR/RSC
               ▼                               │
┌──────────────────────────────────────────────┴──────────────┐
│                  Next.js 15 App Engine                      │
│                                                             │
│  ┌──────────────────────┐      ┌─────────────────────────┐  │
│  │    App Router UI     │      │   Backend API Routes    │  │
│  │  - Dashboard (/)     │      │  - /api/auth/*          │  │
│  │  - /planner          │      │  - /api/tasks/*         │  │
│  │  - /topik            │      │  - /api/topik/*         │  │
│  │  - /habits           │      │  - /api/finance/*       │  │
│  │  - /finance          │      │  - /api/goals/*         │  │
│  │  - /goals            │      │  - /api/ai/analyze      │  │
│  │  - /ai               │      │  - /api/notifications   │  │
│  │  - /profile          │      │  - /api/onboarding      │  │
│  └──────────┬───────────┘      └────────────┬────────────┘  │
│             │                               │               │
│             ▼                               ▼               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │            Pure Deterministic Calculations            │  │
│  │  - Finance: Dynamic Daily Limit, Income Progress      │  │
│  │  - TOPIK: SM-2 Spaced Repetition, Level Thresholds    │  │
│  │  - Planner: Overlap Detection, Sleep Protection       │  │
│  │  - Discipline: Weighted Multi-factor Scoring (0-100)  │  │
│  └──────────────────────────┬────────────────────────────┘  │
│                             │                               │
│                             ▼                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                     Prisma ORM                        │  │
│  │  Type-safe query engine, model relations & migrations │  │
│  └──────────────────────────┬────────────────────────────┘  │
└─────────────────────────────┼───────────────────────────────┘
                              ▼
                 ┌──────────────────────────┐
                 │  SQLite Database Engine  │
                 │     (lifeos.db file)     │
                 └──────────────────────────┘
```

### 1. App Layer (`src/app`)
Contains pages, layouts and backend API routes:
- Pages: Dashboard (`/`), Planner (`/planner`), TOPIK (`/topik`), Habits (`/habits`), Finance (`/finance`), Goals (`/goals`), AI (`/ai`), Profile (`/profile`), Onboarding (`/onboarding`), Login (`/login`), Register (`/register`).
- APIs: 23 secure endpoints handling business actions, mutations, and aggregated queries.

### 2. Components Layer (`src/components`)
Contains reusable UI components, mobile and desktop layouts (`Shell.tsx`). Business calculations are isolated from presentation components.

### 3. Domain and Libraries Layer (`src/lib`)
Contains shared infrastructure and pure domain logic:
- `src/lib/calculations/`: Deterministic calculation engines for finance, discipline, TOPIK SM-2, and planner schedule conflict detection.
- `src/lib/auth.ts`: Bcrypt password hashing and JWT token management.
- `src/lib/ai/provider.ts`: Google Gemini and heuristic decision support engines with prompt-injection defense.
- `src/lib/prisma.ts`: Singleton database client.
- `src/lib/session.ts`: Cookie-based session extraction.

### 4. Database Layer (`prisma`)
- `prisma/schema.prisma`: Defines entities and relationships.
- `prisma/seed.ts`: Rich seed data with 500+ TOPIK words, grammar patterns, writing prompts, expense categories, and schedule templates.

### 5. Test Suite (`tests`)
Automated Vitest tests verifying calculation edge cases, cryptographic security, schedule conflict algorithms, and AI prompt sanitization.

---

## Domain Relationships

The conceptual flow is:

`User → Preferences → Schedule → Tasks → Daily Execution`

`User → TOPIK Goal → Study Plan → Vocabulary/Grammar/Reading/Listening/Writing → Results`

`User → Habits → Completions → Streaks → Discipline Score`

`User → Goals → Milestones → Daily Actions → Progress`

`User → Income/Expenses → Budget → Spending Analysis → Financial Targets`

`User → All Domains → AI Analysis → Recommendations → Explicit Confirmation → Changes`

---

## Important Invariants

Planner:
- No unintended overlapping time blocks.
- Fixed events remain protected.
- Sleep and recovery windows remain protected.
- Rescheduling remains deterministic.

Finance:
- Calculations are deterministic.
- Dates and remaining-day calculations are handled explicitly without NaN or division by zero.
- No silent financial transactions.

Authentication:
- Protected resources require valid sessions.
- Authorization is checked server-side.
- Secrets are never exposed to client code.

AI:
- External and user content is untrusted.
- Recommendations are separated from consequential actions.
- Consequential changes require explicit confirmation.
