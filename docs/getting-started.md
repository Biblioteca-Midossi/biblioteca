# Getting started

This guide explains the simplest way to run Biblioteca Midossi.

## 1. Create the environment file

```bash
cp template.env .env
```

Change at least these values:

```env
POSTGRES_PASSWORD=change-me
JWT_SECRET_KEY=replace-with-a-random-secret
ADMIN_PASSWORD=change-me
```

Generate a strong JWT secret with:

```bash
openssl rand -hex 32
```

## 2. Run with Docker

```bash
docker compose up --build
```

Open:

- App: `http://localhost:4000`
- API docs: `http://localhost:4000/api/docs`
- Health check: `http://localhost:4000/api/health`

## 3. First administrator

When the backend starts, it checks whether an admin user exists. If not, it creates one:

```text
username: support
email: support@localhost.com
password: value of ADMIN_PASSWORD
role: 4
```

Change the password after first login when that feature is available, or update it directly in the database.

## 4. Run in development mode

Install dependencies:

```bash
bun install
uv sync
```

Start PostgreSQL:

```bash
docker compose up postgres
```

If the backend runs on your host instead of inside Docker, set this in `.env`:

```env
POSTGRES_HOST=localhost
```

Start the API:

```bash
uv run uvicorn App:biblioteca --host 0.0.0.0 --port 4000 --reload
```

Start the frontend:

```bash
bun run dev:client
```

Use the frontend at `http://localhost:3000`.
