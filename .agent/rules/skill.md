---
trigger: model_decision
description: Apply when executing a workflow or procedure explicitly documented in this file. Follow its steps when performing the relevant task, and use it as the prescribed process rather than inventing a new workflow.
---

# Workn Development Skill

## Purpose

Use this skill when implementing, modifying, debugging, or testing Workn features.

## 1. Before Making Changes

1. Inspect the repository structure and relevant files.
2. Read `AGENTS.md` and any applicable project documentation.
3. Read `PRD.md` and relevant documents in `docs/` before changing product behaviour.
4. Inspect existing implementations, dependencies, Prisma schema, migrations, and tests.
5. Identify the affected features, data models, server actions or routes, UI components, and tests.
6. Check whether the requested behaviour is already implemented before creating a new solution.

Do not assume a file, component, function, dependency, or feature exists. Verify it first.

## 2. Understand the Requirement

Before coding, establish:

- What the user needs to accomplish.
- Which user role is involved: member or administrator.
- What data is required.
- Which business rules apply.
- What permissions are required.
- What happens when the operation succeeds or fails.
- Which tests should verify the result.

If a requirement conflicts with the PRD or existing approved documentation, flag the conflict rather than silently choosing a solution.

If a critical business decision is unspecified, do not invent one. Ask for clarification or document the unresolved decision before implementing dependent behaviour.

## 3. Implementation Workflow
Avoid unnecessary rewrites, duplicate components, unrelated refactoring, and new dependencies without a clear reason.

## 4. Workn Business Rules

Always preserve these rules:

### Memberships
- Monthly subscriptions last one calendar month from activation.
- Activate paid memberships only after server-side payment verification.
- Expired memberships cannot access subscription-only benefits until renewed.
- Benefits reset according to the subscription period and do not roll over by default.
- Keep historical membership records when plans or accounts are deactivated.

### Bookings
- Check resource availability, operating hours, membership status, eligibility, benefits, and applicable charges before confirming a booking.
- A booking's start time must be earlier than its end time.
- Prevent overlapping active bookings for the same resource, including simultaneous requests.
- A frontend availability check alone is not sufficient to prevent conflicts.
- Failed bookings must not consume benefits.
- Prevent duplicate bookings and duplicate benefit deductions during retries.
- Preserve cancelled bookings and their relevant history.

### Payments and refunds
- A browser redirect or client-submitted success message is not proof of payment.
- Verify payment status on the server using the configured payment integration or approved simulation.
- Handle duplicate callbacks and retries without duplicating financial effects.
- Record refund eligibility and the refund outcome before marking a payment as refunded.
- Preserve payment history after cancellations.
- Never claim a payment, refund, or subscription succeeded unless the result has been verified.

### Configuration
- Keep plan prices, benefits, resource availability, and applicable restrictions centrally configurable.
- Do not invent plan names, prices, allowances, opening hours, cancellation windows, or refund policies that have not been approved.

## 5. Security and Permissions

- Enforce authentication and authorisation on the server for every protected operation.
- Treat Supabase Auth as the identity provider and map authenticated identities to internal Workn users.
- Derive the acting user's identity from the authenticated server-side session.
- Never trust a user ID, role, price, payment status, benefit balance, or permission supplied by the client.
- Members may access only their own private records unless an explicitly authorised workflow permits otherwise.
- Only authorised administrators may perform administrative actions.
- Validate all inputs on the server.
- Keep secrets, API keys, and privileged database credentials out of client-side code.
- Return only the data required by the current operation.
- Do not expose sensitive information in logs or error messages.

## 6. Database Changes

Workn uses PostgreSQL and Prisma.

Before modifying data models:

1. Inspect the existing Prisma schema and migration history.
2. Identify relationships, constraints, indexes, and deletion behaviour.
3. Preserve historical payment, booking, membership, benefit, and audit records.
4. Use appropriate transactions for related database changes.
5. Consider database constraints, locking, and idempotency for concurrency-sensitive operations.
6. Create and test migrations using the project's existing workflow.

Do not modify applied migrations casually or reset a database containing data that must be preserved.

Use precise monetary storage, not floating-point arithmetic. Store timestamps consistently and apply the defined Lagos business timezone to operating hours and day-pass expiry.

## 7. UI and Design System

Follow Workn's established design system and existing component patterns.

Use existing design tokens and shared components where available. Keep layouts responsive, accessible, and consistent across pages.

Do not introduce arbitrary colours, typography, spacing systems, or duplicate UI patterns without a clear reason. where the design system fails or conflicting, act like a professional UI designer and take an informed professional decision.

## 8. Error Handling

- Validate data before processing it.
- Handle expected failures explicitly.
- Show users clear messages without exposing internal system details.
- Log useful diagnostic information without secrets or unnecessary personal data.
- Do not silently swallow errors.
- Do not return success when an operation partially fails.
- Ensure retries cannot duplicate payments, bookings, or benefit deductions.
- Handle timeouts and external service failures without assuming the operation failed or succeeded when its outcome is unknown.

## 9. Where there's inconsistency varying or clashing context in colour system ie the laid down context will create a poor UI, ensure to adjust accordingly.

## Final Response Format

After completing a task, report:

**Implemented:** What changed.

**Files changed:** The main files created or modified.

**Validation:** Tests and checks actually run, including failures.

**Outstanding:** Any unresolved decisions, limitations, or follow-up work.

Be concise, specific, and honest. Never claim completion beyond what has been verified.