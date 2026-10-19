# Project Rules

## Version Control
For version control practices, see the `COMMIT.md` file.

## TypeScript

- **No `any`**. Never. Use `unknown` + type guard, or a proper interface/type.
- **No inline type annotations in function parameters**. Every function/component prop type MUST be a named interface or type alias, defined separately.
- **No inline object types** like `{ field: string }` in function signatures or callbacks. Extract to `interface` or `type`.
- Use `interface` for object shapes (preferred), `type` for unions/utility types.
- **No untyped collections**: never a bare `Array<T>`/`T[]` of objects built ad hoc, and never object literals passed around as untyped bags — give every collection a named element type, and type every object shape explicitly (no `Record<string, unknown>` dumping grounds unless genuinely dynamic).
- Use the `@local/...` alias for all handwritten imports within `src`; never use relative `./...` or `../...` import paths. Generated files such as `routeTree.gen.ts` remain generator-owned.

## Forms

- Use `@mantine/form` (`useForm`) for ALL form state. No `useState` for individual form fields.
- Keep `useEffect` to absolute minimum — only for syncing external data into the form.

## Components

- Keep files focused and small. Split into subdirectories per feature if needed.
- Don't force modularity if it doesn't fit — one file per entity/form is fine.

## Layout

- Use Mantine `Grid` for multi-column form layouts.
- Use Mantine `Tabs` for complex entities with multiple sections.

## Backend (Python)

- List endpoints stay paginated; when a new tree or "everything" view appears, add a dedicated lightweight endpoint that returns only the fields the view renders instead of raising caps or looping pages client-side.
- Fix ruff warnings before committing (`bun run lint`).
- **No untyped dicts/lists**: every dict, list, or tuple that crosses a boundary (routes, services, models) has a named Pydantic model or `TypedDict`/`NamedTuple` — never a bare `dict[str, Any]`, `list[dict]`, or kwargs bag. `Any` is allowed only at true dynamic edges (e.g. raw DB rows before model validation), never inside business logic.
- Keep Pydantic model configs consistent: `snake_case` for DB columns, `camelCase` for API responses (via `alias_generator=to_camel, populate_by_name=True`).

## Typesync (backend ↔ frontend)

- API types are generated from the FastAPI OpenAPI schema — never hand-write request/response types in `src/types/` or duplicate models on the client.
- Regenerate with `bun run typesync`, which runs `@openapitools/openapi-generator-cli` twice:
  - `typescript-axios` → frontend client + types (the axios instance in `src/hooks/api.ts` is replaced by the generated client).
  - `python-fastapi` → backend client models (for any backend-to-backend calls/tests).
- The backend is the single source of truth: change the Pydantic model, regenerate, then adapt the frontend. Never edit generated files by hand.

## Backend structure

The backend is a single FastAPI app; `App.py` is the entrypoint (mounts the API under `/api`, static files, SPA fallback):

- `api/routes/` — one module per resource; each exposes an `APIRouter` named `router` and is registered automatically.
- `api/models/` — Pydantic request/response/row models.
- `api/services/` — reusable database, file, and domain operations.
- `api/auth/` — AuthX JWT cookie configuration and helpers.
- `api/lib/` — config, database pool, logging.
- DB schema changes go in idempotent SQL files under `dbinit/`; never edit or patch the schema from application code.

## Process

- When possible (e.g., for non-blocking tasks or tasks that don't depend on each other), using multiple agents is welcome and often recommended to speed up the work.
- Track tasks in `plans/modules/<module>-tasks.md` (whole modules) or `plans/features/<feature>-tasks.md` (cross-cutting features), with progress in the sibling `-progress.md`.
- Run `bun run everything` before considering done. Use `bun`/`uv` from the system itself; never run tests or builds through Docker containers.
- Deployment is handled by the developer on request from the repo root with `docker compose build biblioteca && docker compose up -d biblioteca`. Only when the developer asks.
- Never use browser testing unless explicitly asked. Verify UI-related behavior through type checks and non-browser tests.
- Never start the API or frontend during verification. The developer runs application services.
- No CSS files — inline styles only (`index.css` for global helpers).
