# Spec-Kit Guide for Meshflow

This project uses [GitHub's Spec-Kit](https://github.com/github/spec-kit) for Spec-Driven Development.

## Quick Start

### Available Commands (for AI Assistant)

When working with your AI assistant (Claude Code, Cursor, etc.), you can use these commands:

1. **`/speckit.constitution`** - Create or update project principles
   ```
   /speckit.constitution Update the constitution to include performance requirements for matching algorithm
   ```

2. **`/speckit.specify`** - Create a new feature specification
   ```
   /speckit.specify Build a feature that allows employees to request help on specific skills and get matched with mentors
   ```

3. **`/speckit.plan`** - Generate implementation plan from a spec
   ```
   /speckit.plan Generate implementation plan for the B2B matching algorithm using Reflex and Supabase
   ```

4. **`/speckit.tasks`** - Break down plan into actionable tasks
   ```
   /speckit.tasks Generate task breakdown for the matching algorithm implementation
   ```

5. **`/speckit.implement`** - Execute the implementation plan
   ```
   /speckit.implement Start implementing the matching algorithm feature
   ```

## Project Structure

```
studymesh/
├── memory/
│   └── constitution.md          # Project principles and guidelines
├── specs/
│   └── 001-b2b-matching-algorithm/
│       ├── spec.md              # Feature specification
│       ├── plan.md              # Implementation plan (generated)
│       └── tasks.md             # Task breakdown (generated)
└── templates/                   # Spec-kit templates (for reference)
```

## Current Specs

### ✅ 001-b2b-matching-algorithm
- **Status**: Specification complete
- **Location**: `specs/001-b2b-matching-algorithm/spec.md`
- **Next Step**: Generate implementation plan

## Workflow

1. **Create Constitution** (if not exists)
   - Defines project principles, tech stack, quality standards
   - Located in `memory/constitution.md`

2. **Write Specification**
   - Focus on **what** and **why**, not **how**
   - User stories with priorities (P1, P2, P3)
   - Acceptance criteria
   - Success metrics

3. **Generate Plan**
   - AI creates implementation plan from spec
   - Includes tech stack research
   - Defines architecture and approach

4. **Break Down Tasks**
   - AI creates actionable task list
   - Ordered by dependencies
   - Includes file paths and test requirements

5. **Implement**
   - AI executes tasks in order
   - Follows TDD approach
   - Validates against spec

## Constitution Principles

Key principles from our constitution:

1. **B2B Enablement First** - All features prioritize internal enablement
2. **Reflex-First Architecture** - Python full-stack, no separate frontend
3. **Test-Driven Development** - TDD mandatory, red-green-refactor
4. **Domain Vocabulary** - Pods, Employees, Working Circles (not classes/students)
5. **Privacy & Multi-Tenancy** - Org-scoped data, no cross-org leakage
6. **Matching Transparency** - Scores must be explainable
7. **Performance** - Matching completes in <5s for 100 employees

## Next Steps

1. Review the matching algorithm spec: `specs/001-b2b-matching-algorithm/spec.md`
2. Generate implementation plan: `/speckit.plan`
3. Generate task breakdown: `/speckit.tasks`
4. Begin implementation: `/speckit.implement`

## Resources

- [Spec-Kit GitHub](https://github.com/github/spec-kit)
- [Spec-Kit Documentation](https://github.github.io/spec-kit/)
- [Spec-Driven Development Guide](https://github.com/github/spec-kit/blob/main/spec-driven.md)

