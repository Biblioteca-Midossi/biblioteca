# Deployment notes

## Docker image

The `Dockerfile` uses two stages:

1. Bun builds the React frontend into `dist/`.
2. A Python/uv runtime installs backend dependencies, copies the API, copies `dist/`, and starts Uvicorn.

The final container serves both:

- the API under `/api`
- the built frontend from `dist/`
- uploaded files from `/uploads`

## Local Compose deployment

Use:

```bash
docker compose up --build -d
```

Services:

- `biblioteca` - app container on port `4000`
- `postgres` - PostgreSQL database

Persistent data:

- `biblioteca-pgdata` Docker volume for PostgreSQL
- `./uploads` bind mount for uploaded files

## Environment variables

Important variables from `template.env`:

```env
POSTGRES_DB=postgres
POSTGRES_USER=biblioteca
POSTGRES_PASSWORD=password
POSTGRES_PORT=5432
POSTGRES_HOST=biblioteca-pg
POSTGRES_SCHEMA=public
JWT_SECRET_KEY=verysecurekey
JWT_COOKIE_SECURE=false
ADMIN_PASSWORD=admin
```

For production:

- use a strong `POSTGRES_PASSWORD`
- use a strong `JWT_SECRET_KEY`
- set `JWT_COOKIE_SECURE=true` when serving over HTTPS
- consider enabling `JWT_COOKIE_CSRF_PROTECT=true`
- do not expose PostgreSQL publicly unless required

## Reverse proxy deployment

`template.docker-compose.yml` shows a production-style setup where the app joins an external `caddy_net` network and does not publish ports directly.

Typical pattern:

1. Create or use an external reverse-proxy network.
2. Attach `biblioteca` to that network.
3. Let Caddy, Traefik, or Nginx route HTTPS traffic to `biblioteca:4000`.

## Database initialization

PostgreSQL runs all SQL files in `dbinit/` only when the database volume is first created.

If you change initialization SQL after a database already exists, those changes will not automatically run. For development, you can reset the database with:

```bash
docker compose down -v
```

Then start again:

```bash
docker compose up --build
```

Warning: `docker compose down -v` deletes the PostgreSQL volume and all data.
