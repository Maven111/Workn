---
trigger: model_decision
description: Use when implementing or modifying authentication, sessions, user roles, authorization, protected routes, or access to private member and admin data in Workn.
---

# Workn Database Schema

## 1. Purpose

This document defines the intended database structure for Workn, a coworking membership and workspace management platform in Lagos, Nigeria.

**Stack:** PostgreSQL, Prisma ORM, Supabase Auth.

PostgreSQL is the source of truth for memberships, payments, bookings, benefits, and audit records. Supabase Auth manages identity, which must map securely to an internal Workn user.

This document guides implementation of `prisma/schema.prisma`. It is a specification, not an existing executable schema. Inspect the repository and current Prisma version before implementation.

## 2. Schema Conventions

- Use UUID primary keys unless the project already uses another convention.
- Use `createdAt` and `updatedAt` timestamps where appropriate.
- Define explicit foreign keys, relationships, indexes, and unique constraints.
- Use enums for controlled statuses.
- Store money using integer minor units or a suitable precise decimal type, never floating-point arithmetic.
- Store timestamps consistently and apply the Lagos business timezone to operating hours and day-pass expiry.
- Preserve historical records when users, plans, or resources are deactivated.
- Enforce permissions and business rules server-side.
- Do not invent unapproved prices, benefits, opening hours, cancellation policies, or refund rules.

## 3. Core Entities

### 3.1 User

Represents a member or administrator.

- `id`: UUID, primary key
- `authUserId`: String, unique Supabase Auth identity
- `fullName`: String, required
- `email`: String, required and consistently normalised
- `phone`: String, optional
- `role`: UserRole
- `accountStatus`: AccountStatus
- `createdAt`, `updatedAt`: DateTime

Relationships: memberships, payments, bookings, benefit ledger entries, and audit logs.

Members must not be able to grant themselves administrator privileges.

### 3.2 MembershipPlan

Defines configurable membership products.

- `id`: UUID, primary key
- `name`: String, required
- `description`: String, optional
- `price`: Precise monetary value
- `currency`: String, initially NGN
- `billingPeriod`: BillingPeriod
- `coworkingDayAllowance`: Int, optional
- `meetingRoomHourAllowance`: Decimal, optional if fractional hours are supported
- `restrictions`: Json, optional
- `isActive`: Boolean
- `createdAt`, `updatedAt`: DateTime

Relationships: memberships.

Only authorised administrators can manage plans. Preserve the purchase price and applicable terms for historical memberships when plan details change. Final plan names, prices, and allowances require approval.

### 3.3 Membership

Records a member's membership purchase and access period.

- `id`: UUID, primary key
- `memberId`: Foreign key to User
- `planId`: Foreign key to MembershipPlan
- `startAt`, `expiresAt`: DateTime
- `status`: MembershipStatus
- `purchasePrice`: Precise monetary value
- `currency`: String
- `createdAt`, `updatedAt`: DateTime

Relationships: member, plan, payments, and benefit ledger entries.

Monthly subscriptions last one calendar month from activation. Activate paid memberships only after server-side payment verification. Expired memberships cannot use subscription-only benefits. Preserve previous memberships during renewal.

Confirm whether multiple active memberships are allowed before enforcing a related constraint.

### 3.4 Payment

Records payments for memberships and bookings.

- `id`: UUID, primary key
- `memberId`: Foreign key to User
- `membershipId`: Optional membership reference
- `bookingId`: Optional booking reference
- `amount`: Precise monetary value
- `currency`: String
- `paymentReference`: Unique provider reference where applicable
- `provider`: String
- `status`: PaymentStatus
- `verifiedAt`, `refundedAt`: Optional DateTime
- `createdAt`, `updatedAt`: DateTime

Support pending, successful, failed, and refunded states.

Verify payments server-side. A browser redirect is not proof of payment. Prevent duplicate processing of callbacks and retries. Ensure payments belong to the correct member and transaction. Record refund eligibility and outcome before marking a payment refunded.

Define a safe relationship between payments, memberships, and bookings during implementation.

### 3.5 WorkspaceResource

Represents a bookable desk, workspace, or meeting room.

- `id`: UUID, primary key
- `name`: String
- `type`: ResourceType
- `capacity`: Int, positive
- `operatingAvailability`: Json, optional
- `rate`: Optional precise monetary value
- `currency`: Optional String
- `isActive`: Boolean
- `createdAt`, `updatedAt`: DateTime

Relationships: bookings.

Only authorised administrators can manage resources. Inactive resources cannot receive new bookings. Preserve historical bookings when resources are deactivated. Configure actual inventory, rates, and operating hours rather than inventing them.

### 3.6 Booking

Records a member's resource reservation.

- `id`: UUID, primary key
- `memberId`: Foreign key to User
- `resourceId`: Foreign key to WorkspaceResource
- `startAt`, `endAt`: DateTime
- `status`: BookingStatus
- `totalCharge`: Precise monetary value
- `currency`: String where charges apply
- `createdAt`, `updatedAt`: DateTime

Relationships: member, resource, payments, and benefit ledger entries.

Requirements:
- `startAt` must be earlier than `endAt`.
- Check membership, eligibility, operating hours, resource availability, benefits, and charges before confirmation.
- Prevent overlapping active bookings, including simultaneous requests.
- Use database constraints, transactions, locking, or another tested concurrency-safe approach. Frontend checks alone are insufficient.
- Failed bookings must not consume benefits.
- Preserve cancelled bookings and relevant cancellation details.
- Follow the approved cancellation policy; do not invent missing terms.

### 3.7 BenefitLedger

Tracks benefit credits, deductions, and adjustments.

- `id`: UUID, primary key
- `memberId`: Foreign key to User
- `membershipId`: Foreign key to Membership
- `bookingId`: Optional foreign key to Booking
- `benefitType`: BenefitType
- `amount`: Decimal quantity using a documented ledger convention
- `reason`: String
- `actorId`: Optional responsible User ID
- `createdAt`: DateTime

Record credits, deductions, and adjustments. Prevent duplicate deductions during retries. Failed bookings must not consume benefits. Balances must be reconcilable against ledger entries and plan allowances.

Benefits reset according to the subscription period and do not roll over by default. Define the exact ledger and reset implementation before coding.

### 3.8 AuditLog

Records important administrative and operational actions.

- `id`: UUID, primary key
- `actorId`: Optional User ID
- `action`: String
- `affectedRecordType`: String
- `affectedRecordId`: Optional UUID
- `outcome`: String
- `metadata`: Optional Json
- `createdAt`: DateTime

Record important changes, corrections, actors, and outcomes. Prevent ordinary users from modifying audit records. Never log passwords, access tokens, API keys, or unnecessary sensitive data.

## 4. Proposed Enums

These are starting proposals and must be checked against actual workflows before implementation.

- `UserRole`: `MEMBER`, `ADMIN`
- `AccountStatus`: `ACTIVE`, `INACTIVE`
- `MembershipStatus`: `PENDING`, `ACTIVE`, `EXPIRED`, `CANCELLED`
- `PaymentStatus`: `PENDING`, `SUCCESSFUL`, `FAILED`, `REFUNDED`
- `BookingStatus`: `PENDING`, `CONFIRMED`, `CANCELLED`
- `ResourceType`: `DESK`, `MEETING_ROOM`, `OTHER`
- `BillingPeriod`: `MONTHLY`, `DAY_PASS`, `OTHER`
- `BenefitType`: `COWORKING_DAYS`, `MEETING_ROOM_HOURS`, `OTHER`

Define valid status transitions and add states only when required by approved workflows.

## 5. Relationships

- A User can have many Memberships, Payments, Bookings, BenefitLedger entries, and AuditLogs.
- A MembershipPlan can have many Memberships.
- A Membership can have many BenefitLedger entries and related payments.
- A WorkspaceResource can have many Bookings.
- A Booking can have related payments and BenefitLedger entries.

Define explicit Prisma relations and foreign keys. Avoid cascading deletion of financial or operational history. Choose appropriate deletion or archival behaviour for each relationship.

## 6. Constraints and Indexes

Implement appropriate constraints and indexes for:

- Unique `authUserId` and consistently normalised email.
- Unique payment references where applicable.
- Valid foreign keys and record ownership.
- Valid booking time intervals.
- Non-negative prices and charges where applicable.
- Positive resource capacity.
- Membership queries by member and status.
- Payment queries by member, reference, and status.
- Booking queries by resource, status, and time range.
- Benefit queries by member and membership.
- Audit queries by actor and creation time.

A simple unique constraint cannot prevent arbitrary overlapping booking intervals. Use a PostgreSQL exclusion constraint, transactional locking, or another tested solution.

## 7. Security and Data Integrity

- Derive identity from the authenticated server-side session.
- Enforce role and ownership checks on every protected operation.
- Never trust client-supplied roles, prices, payment statuses, or benefit balances.
- Verify payments before activating memberships or confirming paid transactions.
- Use transactions for related updates that must succeed or fail together.
- Make payment processing and benefit deductions idempotent.
- Preserve historical financial and operational records.
- Keep secrets and privileged credentials server-side.
- Ensure failed operations cannot leave records falsely marked as successful.

## 8. Prisma Implementation

Before creating or changing the schema:

1. Inspect the repository, existing schema, migrations, and Prisma version.
2. Define models, enums, relations, indexes, and constraints.
3. Decide the payment relationship design.
4. Confirm membership renewal and multiple-active-membership behaviour.
5. Design concurrency protection for booking overlaps.
6. Define benefit calculations and reset handling.
7. Map Supabase Auth identities to internal Workn users.
8. Create and review migrations.
9. Test payment retries, membership activation, booking conflicts, benefit deductions, and permissions.

Do not casually modify applied migrations or reset a database containing data that must be preserved.


## 9. Definition of Done

The schema is ready when required entities and relationships are represented, constraints and permissions are defined, financial and booking workflows are protected against inconsistency, historical records are preserved, migrations and critical tests pass, and unresolved decisions are documented.