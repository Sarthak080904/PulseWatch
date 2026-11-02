# API overview

All application endpoints are JSON. Authenticated endpoints require `Authorization: Bearer <JWT>`.

## Authentication
- `POST /auth/register` — `{ "user": { "email": "...", "password": "...", "password_confirmation": "..." } }`
- `POST /auth/login` — `{ "user": { "email": "...", "password": "..." } }`
- `DELETE /auth/logout`
- `GET /api/v1/me`

## Monitors
- `GET /api/v1/monitors`
- `POST /api/v1/monitors` — `{ "monitor": { "name": "Public API", "url": "https://example.com/health", "http_method": "get", "interval_seconds": 300, "expected_status": 200 } }`
- `GET /api/v1/monitors/:id`
- `PATCH /api/v1/monitors/:id`
- `DELETE /api/v1/monitors/:id`
- `POST /api/v1/monitors/:id/check_now`
- `GET /api/v1/monitors/:id/checks`
- `GET /api/v1/overview`

Intervals supported: 60, 300, 600, 900, 1800, and 3600 seconds.
