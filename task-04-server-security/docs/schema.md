# Task 4 Database Schema Specification

- **System**: Workn Coworking Space Management Platform (Lagos, Nigeria)
- **Database Engine**: PostgreSQL 15+ (via Prisma ORM)
- **Scope**: Authoritative relational schema, session persistence, financial ledgers, and retrieval chunks
- **Author**: Builder Assessment Team
- **Document Status**: Step 1 Specification (Prior to migration execution)

---

## 1. Architectural Principles & Conventions

1. **PostgreSQL as Single Source of Truth**:
   PostgreSQL enforces authoritative business invariants (role permissions, membership status, credit ledger balances, non-overlapping booking schedules, and financial transaction histories). External services (Supabase Auth, Paystack) manage peripheral operations, but all persistent state is validated and owned by PostgreSQL.
2. **Precise Minor-Unit & Decimal Monetary Types**:
   All monetary fields are stored as `Decimal(12, 2)` (or integer minor units in Kobo). Floating-point arithmetic (`FLOAT`, `DOUBLE`) is strictly prohibited to eliminate rounding drift in financial reconciliation.
3. **UUID Primary Keys**:
   All entities utilize cryptographically generated UUIDv4 strings (`@id @default(uuid())`) to prevent sequential enumeration attacks and allow safe client-side ID generation where appropriate.
4. **Temporal Accountability**:
   Every stateful table includes `createdAt` and `updatedAt` timestamps in UTC, with business logic converting to West Africa Time (`WAT`, UTC+1) for Lagos operating hours.

---

## 2. Table-by-Table Technical Specification

The schema defines **eleven relational models**, exceeding the mandatory five-table requirement:

---

### 2.1 `User` (Platform Accounts & Roles)
Represents registered members and workspace administrators.

| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `String` (UUID) | No | `@id @default(uuid())` | Primary internal identifier. |
| `authUserId` | `String` | No | `@unique` | Foreign identity key from Supabase Auth. |
| `fullName` | `String` | No | `VARCHAR(80)` | Legal member name (bounded 3–80 chars). |
| `email` | `String` | No | Lowercase normalized | Primary contact and sign-in identifier. |
| `phone` | `String` | Yes | 10–11 Nigerian digits | Contact phone for space access & notifications. |
| `role` | `UserRole` (Enum)| No | `@default(MEMBER)` | Application role: `MEMBER` or `ADMIN`. |
| `accountStatus`| `AccountStatus` | No | `@default(ACTIVE)` | Account state: `ACTIVE`, `SUSPENDED`, `INACTIVE`. |
| `createdAt` | `DateTime` | No | `@default(now())` | Account provisioning timestamp. |
| `updatedAt` | `DateTime` | No | `@updatedAt` | Timestamp of last profile mutation. |

- **Relationships**:
  - `sessions`: `1:N` with `Session` (a user can have multiple concurrent active sessions).
  - `memberships`: `1:N` with `Membership`.
  - `payments`: `1:N` with `Payment`.
  - `paymentAttempts`: `1:N` with `PaymentAttempt`.
  - `bookings`: `1:N` with `Booking`.
  - `benefitLedgers`: `1:N` with `BenefitLedger`.
  - `auditLogs`: `1:N` with `AuditLog` (actions authored by this user).
- **Indexes & Reasoning**:
  - `@@index([email])`: Accelerates authentication lookups during sign-in and password reset. *Write cost*: Low; email updates are infrequent.
  - `@@index([role])`: Optimizes administrative filtering and dashboard role checks. *Write cost*: Negligible; role changes occur rarely.

---

### 2.2 `Session` (Server-Side Session Store)
Maintains cryptographic session records on the server, backing client-side session cookies.

| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `String` (UUID) | No | `@id @default(uuid())` | Primary key. |
| `userId` | `String` | No | Foreign Key -> `User.id` | Owner of the session. |
| `sessionTokenHash`| `String` | No | `@unique` | SHA-256 hash of the random session token cookie. |
| `ipAddress` | `String` | Yes | IPv4 / IPv6 string | Client IP address at session creation. |
| `userAgent` | `String` | Yes | Text string | Client browser / device user-agent string. |
| `expiresAt` | `DateTime` | No | Absolute timestamp | Session expiration time (sliding or absolute). |
| `revokedAt` | `DateTime` | Yes | Nullable timestamp | Set when user logs out or admin terminates session. |
| `createdAt` | `DateTime` | No | `@default(now())` | Session issuance timestamp. |

- **Relationships**:
  - `user`: `M:1` with `User` (`fields: [userId], references: [id], onDelete: Cascade`).
- **Indexes & Reasoning**:
  - `@@index([sessionTokenHash])`: Critical lookup path on every authenticated HTTP request to resolve session identity. *Write cost*: Moderate on login/logout; read volume is high.
  - `@@index([userId, expiresAt])`: Enables rapid bulk eviction of expired sessions for a specific user. *Write cost*: Low.

---

### 2.3 `MembershipPlan` (Product Catalog)
Configurable coworking subscription products and allowances.

| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `String` (UUID) | No | `@id @default(uuid())` | Primary key. |
| `name` | `String` | No | Text | Commercial plan name (e.g. "Dedicated Desk Pro"). |
| `description` | `String` | Yes | Text | Public marketing summary. |
| `price` | `Decimal(12, 2)`| No | Non-negative | Catalog price in currency minor units. |
| `currency` | `String` | No | `@default("NGN")` | ISO currency code. |
| `billingPeriod`| `BillingPeriod` | No | Enum | `MONTHLY`, `DAY_PASS`, `ANNUAL`. |
| `coworkingDayAllowance` | `Int` | Yes | Non-negative integer | Monthly desk access day count. |
| `meetingRoomHourAllowance`| `Decimal(5, 2)`| Yes | Decimal hours | Monthly meeting room credit allowance. |
| `restrictions` | `Json` | Yes | Key-value attributes | Access restrictions (e.g. weekday-only, hours). |
| `isActive` | `Boolean` | No | `@default(true)` | Soft toggle; archived plans cannot be purchased. |
| `createdAt` | `DateTime` | No | `@default(now())` | Timestamp created. |
| `updatedAt` | `DateTime` | No | `@updatedAt` | Timestamp modified. |

- **Relationships**:
  - `memberships`: `1:N` with `Membership`.
- **Indexes & Reasoning**:
  - `@@index([isActive, billingPeriod])`: Accelerates public catalog discovery queries. *Write cost*: Zero impact during normal operations.

---

### 2.4 `Membership` (Purchased Subscription Instances)
Records a member's active or historical membership entitlement period.

| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `String` (UUID) | No | `@id @default(uuid())` | Primary key. |
| `memberId` | `String` | No | Foreign Key -> `User.id` | Member holding the plan. |
| `planId` | `String` | No | Foreign Key -> `Plan.id` | Purchased plan definition. |
| `startAt` | `DateTime` | No | Valid timestamp | Start date of entitlement. |
| `expiresAt` | `DateTime` | No | Valid timestamp | End date of entitlement (1 calendar month / day). |
| `status` | `MembershipStatus`| No | `@default(PENDING)` | `PENDING`, `ACTIVE`, `EXPIRED`, `CANCELLED`. |
| `purchasePrice`| `Decimal(12, 2)`| No | Historical frozen price | Price charged at checkout (immutable). |
| `currency` | `String` | No | `@default("NGN")` | Currency charged. |
| `createdAt` | `DateTime` | No | `@default(now())` | Timestamp issued. |
| `updatedAt` | `DateTime` | No | `@updatedAt` | Timestamp updated. |

- **Relationships**:
  - `member`: `M:1` with `User`.
  - `plan`: `M:1` with `MembershipPlan`.
  - `payments`: `1:N` with `Payment`.
  - `benefitLedgers`: `1:N` with `BenefitLedger`.
- **Indexes & Reasoning**:
  - `@@index([memberId, status])`: Enables rapid verification of active membership on booking requests. *Write cost*: Low.
  - `@@index([expiresAt])`: Powers automated nightly cron jobs that transition expired memberships to `EXPIRED`. *Write cost*: Low.

---

### 2.5 `Payment` (Authoritative Settled Money Table)
Immutable financial record of verified, settled monetary transactions.

| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `String` (UUID) | No | `@id @default(uuid())` | Primary key. |
| `memberId` | `String` | No | Foreign Key -> `User.id` | Member paying. |
| `membershipId` | `String` | Yes | Foreign Key | Linked membership (if membership purchase). |
| `bookingId` | `String` | Yes | Foreign Key | Linked booking (if meeting room / extra hours). |
| `amount` | `Decimal(12, 2)`| No | Non-negative | Settled amount received. |
| `currency` | `String` | No | `@default("NGN")` | ISO currency code. |
| `paymentReference`| `String` | Yes | `@unique` | Verified provider reference (Paystack transaction ID). |
| `provider` | `String` | No | e.g. "PAYSTACK" | Payment gateway name. |
| `status` | `PaymentStatus` | No | `@default(PENDING)` | `PENDING`, `SUCCESSFUL`, `FAILED`, `REFUNDED`. |
| `verifiedAt` | `DateTime` | Yes | Timestamp | Exact server-side webhook verification timestamp. |
| `refundedAt` | `DateTime` | Yes | Timestamp | Nullable refund completion timestamp. |
| `createdAt` | `DateTime` | No | `@default(now())` | Transaction initiation time. |
| `updatedAt` | `DateTime` | No | `@updatedAt` | Timestamp of last status change. |

- **Relationships**:
  - `member`: `M:1` with `User`.
  - `membership`: `M:1` with `Membership` (nullable).
  - `booking`: `M:1` with `Booking` (nullable).
- **Indexes & Reasoning**:
  - `@@index([memberId, status])`: Optimizes member invoice and payment history rendering. *Write cost*: Moderate.
  - `@@index([paymentReference])`: Rapid lookup path for incoming asynchronous payment webhooks. *Write cost*: One-time on record insert.

---

### 2.6 `PaymentAttempt` (Money-Attempts / Telemetry Table)
Audit log of every payment checkout attempt, capturing failed, abandoned, or dropped payments.

| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `String` (UUID) | No | `@id @default(uuid())` | Primary key. |
| `memberId` | `String` | No | Foreign Key -> `User.id` | Member initiating the transaction. |
| `targetType` | `String` | No | e.g. "MEMBERSHIP" | Purpose: "MEMBERSHIP", "BOOKING", "DAY_PASS". |
| `targetId` | `String` | Yes | UUID reference | Specific plan or booking ID being attempted. |
| `amount` | `Decimal(12, 2)`| No | Non-negative | Intended charge amount. |
| `currency` | `String` | No | `@default("NGN")` | ISO currency code. |
| `attemptReference`| `String`| No | `@unique` | Initial client/gateway checkout reference. |
| `gateway` | `String` | No | e.g. "PAYSTACK" | Target gateway provider. |
| `status` | `AttemptStatus` | No | Enum | `INITIATED`, `ABANDONED`, `FAILED`, `GATEWAY_ERROR`. |
| `errorCode` | `String` | Yes | Provider error | Raw gateway error code (e.g. `insufficient_funds`). |
| `errorMessage` | `String` | Yes | Text description | Detailed human-readable failure reason. |
| `ipAddress` | `String` | Yes | Client IP | IP address initiating the payment modal. |
| `metadata` | `Json` | Yes | Context payload | Checkout telemetry (device, card BIN, retry count). |
| `createdAt` | `DateTime` | No | `@default(now())` | Creation timestamp. |
| `updatedAt` | `DateTime` | No | `@updatedAt` | Last attempt update timestamp. |

- **Relationships**:
  - `member`: `M:1` with `User`.
- **Indexes & Reasoning**:
  - `@@index([memberId, createdAt])`: Enables user-level checkout drop-off analysis. *Write cost*: High write volume; essential for analytics.
  - `@@index([attemptReference])`: Reconciles gateway callbacks with the original attempt. *Write cost*: Low.
  - `@@index([status, createdAt])`: Accelerates weekly conversion failure rate reporting. *Write cost*: Low.

---

### 2.7 `WorkspaceResource` (Physical Space Inventory)
Physical workspace inventory: hot desks, dedicated desks, and meeting rooms.

| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `String` (UUID) | No | `@id @default(uuid())` | Primary key. |
| `name` | `String` | No | Text | Resource name (e.g. "Lekki Boardroom A"). |
| `type` | `ResourceType` | No | Enum | `DESK`, `MEETING_ROOM`, `EVENT_SPACE`. |
| `capacity` | `Int` | No | Positive integer | Physical seating capacity. |
| `operatingAvailability`| `Json`| Yes| Working hours JSON | Permitted booking hours (e.g. `08:00–18:00 WAT`). |
| `rate` | `Decimal(12, 2)`| Yes | Monetary value | Hourly overage or standalone hourly charge. |
| `currency` | `String` | Yes | `@default("NGN")` | ISO currency code. |
| `isActive` | `Boolean` | No | `@default(true)` | Soft toggle; archived spaces cannot be booked. |
| `createdAt` | `DateTime` | No | `@default(now())` | Record creation. |
| `updatedAt` | `DateTime` | No | `@updatedAt` | Record update. |

- **Relationships**:
  - `bookings`: `1:N` with `Booking`.
- **Indexes & Reasoning**:
  - `@@index([type, isActive])`: Optimizes member resource discovery screens. *Write cost*: Negligible.

---

### 2.8 `Booking` (Workspace Reservations)
Reservations for desks and meeting rooms with strict concurrency protection.

| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `String` (UUID) | No | `@id @default(uuid())` | Primary key. |
| `memberId` | `String` | No | Foreign Key -> `User.id` | Reserving member. |
| `resourceId` | `String` | No | Foreign Key -> `Resource.id`| Booked desk or room. |
| `startAt` | `DateTime` | No | Valid timestamp | Start of reservation window. |
| `endAt` | `DateTime` | No | Valid timestamp | End of reservation window (`endAt > startAt`). |
| `status` | `BookingStatus` | No | `@default(PENDING)` | `PENDING`, `CONFIRMED`, `CANCELLED`. |
| `totalCharge` | `Decimal(12, 2)`| No | Non-negative | Total fee charged or 0.00 if covered by allowance. |
| `currency` | `String` | Yes | `@default("NGN")` | Currency of charge. |
| `createdAt` | `DateTime` | No | `@default(now())` | Timestamp booking created. |
| `updatedAt` | `DateTime` | No | `@updatedAt` | Timestamp booking modified. |

- **Relationships**:
  - `member`: `M:1` with `User`.
  - `resource`: `M:1` with `WorkspaceResource`.
  - `payments`: `1:N` with `Payment`.
  - `benefitLedgers`: `1:N` with `BenefitLedger`.
- **Indexes & Reasoning**:
  - `@@index([resourceId, status, startAt, endAt])`: **Critical Index** for anti-overlap conflict detection queries. Prevents double-booking collision. *Write cost*: High, but essential for data integrity.
  - `@@index([memberId, status])`: Accelerates member dashboard "Upcoming Bookings" list. *Write cost*: Moderate.

---

### 2.9 `BenefitLedger` (Credit Grant and Usage Ledger)
Double-entry-style ledger tracking coworking day credits and meeting room hour balances.

| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `String` (UUID) | No | `@id @default(uuid())` | Primary key. |
| `memberId` | `String` | No | Foreign Key -> `User.id` | Credited or deducted member. |
| `membershipId` | `String` | No | Foreign Key -> `Membership.id`| Source membership plan grant. |
| `bookingId` | `String` | Yes | Foreign Key -> `Booking.id` | Linked booking consuming the credit. |
| `benefitType` | `BenefitType` | No | Enum | `COWORKING_DAYS`, `MEETING_ROOM_HOURS`. |
| `amount` | `Decimal(6, 2)` | No | Signed decimal | Positive = grant; Negative = deduction. |
| `reason` | `String` | No | Text description | Operational reason (e.g. "Monthly Plan Renewal"). |
| `actorId` | `String` | Yes | User ID | Administrator or system actor making adjustment. |
| `createdAt` | `DateTime` | No | `@default(now())` | Ledger transaction timestamp. |

- **Relationships**:
  - `member`: `M:1` with `User`.
  - `membership`: `M:1` with `Membership`.
  - `booking`: `M:1` with `Booking` (nullable).
- **Indexes & Reasoning**:
  - `@@index([memberId, membershipId])`: Accelerates balance recalculation (`SUM(amount)`). *Write cost*: Low; grants happen monthly, deductions happen on booking.

---

### 2.10 `AuditLog` (Administrative Accountability)
Immutable audit trail of security-sensitive administrative operations.

| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `String` (UUID) | No | `@id @default(uuid())` | Primary key. |
| `actorId` | `String` | Yes | Foreign Key -> `User.id` | Performing administrator (null if system). |
| `action` | `String` | No | e.g. "REFUND_ISSUED" | Explicit business action name. |
| `affectedRecordType`| `String` | No | e.g. "Payment" | Target model. |
| `affectedRecordId` | `String` | Yes | UUID string | Primary key of affected record. |
| `outcome` | `String` | No | "SUCCESS" / "FAILED" | Operation result. |
| `metadata` | `Json` | Yes | Context snapshot | Changed attributes, previous values, IP, timestamp. |
| `createdAt` | `DateTime` | No | `@default(now())` | Event timestamp (immutable). |

- **Relationships**:
  - `actor`: `M:1` with `User` (nullable).
- **Indexes & Reasoning**:
  - `@@index([actorId, createdAt])`: Powers administrator activity review audits. *Write cost*: Low.
  - `@@index([affectedRecordType, affectedRecordId])`: Enables rapid historical forensic reconstruction of any record. *Write cost*: Low.

---

### 2.11 `KnowledgeChunk` (AI Assistant Vector & RAG Store)
Document chunks supporting the Workn AI Workspace Assistant, allowing grounded context retrieval.

| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `String` (UUID) | No | `@id @default(uuid())` | Primary key. |
| `documentTitle`| `String` | No | Text | Title of source document (e.g. "Workn ToS v2"). |
| `sourceSlug` | `String` | No | Text identifier | Document slug or file path. |
| `content` | `String` | No | Full chunk text | Text chunk ingested into retrieval index. |
| `tokenCount` | `Int` | No | Integer | Bounded token length of the chunk. |
| `category` | `String` | No | e.g. "POLICY", "FACILITY"| Knowledge domain classification. |
| `embedding` | `Json` | Yes | Vector float array | Serialized vector embedding or vector extension. |
| `createdAt` | `DateTime` | No | `@default(now())` | Ingestion timestamp. |
| `updatedAt` | `DateTime` | No | `@updatedAt` | Modification timestamp. |

- **Indexes & Reasoning**:
  - `@@index([category])`: Enables category pre-filtering before executing semantic vector retrieval. *Write cost*: Negligible.
  - `@@index([sourceSlug])`: Allows rapid atomic re-indexing and replacement of updated policy documents. *Write cost*: Low.

---

## 3. Facts Stored Twice (Denormalization Rationale)

In strict database normalization (3NF), values derived from other tables should not be duplicated. However, Workn deliberately stores three facts twice for critical legal, historical, and performance reasons:

1. **`Membership.purchasePrice` duplicated from `MembershipPlan.price`**:
   - *Reason*: Membership plans change prices over time (e.g., inflation adjustments in Lagos). If `Membership` merely referenced `plan.price` dynamically, updating a plan from ₦45,000 to ₦60,000 would retroactively alter the reported purchase cost of every historical membership purchased three years earlier. Freezing `purchasePrice` in the `Membership` record preserves an immutable historical contract.
2. **`Booking.totalCharge` duplicated from `WorkspaceResource.rate`**:
   - *Reason*: Hourly room rental rates fluctuate. A meeting room booked at ₦10,000/hr during a promotional window must permanently retain that ₦10,000 price tag, even if the facility rate later increases to ₦15,000/hr.
3. **`Payment.amount` duplicated from `Membership.purchasePrice` / `Booking.totalCharge`**:
   - *Reason*: A payment does not always match the item sticker price. Members may apply promotional credits, pay via multi-part milestone installments, incur gateway surcharge fees, or settle across currency conversions. Storing `Payment.amount` ensures the cash ledger reflects actual money banked, completely decoupled from product catalog pricing.

---

## 4. The Separation: Money Table (`Payment`) vs Money-Attempts Table (`PaymentAttempt`)

Workn separates financial transactions into two distinct tables: `Payment` (the authoritative settled money table) and `PaymentAttempt` (the telemetry and drop-off table).

This separation is mandatory for two business and legal reasons:

1. **Drop-Off Data & Funnel Analytics**:
   In Nigeria's financial ecosystem, payment failure rates are heavily influenced by external banking friction (e.g., card 3D-Secure OTP delivery failures, bank network downtime, card limit exhaustion, or user checkout hesitation). 
   If failed and abandoned checkouts were mixed directly into `Payment`, financial reports would become polluted with ghost rows. By isolating attempts in `PaymentAttempt`, product and growth teams can accurately calculate conversion funnels, pinpoint where users abandon checkout, measure bank failure rates, and proactively reach out to members whose transactions dropped due to cellular network timeouts in Lagos.

2. **Authoritative Source of Truth for Litigation, Inquiries, and Annual Tax Filing**:
   The `Payment` table is a clean, immutable ledger of real financial settlement. Every row represents verified money that cleared through Paystack and banked into the business's accounts. 
   In contrast, `PaymentAttempt` provides the forensic paper trail required for payment disputes, chargebacks, and legal inquiries. When a member claims: *"Your system charged me twice!"*, the company can cross-reference `PaymentAttempt` to prove that one attempt timed out at the customer's issuing bank while only a single transaction settled into `Payment`.

---

## 5. Tax Authority Audit Scenario: Transaction from Fourteen Months Ago

### The Scenario
The Lagos State Internal Revenue Service (LIRS) or the Federal Inland Revenue Service (FIRS) conducts an annual audit and demands an authoritative, end-to-end accounting of a specific transaction executed **fourteen months ago** (e.g., Reference `pstk_tx_908127391`).

### The Workn Resolution Procedure
Because Workn maintains an immutable, relational architecture, the audit is resolved in under five minutes through four deterministic steps:

1. **Locate the Settled Record in `Payment`**:
   Query `Payment` by the unique `paymentReference`:
   ```sql
   SELECT p.id, p.amount, p.currency, p.status, p.verified_at, u.full_name, u.email, u.phone
   FROM "Payment" p
   JOIN "User" u ON p.member_id = u.id
   WHERE p.payment_reference = 'pstk_tx_908127391';
   ```
   This immediately yields the exact amount banked (₦75,000.00), the exact verification timestamp down to the second, the member's legal identity, and proof of settlement.

2. **Trace the Original Checkout Intent in `PaymentAttempt`**:
   Using the transaction reference, join with `PaymentAttempt` to extract the full telemetry: the originating client IP address, the card BIN, the checkout timestamp, and the specific plan requested. This disproves any allegation of fraudulent automated billing.

3. **Verify the Corresponding Entitlement in `Membership` or `Booking`**:
   Inspect the linked `Membership` or `Booking` row. The auditor can see that this payment activated a Dedicated Desk subscription spanning the exact 30-day period fourteen months ago, and verify the corresponding `BenefitLedger` credit grant.

4. **Produce the Immutable Bank Settlement Cross-Reference**:
   Workn's `paymentReference` matches the payout settlement manifest exported from Paystack's institutional portal, demonstrating a 1:1 match between the internal database, the payment processor's ledger, and the physical corporate bank statement.

Zero records are lost, zero historical calculations are retroactively corrupted, and the business presents an indisputable, legally sound audit defense.

