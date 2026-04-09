# ByGagoos-Ink Project Guidelines

## Quick Start

**Build & Test Commands**

```bash
# Backend (from backend/)
npm run dev              # Start dev server with hot reload
npm run build            # Compile TypeScript to dist/
npm run type-check       # Check TypeScript without building
npm run test             # Run test suite
npm run lint:fix         # Fix linting issues

# Frontend (from frontend/)
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run lint             # Check code style
```

**Full Stack Development**

```bash
# From root directory - starts both with hot reload
npm run dev              # Uses concurrently to run backend + frontend

# Or individually
cd backend && npm run dev
cd frontend && npm run dev
```

**Essential Files to Know**

- Backend config: `backend/src/config/` — database, Redis, multer, auth
- Frontend routes: `frontend/src/router.tsx`
- API types: `backend/src/types/` — shared TypeScript interfaces
- Environment: `.env` files (backend/.env, frontend/.env) — never commit these

## Architecture

### Backend: Node.js + Express + MongoDB + JWT

**Key Decisions:**

- **Path aliases** (`@modules`, `@utils`, etc.) defined in `backend/tsconfig.json` — use for clean imports
- **Role-based access**: 4 roles (admin, manager, staff, client) defined in `backend/src/core/userRoles.ts`
- **Modules structure**: Each business domain (clients, designs, orders) as a module with service/controller/routes

**Service Boundaries:**

- `backend/src/modules/clients/` — Client data and relationships
- `backend/src/modules/designs/` — Design management, uploads, preview generation
- `backend/src/modules/orders/` — Order creation, status tracking, invoicing
- `backend/src/services/` — Cross-module utilities (email, PDF generation, image processing)
- `backend/src/config/` — Database, Redis, Multer, environment variables

**Middleware Stack** (order matters):

1. Auth middleware (`backend/src/middlewares/auth.middleware.ts`) — Validates JWT, sets `req.user`
2. Role middleware (`backend/src/middlewares/role.middleware.ts`) — Checks role-based access
3. Rate limit middleware — Prevents abuse
4. Error handling in controllers — Consistent error responses

**Common Pitfalls:**

- Missing path alias imports → leads to circular dependencies; always use `@alias` syntax
- Timezone issues in date fields — MongoDB stores UTC; convert in service layer
- Mongoose schema validation happens at save time; add `runValidators: true` to updates
- Redis tokens expire; check expiry logic in auth middleware before assuming token is valid

### Frontend: React 18 + TypeScript + Tailwind + Vite

**Key Decisions:**

- **Store**: Zustand (`frontend/src/stores/`) — lightweight state for auth, UI state
- **Data fetching**: React Query (`@tanstack/react-query`) — auto-caching, refetch on window focus
- **Forms**: React Hook Form + Zod — type-safe validation
- **Routing**: React Router v6 — nested routes in `frontend/src/router.tsx`

**Component Patterns:**

- Page components in `frontend/src/pages/` — correspond to routes
- Reusable UI in `frontend/src/components/` — Button, Card, Modal, Table, etc.
- Custom hooks in `frontend/src/hooks/` — useAuth, useTasks, etc.
- Type definitions in `frontend/src/types/` — mirror backend schemas

**Common Pitfalls:**

- CORS issues → backend must allow frontend origin in headers (set in `backend/src/app.ts`)
- API URL mismatch → check `frontend/.env` against actual backend base URL
- Stale UI after API changes → wrap mutations in React Query, use `invalidateQueries`
- Image loading → use Lucide icons for UI; for uploads, validate on backend before storing

## Code Style & Conventions

### TypeScript

- **Strict mode enabled**: `backend/tsconfig.json` has `"strict": true`
- **Interfaces over types** for data models (extensible in subclasses)
- **Services return typed results**: `{ success: boolean; data?: T; error?: string }`
- **Never ignore TypeScript errors** — run `npm run type-check` before pushing

### Error Handling

- Controllers throw domain-specific errors; middleware catches and formats as JSON
- Example: `throw new Error('User not found')` → middleware converts to `{ error: 'User not found', statusCode: 404 }`
- Always include context in error messages (e.g., user ID, design ID)

### Naming Conventions

- **Files**: kebab-case for files (`user-controller.ts`), PascalCase for classes/interfaces
- **Functions**: camelCase for async utils that return Promises
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`, `JWT_SECRET`)
- **Database fields**: camelCase in TypeScript; MongoDB uses camelCase (no snake_case)

### Async Patterns

- Use `async/await` instead of `.then()` chains
- Always wrap async in try/catch in controllers
- For batch operations, use `Promise.all()` for parallel; `for...of` for sequential

## Git & Deployment

### Before Committing

```bash
npm run type-check      # Catch TypeScript errors
npm run lint:fix        # Auto-fix style issues
npm run test            # Run unit tests (if defined)
```

### Branch Strategy

- `main` — Production-ready; requires all tests passing
- `develop` — Integration branch; for feature branches
- Feature branches: `feature/short-description` — short-lived, squash before merge

### Deployment

- **Frontend**: Vercel auto-deploys on push to `main`
- **Backend**: Railway auto-deploys on push to `main`
- **Database**: MongoDB Atlas M0 (512 MB free tier); seed script in `backend/scripts/`

### Environment Variables

- Backend: `backend/.env` — never commit; set in Railway dashboard
- Frontend: `frontend/.env` — API base URL must match backend (e.g., `https://api.bygagoos.com`)
- Sensitive data: credentials, secrets go in platform dashboards, not `.env` files

## Development Workflow

### Setup Local Machine

```bash
git clone https://github.com/ByGagoos/bygagoos-ink.git
cd bygagoos-ink

# Backend
cd backend
npm install
cp .env.example .env        # Configure MongoDB URI, JWT secret, etc.
npm run dev                 # Starts on http://localhost:5000

# Frontend (new terminal)
cd frontend
npm install
npm run dev                 # Starts on http://localhost:5173
```

### Debugging

- **Backend errors**: Check `backend/logs/` or console output
- **Frontend network errors**: Check React Query devtools (Shift+Alt+Q) or Network tab
- **Database issues**: Use MongoDB Compass to inspect; check connection string in `.env`
- **TypeScript type errors**: Run `npm run type-check` for full diagnostics

### Documentation

- Architectural decisions: Add to comments in source code or link to docs in module README
- New features: Update GUIDE_DEMARRAGE.md or create feature-specific docs
- API endpoints: Swagger docs auto-generated from JSDoc comments in routes

### Testing

- Unit tests: Jest config in `backend/jest.config.js`
- Test files: `backend/src/**/*.test.ts` or `backend/test/`
- Run: `npm run test:watch` for live mode during development

## Performance & Optimization

### Backend

- Use indexes on frequently queried fields (MongoDB Atlas UI or via migration scripts)
- Cache repeated queries with Redis (`backend/src/core/config/redis.ts`)
- Batch uploads: preview generation via Sharp runs on server, not client

### Frontend

- Lazy-load routes with React Router: `lazy()` + `Suspense`
- Memoize expensive computations with `useMemo`, `useCallback`
- Image optimization: Tailwind responsive classes; use native `<img>` sizes attribute

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `npm run dev` fails with "permission denied" | On Windows, run PowerShell as Admin; on macOS/Linux, check Node.js is in PATH |
| TypeScript errors after pulling new code | Run `npm install` in both backend/ and frontend/ |
| "Cannot find module" even with path alias | Run `npm run type-check` to verify tsconfig.json paths are correct |
| CORS errors when calling API | Check `backend/src/app.ts` CORS config includes frontend origin |
| MongoDB connection timeout | Check `.env` connection string is valid; verify network access in Atlas dashboard |
| Design upload fails | Check Multer config in `backend/src/config/multer.ts`; verify `uploads/` directory exists |
| Frontend build fails | Run `npm run build` then check error output; ensure all dependencies are installed |

## Links & Resources

- **Startup Guide**: See [GUIDE_DEMARRAGE.md](./GUIDE_DEMARRAGE.md) for full onboarding
- **Admin Settings**: [ADMIN_SETTINGS_GUIDE.md](./ADMIN_SETTINGS_GUIDE.md) — system configuration
- **MongoDB Docs**: https://www.mongodb.com/docs/
- **Express Middleware**: https://expressjs.com/en/guide/using-middleware.html
- **React Router**: https://reactrouter.com/
- **Tailwind CSS**: https://tailwindcss.com/docs
