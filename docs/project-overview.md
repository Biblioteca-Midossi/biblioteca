# Project overview

Biblioteca Midossi is split into a React frontend and a FastAPI backend.

## Frontend

Source folder: `src/`

Important parts:

- `src/routes/` - TanStack Router file-based pages
- `src/components/` - reusable UI components
- `src/hooks/api.ts` - shared Axios client and token refresh handling
- `src/hooks/` - data-fetching and state hooks
- `src/types/` - TypeScript types
- `src/theme.ts` - Mantine theme setup

The frontend calls the backend through `/api`. In development, Vite proxies `/api` to `http://localhost:4000`.

## Backend

Source folder: `api/`

Important parts:

- `App.py` - creates the FastAPI app, mounts built frontend assets, registers routes
- `api/routes/` - route modules for auth, books, and users
- `api/auth/` - AuthX JWT cookie configuration and helpers
- `api/models/` - Pydantic request/response/row models
- `api/services/` - reusable database, file, and user operations
- `api/lib/database.py` - PostgreSQL connection pool helper
- `api/lib/config.py` - environment and PostgreSQL configuration

Routes are registered automatically from modules in `api/routes/` that expose an `APIRouter` named `router`.

## Database

Initialization files live in `dbinit/` and are mounted into the PostgreSQL container at `/docker-entrypoint-initdb.d`.

Core tables include:

- `libri` - books
- `autori` - authors
- `generi` - genres
- `utenti` - users
- `collocazioni` - institute/shelf locations
- `libro_autori` - many-to-many book/author links
- `libro_generi` - many-to-many book/genre links
- `prenotazioni` - reservations

Institutes are represented with the values:

- `EXT`
- `ITT`
- `LAC`
- `LAV`

## Authentication model

Authentication uses JWTs stored in HTTP-only cookies:

- `access_token` - short-lived access token
- `refresh_token` - longer-lived refresh token

The frontend automatically attempts `/auth/refresh` when an API call returns `401`.

## Roles

Role checks are numeric. Admin screens and book management currently require role `3` or higher. The bootstrap admin uses role `4`.
