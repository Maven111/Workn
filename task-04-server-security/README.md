# Task 4: The Server is the Source of Truth

## 1. Executive Summary

Task 4 transitions Workn from client-side visual controls to rigorous server-side authority. In a secure architecture, the client interface is treated as entirely untrusted: an attacker can modify local state, disable input constraints, or bypass the browser by issuing crafted direct HTTP requests.

This task establishes an uncompromised defensive posture across the data layer, application boundary, authentication pipeline, and background asynchronous workers.

---

## 2. Core Architectural Implementations

### 1. Database Schema & Deliberate Forward Migrations
- **Schema Model**: 11 production models in `prisma/schema.prisma` covering users, roles, memberships, payment attempts, ledgers, and `EmailVerification`.
- **Zero Agent Migrations**: Every schema change was proposed to the Builder and applied via `npx prisma migrate dev`.
- **Forward-Only Integrity**: Documented three-step non-destructive migrations (`add as optional -> populate -> make required`) and captured the client drift error.
- **Reference**: [`docs/schema.md`](file:///c:/Users/man/Desktop/Workn/task-04-server-security/docs/schema.md), [`docs/migrations.md`](file:///c:/Users/man/Desktop/Workn/task-04-server-security/docs/migrations.md).

### 2. Password Hashing Architecture
- **Adaptive Memory-Hard Hashing**: Evaluated and enforced bcrypt cost factor 12 ($2^{12} = 4,096$ rounds).
- **Machine Timing Comparison**: Bcrypt cost 12 benchmarked at **451.95 ms** per password vs. SHA-256 at **0.0017 ms** on the Builder's CPU (a 264,041x speed difference).
- **Security Inversion**: Legitimate users hash once per login (452 ms latency is unnoticeable); attackers face **8.6 years** on an 8-GPU rig to crack 8-character passwords compared to 18.2 minutes with SHA-256.
- **Reference**: [`docs/hashing.md`](file:///c:/Users/man/Desktop/Workn/task-04-server-security/docs/hashing.md).

### 3. Normalisation, Trimming & Server Boundary Validation
- **Normalisation**: Emails strictly lowercased across all registration, login, and reset entry points. Passwords are never lowercased, preserving character entropy and complexity.
- **Trimming**: Passwords have leading and trailing whitespace trimmed to prevent accidental copy-paste padding lockouts.
- **Zod Schema Boundary**: Schemas enforced at the entry point of Server Actions and REST API routes before payloads touch database operations.
- **Validation Timing**: Added latency overhead is **1.944 microseconds** per request, proving that boundary schema parsing introduces zero measurable latency.
- **Direct Attack Refusal**: Re-sent the Task 3 direct request bypass and confirmed refusal at the server boundary with HTTP 400.
- **Reference**: [`docs/validation-placement.md`](file:///c:/Users/man/Desktop/Workn/task-04-server-security/docs/validation-placement.md).

### 4. Rate Limiting & Legitimate Defeat
- **Sliding-Window Policy**: 5 attempts per 15-minute window for login; 3 attempts per 15 minutes for registration and password reset.
- **Composite Keying**: Keys combine client IP address and target email to mitigate denial-of-service against shared NAT gateways.
- **Standard HTTP Headers**: Returns `HTTP 429 Too Many Requests` accompanied by `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset`.
- **Legitimate Defeat**: Proved that rotating client IP from `197.210.64.12` to `102.89.23.45` bypassed IP quotas without altering server configuration, establishing why IP rate limiting alone is insufficient against distributed botnets.
- **Reference**: [`docs/rate-limiting.md`](file:///c:/Users/man/Desktop/Workn/task-04-server-security/docs/rate-limiting.md).

### 5. Breached Password Check (k-Anonymity)
- **Zero-Knowledge Range Verification**: Computes 40-character SHA-1 hash locally. Sends strictly the 5-character prefix to HaveIBeenPwned API; evaluates remaining 35-character suffix against returned candidate range locally in server memory.
- **Corpus Verification**: Tested with `password123` (observed 2,266,543 times across public breaches) and confirmed rejection.
- **Reference**: [`docs/breach-check.md`](file:///c:/Users/man/Desktop/Workn/task-04-server-security/docs/breach-check.md).

### 6. Email Verification & Asynchronous Queue Dispatch
- **CSPRNG Code Generation**: Generates 6-digit verification PINs using Node.js `crypto.randomInt(100000, 1000000)` rather than predictable pseudo-random PRNGs.
- **10-Minute Expiry Window**: Balances cellular SMS/email jitter in Nigeria with brute-force limitation ($0.0005\%$ guess probability under rate limiting).
- **Decoupled Asynchronous Dispatch**: Decouples email delivery to a background job queue, reducing user registration latency from **206.02 ms** down to **16.47 ms** (12.5x speedup).
- **Deliberate SMTP Failure & Fix**: Documented connection refusal on misconfigured host (`16-smtp-failure.txt`) and resolved it via authenticated ESMTP relay (`17-smtp-success.txt`).
- **All Three Failure Modes Enforced**: Verified expired code, wrong code, and reused code failure modes against PostgreSQL state.
- **Token-Styled Presentation**: Built email template implementing Task 1 design tokens (Warm Oat `#FBF9F5`, Terracotta `#C85A32`, Forest Green `#2A4B3C`, Syne headings).
- **Reference**: [`docs/verification-design.md`](file:///c:/Users/man/Desktop/Workn/task-04-server-security/docs/verification-design.md), [`docs/email-copy.md`](file:///c:/Users/man/Desktop/Workn/task-04-server-security/docs/email-copy.md).

---

## 3. Deliverables Directory Structure

```
task-04-server-security/
  README.md
  docs/
    schema.md
    migrations.md
    hashing.md
    validation-placement.md
    rate-limiting.md
    breach-check.md
    verification-design.md
    email-copy.md
    not-implemented.md
    defects.md
    interview-answers.md
  evidence/
    01-schema-drawing.jpeg
    02-database-state-before.png
    03-initial-migration.txt
    04-required-column-failure.txt
    05-required-column-three-steps.txt
    06-drift-error.txt
    07-hash-twice-different.txt
    08-timing-argon-vs-sha.txt
    09-email-case-normalised.png
    10-password-trim-working.png
    11-validation-timing.txt
    12-direct-request-before-and-after.txt
    13-rate-limit-triggered.png
    14-rate-limit-defeated.txt
    15-breach-check-rejection.png
    16-smtp-failure.txt
    17-smtp-success.txt
    18-registration-timing-sync-vs-job.txt
    19-verification-row.png
    20-verification-expired.png
    21-verification-wrong-code.png
    22-verification-code-reused.png
    23-rendered-email.png
    email-preview.html
```

---

## 4. Key Numbers Summary (from `Docs/numbers-register.md`)

- **Bcrypt Cost Factor**: 12 rounds ($2^{12} = 4,096$ iterations)
- **Bcrypt Timing (Builder CPU)**: 451.95 ms
- **SHA-256 Timing (Builder CPU)**: 0.001712 ms (1.712 $\mu$s)
- **Speed Disparity Ratio**: 264,041x
- **GPU Cracking Time (62^8 combos)**: 18.2 minutes (SHA-256) vs. 8.6 years (bcrypt)
- **Rate Limit Window**: 5 attempts / 15 minutes (Login), 3 / 15m (Register/Reset)
- **Email Code Expiry Window**: 10 minutes (600 seconds)
- **Registration Email Latency**: 206.02 ms (Sync) vs. 16.47 ms (Async Background Job)

