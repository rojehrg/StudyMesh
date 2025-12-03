# Meshflow Constitution

## Core Principles

### I. B2B Enablement First
Every feature must prioritize internal enablement, knowledge sharing, and skill development within organizations. The platform exists to connect employees, reduce onboarding time, and surface training needs. Academic/student-focused patterns are explicitly avoided.

### II. Reflex-First Architecture
Meshflow is built entirely on Reflex (Python full-stack framework). All UI, backend logic, and state management must use Reflex patterns. Supabase PostgreSQL is the single source of truth for data persistence. No separate frontend frameworks.

### III. Test-Driven Development (NON-NEGOTIABLE)
TDD mandatory: Tests written → User approved → Tests fail → Then implement. Red-Green-Refactor cycle strictly enforced. All matching algorithms, data models, and critical paths must have unit and integration tests.

### IV. Domain Vocabulary Consistency
Use B2B terminology consistently: "Pods" (not classes), "Employees" (not students), "Working Circles" (not study groups), "Enablement" (not study), "Mentorship" (not tutoring). All UI copy, error messages, and documentation must adhere to this vocabulary.

### V. Privacy & Multi-Tenancy
Organizations are isolated tenants. All queries must be scoped by `org_id`. Employee data is only visible within their organization. Pod membership and working circles are org-scoped. No cross-org data leakage.

### VI. Matching Algorithm Transparency
Compatibility scores must be explainable. Score breakdowns (skill gap, department diversity, availability, etc.) must be visible to users. Algorithm weights are configurable and documented. Users can see why they were matched.

### VII. Performance & Scalability
Matching calculations must complete within 5 seconds for pods up to 100 employees. Use batch processing and caching where appropriate. Database queries must be optimized with proper indexes. Graph visualizations must render smoothly for up to 50 nodes.

## Additional Constraints

### Technology Stack
- **Framework**: Reflex (Python)
- **Database**: Supabase PostgreSQL (via SQLAlchemy/SQLModel)
- **Authentication**: Custom JWT-based auth (Supabase Auth optional)
- **Graph Visualization**: reflex-enterprise react-flow
- **Styling**: Tailwind CSS via Reflex
- **Deployment**: Reflex Cloud or self-hosted

### Data Model Requirements
- All models must use SQLModel for type safety
- JSON fields for flexible data (availability, score breakdowns)
- Foreign keys properly indexed
- Timestamps on all entities (created_at, updated_at)
- Soft deletes preferred over hard deletes

### UI/UX Standards
- Consistent indigo color scheme (#4F46E5)
- Responsive design (mobile-first)
- Loading states for all async operations
- Clear error messages
- Empty states with helpful guidance
- Accessibility: keyboard navigation, screen reader support

## Development Workflow

### Code Review Requirements
- All PRs must verify constitution compliance
- Matching algorithm changes require algorithm review
- Database migrations must be reviewed for performance impact
- UI changes must be tested across screen sizes

### Testing Gates
- Unit tests for all matching logic
- Integration tests for database operations
- E2E tests for critical user flows (pod creation, matching, circle formation)
- Performance tests for matching algorithm with 100+ employees

### Quality Standards
- Code must pass linting (ruff, black)
- Type hints required for all functions
- Docstrings for public APIs
- No hardcoded credentials or secrets
- Environment variables for all configuration

## Governance

**Constitution supersedes all other practices.** Amendments require:
- Documentation of rationale
- Approval from project maintainer
- Migration plan if breaking changes
- Update to this constitution file

All development must align with these principles. Complexity must be justified. When in doubt, choose simplicity and clarity.

**Version**: 1.0.0 | **Ratified**: 2025-01-XX | **Last Amended**: 2025-01-XX

