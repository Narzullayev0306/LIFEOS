# LIFEOS — Architecture Guide

## Architectural Goal

LIFEOS is a modular personal operating system built around a shared user context: time, tasks, study, habits, goals, money and AI recommendations.

The architecture should remain incremental and avoid unnecessary rewrites.

## Current Stack

- Next.js App Router
- TypeScript
- Prisma ORM
- SQLite
- JWT-based sessions
- bcryptjs for password hashing
- jose for JWT handling
- Vitest for tests
- Vanilla CSS/design-token based styling

The exact versions and scripts are defined by `package.json` and should be treated as authoritative.

## Application Layers

### App Layer

`src/app` contains pages, layouts and API routes.

Major product areas include dashboard, planner, TOPIK, habits, finance, goals, AI, profile and onboarding.

### Components

`src/components` contains reusable UI components and shared layouts.

Keep business calculations out of presentation components when they can be isolated into reusable domain modules.

### Domain and Libraries

`src/lib` contains shared infrastructure and domain logic.

Calculation engines should remain deterministic and independently testable. Examples include planner scheduling, finance calculations, discipline scoring and spaced repetition.

### Database

`prisma/schema.prisma` defines persistent entities and relationships.

`prisma/seed.ts` provides development seed data.

### Tests

`tests` contains automated tests for calculations and core application behavior.

## Domain Relationships

The intended conceptual flow is:

`User → Preferences → Schedule → Tasks → Daily Execution`

`User → TOPIK Goal → Study Plan → Vocabulary/Grammar/Reading/Listening/Writing → Results`

`User → Habits → Completions → Streaks → Discipline Score`

`User → Goals → Milestones → Daily Actions → Progress`

`User → Income/Expenses → Budget → Spending Analysis → Financial Targets`

`User → All Domains → AI Analysis → Recommendations → Explicit Confirmation → Changes`

## Important Invariants

Planner:

- no unintended overlapping time blocks
- fixed events remain protected
- sleep/recovery remains protected
- rescheduling remains deterministic

Finance:

- calculations are deterministic
- dates and remaining-day calculations are handled explicitly
- no silent financial transactions

Authentication:

- protected resources require valid sessions
- authorization is checked server-side
- secrets are never exposed to client code

AI:

- external/user content is untrusted
- recommendations are separated from consequential actions
- consequential changes require confirmation

## Change Strategy

When implementing a new feature:

1. Identify the affected domain.
2. Inspect existing models, APIs and components.
3. Reuse existing abstractions when appropriate.
4. Add or update deterministic domain logic.
5. Add tests for important behavior and edge cases.
6. Update UI and responsive states.
7. Validate the production build.
8. Update documentation and `TASKS.md`.

Avoid creating parallel implementations of the same business rule.
