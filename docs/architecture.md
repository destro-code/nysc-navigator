# Backend Architecture Baseline

## 1) Locked Backend Stack

The backend stack is now **locked** for the NYSC Navigator platform:

- **Runtime & language:** Node.js 22 LTS + TypeScript
- **Framework:** NestJS (modular monolith, service-oriented modules)
- **API style:** REST with OpenAPI 3.1 as the source contract
- **Primary database:** PostgreSQL 16
- **Cache / queue primitives:** Redis 7
- **Auth/session strategy:** JWT access tokens + refresh token rotation
- **Async/event pattern:** domain events published via Redis Streams (phase 1), with Kafka-compatible abstraction reserved for scale-out
- **Object storage (planned):** S3-compatible bucket
- **Observability:** OpenTelemetry traces + structured JSON logs

This stack is intentionally conservative to optimize team familiarity, hiring availability, and operational simplicity.

## 2) Service Boundaries (Module Boundaries in NestJS)

The backend is split into clear bounded contexts:

1. **auth**
   - Signup/login/refresh/logout
   - Password reset and email verification flow
   - Token issue/revocation

2. **users**
   - User profile and preferences
   - Role/permission attachment (RBAC claims)
   - Account lifecycle metadata

3. **forum**
   - Thread/post/comment CRUD
   - Moderation flags/report intake
   - Content visibility state transitions

4. **notifications**
   - In-app notification records
   - Delivery fan-out (email/push hooks in later phase)
   - Read/unread acknowledgement

5. **admin**
   - Moderation workflow orchestration
   - Metrics and policy operations
   - Elevated-only endpoints

6. **support**
   - Support ticket creation and updates
   - User-agent conversation timeline
   - SLA state transitions

### Ownership Rules

- Every module owns its own data schema and repository layer.
- Cross-module reads happen through explicit service interfaces, not direct table joins in foreign modules.
- All externally consumed payloads must be represented in OpenAPI and mirrored in `packages/types`.

## 3) API-First Rule

Before endpoint implementation:

1. Add/modify OpenAPI spec in `docs/api/openapi.yaml`.
2. Review and approve contract changes.
3. Update shared models in `packages/types`.
4. Implement backend handler and frontend client usage.

No endpoint should ship without contract coverage in OpenAPI.
