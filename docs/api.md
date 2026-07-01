# Simple API reference

All backend endpoints are served under `/api`.

Example local base URL:

```text
http://localhost:4000/api
```

Interactive OpenAPI docs:

```text
http://localhost:4000/api/docs
```

## Auth

### Register

```http
POST /api/auth/register
```

JSON body:

```json
{
  "nome": "Mario",
  "cognome": "Rossi",
  "username": "mrossi",
  "email": "mario@example.com",
  "password": "password",
  "istituto": "ITT"
}
```

### Login

```http
POST /api/auth/login
```

JSON body:

```json
{
  "login": "mrossi",
  "password": "password"
}
```

`login` accepts either username or email. On success, the API sets HTTP-only JWT cookies.

### Refresh session

```http
POST /api/auth/refresh
```

Requires a valid refresh cookie.

### Logout

```http
POST /api/auth/logout
```

Clears authentication cookies.

## Books

### List books

```http
GET /api/books?page=1&limit=12&search=term
```

Query parameters:

- `page` - page number, default `1`
- `limit` - books per page, default `12`
- `search` - optional title/author/genre search

### Recent books

```http
GET /api/books/recent?limit=5
```

### Book detail

```http
GET /api/books/{book_id}
```

### Create book

```http
POST /api/books
```

Requires role `3+`.

Uses `multipart/form-data`:

- `data` - JSON string matching the create book payload
- `thumbnail` - optional uploaded image

Example `data` value:

```json
{
  "isbn": "9780000000000",
  "titolo": "Example Book",
  "genere": ["Narrativa"],
  "quantita": 3,
  "casaEditrice": "Example Publisher",
  "descrizione": "Short description",
  "istituto": "ITT",
  "scaffale": "A01",
  "nomeAutore": ["Italo"],
  "cognomeAutore": ["Calvino"]
}
```

### Update book

```http
PUT /api/books/{book_id}
```

Requires role `3+`.

Uses `multipart/form-data`:

- `updatedBook` - JSON string with fields to update
- `file` - optional replacement image

### Delete book

```http
DELETE /api/books/{book_id}
```

Requires role `3+`.

## Users

### Current profile

```http
GET /api/users/me
```

Requires login.

### Update current profile

```http
PUT /api/users/me
```

Requires login. Supports form fields and an optional image file.

### List users

```http
GET /api/users/get-users?offset=0&limit=10
```

Requires role `3+`.

### Recent users

```http
GET /api/users/recent?limit=5
```

Requires role `3+`.

### Update user

```http
PUT /api/users/update-user/{user_id}
```

Requires login and role authority over the target user.

JSON body:

```json
{
  "user_data": {
    "nome": "Mario",
    "cognome": "Rossi",
    "username": "mrossi",
    "email": "mario@example.com",
    "ruolo": 2
  }
}
```

## Health

```http
GET /api/health
```

Returns:

```json
{ "status": "ok" }
```
