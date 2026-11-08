# Task 5 Technical Interview Answers

Comprehensive, defensible answers for Task 5. Every answer is strictly under 200 words, contains zero word metric annotations, and cites exact numbers matching `Docs/numbers-register.md`.

---

### Question 1: What should a secure browser session look like? Name every property and what each one prevents.
A secure session consists of a 256-bit cryptographically random token stored in an HTTP cookie backed by a hashed database record. 

Its properties are:
1. **High Entropy Identifier**: Generated via `crypto.randomBytes(32)` (256 bits), preventing brute-force token prediction.
2. **One-Way Hashed Storage**: The database stores only `SHA-256(token)`. A database leak reveals zero usable tokens, preventing impersonation.
3. **`HttpOnly` Flag**: Blocks client-side JavaScript access (`document.cookie`), preventing token theft via Cross-Site Scripting (XSS).
4. **`Secure` Flag**: Restricts cookie transmission strictly to TLS/HTTPS, preventing plaintext eavesdropping on public Wi-Fi.
5. **`SameSite=Lax` Flag**: Prevents Cross-Site Request Forgery (CSRF) by withholding the cookie on third-party cross-site requests while supporting top-level navigation.
6. **Strict Expiration (`Max-Age=604800`)**: Enforces a 7-day lifetime, limiting the temporal window if a token is intercepted.
7. **`Path=/`**: Restricts the cookie scope to authorized application paths.

---

### Question 2: What is session fixation, and what prevents it?
Session fixation is an attack where an adversary forces a known session identifier onto a victim's browser before the victim authenticates. When the victim logs in, the server associates the existing, attacker-known session ID with the victim's authenticated identity. The attacker then uses the known identifier to hijack the account without ever learning credentials.

It is prevented by **session regeneration upon authentication**: the server must always destroy any pre-existing unauthenticated session identifier and issue a completely fresh, cryptographically random token upon successful login. Workn generates a new 256-bit token in `createSession()` on every sign-in, completely severing any identifier present before login.

---

### Question 3: Are tokens better than server-side sessions? Answer for Workn, not in general.
For Workn, **server-side sessions are superior to stateless JWT tokens**.

Workn manages physical access to real-world commercial facilities, meeting room allocations, and financial transactions in Lagos. This operational reality demands instantaneous, authoritative revocation capabilities. 

With stateless JWTs, when a member reports a stolen laptop, is banned for non-payment, or initiates account deletion, the token remains valid until its signature expires unless complex distributed blacklists are maintained. With Workn's server-side `Session` table in PostgreSQL, calling `destroySession()` or setting `revokedAt = NOW()` terminates the session immediately across all hubs. Because Workn already utilizes PostgreSQL for relational consistency, the microscopic database lookup latency is an inconsequential price to pay for absolute revocation authority.

---

### Question 4: How would you implement log out of all devices?
To log out of all devices, the application must invalidate every active session record belonging to the user across the entire fleet.

In Workn, this is implemented in `revokeAllUserSessions(userId)`:
1. The server executes an atomic database update:
   ```sql
   UPDATE "Session" SET "revokedAt" = NOW() WHERE "userId" = $1 AND "revokedAt" IS NULL;
   ```
2. The current device's cookie is cleared by setting `Max-Age: 0`.
3. When any other device (phone, home laptop, shared tablet) makes its next request, the middleware calls `validateSessionToken()`. Because `session.revokedAt` is now populated, the token is rejected, and all other devices are redirected to the login screen.

---

### Question 5: How do you invalidate existing sessions on a password change?
When a password is changed or reset, all existing active sessions must be invalidated immediately to terminate any unauthorized access.

In Workn's password update handler:
1. The new password is validated against the breach corpus and hashed with bcrypt (cost factor 12).
2. Within the same transaction that updates the user's password hash in the database, the server calls `revokeAllUserSessions(userId)`.
3. All existing rows in the `Session` table for that user are marked as revoked (`revokedAt = NOW()`).
4. A single fresh session token is issued exclusively to the browser that performed the password update, while all other active devices are forcefully terminated.

---

### Question 6: What do the HttpOnly, Secure and SameSite cookie flags protect against, and what does each one fail to protect against?
- **`HttpOnly`**:
  - *Protects against*: Token exfiltration via Cross-Site Scripting (XSS). Malicious scripts executing in browser memory cannot read `document.cookie`.
  - *Fails to protect against*: Cross-Site Request Forgery (CSRF), packet sniffing over HTTP, or direct malware on the client operating system.
- **`Secure`**:
  - *Protects against*: Plaintext transmission over unencrypted networks (Man-in-the-Middle Wi-Fi packet capture).
  - *Fails to protect against*: XSS, CSRF, physical machine access, or compromised DNS/TLS termination proxies.
- **`SameSite` (Lax/Strict)**:
  - *Protects against*: CSRF attacks, ensuring third-party sites cannot trigger unauthorized state-changing POST requests using the user's cookie.
  - *Fails to protect against*: XSS (an attacker running script on the origin can forge requests locally) or sub-domain takeover.

---

### Question 7: What is the difference between a 401 and a 403, and how should the interface treat them differently?
- **HTTP 401 Unauthorized**: Means **unauthenticated** (identity is unverified or session is missing/expired). The client must authenticate to proceed. The interface should preserve the current route as a redirect parameter and guide the user to the login screen: `/auth?view=login&redirect=/target`.
- **HTTP 403 Forbidden**: Means **unauthorized** (identity is known and authenticated, but lacks sufficient permissions). Re-authenticating with the same credentials will produce the exact same refusal. The interface must **not** redirect to login; instead, it should display an access-denied view explaining that higher privileges (e.g. `ADMIN` role) are required, offering navigation back to the member dashboard.

---

### Question 8: Why must logout be handled on the server rather than the front end, and what exactly stays alive if it is not?
Logout must be handled authoritatively on the server because HTTP cookies are merely client-side tokens. 

If logout is handled solely on the frontend by clearing `document.cookie` or deleting local storage:
- The server **never learns** that the session has ended.
- In PostgreSQL, the `Session` row remains active with `revokedAt: null` and full validity until its expiration date.
- What stays alive: **The cryptographic session identifier itself**. 
- If an adversary intercepted the cookie earlier, extracted it from browser cache, or possesses a copy on another device, the stolen identifier remains 100% functional against all API endpoints. Only server-side revocation (`destroySession()`) renders the token permanently dead.

---

### Question 9: What is the difference between authentication and authorisation, and which one does a protected route need?
- **Authentication**: Establishes **who you are** (identity verification via credentials, bcrypt password matching, and session token resolution).
- **Authorisation**: Determines **what you are permitted to do** (permissions and access rights evaluated against application roles or resource ownership).

A protected route requires **both**:
1. First, authentication confirms the request originates from a valid, active user account.
2. Second, authorization confirms that the authenticated user possesses the specific rights required for that route (e.g., verifying that `user.role === 'ADMIN'` for `/admin`, or verifying that `booking.memberId === user.id` for `/bookings/[id]`). Authentication without authorization permits any regular member to access administrative tools.

---

### Question 10: A user asks you to delete their account. Walk me through what happens, from the request to the data being gone.
1. **Verification**: The user submits an authenticated erasure request confirmed with their password.
2. **Immediate Lockout (Soft Delete)**: The server updates `accountStatus = 'INACTIVE'`, immediately revoking all active sessions via `revokeAllUserSessions()`.
3. **Identity Anonymisation**: Contact details are wiped (`fullName = 'Anonymised Member'`, `phone = null`, `email = deleted-xxx@workn.invalid`) so identity cannot be leaked in operational logs.
4. **Audit Documentation**: An immutable `AuditLog` entry records the request and sets `scheduledPurgeAt = NOW() + 30 days`.
5. **30-Day Grace Period**: The account remains locked during the 30-day statutory recovery and dispute window.
6. **Hard Delete Purge Job**: On day 31, an automated background job discovers the expired request and executes an atomic transaction: permanently deleting session records, detaching audit log foreign keys, and purging the `User` row from PostgreSQL.

---

### Question 11: Which data would you refuse to delete on a deletion request, and on what basis?
Workn refuses to delete **financial transaction ledgers, payment attempt logs, and statutory tax invoices**.

The legal basis is:
- **NDPA 2023 Section 38(1)(b)** and **GDPR Article 17(3)(b)**, which explicitly override the right to erasure when data processing is required to comply with a statutory legal obligation.
- Under **CAMA 2020 Section 375** and **LIRS tax reporting regulations**, commercial businesses in Nigeria must preserve accounting records and transaction books for a statutory minimum of **6 years**.

Workn resolves this by anonymizing identity: we permanently purge personal contact details (phone, email, marketing profiles), but retain the immutable financial ledger, payment amounts, and Paystack reference hashes with detached actor identifiers.

---

### Question 12: What happens to your backups when a user is deleted?
When a user is purged from the live database, database backup snapshots (stored in encrypted S3 buckets in Frankfurt) are **not** immediately unpacked or mutated. Attempting to edit historical backups in real time would invalidate cryptographic checksums and risk database corruption.

Under NDPA Section 38(1)(d), archival backups are permitted to retain data strictly for disaster recovery until natural lifecycle expiration. Workn enforces two controls:
1. **Automated Lifecycle Expiration**: All rolling backup snapshots automatically rotate and expire on a strict **30-day lifecycle rule** in S3.
2. **Post-Restore Re-Purge Job**: If a catastrophic failure requires restoring an older backup, our automated bootstrap sequence reads the persistent `AuditLog` table and immediately re-executes `executeScheduledPurgeJob()` to re-purge any erased accounts before the application accepts public traffic.

---

### Question 13: What is the difference between anonymising and deleting, and when is anonymising sufficient?
- **Deleting**: Permanently removes the physical database row (`DELETE FROM "User"`). The record ceases to exist.
- **Anonymising**: Irreversibly strips and decouples all direct and indirect personal identifiers (`fullName`, `email`, `phone`, `ipAddress`) so the remaining data can never be re-associated with a natural person.

Anonymising is sufficient—and often legally superior—when retaining historical business metrics:
- Under **Recital 26 of GDPR** and **NDPA Section 3**, anonymous statistical data is no longer classified as personal data.
- It allows Workn to analyze facility capacity (e.g. how many desks were occupied on Tuesday mornings in Lekki) and solar power usage without retaining any member PII.

---

### Question 14: Why do you want to work as a forward deployed engineer specifically, rather than as a software engineer?
A traditional software engineer builds features against an abstract specification in an isolated development environment. A forward deployed engineer (FDE) operates directly on the front line where business reality collides with technology.

I want to work as an FDE because I care deeply about solving real-world, high-stakes problems with measurable operational impact. In environments like Workn in Lagos, an engineer cannot make naive assumptions about reliable power, fast internet, or frictionless email delivery. FDEs diagnose cross-continental latency, navigate local compliance frameworks like NDPA and CAMA, speak with business owners to uncover true requirements, and build resilient systems that thrive under adversarial production conditions.

---

### Question 15: A customer says they want to use AI to improve their operations. How do you respond?
I respond by focusing on **operational friction and data readiness** before touching any AI models:

1. **Identify the Specific Problem**: What specific bottleneck costs the business time, money, or customer trust? AI is not a generic efficiency button; it is an optimization tool for specific unstructured data or predictive tasks.
2. **Audit Data Hygiene & Boundaries**: Where does the relevant operational data live, is it clean, and who is authorized to view it? Unstructured records without role-based access control will cause security disasters.
3. **Evaluate Simpler Solutions**: Can the problem be solved with a database index, a clean workflow automation, or a simple heuristics engine? If so, we build that first.
4. **Define Measurable Benchmarks**: If generative AI or RAG is justified, what is the exact baseline accuracy metric and cost per transaction we must beat?

---

### Question 16: What is the difference between a RAG system and a fine-tuned model for an enterprise deployment?
- **RAG (Retrieval-Augmented Generation)**:
  - Dynamically retrieves external documents from a vector store at query time and passes them into the model's context window.
  - *Best for*: Rapidly evolving factual knowledge (pricing plans, meeting room policies, member terms). Zero retraining cost; immediate updates when source documents change; verifiable citations; strict document-level access control.
- **Fine-Tuning**:
  - Permanently updates the model's internal neural network weights using a curated training dataset.
  - *Best for*: Teaching specialized tone, domain vocabulary, or structured syntax output (e.g. proprietary SQL dialect generation).
  - *Weakness*: Cannot reliably memorize fast-changing factual data and risks severe hallucination without context.

For Workn, RAG is the correct choice for member assistance because facility rules and pricing change frequently.

---

### Question 17: How do you evaluate whether an AI agent is working correctly in production?
Evaluating an agent requires automated, multi-dimensional benchmarking rather than subjective vibes:

1. **Retrieval Quality (RAG Triad)**:
   - *Context Relevance*: Did the vector search retrieve documents that actually answer the user's question?
   - *Groundedness (Faithfulness)*: Are all claims in the output directly supported by the retrieved context, or did the model hallucinate?
   - *Answer Relevance*: Does the response directly address the member's query?
2. **Determinism & Guardrails**: Evaluating whether tool-calling parameters validate against server-side Zod schemas before execution.
3. **Execution Latency & Cost**: Tracking Time-to-First-Token (TTFT), total latency, and token consumption per session.
4. **Regression Evals**: Running a golden test dataset of 100 historical queries on every deployment to ensure accuracy does not degrade.

---

### Question 18: How do you decide between local component state, context and an external state manager?
I follow the principle of least complexity:

1. **Local Component State (`useState`, `useTransition`)**: Used when state is private to a single component or its immediate children (e.g. input values, password visibility toggles, modal open/closed states). This covers 80% of application needs.
2. **React Context (`useContext`)**: Used for low-frequency, globally accessible state that rarely mutates (e.g. active color theme, authenticated member profile, locale).
3. **External State Manager (Zustand / Redux)**: Only justified when high-frequency state must be shared across disparate, deeply nested components with fine-grained selector re-render optimizations (e.g. real-time interactive floorplans with live seat reservations). Adding external stores for simple forms is unnecessary overhead.

---

### Question 19: How do you handle server state, as distinct from client state?
- **Client State**: Ephemeral UI state that lives strictly in browser memory (is this modal open, what did the user type in the filter input, which tab is active). It can be discarded on refresh with zero consequence.
- **Server State**: Persistent, shared state owned by the remote database (user accounts, meeting room availability, payment transaction ledgers). It is asynchronous, requires cache invalidation, and can be modified by other users simultaneously.

I treat server state as **untrusted and asynchronous**:
1. Server state is fetched via Server Components or cached hooks.
2. Mutations are executed through Server Actions or REST endpoints that revalidate cached tags (`revalidatePath`).
3. Client interfaces display optimistic feedback during transitions (`useTransition`), but strictly update authoritative UI only upon server confirmation.

---

### Question 20: Cite three specific numbers from your own Tasks 1 to 4: one from your type scale, one timing figure from your hashing comparison, and one from your rate limit configuration. Explain what each means and why you chose it. These must match docs/numbers-register.md exactly.
1. **Type Scale**: **`70px` (Display Large)** with line height **`105px` (1.5x)** (`--type-display-large-font-size: 70px`, `--type-display-large-line-height: 105px`). Space Grotesk Bold, chosen for hero headings to anchor brand impact without crowding ascenders and descenders.
2. **Hashing Comparison**: **`451.95 ms` (Bcrypt Cost 12 Timing)**. Benchmarked live on my CPU over 5 runs (Node v24.19.0, Windows x64). Cost 12 ($2^{12} = 4,096$ rounds) was chosen because it achieves sub-500ms login latency for legitimate users while forcing an 8-GPU attack rig to spend **8.6 years** cracking 8-character passwords, compared to 18.2 minutes with SHA-256 (`0.001712 ms`).
3. **Rate Limit Configuration**: **`5 attempts per 15 minutes`** on login (`RATE_LIMIT_POLICIES.login`). Chosen to permit genuine users to recover from honest typos while completely neutralizing automated credential stuffing.

---

### Question 21: Across all five tasks, name the decision you are least confident about. Say what you would need to find out to settle it, and what you would do if the answer went against you.
The decision I am least confident about is **choosing Hard Gating over Soft Gating for initial member onboarding**.

While Hard Gating provides absolute certainty that every account in PostgreSQL possesses a verified inbox, it introduces a measurable 15% to 20% drop-off in completed registrations due to cellular network SMS/email latency in Lagos. 

To settle this decision, I would need to analyze production funnel analytics over the first 60 days: tracking the drop-off rate between registration submission and code confirmation, alongside support tickets reporting missing verification emails. If data reveals that acquisition drop-off exceeds 25% and physical facility fraud remains negligible, I would switch to Soft Gating: issuing an immediate session on registration and restricting only paid workspace bookings and physical door access until verification completes.

---

### Question 22: Wrong-answer analysis: a candidate says that for GDPR compliance they added a delete account button that removes the user's row from the database immediately, so they are fully compliant with the right to be forgotten, and that they also keep backups for a year in case anyone needs their data restored. Identify each problem, say which is a legal exposure rather than a technical one, and say what the correct design is.
The candidate exhibits critical legal and technical flaws:

1. **Immediate Deletion Destroys Financial Records (Legal Exposure)**: Purging user rows immediately destroys transaction history, violating corporate laws (CAMA 2020 Section 375 and LIRS rules requiring 6-year retention). This is an unlawful destruction of tax records.
2. **Backups Retained One Year Without Purge Sync (Legal Exposure)**: Retaining erased personal data in un-rotated backups for a year without automated re-purge breaches GDPR Article 5(1)(e) and NDPA Section 34.
3. **Absence of Grace Period (Operational Exposure)**: Instant deletion makes accidental clicks or account takeovers irreversible.

**Correct Design**: Enforce a 30-day soft-delete grace period with immediate lockout and anonymization. Retain financial ledgers with detached pseudonymous keys for 6 years. Enforce 30-day rolling backup expiration with automated re-purge on restore.
