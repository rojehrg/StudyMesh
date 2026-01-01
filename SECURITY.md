# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Attunly, please report it responsibly:

1. **Do NOT** open a public GitHub issue for security vulnerabilities
2. Email security concerns to the repository owner
3. Include detailed steps to reproduce the vulnerability
4. Allow reasonable time for a fix before public disclosure

## Security Measures

### Authentication & Authorization
- All API endpoints require authentication via Supabase Auth
- Admin endpoints require additional ADMIN_SECRET token
- Organization-level authorization prevents cross-tenant data access
- Session tokens are HTTP-only cookies with secure flags

### Data Protection
- No sensitive data (tokens, passwords) in console logs
- Environment variables for all secrets (never committed)
- Supabase Row-Level Security (RLS) for database access
- Input validation on all API endpoints

### Infrastructure
- HTTPS enforced in production
- Supabase handles database encryption at rest
- Regular dependency updates via Dependabot
- CodeQL scanning for vulnerability detection

## Environment Variables Required

```
# Public (safe to expose to client)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=

# Private (server-side only)
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
ADMIN_SECRET=           # Required for migration endpoints
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_WEBHOOK_URL=
```

## Security Checklist for Contributors

- [ ] No hardcoded secrets or API keys
- [ ] No sensitive data in console.log statements
- [ ] All new endpoints have authentication checks
- [ ] User input is validated and sanitized
- [ ] No use of dangerouslySetInnerHTML without sanitization
- [ ] Database queries use parameterized queries (Supabase handles this)

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |
