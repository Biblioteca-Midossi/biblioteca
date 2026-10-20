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
- Internal Pydantic models keep `snake_case` fields; wire (API-visible) shapes use camelCase — hand-written row/service models stay snake_case, wire formats are declared in the contract and generated with camelCase aliases (`populate_by_name=True` so Python code uses snake_case).

## Contract & Typesync (design-first)

- `contracts/biblioteca.yaml` is the **single source of truth** for the API. Every endpoint change starts there: edit the YAML (paths, schemas, `operationId` in camelCase, domain tags), then regenerate, then implement/adapt.
- `bun run typesync` regenerates both artifacts from the contract — never edit generated files by hand:
  - `src/api/` — `typescript-axios` client used by the frontend.
  - `contracts_gen/biblioteca_api/` — `python-fastapi` server skeleton: routers (`apis/`) + Pydantic models (`models/`). `contracts_gen/` is gitignored; regenerate after cloning or after any contract change.
- Generated sources are **never committed** (`.gitignore` covers `src/api/` and `contracts_gen/`), mirroring rideup's `target/generated-sources/` rule.
- Server implementation lives in `api/impl/`: one class per generated interface implementing the generated `Base*Api` (e.g. `BooksImpl(BaseBooksApi)`). Generated routers own the HTTP shape (paths, status codes, response models); impls own business logic and must not re-declare paths or status codes.
- The frontend calls the API **only** through the generated client classes (`authApi`, `booksApi`, `usersApi` from `@local/hooks/api`). Hand-written URL strings like `api.get('/books/...')` are forbidden — the generated methods are the path constants. Raw axios/`fetch` calls outside the generated client are forbidden.
- Transport types come from the generated code (`BookResponse`, `UserProfileOut`, ...). Components needing extra view state (e.g. a `File` before upload) define a named view-model type derived from the generated one (`Omit`/extends), never a parallel hand-written duplicate.

## Backend structure

The backend is a single FastAPI app; `App.py` is the entrypoint (mounts the API under `/api`, static files, SPA fallback):

- `contracts/biblioteca.yaml` — API contract (source of truth; see Contract & Typesync).
- `contracts_gen/biblioteca_api/` — generated routers + models (never edited, never committed).
- `api/impl/` — one class per generated interface implementing `Base*Api`; business logic and permission checks live here.
- `api/models/` — hand-written internal models (DB row shapes via `db.fetchall_as`, service payloads). Wire formats visible to the API live in the contract; row models mirror DB columns in snake_case.
- `api/services/` — reusable database, file, and domain operations.
- `api/auth/` — AuthX JWT cookie configuration and helpers.
- `api/lib/` — config, database pool, logging.
- DB schema changes go in idempotent SQL files under `dbinit/`; never edit or patch the schema from application code.
- Lint config: `ruff.toml` (hand-written code), `ruff.gen.toml` (generated code — relaxed, don't fight the generator).

## Process

- When possible (e.g., for non-blocking tasks or tasks that don't depend on each other), using multiple agents is welcome and often recommended to speed up the work.
- Track tasks in `plans/modules/<module>-tasks.md` (whole modules) or `plans/features/<feature>-tasks.md` (cross-cutting features), with progress in the sibling `-progress.md`.
- Run `bun run everything` before considering done. Use `bun`/`uv` from the system itself; never run tests or builds through Docker containers.
- Deployment is handled by the developer on request from the repo root with `docker compose build biblioteca && docker compose up -d biblioteca`. Only when the developer asks.
- Never use browser testing unless explicitly asked. Verify UI-related behavior through type checks and non-browser tests.
- Never start the API or frontend during verification. The developer runs application services.
- No CSS files — inline styles only (`index.css` for global helpers).
