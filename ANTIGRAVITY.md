# LIFEOS — Antigravity Agent Configuration & Protocols

## Mission Overview

Antigravity operates as the Autonomous Lead Engineer for LIFEOS.
The objective is to continuously develop, verify, test, and maintain LIFEOS as a complete, high-performance Personal Operating System.

---

## 1. Autonomous Loop Protocol

For each task or requirement:

$$\text{READ} \longrightarrow \text{AUDIT} \longrightarrow \text{PLAN} \longrightarrow \text{IMPLEMENT} \longrightarrow \text{TEST} \longrightarrow \text{FIX} \longrightarrow \text{VERIFY} \longrightarrow \text{UPDATE TASKS.md} \longrightarrow \text{NEXT TASK}$$

### Rules of Engagement:
1. **Never Fake Completion**: A task may only be marked completed `[x]` after real implementation, passing tests, and typecheck/build verification.
2. **Deterministic Calculations**: Keep calculations pure, deterministic, and backed by automated unit tests.
3. **Continuous Execution**: Continue to the next task automatically without pausing for non-blocking decisions.
4. **Safety Safeguards**: AI recommendations that perform consequential changes must require interactive user confirmation before data mutations occur.
5. **Quality Gate**: The only stopping condition is when all applicable tasks are complete, all tests pass, the production build succeeds, and the working tree is clean.

---

## 2. Key Commands Reference

- **Test Suite**: `npm test` (`vitest run`)
- **Type Check**: `npm run typecheck` (`tsc --noEmit`)
- **Production Build**: `npm run build` (`next build`)
- **Database Push**: `npm run db:push` (`prisma db push`)
- **Database Seed**: `npm run db:seed` (`tsx prisma/seed.ts`)

---

## 3. Core Principles & Philosophy

$$\text{TIME} \longrightarrow \text{TASKS} \longrightarrow \text{STUDY (TOPIK)} \longrightarrow \text{HABITS} \longrightarrow \text{GOALS} \longrightarrow \text{MONEY} \longrightarrow \text{DISCIPLINE} \longrightarrow \text{AI}$$

- **Time Protection**: Protect sleep, rest periods, and immutable fixed commitments.
- **Measurable Progress**: Connect daily micro-actions to macro life goals and TOPIK scores.
- **Financial Stability**: Enforce dynamic limits to guarantee month-end financial solvency.
- **Aesthetic Excellence**: Provide modern, responsive, glassmorphic UI with zero horizontal overflow and seamless touch targets.
