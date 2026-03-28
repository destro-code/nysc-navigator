# ADR 0001: Adopt Node.js + NestJS + PostgreSQL + Redis

- **Status:** Accepted
- **Date:** 2026-03-28

## Context

NYSC Navigator needs a backend stack that supports rapid product delivery, typed contracts, and straightforward operations for a small team.

## Decision

Adopt:

- Node.js 22 LTS + TypeScript
- NestJS for backend framework
- PostgreSQL 16 for primary relational data
- Redis 7 for cache, session-side state, and event fan-out primitives

## Consequences

### Positive

- Strong TypeScript alignment with existing frontend.
- Modular architecture in NestJS supports domain-based scaling.
- PostgreSQL provides reliable transactional consistency.
- Redis enables low-latency reads and async workflows.

### Negative

- Requires disciplined schema and migration practices.
- Redis introduces an additional operational dependency.

### Follow-up

- Revisit event backbone (Redis Streams vs Kafka) at scale milestone.
