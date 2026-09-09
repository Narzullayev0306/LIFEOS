# LIFEOS — Personal Operating System

<div align="center">

```
TIME ──► TASKS ──► STUDY (TOPIK) ──► HABITS ──► GOALS ──► MONEY ──► DISCIPLINE ──► AI
```

**A high-performance personal operating system connecting daily time blocking, Korean TOPIK II preparation, habits, financial budgets, goals, and AI decision support.**

</div>

---

## 🌟 Key Features

### 1. 📅 Intelligent Daily Planner & Conflict Engine
- **Conflict Detection**: Real-time detection of overlapping scheduled tasks with exact overlap minute metrics.
- **Sleep & Recovery Protection**: Prevents scheduling tasks during your sleep recovery window (`sleepTime` – `wakeTime`).
- **Smart Rescheduling**: Auto-recalculates open timeline slots after delayed, missed, or skipped tasks while preserving fixed events (meetings, gym).
- **Pomodoro Focus Timer**: Integrated countdown timer on current task with audio/visual feedback.

### 2. 🇰🇷 Comprehensive TOPIK II Preparation
- **Curated Bilingual Database**: 500+ Korean-Uzbek vocabulary with Hanja, parts of speech, difficulty levels (1-6), and example sentences.
- **Spaced Repetition (SM-2)**: Algorithm-backed flashcards (`Again`, `Hard`, `Good`, `Easy`) tracking ease factors and optimal review intervals.
- **Interactive Quizzes**: Korean → Uzbek and Uzbek → Korean with instant feedback and wrong-answer logging.
- **Speech Synthesis**: Native Korean audio pronunciation using Web Speech API.
- **Grammar Library**: Deep grammar patterns with usage notes and practice questions.
- **TOPIK Writing (Tasks 51-54)**: Practice prompts with high-scoring sample answers and self-evaluation rubrics.
- **Mock Exam Simulator**: 180-minute official exam countdown with diagnostic radar breakdown.

### 3. ⚡ Habits & Discipline Scoring Engine
- **Habit Tracker**: Multi-category habits with streak tracking (`currentStreak`, `bestStreak`).
- **Deterministic Discipline Score (0-100)**:
  - 📋 Tasks Completion: 35% weight
  - ⚡ Habits Kept: 30% weight
  - 📖 TOPIK Study Target: 25% weight
  - 💰 Budget Adherence: 10% weight
- **7-Day Trend Chart & Transparent Breakdown**: Understand every point in your score.

### 4. 💰 Financial Engine & Dynamic Daily Limits
- **Dynamic Daily Limit**:
  $$\text{Daily Limit} = \frac{\text{Monthly Budget} - \text{Total Spent to Date}}{\text{Days Remaining in Month}}$$
- **Budget vs. Actual**: Real-time category spending breakdown and overspending penalties.
- **Income Target Tracking**: Computes required daily earnings to hit monthly revenue targets.
- **Savings Goals**: Visual progress bars towards savings milestones.

### 5. 🎯 Goals & OKR Framework
- **Timeframes**: Long-term (1-3 years), Annual, Monthly, and Weekly goals.
- **Milestones**: Interactive checklists that dynamically update overall goal progress.

### 6. 🤖 AI Decision Support & Safety Safeguards
- **Provider Abstraction**: Google Gemini REST API support + Built-in deterministic heuristic expert engine for offline use.
- **Prompt Injection Defenses**: Sanitization of all user inputs before processing.
- **Consequential Action Gate**: Any consequential change proposed by the AI (e.g., rescheduling tasks) requires explicit user confirmation.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, TypeScript)
- **Styling**: Vanilla CSS Architecture with custom Design Tokens, Dark/Light Themes & Glassmorphism
- **Database & ORM**: SQLite (`file:./lifeos.db`) with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: JWT session cookies with `bcryptjs` password hashing and `jose`
- **Testing**: [Vitest](https://vitest.dev/) for unit and calculation tests

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node.js v22)
- npm or yarn

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Narzullayev0306/LIFEOS.git
cd LIFEOS

# Install dependencies
npm install
```

### 3. Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```
Default `.env` configuration:
```env
DATABASE_URL="file:./lifeos.db"
JWT_SECRET="lifeos-jwt-secret-replace-with-secure-random-string-in-production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
# Optional: Provide Google Gemini API Key for online generative AI
GEMINI_API_KEY=""
```

### 4. Database Setup & Seeding
```bash
# Push schema to SQLite database
npm run db:push

# Seed with rich demo user, TOPIK vocabulary, grammar, and categories
npm run db:seed
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

**Demo Credentials**:
- **Email**: `demo@lifeos.local`
- **Password**: `LifeOS2026!`

---

## 🧪 Testing & Validation

```bash
# Run all unit and calculation tests
npm test

# Run TypeScript typecheck
npm run typecheck

# Build for production
npm run build
```

---

## 📁 Repository Structure

```
LIFEOS/
├── prisma/
│   ├── schema.prisma      # Complete data models (Users, Tasks, TOPIK, Finance, Habits)
│   └── seed.ts            # Seed script with rich realistic test dataset
├── src/
│   ├── app/               # Next.js App Router (Pages & API endpoints)
│   │   ├── api/           # Backend REST endpoints (auth, tasks, topik, finance, ai)
│   │   ├── planner/       # Interactive Daily Planner
│   │   ├── topik/         # TOPIK II Learning Center
│   │   ├── habits/        # Habits & Discipline Tracker
│   │   ├── finance/       # Financial Management & Budgets
│   │   ├── goals/         # OKR & Milestone Management
│   │   ├── ai/            # AI Decision Support Assistant
│   │   ├── profile/       # Profile & System Settings
│   │   ├── onboarding/    # Multi-step Onboarding Flow
│   │   └── page.tsx       # Unified Dashboard
│   ├── components/        # Reusable UI components & layouts
│   ├── lib/
│   │   ├── ai/            # AI provider & prompt defense
│   │   ├── auth.ts        # Bcrypt & JWT cryptography
│   │   ├── calculations/  # Deterministic calculation engines (finance, SM-2, planner, discipline)
│   │   ├── prisma.ts      # Prisma singleton
│   │   └── session.ts     # Cookie session reader
│   └── styles/
│       └── globals.css    # Modern Vanilla CSS design system
└── tests/                 # Vitest test suite
```

---

## 📜 License

MIT License © 2026 LIFEOS.
