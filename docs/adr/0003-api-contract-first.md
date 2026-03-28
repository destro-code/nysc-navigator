# ADR 0003: API Contract First with OpenAPI

- **Status:** Accepted
- **Date:** 2026-03-28

## Context

Frontend/backend drift occurs when endpoint behavior is implemented before contracts are reviewed.

## Decision

Use OpenAPI 3.1 in `docs/api/openapi.yaml` as the canonical contract. Any API change must update this document before implementation.

## Consequences

### Positive

- Enables early review of API shape and naming.
- Makes backend and frontend integration predictable.
- Supports future SDK/code generation.

### Negative

- Adds up-front design work before coding.
- Requires active maintenance discipline.

### Follow-up

- Add CI validation to fail builds when OpenAPI is invalid.
