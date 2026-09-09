# LIFEOS — Antigravity Autonomous Execution Guide

## Purpose

This repository is designed to be worked on autonomously from Antigravity using `/goal`.

`/goal` is an Antigravity execution command, not a GitHub command. GitHub stores the repository, backlog, commits and pull requests; Antigravity is responsible for running the local development workflow.

## Start Command

Run `/goal` in Antigravity and use this objective:

```text
Read AGENTS.md, TASKS.md, README.md, ARCHITECTURE.md, DEVELOPMENT.md and PRODUCT_SPEC.md.

You are the autonomous lead engineer for LIFEOS.

Implement the repository completely according to TASKS.md and the product rules in PRODUCT_SPEC.md.

Use this loop continuously:
READ → AUDIT → PLAN → IMPLEMENT → TEST → FIX → VERIFY → UPDATE TASKS.md → NEXT TASK

Do not stop after one task or one phase.
Do not ask for confirmation for normal engineering decisions.
Ask only for genuine blockers such as missing credentials, contradictory requirements, unavailable external services, or irreversible destructive actions.

Never mark a task complete without real verification.
Inspect package.json before choosing commands.
Run the project's available lint, typecheck, tests and production build as appropriate.
Fix failures before continuing.
Keep GitHub Issues aligned with TASKS.md.
Never commit secrets.

Continue until all applicable TASKS.md items are implemented and verified, validation passes, the production build succeeds, and no known critical bug remains.

Start now.
```

## Execution Rules

1. `TASKS.md` is the implementation checklist.
2. `AGENTS.md` contains the autonomous engineering policy.
3. `PRODUCT_SPEC.md` defines the intended product behavior.
4. `ARCHITECTURE.md` describes the technical structure.
5. `DEVELOPMENT.md` contains local development and validation guidance.
6. Never invent completion status.
7. Preserve working functionality unless a justified change is required.
8. Prefer small, verifiable changes over large rewrites.
9. Update documentation when behavior or architecture changes.

## GitHub Relationship

Use GitHub for:
- source control
- issues and backlog
- commits
- pull requests
- code review
- CI results

Use Antigravity for:
- local code editing
- dependency installation
- running development commands
- tests
- linting
- typechecking
- production builds
- browser/application verification

Do not treat a GitHub commit as proof that the application works. Verification must come from actual validation.

## Key Commands Reference

- **Test Suite**: `npm test` (`vitest run`)
- **Type Check**: `npm run typecheck` (`tsc --noEmit`)
- **Production Build**: `npm run build` (`next build`)
- **Database Push**: `npm run db:push` (`prisma db push`)
- **Database Seed**: `npm run db:seed` (`tsx prisma/seed.ts`)
