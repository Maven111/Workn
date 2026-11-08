Sessions, Compliance and the Defence

## 1. Architectural Pillars

### 1.1 Cryptographic Two-Tier Session Architecture
- **Raw Token Entropy**: 256 bits of cryptographically secure pseudo-random entropy generated via `crypto.randomBytes(32).toString('hex')` (64-character hex string).
- **One-Way Hashed Storage**: The PostgreSQL `Session` table strictly stores the `SHA-256` digest of the raw token (`sessionTokenHash`). If the database is compromised, an adversary obtains zero usable session tokens.
- **Secure Cookie Flags**: Enforces `HttpOnly: true`, `Secure: true`, `SameSite: 'lax'`, and `Path: '/'` with a 7-day TTL (`SESSION_MAX_AGE_SECONDS = 604800`).
- **Authoritative Server Invalidation**: `destroySession()` marks `revokedAt = NOW()` in PostgreSQL and emits `Max-Age: 0`. Stolen or cached tokens are immediately rejected by server-side verification.
- **Reference**: [`docs/sessions.md`](file:///c:/Users/man/Desktop/Workn/task-05-sessions-compliance-defence/docs/sessions.md).

### 1.2 Hard Gating Onboarding Flow
- **Decision**: Shipped **Hard Gating** as Workn's primary production pipeline.
- **Justification**: Workn provisions physical access to real-world commercial premises across Lagos hubs (Lekki, Victoria Island, Ikeja). Physical facility liability, anti-fraud controls, and commercial tax compliance (LIRS / CAMA 2020) require verified inboxes before authenticated sessions are issued.
- **Conversion Trade-Off**: Accepted a 15%–20% initial drop-off in completed registrations in exchange for a 100% verified member base.
- **Reference**: [`docs/gating.md`](file:///c:/Users/man/Desktop/Workn/task-05-sessions-compliance-defence/docs/gating.md).

### 1.3 Shared Kiosk Session Conflict Resolution
- **Shared Workstation Collision**: Diagnosed and resolved the vulnerability where Person B logs in on a shared terminal while Person A's session remains active.
- **Automatic Invalidation**: When an existing cookie belongs to a different member, the server explicitly revokes the previous session (`revokedAt = NOW()`) before issuing a fresh 256-bit token to User B.
- **Evidence**: [`evidence/06-two-users-one-browser.txt`](file:///c:/Users/man/Desktop/Workn/task-05-sessions-compliance-defence/evidence/06-two-users-one-browser.txt).

### 1.4 Logout Network Failure Resilience
- **The Edge Case**: Network drops during logout cause naive client UIs to display "Signed out" while the session remains 100% active on the server.
- **The Fix**: Multi-tiered protocol requiring server confirmation (`200 OK`), automated retry loops, and `navigator.sendBeacon` background dispatch.
- **Evidence**: [`evidence/09-logout-network-failure.txt`](file:///c:/Users/man/Desktop/Workn/task-05-sessions-compliance-defence/evidence/09-logout-network-failure.txt), [`evidence/10-logout-edge-case-fixed.txt`](file:///c:/Users/man/Desktop/Workn/task-05-sessions-compliance-defence/evidence/10-logout-edge-case-fixed.txt).

### 1.5 Lawful Account Deletion & Scheduled Purge Job
- **Immediate Soft Delete & Lockout**: Immediate `accountStatus = 'INACTIVE'`, global session termination (`revokeAllUserSessions`), and PII anonymization (`Anonymised Member`).
- **30-Day Statutory Grace Period**: NDPA 2023 Section 34 and GDPR Article 17 compliant recovery and commercial dispute window.
- **Atomic Scheduled Purge**: Background job purges expired accounts in a single database transaction (`prisma.$transaction`).
- **Idempotency Verified**: Running the job twice on identical data produces zero secondary mutations.
- **Evidence**: [`evidence/13-scheduled-job-run-one.txt`](file:///c:/Users/man/Desktop/Workn/task-05-sessions-compliance-defence/evidence/13-scheduled-job-run-one.txt), [`evidence/14-scheduled-job-run-two.txt`](file:///c:/Users/man/Desktop/Workn/task-05-sessions-compliance-defence/evidence/14-scheduled-job-run-two.txt).

### 1.6 Data Retention Matrix & Legal Conflict Analysis
- **Retention Specification**: Full column-by-column breakdown of all 11 schema models.
- **The Legal Conflict**: Resolved conflict between Right to Erasure (NDPA Sec. 34) and Statutory Financial Retention (CAMA 2020 Sec. 375 / LIRS 6-year book retention): tax retention prevails under NDPA Section 38(1)(b) via PII dissociation.
- **Backup Re-Purge Sync**: 30-day rolling snapshot lifecycle with automated post-restore audit reconciliation.
- **Reference**: [`docs/retention-matrix.md`](file:///c:/Users/man/Desktop/Workn/task-05-sessions-compliance-defence/docs/retention-matrix.md), [`privacy.md`](file:///c:/Users/man/Desktop/Workn/task-05-sessions-compliance-defence/privacy.md).

### 1.7 Protected Administrative Route & Authorization
- **Role-Based Control**: Built `/admin` protected route with strict server-side authorization: ordinary `MEMBER` accounts receive HTTP 403 Access Denied, while `ADMIN` accounts access facility controls and privileged server mutations.
- **Reference**: [`src/app/admin/page.tsx`](file:///c:/Users/man/Desktop/Workn/src/app/admin/page.tsx), [`src/app/admin/actions.ts`](file:///c:/Users/man/Desktop/Workn/src/app/admin/actions.ts).

---

## 2. Deliverables Directory Structure

task-05-sessions-compliance-defence/
  README.md
  privacy.md
  privacy-draft-with-broken-promise.md
  docs/
    sessions.md
    gating.md
    retention-matrix.md
    state-management.md
    defects.md
    interview-answers.md
  evidence/
    01-two-session-ids.txt
    06-two-users-one-browser.txt
    09-logout-network-failure.txt
    10-logout-edge-case-fixed.txt
    13-scheduled-job-run-one.txt
    14-scheduled-job-run-two.txt
```
