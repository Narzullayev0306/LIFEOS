# LIFEOS — Project Tasks

> LIFEOS is a personal operating system for daily planning, TOPIK preparation, habits, discipline, goals, income, expenses and AI-assisted decision support.
>
> This file is the single source of truth for implementation progress.

## Status

- `[ ]` Not started
- `[~]` In progress
- `[x]` Completed and verified
- `[!]` Blocked — reason required

## Rules

1. Never mark a task `[x]` without verification.
2. Keep this file synchronized with implementation.
3. Complete dependencies before dependent tasks.
4. Do not replace real functionality with fake/mock production behavior.
5. Preserve working functionality and existing architecture unless a change is justified.

---

# Phase 0 — Discovery & Foundation

- [ ] Audit repository and define architecture
- [ ] Choose/confirm application stack
- [ ] Configure TypeScript and strict mode where applicable
- [ ] Configure linting and formatting
- [ ] Configure environment variables safely
- [ ] Configure database
- [ ] Configure authentication foundation
- [ ] Configure error handling and logging
- [ ] Configure testing foundation
- [ ] Add development seed data

# Phase 1 — Data Model

- [ ] User profile and preferences
- [ ] Timezone and locale settings
- [ ] Tasks
- [ ] Time blocks
- [ ] Recurring tasks
- [ ] Reminders
- [ ] Habits and habit completions
- [ ] Goals and milestones
- [ ] TOPIK goals
- [ ] Vocabulary and review progress
- [ ] Grammar materials
- [ ] Reading materials and results
- [ ] Listening materials and results
- [ ] Writing practice and results
- [ ] Mock exams and results
- [ ] Study sessions
- [ ] Income
- [ ] Expenses
- [ ] Expense categories
- [ ] Budgets
- [ ] Financial goals

# Phase 2 — Authentication & Onboarding

- [ ] Registration
- [ ] Login
- [ ] Logout
- [ ] Session management
- [ ] Protected routes
- [ ] User profile
- [ ] Onboarding flow
- [ ] Wake/sleep schedule
- [ ] Fixed weekly schedule
- [ ] TOPIK target setup
- [ ] Exam date setup
- [ ] Daily study target setup
- [ ] Financial target setup
- [ ] Habit setup
- [ ] Notification preferences
- [ ] Generate initial plan from onboarding data

# Phase 3 — Dashboard

- [ ] Today overview
- [ ] Current task
- [ ] Next task
- [ ] Day progress
- [ ] TOPIK countdown
- [ ] TOPIK daily progress
- [ ] Discipline score
- [ ] Habit progress
- [ ] Today's spending
- [ ] Daily spending limit
- [ ] Monthly income
- [ ] Monthly expenses
- [ ] Remaining budget
- [ ] Goal progress

# Phase 4 — Planner

- [ ] Create task
- [ ] Edit task
- [ ] Delete task
- [ ] Complete task
- [ ] Skip task
- [ ] Reschedule task
- [ ] Priorities
- [ ] Time estimates
- [ ] Time blocks
- [ ] Recurring tasks
- [ ] Reminders
- [ ] Calendar view
- [ ] Daily timeline
- [ ] Detect schedule conflicts
- [ ] Protect fixed events
- [ ] Protect sleep/recovery
- [ ] Suggest breaks
- [ ] Recalculate schedule after missed tasks
- [ ] Current-task timer

# Phase 5 — TOPIK System

- [ ] TOPIK goal and target score
- [ ] Exam countdown
- [ ] Current score tracking
- [ ] Vocabulary database
- [ ] Korean/Uzbek meanings
- [ ] Example sentences
- [ ] Difficulty and categories
- [ ] Daily vocabulary target
- [ ] Flashcards
- [ ] Korean → Uzbek quiz
- [ ] Uzbek → Korean quiz
- [ ] Incorrect-answer tracking
- [ ] Spaced repetition
- [ ] Grammar library
- [ ] Grammar practice
- [ ] Reading library
- [ ] Reading questions and scoring
- [ ] Listening library
- [ ] Listening player and scoring
- [ ] Writing prompts
- [ ] Writing history and scoring
- [ ] Mock tests
- [ ] Mock test timer
- [ ] Weak-area analysis
- [ ] Study-session tracking
- [ ] Weekly TOPIK progress

# Phase 6 — Habits & Discipline

- [ ] Create habit
- [ ] Edit habit
- [ ] Delete habit
- [ ] Complete habit
- [ ] Habit history
- [ ] Streaks
- [ ] Daily discipline score
- [ ] Weekly discipline score
- [ ] Monthly discipline score
- [ ] Explain score calculation

# Phase 7 — Finance

- [ ] Add income
- [ ] Edit income
- [ ] Delete income
- [ ] Add expense
- [ ] Edit expense
- [ ] Delete expense
- [ ] Expense categories
- [ ] Monthly budget
- [ ] Remaining budget
- [ ] Dynamic daily spending limit
- [ ] Monthly income target
- [ ] Remaining income target
- [ ] Required daily income calculation
- [ ] Savings tracking
- [ ] Spending analytics
- [ ] Income analytics
- [ ] Budget vs actual
- [ ] Monthly comparison
- [ ] Edge-case calculation tests

# Phase 8 — Goals

- [ ] Long-term goals
- [ ] Monthly goals
- [ ] Weekly goals
- [ ] Daily actions
- [ ] Milestones
- [ ] Goal deadlines
- [ ] Goal priorities
- [ ] Goal progress
- [ ] Goal history

# Phase 9 — Notifications

- [ ] Task reminders
- [ ] Study reminders
- [ ] Vocabulary reminders
- [ ] Habit reminders
- [ ] Expense reminders
- [ ] Daily planning reminder
- [ ] Daily review reminder
- [ ] Sleep/recovery reminder
- [ ] User notification preferences

# Phase 10 — AI Assistant

- [ ] AI provider abstraction
- [ ] Secure API key handling
- [ ] Daily plan analysis
- [ ] Schedule recommendations
- [ ] Missed-task recovery recommendations
- [ ] TOPIK progress analysis
- [ ] TOPIK study recommendations
- [ ] Vocabulary recommendations
- [ ] Finance analysis
- [ ] Overspending detection
- [ ] Goal recommendations
- [ ] Daily review generation
- [ ] Prompt-injection defenses for external/user-provided content
- [ ] AI actions require confirmation when consequential

# Phase 11 — Responsive UX

- [ ] Mobile navigation
- [ ] Mobile dashboard
- [ ] Mobile planner
- [ ] Mobile TOPIK
- [ ] Mobile vocabulary
- [ ] Mobile finance
- [ ] Mobile goals
- [ ] Tablet layouts
- [ ] Desktop layouts
- [ ] Touch-friendly controls
- [ ] Responsive tables/charts
- [ ] No horizontal overflow
- [ ] Loading states
- [ ] Empty states
- [ ] Error states
- [ ] Accessibility review
- [ ] Keyboard navigation

# Phase 12 — Quality & Security

- [ ] Unit tests
- [ ] Integration tests
- [ ] API tests
- [ ] Authentication tests
- [ ] Planner calculation tests
- [ ] Finance calculation tests
- [ ] TOPIK progress tests
- [ ] Habit/streak tests
- [ ] AI service tests
- [ ] Input validation
- [ ] Authorization review
- [ ] Private-data protection
- [ ] Secret scanning
- [ ] Dependency vulnerability review
- [ ] Production build
- [ ] Lint passes
- [ ] Typecheck passes

# Phase 13 — Documentation & Release

- [ ] README with product overview
- [ ] Installation instructions
- [ ] Environment variable documentation
- [ ] Development commands
- [ ] Architecture documentation
- [ ] Database documentation
- [ ] AI architecture documentation
- [ ] Deployment documentation
- [ ] Screenshots/demo
- [ ] Final product audit
- [ ] Final mobile verification
- [ ] Final desktop verification
- [ ] Git working tree reviewed

---

# Definition of Done

The project is complete only when all applicable tasks are `[x]`, required validation passes, the production build succeeds, core functionality is verified, and no known critical bug remains.

## Progress

- Completed: 0
- In progress: 0
- Blocked: 0
- Remaining: tracked by checklist above
