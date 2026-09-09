# LIFEOS — Developer Guide

## 1. Environment Setup

### Prerequisites
- **Node.js**: v18.17.0+ (Tested on v22.x)
- **npm**: v9.0.0+ (Tested on v10.x)
- **Git**: Installed and configured

### Installation & Initialization
```bash
# Clone the repository
git clone https://github.com/Narzullayev0306/LIFEOS.git
cd LIFEOS

# Install dependencies
npm install

# Create local environment configuration
cp .env.example .env

# Generate Prisma Client and sync SQLite database
npx prisma generate
npm run db:push

# Populate database with rich seed data (TOPIK vocabulary, grammar, categories, demo user)
npm run db:seed
```

---

## 2. Standard Development Scripts

| Command | Action |
|---|---|
| `npm run dev` | Starts local Next.js dev server on `http://localhost:3000` |
| `npm run build` | Compiles production application bundle and validates all pages |
| `npm run start` | Runs the production build locally |
| `npm run typecheck` | Runs TypeScript compiler in strict mode without emitting files (`tsc --noEmit`) |
| `npm test` | Runs the full Vitest automated test suite |
| `npm run test:watch` | Runs Vitest in interactive watch mode |
| `npm run db:push` | Pushes Prisma schema changes directly to SQLite database |
| `npm run db:seed` | Runs seed script (`prisma/seed.ts`) using `tsx` |
| `npm run db:generate` | Regenerates Prisma TypeScript client |

---

## 3. Database Management

### Prisma SQLite Configuration
The database URL is configured in `.env`:
```env
DATABASE_URL="file:./lifeos.db"
```
The SQLite database file `lifeos.db` is stored locally in the project root and is excluded from git tracking via `.gitignore`.

### Making Schema Modifications
1. Edit `prisma/schema.prisma`.
2. Run `npx prisma db push` to synchronize changes to `lifeos.db`.
3. Run `npx prisma generate` to refresh `@prisma/client` types.
4. If seed data is affected, update `prisma/seed.ts` and re-run `npm run db:seed`.

---

## 4. Coding Conventions & Best Practices

1. **TypeScript Strict Mode**:
   - Every function and parameter must have explicit types.
   - Avoid `any` where possible; use interfaces and enums/union types.
2. **Pure Deterministic Calculations**:
   - All financial, schedule, discipline, and SM-2 calculations must remain in `src/lib/calculations/` as pure, side-effect-free functions.
   - Every calculation engine must have corresponding test coverage in `tests/`.
3. **Vanilla CSS Design System**:
   - Use CSS variables defined in `src/styles/globals.css`.
   - Never introduce TailwindCSS classes unless explicitly required by user configuration.
   - All interactive elements must maintain responsive styles across desktop ($\ge 1024\text{px}$), tablet ($640\text{px} - 1023\text{px}$), and mobile ($\le 639\text{px}$).
4. **Authentication & Session**:
   - Always retrieve the current authenticated user via `getCurrentUser()` from `src/lib/session.ts` in API routes.
   - Guard user data strictly: queries must filter by `userId: session.id`.

---

## 5. Running Automated Tests

```bash
# Run all unit and calculation tests
npm test

# Expected Output:
# ✓ tests/calculations.test.ts (14 tests)
# ✓ tests/auth.test.ts (3 tests)
# Test Files: 2 passed (2)
# Tests:      17 passed (17)
```
