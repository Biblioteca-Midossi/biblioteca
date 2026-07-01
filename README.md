# Biblioteca Midossi

Biblioteca Midossi is a simple full-stack web app for managing a school library catalogue. It provides a public book browser, user registration/login, personal profiles, and an administrator dashboard for managing books and users.

The project is built for IIS U. Midossi and uses Italian domain terms such as `libri`, `autori`, `utenti`, `istituto`, and `collocazioni` throughout the backend and database.

## Features

- Browse books with pagination and search
- View book details and cover images
- Register, log in, refresh sessions, and log out
- Cookie-based JWT authentication
- User profile endpoint and profile updates
- Role-protected admin dashboard
- Create, update, and delete books with thumbnail upload
- Manage users with role checks
- PostgreSQL schema initialization through Docker
- Single Docker image serving both the FastAPI API and the built React app

## Tech stack

### Frontend

- React 19
- Vite
- TanStack Router
- Mantine UI
- Axios
- Zustand
- Bun

### Backend

- Python 3.12
- FastAPI
- AuthX JWT cookies
- psycopg / psycopg-pool
- Pydantic
- Pillow for image conversion
- uv

### Infrastructure

- PostgreSQL 18
- Docker / Docker Compose

## Project structure

```text
.
├── App.py                  # FastAPI application entrypoint
├── api/                    # Backend routes, auth, models, services, database helpers
├── dbinit/                 # PostgreSQL initialization and migration SQL files
├── public/                 # Static frontend assets
├── src/                    # React frontend
├── uploads/                # Uploaded thumbnails/profile files, mounted in Docker
├── Dockerfile              # Multi-stage frontend/backend production image
├── docker-compose.yml      # Local Docker deployment
├── template.env            # Example environment file
└── docs/                   # Simple project documentation
```

## Quick start with Docker

1. Copy the environment template:

```bash
cp template.env .env
```

2. Edit `.env`, especially:

```env
POSTGRES_PASSWORD=change-me
JWT_SECRET_KEY=replace-with-a-random-secret
ADMIN_PASSWORD=change-me
```

You can generate a JWT secret with:

```bash
openssl rand -hex 32
```

3. Start the stack:

```bash
docker compose up --build
```

4. Open the app:

```text
http://localhost:4000
```

5. API documentation is available at:

```text
http://localhost:4000/api/docs
```

The backend creates a first administrator automatically if no role `4` user exists:

- username: `support`
- email: `support@localhost.com`
- password: value of `ADMIN_PASSWORD`

## Local development

### Requirements

- Python 3.12+
- uv
- Bun
- PostgreSQL, or the Docker Compose database service

### Install dependencies

```bash
bun install
uv sync
```

### Start PostgreSQL only

```bash
docker compose up postgres
```

For local backend development, set `POSTGRES_HOST=localhost` in `.env` if the API runs outside Docker.

### Run the backend

```bash
uv run uvicorn App:biblioteca --host 0.0.0.0 --port 4000 --reload
```

### Run the frontend

```bash
bun run dev:client
```

The Vite dev server runs on `http://localhost:3000` and proxies `/api` to `http://localhost:4000`.

## Useful scripts

```bash
bun run dev:client   # start Vite frontend dev server
bun run build        # build the frontend into dist/
bun run lint         # run ESLint and Ruff checks
bun run fmt          # auto-format frontend/backend files
bun run typecheck    # TypeScript type check
```

## Main routes

Frontend pages:

- `/` - public book catalogue
- `/books/$id` - book details
- `/login` - login
- `/register` - registration
- `/users/me` - current user profile
- `/dashboard` - admin dashboard, role 3+
- `/userlist` - user management, role 3+

Backend route groups:

- `/api/auth/*` - authentication
- `/api/books/*` - catalogue and book management
- `/api/users/*` - profile and user management
- `/api/health` - health check

## Roles

The code uses numeric roles. Current protected admin features require role `3` or higher. The initial bootstrap administrator is created with role `4`.

## More documentation

Simple docs are available in [`docs/`](docs/):

- [`docs/getting-started.md`](docs/getting-started.md)
- [`docs/project-overview.md`](docs/project-overview.md)
- [`docs/api.md`](docs/api.md)
- [`docs/deployment.md`](docs/deployment.md)

## Notes

This README was written from the current repository contents. The wider `Biblioteca-Midossi` GitHub organization can be used as style and naming inspiration, but this documentation focuses on the code present in this project.
