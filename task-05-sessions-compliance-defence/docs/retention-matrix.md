# Workn Data Retention Matrix & Statutory Compliance Specification

## 1. Statutory Framework & Scope

This document specifies the data retention, archival, and erasure policy for Workn (coworking and membership management platform in Lagos, Nigeria).

The retention framework is governed by:
1. **Nigeria Data Protection Act (NDPA) 2023**: Section 34 (Right to Erasure), Section 38 (Exceptions for Legal Obligations & Public Interest).
2. **General Data Protection Regulation (GDPR)**: Article 17 (Right to be Forgotten), Article 5(1)(e) (Storage Limitation).
3. **Companies and Allied Matters Act (CAMA) 2020**: Section 375 (Obligation to maintain financial and accounting records for 6 years).
4. **Lagos State Internal Revenue Service (LIRS)**: Corporate transaction audit requirements.

---

## 2. Table-by-Table & Column-by-Column Retention Matrix

| Model / Table | Column / Attribute Group | Classification | Policy | Retention Period | Legal / Business Basis |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`User`** | `fullName`, `phone`, `email` | Direct PII | Purged on request (after 30-day grace period) | 30 days after deletion request; or active membership + 1 year | NDPA Section 34 (Right to Erasure). Contact details have no retention basis once account terminates. |
| **`User`** | `taxId` | Statutory Financial ID | Retained (anonymized from member profile) | 6 years from last financial transaction | CAMA 2020 Section 375 & LIRS tax reporting obligations. |
| **`User`** | `role`, `accountStatus`, `createdAt` | System Metadata | Retained with pseudonymous key | Indefinite (anonymized) | Audit trail integrity; internal platform metrics. |
| **`Session`** | `id`, `sessionTokenHash`, `ipAddress`, `userAgent` | Authentication Token & Access Log | Purged immediately on logout/purge job | Max 7 days (or immediate on logout) | Security risk mitigation; token replay protection. |
| **`EmailVerification`** | `code`, `email`, `expiresAt`, `consumedAt` | Authentication Factor | Purged automatically by background job | 10 minutes active; purged after 24 hours | Security; CSPRNG codes have zero utility post-consumption. |
| **`Payment`** | `amount`, `currency`, `gatewayReference`, `paymentMethod` | Financial Ledger | Retained | 6 years | CAMA 2020 Section 375; financial audit & dispute reconciliation. |
| **`PaymentAttempt`** | `attemptReference`, `status`, `errorCode`, `metadata` | Transaction Diagnostics | Retained | 180 days (diagnostics) -> Aggregate metrics | Fraud prevention; Paystack gateway troubleshooting. |
| **`Membership`** | `startAt`, `expiresAt`, `status`, `planId` | Contractual Record | Retained (PII detached) | 6 years | Contractual proof of commercial facility access & liability. |
| **`MembershipPlan`** | `name`, `price`, `allowance`, `restrictions` | Commercial Product Catalog | Retained permanently | Indefinite | Historical pricing and audit compliance. |
| **`Booking`** | `resourceId`, `startAt`, `endAt`, `totalAmount` | Resource Allocation & Financial | Retained (memberId anonymized) | 6 years (financial) | Facility utilization analytics; commercial lease tax audits. |
| **`BenefitLedger`** | `benefitType`, `amount`, `reason` | Allowance Accounting | Retained | 3 years | Internal audit of membership benefit consumption. |
| **`AuditLog`** | `action`, `affectedRecordType`, `outcome`, `metadata` | Security & Compliance Audit Log | Retained (actorId detached) | 7 years | Statutory compliance proof under NDPA Section 40. |
| **`KnowledgeChunk`** | `content`, `embedding`, `category` | Business Knowledge Base | Retained | Active document lifecycle | Intellectual property; internal operations. |

---

## 3. The Three Harder Compliance Requirements

### 3.1 Backups: Synchronization, Storage Location & Re-Purge Protocol
- **Storage Location**: Workn database backups are stored in AWS S3 Frankfurt (`eu-central-1`) with server-side encryption via AWS KMS (`aws:kms`).
- **Snapshot Intervals**: Automated daily full snapshots with 7-day Point-in-Time-Recovery (PITR) WAL logs.
- **The Legal Sync Problem**: A database backup containing personal data of a user who lawfully exercised their Right to Erasure becomes technically non-compliant if restored.
- **Workn's Automated Re-Purge Protocol**:
  1. Base backup snapshots automatically rotate and expire on a strict **30-day lifecycle rule** in S3 bucket configuration.
  2. Live database deletions cannot mutate immutable tape/snapshot backups without corrupting cryptographic archive integrity. Under NDPA Section 38(1)(d), archival backups are permitted to retain data strictly for disaster recovery until natural lifecycle expiration.
  3. **The Reconcile Trigger**: If a disaster recovery event forces a restoration from an earlier backup, Workn's automated post-restore initialization script reads the persistent `AuditLog` table, identifies all `HARD_DELETE_COMPLETED` records processed since the backup timestamp, and immediately re-executes `executeScheduledPurgeJob()` before the application opens to public traffic.

---

### 3.2 The Conflict: Right to Erasure vs. Statutory Tax Retention
- **The Conflict Scenario**: A former member who booked desks and meeting rooms at Workn's Admiralty Way hub demands complete erasure of all records under NDPA Section 34 ("delete my account and wipe all database traces of my existence, including billing"). Simultaneously, the Federal Inland Revenue Service (FIRS) and LIRS require Workn to maintain corporate books, transaction references, invoices, and tax IDs for a statutory minimum of 6 years under CAMA 2020 Section 375.
- **Which Obligation Wins**: **The statutory tax retention obligation wins over the right to erasure.**
- **The Legal Basis**:
  - Under both NDPA Section 38(1)(b) and GDPR Article 17(3)(b), the right to erasure is explicitly restricted where personal data processing is necessary *"for compliance with a legal obligation which requires processing by law to which the controller is subject."*
  - A consumer right to privacy cannot void corporate tax compliance or legal dispute resolution rights.
- **Workn's Implementation**: Workn resolves the conflict through **targeted dissociation**:
  - All direct communication and personal identifiers (`fullName`, `phone`, `email`, active sessions) are permanently purged.
  - The transaction records (`Payment`, `PaymentAttempt`, `taxId`) are preserved in the financial ledger with `actorId` set to `null` or detached pseudonymous references (`DELETED_MEMBER_61720047`).

---

### 3.3 Anonymisation Against Deletion
- **Why Anonymisation is Used**: Complete physical deletion (`DELETE FROM "Booking"`) destroys historical facility utilization metrics. Workn's engineering team needs to analyze peak capacity (e.g. how many meeting room hours were used on Tuesday mornings in Lekki) and calculate solar inverter energy consumption per desk.
- **Why Anonymised Data is Legally Retainable**:
  - Both Recital 26 of GDPR and Section 3 of the Nigeria Data Protection Act 2023 define personal data strictly as information relating to an *identified or identifiable natural person*.
  - When personal identifiers are irreversibly decoupled (the raw email and name are replaced with pseudonymous hashes, phone numbers set to null, and direct mappings destroyed), the record ceases to be personal data under the law.
  - Anonymous statistical records are outside the scope of data protection legislation and may be retained indefinitely for business intelligence, architectural capacity planning, and operational modeling.

