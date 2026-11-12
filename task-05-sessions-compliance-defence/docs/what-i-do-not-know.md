# What I Do Not Know

*An honest technical inventory of engineering unknowns, architectural blind spots, and unanswered operational questions across the Workn codebase.*

## 1. How the Session Cookie Payload Is Cryptographically Sealed by the Framework

### What it is
The internal cryptographic sealing, key derivation, and authentication mechanism used by `@supabase/ssr` and Next.js cookie stores to package user credentials, refresh tokens, and session metadata into chunked, tamper-proof HTTP cookies (`workn_session` and `sb-*-auth-token`).

### How I know I do not understand it
I treat `createServerClient` and Next.js `cookies()` as an opaque black box. I know that our configuration flags the cookie with `HttpOnly`, `SameSite=Lax`, and `Secure`, and I know that the browser will not expose it to `document.cookie`. However, if an auditor handed me a raw base64-encoded cookie string and the project secret key, I could not write a standalone Node.js script using `node:crypto` to manually verify the HMAC signature or decrypt the ciphertext without invoking the framework's proprietary helper libraries. I do not know the exact key derivation function (whether PBKDF2, scrypt, or HKDF), the cipher mode (AES-256-GCM vs AES-256-CBC), or how initialization vectors (IVs) are rotated between consecutive request updates.

### What I would need to learn it
I need to clone the `@supabase/ssr` and Next.js `next/dist/server/web/spec-extension/cookies` repositories, attach a step-through debugger to an active session serialization cycle, trace the exact cryptographic pipeline down to the Node.js `crypto.createCipheriv` calls, and write a dependency-free script that validates and decrypts an exported production cookie string from scratch.

---

## 2. What Prisma Engine Does When a Migration or Interactive Transaction Fails Halfway

### What it is
The transactional rollback guarantees, DDL atomicity boundaries, and connection-recovery mechanics of Prisma’s Rust query engine when executing multi-step migrations (`ALTER TABLE`, backfills, `SET NOT NULL`) or distributed interactive transactions (`prisma.$transaction`) against PostgreSQL.

### How I know I do not understand it
When implementing the 3-phase `taxId` migration in Task 4 Step 5, I initially feared that if step 2 (the backfill script) failed after step 1 (`ADD COLUMN taxId NULLABLE`), the database would be left in an inconsistent state. While PostgreSQL supports transactional DDL (`BEGIN; ALTER TABLE ...; COMMIT;`), I do not understand how Prisma’s Rust engine handles connection socket drops halfway through an interactive transaction. If a network blip severs the TCP connection while the engine is waiting on an external payment verification or webhook, does the PostgreSQL backend immediately rollback via statement timeout, or does it hold table locks until the TCP keepalive expires, potentially deadlocking concurrent queries?

### What I would need to learn it
I need to study the PostgreSQL Write-Ahead Log (WAL) and lock manager documentation (`pg_locks`), review the source code of the Prisma Rust query engine (`prisma/prisma-engines`), and run chaos-engineering experiments using network fault injection tools (such as Pumba or Toxiproxy) to sever database connections in the middle of a schema migration and inspect the exact transaction rollback behavior.

---

## 3. In-Memory Rate Limiter Volatility Across Stateless Serverless Restarts

### What it is
The lifecycle, memory persistence, and distributed state boundaries of the sliding-window in-memory rate limiter implemented in `src/lib/security/rate-limiter.ts`.

### How I know I do not understand it
In our local development server, the rate limiter uses a Node.js `Map<string, RateLimitRecord>` to track IP and email attempts. When Next.js hot-reloads or when the server restarts, this memory is wiped clean. In a real-world serverless deployment (such as Vercel or AWS Lambda), every incoming request may be routed to an entirely separate container instance or cold-booted execution context. I do not have empirical data on how often serverless instances recycle. An attacker could theoretically distribute 50 brute-force login attempts across 10 distinct lambda instances without any single instance registering the 5-attempt threshold, effectively bypassing our defense.

### What I would need to learn it
I need to study distributed coordination algorithms, implement a Redis-backed sliding-window counter using Lua scripts (or a managed provider like Upstash), and run automated load tests using Artillery or k6 against a distributed multi-node cluster to benchmark rate-limiting evasion across stateless nodes.

---

## 4. Scheduled Background Purge Execution Guarantees During Infrastructure Downtime

### What it is
The reliability, retry guarantees, and missed-schedule recovery behavior of the automated account deletion and data retention purge routine (`src/lib/compliance/deletion.ts`).

### How I know I do not understand it
In Task 5, we verified the retention purge script by executing it directly via `node scripts/test-retention-purge.mjs` and proving that Run 2 is idempotent. However, in a production setup governed by a cron scheduler (e.g. `0 2 * * *` at 2:00 AM WAT), I do not know what happens if the server is offline, restarting, or undergoing maintenance when the cron event fires. Does the scheduler record the missed execution and run immediately upon boot, or is the purge silently skipped until the next calendar day? If a database lock prevents the purge job from deleting a specific row, how is that failure surfaced to the operations team?

### What I would need to learn it
I need to study enterprise job-scheduling architectures (such as `pg_cron` running directly inside PostgreSQL, BullMQ backed by Redis, or AWS EventBridge with dead-letter queues), understand distributed lease locks (`SELECT ... FOR UPDATE SKIP LOCKED`), and design a persistent job audit table that tracks job run states (`PENDING`, `RUNNING`, `FAILED`, `COMPLETED`) with automated alerting.

---

## 5. Whether Workn's Retention Matrix Would Survive an Adversarial Scrutiny by an NDPA Auditor vs. a Tax Court

### What it is
The complex statutory priority between the Right to Erasure under Section 34 of the Nigeria Data Protection Act (NDPA 2023) and mandatory corporate accounting retention rules under Section 332 of the Companies and Allied Matters Act (CAMA 2020) and Section 47 of the Personal Income Tax Act (PITA).

### How I know I do not understand it
In `docs/retention-matrix.md`, I resolved the legal conflict through an engineering compromise: locking the account into an `INACTIVE` state, destroying active sessions, but strictly preserving invoices, payment logs, and user IDs for 6 years. However, I am a software engineer, not a Nigerian privacy attorney. If a data subject lodges a formal complaint with the Nigeria Data Protection Commission (NDPC) demanding immediate destruction of their personal email and telephone number, would an NDPC enforcement tribunal accept our CAMA tax defense as an absolute justification, or would they penalize us for failing to decouple and anonymize personal identifiers from the fiscal ledger?

### What I would need to learn it
I need to consult an accredited Nigerian data protection compliance organization (DPCO), review published NDPC enforcement orders and penalty notices, study comparative EU GDPR Article 17(3)(b) case law regarding data segregation, and draft a formal legal opinion on cryptographic data pseudonymization versus statutory record destruction.

---

## 6. The Precise HTTP Streaming Pipeline Where Cookie Mutations Collide with Server Action Serialization

### What it is
The exact boundary and order-of-operations in Next.js App Router where server-side cookie modifications (`cookies().set()`, `cookies().delete()`) are serialized into HTTP response headers alongside React Server Component (RSC) streaming chunk payloads.

### How I know I do not understand it
During Task 5 Defect 1 debugging, I observed that calling `destroySession()` inside a Server Action successfully executed the database revocation, but if the action immediately invoked `redirect('/auth?view=login')`, certain browser clients retained the stale cookie across the redirect. I do not fully understand the low-level HTTP transport layer in Next.js—specifically how the framework flushes HTTP response headers when an RSC streaming payload has already begun transmitting bytes. If headers are flushed before `cookies().set()` is evaluated in an asynchronous sub-routine, the `Set-Cookie` header is silently dropped.

### What I would need to learn it
I need to read the HTTP/1.1 and HTTP/2 RFC specifications on chunked transfer encoding and trailer headers, inspect the internal Next.js request store source code (`next/dist/server/app-render/action-handler.js`), and build a minimal Node.js HTTP server that simulates chunked body streaming while injecting late `Set-Cookie` headers to observe browser handling.

---

## 7. Cryptographic Entropy Quality of Node.js `crypto.randomBytes` in MicroVM and Container Environments

### What it is
The statistical entropy harvesting and random number generation quality of `crypto.randomBytes(32)` when executed inside lightweight microVMs, Docker containers, and serverless sandbox runtimes.

### How I know I do not understand it
Our session generator relies on `crypto.randomBytes(32)` to generate 256 bits of CSPRNG entropy. In standard desktop and server environments, this calls the OS kernel’s entropy pool (e.g. `BCryptGenRandom` on Windows, `/dev/urandom` on Linux). However, in modern serverless environments (like AWS Firecracker microVMs), virtual machines are spun up, snapshotted, and restored in milliseconds. In virtualized environments that suffer from "entropy starvation" or snapshot state duplication, two concurrent VM instances restored from the same parent memory snapshot could theoretically generate identical or predictable pseudo-random sequences.

### What I would need to learn it
I need to study RFC 8937, research Linux kernel entropy harvesting (`getrandom(2)` system call), review AWS Firecracker's entropy seeding mechanisms, and execute a NIST SP 800-22 statistical randomness test suite against 100,000 session tokens generated across container cold boots to verify pre-image unpredictability.

---

## 8. HaveIBeenPwned k-Anonymity Mathematical Leakage and Correlation Side-Channels

### What it is
The theoretical information leakage and correlation vulnerabilities inherent in querying external breached credential range APIs using the 5-character SHA-1 prefix k-anonymity model.

### How I know I do not understand it
The k-anonymity model divides the SHA-1 keyspace into $16^5 = 1,048,576$ buckets, with each bucket returning 400 to 800 matching hash suffixes. While the plaintext password is never sent over the wire, I do not understand the statistical correlation risks over time. If a malicious network observer (or compromised upstream ISP) monitors Workn's outgoing API queries and records a specific office IP address making repeated prefix queries during registration spikes, could they correlate those queries against timing attacks and known password frequency lists to narrow down the candidate password to a dangerously small statistical set?

### What I would need to learn it
I need to study differential privacy mathematics and k-anonymity boundary proofs, read Cloudflare's published security papers on the Pwned Passwords protocol, and simulate network traffic correlation attacks using Wireshark to determine whether prefix frequency leaks actionable entropy.

---

## 9. Real-World Failure Modes of Nigerian Interbank Settlement (NIBSS) Webhooks During Systemic Outages

### What it is
The failure, timeout, and delayed-settlement dynamics of the Nigerian Inter-Bank Settlement System (NIBSS) and commercial bank payment gateways (Paystack, Flutterwave, Moniepoint) during national financial switch downtime.

### How I know I do not understand it
Our payment integration architecture assumes that when a user pays for a desk pass, a payment webhook arrives within a few seconds to update the member's booking status from `PENDING` to `CONFIRMED`. However, as any Lagos resident knows, during systemic bank network downtime or Sunday night core banking batch runs, bank transfer alerts and payment webhooks can be delayed by anywhere from 30 minutes to 12 hours. I do not have a battle-tested architecture for how Workn should handle a physical walk-in member whose debit alert has left their account, whose money is stuck in NIBSS transit, and whose booking remains locked in `PENDING` while they stand in the lobby needing immediate Wi-Fi access.

### What I would need to learn it
I need to interview senior integration engineers at Nigerian payment switches (Paystack, Interswitch, Moniepoint), study asynchronous two-phase settlement patterns with manual escrow holds, and build an automated polling reconciliation worker that queries settlement status APIs rather than relying solely on push webhooks.

