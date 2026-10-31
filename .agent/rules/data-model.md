---
trigger: model_decision
description: Apply when creating, modifying, or reviewing Workn's data entities, relationships, business records, or data flows. Use this context when working on how users, memberships, payments, bookings, benefits, and resources relate to one another.
---

# Workn Data Model

## 1. Purpose and Technology

This document defines Workn's intended data entities, relationships, and data-integrity requirements. It is a specification for implementation, not an existing database schema.

- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** Supabase Auth
- **Backend:** Next.js server-side routes and/or server actions

PostgreSQL is the source of truth for memberships, payments, bookings, benefits, and operational records. Supabase Auth manages identity and sessions; each authenticated identity must map securely to an internal Workn user record. Use database constraints, transactions, and server-side validation together.

## 2. Core Entities

Workn has eight core entities: Users, Membership Plans, Memberships, Payments, Workspace Resources, Bookings, Benefit Ledger, and Audit Logs.

### 2.1 Users

**Purpose:** Internal records for members and administrators.

Fields:
- `id`: unique internal user ID
- `fullName`, `email`, `phone`
- `authUserId`: unique reference to Supabase Auth identity
- `role`: member or administrator
- `accountStatus`: active or inactive
- `createdAt`, `updatedAt`

Rules:
- Validate identity and role on the server.
- Members cannot grant themselves administrator privileges.
- Handle email normalisation and uniqueness consistently.
- Deactivating an account must not erase historical financial or booking records.

### 2.2 Membership Plans

**Purpose:** Centrally managed membership products, prices, benefits, and restrictions.

Fields:
- `id`, `name`
- `price`, `currency`
- `duration` or billing period
- `coworkingDayAllowance`
- `meetingRoomHourAllowance`
- `restrictions`
- `isActive`

Rules:
- Only authorised administrators can manage plans.
- Do not hard-code prices or allowances throughout the application.
- Deactivating a plan must not delete historical memberships.
- Plan changes must not rewrite historical purchases. Preserve the price and applicable benefits at purchase where needed.
- The PRD does not specify final plan names, prices, or allowances. Do not invent them.

### 2.3 Memberships

**Purpose:** Records a member's purchase and use of a plan.

Fields:
- `id`, `memberId`, `planId`
- `startAt`, `expiresAt`
- `status`
- `paymentId`, where applicable
- `createdAt`, `updatedAt`
- Renewal history, represented through linked membership records or another documented approach

Rules:
- Activate paid memberships only after server-side payment verification.
- Monthly subscriptions last one calendar month from activation.
- Record start and expiry timestamps.
- Expired memberships cannot use subscription-only benefits until renewed.
- Preserve previous membership and payment history.
- Define valid statuses and transitions consistently. Do not assume users can have only one historical membership.

### 2.4 Payments

**Purpose:** Records payments for memberships and paid bookings.

Fields:
- `id`, `memberId`
- `amount`, `currency`
- `paymentReference`, `provider`, `status`
- `membershipId` and/or `bookingId`, as applicable
- `createdAt`, `verifiedAt`, `refundedAt`

Rules:
- Use integer minor units or a suitable precise decimal type. Never use floating-point arithmetic for money.
- Payment references must be unique where required.
- Payment status must reflect the verified transaction state.
- Verify payments on the server. A browser redirect or client-submitted success flag is not proof of payment.
- Handle duplicate callbacks and retries without duplicate financial effects.
- Mark a payment refunded only after the refund outcome is recorded.
- Preserve payment history after cancellations.
- Define and enforce which transaction a payment belongs to so it cannot be applied to the wrong membership or booking.

The PRD requires pending, successful, failed, and refunded states. Additional states may be added if needed for reliable processing.

### 2.5 Workspace Resources

**Purpose:** Bookable resources such as shared desks and meeting rooms.

Fields:
- `id`, `name`, `type`
- `capacity`
- `operatingAvailability`
- `rate`
- `isActive`

Rules:
- Only authorised administrators can manage resources.
- Inactive resources cannot accept new bookings.
- Deactivation must preserve historical bookings.
- Availability checks must account for operating hours and existing bookings.
- Enforce relevant capacity and resource-specific restrictions.
- The PRD does not define exact inventory, rates, or opening hours; configure these rather than inventing them.

### 2.6 Bookings

**Purpose:** Records a member's reservation of a workspace or meeting room.

Fields:
- `id`, `memberId`, `resourceId`
- `startAt`, `endAt`
- `status`
- `totalCharge`, `benefitDeduction`
- `paymentId`, where applicable
- `cancellationDetails`, where applicable
- `createdAt`, `updatedAt`

Rules:
- `startAt` must be earlier than `endAt`.
- Check resource availability, membership status, eligibility, benefits, and charges before confirmation.
- Prevent overlapping active bookings for the same resource, including concurrent requests. A frontend availability check alone is insufficient.
- Confirm a booking only after the database operation succeeds.
- Coordinate booking creation, payment association, and benefit deductions safely.
- Failed bookings must not consume benefits.
- Apply the approved cancellation policy and preserve cancelled booking history.
- The PRD does not define cancellation windows, fees, or every booking status. Do not invent them.

Use database transactions when multiple record changes must succeed or fail together. Consider appropriate constraints, locking, or equivalent concurrency safeguards.

### 2.7 Benefit Ledger

**Purpose:** Records benefits granted, used, and adjusted.

Fields:
- `id`, `memberId`, `membershipId`
- `benefitType`
- `amount` (credited, deducted, or adjusted quantity)
- `reason`
- `bookingId`, where applicable
- `actorId`, where applicable
- `createdAt`

Rules:
- Record credits, deductions, and adjustments as ledger entries.
- Link usage to the relevant booking where applicable.
- Record reasons and actors for manual adjustments.
- Do not deduct benefits for failed bookings or apply deductions twice on retries.
- Calculate remaining benefits from the applicable allowance and valid ledger entries, or maintain a derived balance that can be reconciled to the ledger.
- Benefits reset according to the subscription period and do not roll over by default.
- Expired memberships cannot use subscription-only benefits.
- Define the representation of credits, deductions, adjustments, and resets consistently.

### 2.8 Audit Logs

**Purpose:** Records important administrative actions and changes.

Fields:
- `id`, `actorId`
- `action`
- `affectedRecordType`, `affectedRecordId`
- `createdAt`, `outcome`
- `metadata`

Rules:
- Record important administrative changes and corrections with actor, action, affected record, timestamp, and outcome.
- Perform audit logging on the server.
- Ordinary users must not be able to edit or delete audit records through normal application functionality.
- Do not log passwords, tokens, API keys, or unnecessary sensitive information.
- Log failed administrative actions where appropriate.

## 3. Entity Relationships

- A User can have many Memberships over time.
- A Membership Plan can be linked to many Memberships.
- A User can have many Payments, Bookings, and Benefit Ledger entries.
- A Membership can have many Benefit Ledger entries.
- A Workspace Resource can have many Bookings over time.
- A Booking can have related Benefit Ledger entries and a related Payment where applicable.
- A Payment is associated with the relevant Membership or Booking.
- A User can create many Audit Logs.
- An Audit Log can identify an affected record by type and ID without a dedicated foreign key for every entity type.

## 4. Data Integrity and Security

### Identity and access
- Every protected record must have a clear ownership or authorisation path.
- Members may access only their own private membership, payment, booking, and benefit records unless an explicitly authorised workflow allows otherwise.
- Enforce authorisation on the server for every protected read and write. Hiding UI elements is not sufficient.
- Never treat a user ID supplied by a browser or AI model as proof of identity.
- Validate inputs and return only the information required for the operation.

### Membership and payment consistency
- A paid membership must reference a verified payment before activation.
- A payment must not activate another user's membership.
- Calculate expiry consistently from activation and approved billing rules.
- Plan updates must not rewrite historical transactions.

### Booking and benefit consistency
- Bookings must reference valid members and resources and have valid time intervals.
- Prevent conflicting reservations and duplicate benefit deductions.
- Coordinate booking, payment, and benefit changes safely.
- Failed operations must not leave records that falsely indicate success.
- Benefit balances must be reconcilable against the ledger.

### Financial consistency
- Use precise monetary values and a consistent currency representation.
- Protect payment processing against duplicate callbacks and retries.
- Refund status must reflect the recorded refund outcome.
- Pending or failed payments must never be represented as successful.

## 5. Transactions, Statuses, Time, and Currency

Use Prisma transactions when related database changes must succeed or fail together, including membership activation, booking plus benefit deduction, and administrative corrections plus audit records.

Transactions alone do not solve every concurrency issue. Use appropriate constraints, locking, idempotency, or equivalent safeguards for overlapping bookings and duplicate payment processing. External payment-provider requests are not part of a database transaction; workflows must recover safely if a provider succeeds but the browser closes or a request times out.

Define valid status values and transitions before implementing workflows:
- **Memberships:** distinguish current access from expired or inactive access.
- **Payments:** support pending, successful, failed, and refunded.
- **Bookings:** distinguish confirmed and cancelled bookings, with additional states as required.

Validate state transitions on the server. Preserve relevant timestamps and never treat a status label alone as proof that an operation succeeded.

Store timestamps consistently and define the business timezone explicitly for Lagos operating hours and day-pass expiry. Do not rely on browser or server-default clocks for payment verification, expiry, or eligibility.

The PRD specifies Nigerian Naira. Use a consistent currency representation and precise monetary storage. Preserve the amount and currency of completed transactions even if plan prices later change.

## 6. Deletion and Historical Records

Deactivating a user, plan, or resource should generally prevent future use without erasing historical records. Preserve payments, bookings, benefit ledger entries, and audit logs for legitimate operational and reconciliation needs.

Define deletion behaviour before adding cascading deletes. Avoid deleting financial or operational history when a related user or plan is removed. Handle any necessary data removal through an explicitly authorised process.

## 7. Prisma Implementation Guidance

Before implementing:
1. Inspect the existing repository, Prisma configuration, schema, and migrations.
2. Define models, enums, relationships, uniqueness, indexes, and deletion behaviour.
3. Decide how Supabase Auth identities map to internal users.
4. Define payment-to-membership/booking relationships.
5. Design safe booking conflict prevention and idempotent payment processing.
6. Define benefit-ledger calculations and reset behaviour.
7. Create a migration, generate the Prisma client, and test critical workflows.