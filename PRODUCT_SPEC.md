# LIFEOS — Product Specification

## Product Definition

LIFEOS is a Personal Operating System. It is not a basic to-do application.

The system connects:

`TIME → TASKS → STUDY → HABITS → GOALS → MONEY → DISCIPLINE → AI`

The application should help a user decide what to do, when to do it, what to study, how much to spend, what goals need attention, and how current behavior affects long-term progress.

---

## Core Modules

### 1. Daily Planning & Time-Blocking

The planner creates and manages a realistic day using tasks, estimated durations, priorities, fixed events, recurring tasks, reminders, meals, breaks and sleep/recovery periods.

Rules:
- **No Overlapping Blocks**: Calculates interval overlaps between scheduled events:
  $$\text{Overlap} = \max(0, \min(E_1, E_2) - \max(S_1, S_2))$$
  Overlapping tasks raise actionable warnings with exact minute overlaps.
- **Protect Fixed Events**: Fixed commitments (e.g., jobs, classes, gym) are preserved with an immutable shield flag (`isFixed: true`).
- **Protect Sleep & Recovery**: Protects the user's defined sleep window (e.g. `23:00` to `06:30`). Tasks scheduled into recovery hours trigger high-priority sleep alerts.
- **Task Lifecycles**: Allow tasks to be missed, skipped, completed or rescheduled.
- **Autonomous Schedule Recalculation**: If flexible tasks are delayed or missed, the scheduler intelligently pushes remaining tasks into open slots past current time, maintaining a 10-minute rest buffer and respecting fixed events.
- **Current & Next Actionable Task**: Always show the current task with an active Pomodoro focus timer and next task preview.

### 2. TOPIK II Study System

TOPIK support includes goals, target score, exam date, vocabulary, spaced repetition, grammar, reading, listening, writing, mock exams, study sessions and weak-area analysis.

- **Bilingual Lexicon**: 500+ curated Korean-Uzbek vocabulary items with Hanja etymology, grammatical parts of speech, difficulty levels (Levels 1–6), and real-world example sentences.
- **SuperMemo-2 (SM-2) Spaced Repetition**:
  - Quality score $q \in [0, 5]$
  - Interval $I(1) = 1$, $I(2) = 6$, $I(n) = I(n-1) \times EF$
  - Ease Factor update:
    $$EF' = \max\left(1.3, EF + (0.1 - (5 - q)(0.08 + (5 - q) \times 0.02))\right)$$
  - Incorrect recalls ($q < 3$) reset repetition counter to 0 and schedule next review for the following day.
- **Audio Pronunciation**: Web Speech API integration (`SpeechSynthesisUtterance`, `ko-KR`) for instant native pronunciation.
- **Interactive Quizzes**: Dual-direction testing (Korean → Uzbek and Uzbek → Korean) with instant feedback and wrong-answer logging.
- **Grammar Library & Practice**: Curated intermediate and advanced grammar patterns with Uzbek translations, usage nuances, sample sentences, and drill questions.
- **Writing Prompts (Tasks 51, 52, 53, 54)**: Official TOPIK II writing formats with sample answers and scoring rubrics.
- **180-Minute Mock Exam Simulator**: Real countdown timer for full 3-section simulation (Listening, Writing, Reading) and diagnostic weakness analysis. Educational content is verified and accurate.

### 3. Habits and Discipline

Habits have completion history and streaks.

The discipline score must be deterministic, explainable and testable (0 to 100):
$$\text{Total Score} = S_{\text{tasks}} + S_{\text{habits}} + S_{\text{study}} + S_{\text{finance}}$$
- **Tasks Score (Max 35 points)**: Based on completion percentage of today's planned tasks.
- **Habits Score (Max 30 points)**: Based on percentage of scheduled daily habits completed.
- **Study Score (Max 25 points)**: Based on actual study minutes vs. daily target.
- **Finance Score (Max 10 points)**: Perfect 10 points if spending $\le$ dynamic daily limit; penalized proportionally if over limit.
Users can inspect exact point breakdowns and 7-day trend history.

### 4. Finance

Finance supports income, expenses, categories, budgets, savings and financial goals.

The system calculates:
- spending to date
- remaining budget
- **dynamic daily spending limit**:
  $$\text{Daily Limit} = \frac{\text{Monthly Budget} - \text{Total Spent to Date}}{\text{Total Days in Month} - \text{Day of Month} + 1}$$
- monthly income target
- remaining income target
- **required daily income**:
  $$\text{Required Daily Income} = \frac{\text{Target Income} - \text{Actual Income to Date}}{\text{Days Remaining}}$$
- savings progress
- budget-versus-actual analytics

Financial calculations are deterministic and covered by tests. LIFEOS never silently executes a financial transaction.

### 5. Goals

Goals support long-term, annual, monthly and weekly planning, with milestones, deadlines, priorities, daily actions, progress and history.

Goals connect directly to daily tasks and measurable progress.

### 6. AI Assistant

The AI assistant is decision support, not an unrestricted autonomous controller.

It analyzes:
- daily schedule
- missed tasks
- TOPIK progress
- vocabulary performance
- finances
- habits
- discipline
- goals

It recommends actions, but consequential changes require explicit user confirmation.
User-provided and external content is treated as untrusted input with prompt-injection defenses.

---

## UX Requirements

The application works well on mobile, tablet and desktop.

Every major workflow accounts for:
- loading states
- empty states
- errors
- success feedback
- keyboard accessibility
- touch interaction
- responsive tables and charts
- no horizontal overflow

The UI prioritizes the next useful action rather than presenting unnecessary information.

## Quality Requirements

Production behavior does not depend on fake data or mocked success responses.
Important calculations require automated tests.
Authentication and authorization are enforced server-side.
Secrets remain outside source control.
Every completed task is verified before being marked `[x]` in `TASKS.md`.
