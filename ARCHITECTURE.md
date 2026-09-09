# LIFEOS — Architectural Blueprint

## 1. System Overview

LIFEOS is architected as a fullstack TypeScript web application built on Next.js 15 (App Router), React 19, SQLite with Prisma ORM, and modern Vanilla CSS design tokens.

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

---

## 2. Directory Structure & Module Boundaries

```
src/
├── app/                        # Next.js App Router (Pages & API endpoints)
│   ├── api/
│   │   ├── ai/analyze/         # AI Decision Support API
│   │   ├── auth/               # Register, Login, Logout, Me
│   │   ├── dashboard/          # Aggregated dashboard metrics endpoint
│   │   ├── discipline/history/ # 7-day trend calculation
│   │   ├── finance/            # Expense, Income, Budget, Goals
│   │   ├── goals/              # OKR & Milestone endpoints
│   │   ├── habits/             # Habits CRUD & Toggle endpoints
│   │   ├── notifications/      # Reminder & notification feeds
│   │   ├── onboarding/         # Setup wizard submission
│   │   ├── planner/recalculate/# Schedule re-balancing endpoint
│   │   ├── profile/            # User profile & settings
│   │   ├── tasks/              # Task CRUD & status updates
│   │   └── topik/              # Vocab, Review (SM-2), Grammar, Writing, Session
│   ├── ai/page.tsx             # AI Decision Support UI
│   ├── finance/page.tsx        # Finance Management UI
│   ├── goals/page.tsx          # Goals & OKR UI
│   ├── habits/page.tsx         # Habits & Discipline UI
│   ├── login/page.tsx          # Authentication Login UI
│   ├── onboarding/page.tsx     # 5-Step Setup Wizard UI
│   ├── page.tsx                # Unified Dashboard UI
│   ├── planner/page.tsx        # Interactive Daily Planner UI
│   ├── profile/page.tsx        # Profile & System Configuration UI
│   ├── register/page.tsx       # User Registration UI
│   ├── topik/page.tsx          # TOPIK II Learning Center UI
│   └── layout.tsx              # Root HTML layout with CSS design system
├── components/
│   └── layout/
│       └── Shell.tsx           # Responsive shell (Desktop sidebar, mobile nav, theme switch)
├── lib/
│   ├── ai/
│   │   └── provider.ts         # Gemini / Heuristic provider abstraction & prompt sanitization
│   ├── auth.ts                 # Bcrypt hashing & jose JWT token signing
│   ├── calculations/           # Pure, testable deterministic engines
│   │   ├── discipline.ts       # Discipline score weights & formulas
│   │   ├── finance.ts          # Dynamic daily limits & leap-year date logic
│   │   ├── planner.ts          # Interval overlap & sleep conflict detection
│   │   └── topik.ts            # SuperMemo-2 spaced repetition & score evaluation
│   ├── prisma.ts               # Global Prisma client singleton
│   └── session.ts              # Server-side cookie session reader
├── middleware.ts               # Edge authentication guard
└── styles/
    └── globals.css             # Vanilla CSS design system, variables & glassmorphism
```

---

## 3. Data Model & Relationships

```
User (1) ──┬── (1) UserSettings
           ├── (1) TimeSchedule
           ├── (1) TopikGoal
           ├── (*) Task ── (0..1) Goal
           ├── (*) TimeBlock
           ├── (*) RecurringRule
           ├── (*) Reminder
           ├── (*) Habit ── (*) HabitCompletion
           ├── (*) DisciplineScore
           ├── (*) Goal ── (*) Milestone
           ├── (*) VocabReviewLog ── (1) TopikVocab
           ├── (*) WritingPractice ── (1) WritingPrompt
           ├── (*) MockExamResult ── (1) MockExam
           ├── (*) StudySession
           ├── (*) Expense ── (1) ExpenseCategory
           ├── (*) Income
           ├── (*) Budget
           ├── (*) FinancialGoal
           ├── (*) Notification
           └── (*) AiLog
```

---

## 4. Security & Authentication Architecture

1. **Password Security**:
   - `bcryptjs` with salt round 10.
   - Plaintext passwords never stored or returned in any API response.
2. **Session Handling**:
   - JWT tokens signed with `HS256` using secret from environment variables (`JWT_SECRET`).
   - Token payload: `{ userId, email, name }` with 7-day expiration.
   - Transmitted via `httpOnly`, `secure` (in production), and `SameSite=Lax` cookies named `lifeos_session`.
3. **Route Protection**:
   - Next.js `middleware.ts` intercepts all requests to private routes (`/`, `/planner`, `/topik`, `/habits`, `/finance`, `/goals`, `/ai`, `/profile`, `/onboarding`).
   - Unauthenticated visitors are automatically redirected to `/login`.
4. **Prompt Injection Defenses**:
   - Sanitizes user input in `src/lib/ai/provider.ts` to neutralize override prompts and embedded HTML/JS tags before evaluation.
5. **Consequential Action Gate**:
   - AI cannot alter user data unilaterally. Proposed actions emit a payload that requires explicit user confirmation before mutation.

---

## 5. Verification & Testing Strategy

- **Test Framework**: Vitest with Node.js environment.
- **Unit & Calculation Suite**: Validates mathematical formulas (SM-2, financial dynamic limits, discipline scores, leap years, schedule conflicts).
- **Cryptographic Suite**: Tests bcrypt hashing and token tampering rejections.
- **Type Checking**: TypeScript strict mode (`tsc --noEmit`).
- **Production Build**: Full compilation and static generation via `next build`.
- **E2E Browser Validation**: Real browser session recording and visual layout confirmation.
