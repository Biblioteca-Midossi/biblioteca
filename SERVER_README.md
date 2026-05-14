# Biblioteca API - Hono/Bun Port

This is the complete port of the FastAPI backend to Hono with Bun runtime.

## Features

✅ **All routes ported:**
- `/api/auth` - Authentication (register, login, logout, token refresh, auth check)
- `/api/books` - Book management (list, get, create, update, delete)
- `/api/users` - User management (profile get/update)
- `/api/assets` - Static assets (thumbnails, profile pictures)

✅ **Database:**
- PostgreSQL using Bun's native SQL driver
- Redis for session/token management using `redis` package

✅ **Authentication:**
- Cookie-based authentication with access/refresh tokens
- Role-based authorization
- Device-specific token management

✅ **File uploads:**
- Book thumbnail uploads with sharp for PNG conversion
- Profile picture uploads

## Setup

1. **Install dependencies:**
```bash
bun install
```

2. **Configure environment variables:**
Create a `.env` file (already created) with:
```env
# Database
DBNAME=postgres
USER=biblioteca
PASSWORD=bibliopassword24
HOST=localhost
PORT=5432

# Redis
REDIS_PASSWORD=bibliopass24
REDIS_PORT=6379

# Security
COOKIE_KEY=your-secret-key

# Features
NO_LOGIN_MODE=false

# Server
PORT=8001
```

3. **Ensure PostgreSQL and Redis are running:**
```bash
# Using Docker Compose (if available in Backend folder)
cd ../Backend
docker-compose up -d
```

## Running the Server

```bash
# Development mode with hot reload
bun run dev:server

# Production mode
bun run src/server/hono.ts
```

The server will start on `http://localhost:8001`

## API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/logout` - Logout
- `GET /api/auth/token/refresh` - Refresh access token
- `GET /api/auth/check` - Check authentication status

### Books (`/api/books`)
- `GET /api/books?page=1&limit=12&search=query` - List books with pagination
- `GET /api/books/:id` - Get book details
- `POST /api/books` - Add new book (requires auth)
- `PUT /api/books/:id` - Update book (requires auth)
- `DELETE /api/books/:id` - Delete book (requires auth)

### Users (`/api/users`)
- `GET /api/users/me` - Get current user profile (requires auth)
- `PUT /api/users/me` - Update current user profile (requires auth)

### Assets (`/api/assets`)
- `GET /api/assets/thumbnails/:bookId` - Get book thumbnail
- `GET /api/assets/profile_pictures/:userId` - Get user profile picture

## Differences from FastAPI version

1. **Runtime:** Bun instead of Python
2. **Framework:** Hono instead of FastAPI
3. **SQL Driver:** Bun's native SQL instead of psycopg2
4. **Redis Client:** Native redis package instead of redis.asyncio
5. **Performance:** Significantly faster startup and request handling

## Project Structure

```
src/server/
├── hono.ts                 # Main server file
├── routes/
│   ├── auth.ts            # Authentication routes
│   ├── books.ts           # Book management routes
│   ├── users.ts           # User management routes
│   └── assets.ts          # Static asset routes
├── services/
│   ├── user-service.ts    # User database operations
│   └── db-operations.ts   # Book database operations
└── utils/
    ├── env.ts             # Environment configuration
    ├── db.ts              # Database connections
    ├── auth-helper.ts     # Password hashing & verification
    └── oauth2.ts          # Token management & auth middleware
```

## Testing

You can test the API using:
- Swagger UI: `http://localhost:8001/api/doc` (if enabled)
- curl, Postman, or any HTTP client
- Your frontend application

## Migration Notes

All functionality from the FastAPI backend has been ported:
- ✅ User registration and authentication
- ✅ Book CRUD operations
- ✅ File uploads (thumbnails, profile pictures)
- ✅ Search and pagination
- ✅ Role-based access control
- ✅ Session management with Redis
- ✅ CORS configuration
- ✅ Error handling

The API is fully compatible with your existing frontend!

