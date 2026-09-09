# LIFEOS — Product Specification

> Version: 1.0.0  
> Status: Implemented & Verified  
> Core Formula: `TIME → TASKS → STUDY (TOPIK) → HABITS → GOALS → MONEY → DISCIPLINE → AI`

---

## 1. Executive Summary

LIFEOS is a unified Personal Operating System engineered to structure daily execution, accelerate Korean TOPIK II language mastery, enforce daily habits, maintain rigorous financial discipline, track long-term goals, and provide proactive AI-driven decision support.

Unlike fragmented todo apps, expense trackers, or flashcard utilities, LIFEOS integrates these vectors into a cohesive closed loop where actions in one domain directly influence and reflect across the entire system.

---

## 2. Core Functional Pillars

### 2.1. Intelligent Daily Planner & Time-Blocking
- **Conflict Prevention Engine**: Formally evaluates interval overlaps between scheduled events:
  $$\text{Overlap} = \max(0, \min(E_1, E_2) - \max(S_1, S_2))$$
  Overlapping tasks raise actionable warnings with exact minute overlaps.
- **Sleep & Recovery Protection**: Protects the user's defined sleep window (e.g. `23:00` to `06:30`). Tasks scheduled into recovery hours trigger high-priority sleep alerts.
- **Fixed vs. Flexible Blocks**: Fixed commitments (e.g., jobs, classes, prayer, gym) are preserved with an immutable shield flag (`isFixed: true`).
- **Autonomous Schedule Recalculation**: If flexible tasks are delayed or missed, the scheduler intelligently pushes remaining tasks into open slots past current time, maintaining a 10-minute rest buffer and respecting fixed events.
- **Current Task Focus Timer**: Integrated Pomodoro timer (25 min default or custom) with start/pause/complete actions.

### 2.2. TOPIK II Preparation Ecosystem
- **Bilingual Lexicon**: 500+ curated Korean-Uzbek vocabulary items with Hanja etymology, grammatical parts of speech, difficulty levels (Levels 1–6), and real-world example sentences.
- **SuperMemo-2 (SM-2) Spaced Repetition**:
  - Quality score $q \in [0, 5]$
  - Interval $I(1) = 1$, $I(2) = 6$, $I(n) = I(n-1) \times EF$
  - Ease Factor update:
    $$EF' = \max\left(1.3, EF + (0.1 - (5 - q)(0.08 + (5 - q) \times 0.02))\right)$$
  - Incorrect recalls ($q < 3$) reset repetition counter to 0 and schedule next review for the following day.
- **Audio Pronunciation**: Web Speech API integration (`SpeechSynthesisUtterance`, `ko-KR`) for instant native pronunciation.
- **Interactive Quizzes**: Dual-direction testing (Korean → Uzbek and Uzbek → Korean) with instant feedback and wrong-answer logging.
- **Grammar Library & Practice**: Curated intermediate and advanced grammar patterns with Uzbek translations, usage nuances, sample sentences, and multiple-choice drill questions.
- **Writing Prompts (Tasks 51, 52, 53, 54)**: Official TOPIK II writing formats with sample answers and scoring rubrics.
- **180-Minute Mock Exam Simulator**: Real countdown timer for full 3-section simulation (Listening, Writing, Reading) and diagnostic weakness analysis.

### 2.3. Habits & Discipline Scoring Engine
- **Habit Streaks**: Daily and weekly tracking with `currentStreak` and `bestStreak` records.
- **Deterministic Discipline Score (0 to 100)**:
  $$\text{Total Score} = S_{\text{tasks}} + S_{\text{habits}} + S_{\text{study}} + S_{\text{finance}}$$
  - **Tasks Score (Max 35 points)**: Based on completion percentage of today's planned tasks.
  - **Habits Score (Max 30 points)**: Based on percentage of scheduled daily habits completed.
  - **Study Score (Max 25 points)**: Based on actual study minutes vs. daily target.
  - **Finance Score (Max 10 points)**: Perfect 10 points if spending $\le$ dynamic daily limit; penalized proportionally if over limit.
- **Transparent Explanations**: Popover and trend chart breaking down each component.

### 2.4. Deterministic Financial Engine
- **Dynamic Daily Spending Limit**:
  $$\text{Daily Limit} = \frac{\text{Monthly Budget} - \text{Total Spent to Date}}{\text{Total Days in Month} - \text{Day of Month} + 1}$$
  - Adapts to leap years (e.g., February 29 in 2024, 2028).
  - Handles month boundaries and prevents division-by-zero errors.
  - If budget is exceeded, limit safely clamped to 0 with overspending warning.
- **Income Target & Required Daily Earnings**: Computes daily earning rate needed to achieve target monthly income:
  $$\text{Required Daily Income} = \frac{\text{Target Income} - \text{Actual Income to Date}}{\text{Days Remaining}}$$
- **Expense Categorization & Visual Analytics**: Distribution by category (Food, Transport, Education, Utilities, Health, Entertainment, Other).
- **Savings Goals**: Visual progress towards financial targets.

### 2.5. Goals & OKR Framework
- **Hierarchical Timeframes**: Long-term (1–3 years), Annual, Monthly, and Weekly goals.
- **Interactive Milestones**: Checklists that automatically recalculate overall goal progress percentage.

### 2.6. AI Decision Support & Safety Architecture
- **Provider Abstraction**: Pluggable architecture supporting Google Gemini API with fallback to built-in deterministic heuristic expert engine.
- **Input Sanitization**: Filters prompt injection vectors, script tags, and system override attempts.
- **Consequential Action Gate**: Any destructive or impactful modification proposed by the AI requires explicit user review and interactive confirmation before execution.

---

## 3. Responsive UX Requirements
- **Mobile First**: Touch-friendly targets ($\ge 44\text{px}$), sticky bottom mobile navigation bar, slide-out drawer, and zero horizontal overflow.
- **Desktop**: Persistent sidebar, multi-column analytics grids, and quick modal creation flows.
- **Theme**: Dark Mode by default with CSS design tokens, smooth glassmorphism, and light theme toggle support.
