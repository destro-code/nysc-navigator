# ADR 0002: Define Domain Service Boundaries

- **Status:** Accepted
- **Date:** 2026-03-28

## Context

Without explicit boundaries, backend modules drift into tightly coupled logic and shared-table anti-patterns.

## Decision

Define the following bounded services:

1. auth
2. users
3. forum
4. notifications
5. admin
6. support

Each service owns its data access and business logic. Cross-service interactions go through explicit APIs/service interfaces.

## Consequences

### Positive

- Clear ownership and accountability.
- Easier testing and incremental extraction in future.
- Better security control over privileged operations.

### Negative

- Potential duplication of view models across service seams.
- Additional interface design overhead.

### Follow-up

- Introduce architecture fitness checks to prevent boundary violations.
