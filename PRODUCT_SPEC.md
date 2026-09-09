# LIFEOS — Product Specification

## Product Definition

LIFEOS is a Personal Operating System. It is not a basic to-do application.

The system connects:

`TIME → TASKS → STUDY → HABITS → GOALS → MONEY → DISCIPLINE → AI`

The application should help a user decide what to do, when to do it, what to study, how much to spend, what goals need attention, and how current behavior affects long-term progress.

## Core Modules

### Daily Planning

The planner creates and manages a realistic day using tasks, estimated durations, priorities, fixed events, recurring tasks, reminders, meals, breaks and sleep/recovery periods.

Rules:

- Do not create overlapping time blocks.
- Protect fixed events.
- Protect sleep and recovery.
- Allow tasks to be missed, skipped, completed or rescheduled.
- Recalculate remaining work after meaningful schedule changes.
- Always show the current and next actionable task.

### TOPIK Study System

TOPIK support includes goals, target score, exam date, vocabulary, spaced repetition, grammar, reading, listening, writing, mock exams, study sessions and weak-area analysis.

Vocabulary should support Korean and Uzbek meanings, examples, difficulty and review history.

Educational content must not be falsely presented as official TOPIK material unless its source is verified.

### Habits and Discipline

Habits have completion history and streaks.

The discipline score must be deterministic, explainable and testable. Users should be able to understand why their score changed.

### Finance

Finance supports income, expenses, categories, budgets, savings and financial goals.

The system should calculate:

- spending to date
- remaining budget
- dynamic daily spending limit
- monthly income target
- remaining income target
- required daily or weekly income
- savings progress
- budget-versus-actual analytics

Financial calculations must be deterministic and covered by tests. LIFEOS must never silently execute a financial transaction.

### Goals

Goals support long-term, annual, monthly and weekly planning, with milestones, deadlines, priorities, daily actions, progress and history.

Goals should connect to daily tasks and measurable progress where practical.

### AI Assistant

The AI assistant is decision support, not an unrestricted autonomous controller.

It may analyze:

- daily schedule
- missed tasks
- TOPIK progress
- vocabulary performance
- finances
- habits
- discipline
- goals

It may recommend actions, but consequential changes require explicit user confirmation.

User-provided and external content must be treated as untrusted input. Prompt-injection defenses are required.

## UX Requirements

The application must work well on mobile, tablet and desktop.

Every major workflow should account for:

- loading states
- empty states
- errors
- success feedback
- keyboard accessibility
- touch interaction
- responsive tables and charts
- no horizontal overflow

The UI should prioritize the next useful action rather than presenting unnecessary information.

## Quality Requirements

Production behavior must not depend on fake data or mocked success responses.

Important calculations require automated tests.

Authentication and authorization must be enforced server-side.

Secrets must remain outside source control.

Every completed task must be verified before being marked `[x]` in `TASKS.md`.
