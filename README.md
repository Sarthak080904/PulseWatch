# PulseWatch

API monitoring and incident management MVP built with Ruby on Rails, React, PostgreSQL, Redis, and Sidekiq.

## Included
- Rails JSON API with Devise token authentication
- Monitor CRUD and configurable HTTP checks
- Sidekiq scheduled health checks
- Check history, uptime summary, and incident lifecycle
- Email alert hooks (SMTP configuration required)
- React + Vite + Tailwind dashboard
- Docker Compose for PostgreSQL and Redis
- RSpec and Vitest starter tests

## Requirements
- Ruby 3.3+
- Bundler
- Node.js 20+
- PostgreSQL 16+ (or Docker)
- Redis 7+ (or Docker)

## 1. Start infrastructure
From the project root:
```bash
docker compose up -d postgres redis
```
PostgreSQL is published on host port `5433` to avoid conflicts with a local PostgreSQL installation.

## 2. Backend setup

In Windows Command Prompt:
```bash
cd backend
bundle install
if not exist .env copy .env.example .env
bundle exec rails db:create db:migrate
bundle exec rails server -p 3000
```
In a second terminal:
```bash
cd backend
bundle exec sidekiq
```

## 3. Frontend setup
In Windows Command Prompt:
```bash
cd frontend
npm install
if not exist .env copy .env.example .env
npm run dev
```
Open http://localhost:5173

## Demo account
Register through the UI. There is no hard-coded demo password.

## Notes
- API checks are executed by Sidekiq workers. A monitor is enqueued immediately after creation and recurring checks are scheduled using `perform_in`.
- Configure SMTP environment variables to send real email notifications. Without SMTP, incidents are still recorded and visible in the dashboard.
- For a public deployment, use HTTPS, a secret manager, a dedicated monitoring worker, outbound network restrictions, and a hardened SSRF policy.
- This MVP intentionally blocks localhost, private, loopback, link-local, and reserved IP destinations. Do not expose an unrestricted URL-fetching service to the public internet without further security review.
