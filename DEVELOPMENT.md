# LIFEOS — Development Guide

## Development Principle

Work from the repository, not from assumptions.

Before changing code:

1. Read `AGENTS.md`.
2. Read `TASKS.md`.
3. Read `PRODUCT_SPEC.md`.
4. Read `ARCHITECTURE.md` when making structural changes.
5. Inspect `package.json` and the relevant source files.

## Autonomous Development Loop

Use:

`READ → PLAN → IMPLEMENT → TEST → FIX → VERIFY → DOCUMENT → NEXT`

Do not stop simply because one feature is complete.

## Validation

Use only commands actually defined by the project. Inspect `package.json` first.

At minimum, meaningful changes should be validated with the relevant combination of:

```bash
npm test
npm run typecheck
npm run build
```

Run lint when a lint script exists.

If a command fails because of code introduced by the current change, fix it before moving on.

## Database

The application uses Prisma with SQLite according to the current project configuration.

Do not commit local database files, credentials or generated secrets.

When changing the Prisma schema, verify the affected application code and tests together.

## API and Security

Validate input at API boundaries.

Verify authorization server-side for protected resources.

Do not expose secrets to the browser.

Treat AI prompts, user text and external content as untrusted input.

## UI Development

Test important flows at mobile, tablet and desktop widths.

Avoid horizontal overflow.

Check loading, empty, error and success states.

Prefer accessible semantic controls and keyboard-friendly interactions.

## Git Workflow

Use focused commits with clear messages.

Examples:

- `feat: add task conflict detection`
- `fix: prevent overlapping time blocks`
- `test: cover finance edge cases`
- `docs: update architecture guide`

Keep `TASKS.md` synchronized with real implementation status.

Do not mark work `[x]` without verification.

## Completion Standard

A feature is complete only when:

- implementation exists
- affected tests pass
- typechecking passes where applicable
- production build passes when applicable
- responsive behavior is checked for UI changes
- documentation is updated when needed
- `TASKS.md` reflects the verified state
