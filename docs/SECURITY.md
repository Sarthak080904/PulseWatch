# Security notes

- Passwords are stored using Devise's password hashing.
- JWTs expire after 24 hours; configure a strong `DEVISE_JWT_SECRET_KEY`.
- Monitor URLs are checked against private and reserved IP ranges before saving.
- The monitor runner must be deployed in a network-restricted environment. DNS rebinding and redirect-based SSRF require additional controls for production; the MVP should not be exposed as an unrestricted public URL fetcher.
- Do not store API credentials in monitor URLs. A production extension should encrypt monitor headers and secrets at rest and redact them from logs.
- Configure HTTPS, secure secrets, rate limiting, request size limits, and database backups before public launch.
