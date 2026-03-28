# ADR 0004: Shared Types Package for Request/Response Models

- **Status:** Accepted
- **Date:** 2026-03-28

## Context

NYSC Navigator frontend and backend both depend on the same request/response model shapes.

## Decision

Create `packages/types` as a shared TypeScript package (`@nysc-navigator/types`) containing transport models mapped from OpenAPI schemas.

## Consequences

### Positive

- Reduces duplicate type definitions.
- Improves type safety across client/server boundaries.
- Establishes a path for typed SDK generation.

### Negative

- Requires versioning discipline if package is published externally.
- Can create false confidence if OpenAPI and package diverge.

### Follow-up

- Introduce OpenAPI-to-types generation to avoid manual drift.
