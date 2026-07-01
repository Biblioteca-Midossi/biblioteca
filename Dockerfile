## Build stage
FROM oven/bun:1 AS build
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY index.html tsconfig.json vite.config.ts ./
COPY src ./src
COPY public ./public

RUN bun run build

## Runtime stage
FROM ghcr.io/astral-sh/uv:python3.12-trixie-slim
WORKDIR /app

# Disable dev dependencies
ENV UV_NO_DEV=1

# Install dependencies first (layer caching)
COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-install-project

# Copy the project source
COPY api ./api
COPY App.py ./

# Copy frontend build
COPY --from=build /app/dist ./dist

# Sync the project
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked

CMD ["uv", "run", "uvicorn", "App:biblioteca", "--host", "0.0.0.0", "--port", "4000"]
