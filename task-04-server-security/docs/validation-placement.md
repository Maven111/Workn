# Server-Side Boundary Validation: Architecture, Placement, and Lifecycle.

- **Subject**: Request Boundary Placement, Execution Sequence, and Declarative Schema Architecture.
## 1. Where in the Request Lifecycle Validation Sits

In robust application security, **validation must sit at the absolute perimeter boundary** of the server application layer. It acts as an immutable customs checkpoint: untrusted data entering over the public Internet must be strictly parsed, validated, and normalized before any internal software subsystem touches it.

```mermaid
flowchart LR
    A["Raw Internet Traffic"] --> B["TLS & Reverse Proxy"]
    B --> C["IP Rate Limiter"]
    C --> D["Body Parser"]
    D --> E["⚡ Zod Boundary Validation"]
    E -->|Invalid (400 Refusal)| F["Immediate Rejection (Safe Exit)"]
    E -->|Valid Typed Data| G["Domain Logic & Database (Prisma)"]
    G --> H["Expensive Operations (Bcrypt / Paystack)"]
```

In Workn's Next.js architecture, this boundary is enforced directly at the entry point of every Server Action (`actions.ts`) and Route Handler (`/api/auth/register`):
```typescript
// Incoming untrusted request
export async function register(formData: FormData) {
  // Step 1: Boundary Schema Parsing (Executes in <0.002 ms)
  const parsed = RegisterSchema.safeParse(rawPayload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }
  // Step 2: Only validated, sanitized data reaches downstream services
  const { fullName, email, password } = parsed.data;
  ...
}
```

## 2. What Runs Before Validation

Only low-cost, protocol-level operations necessary to prepare the raw byte stream may run before schema validation:

1. **TLS / SSL Termination**:
   Decryption of HTTPS traffic at the reverse proxy or load balancer boundary.
2. **Network & Transport Layer Filtering**:
   Edge filtering of malformed HTTP packets, oversized request payload drops (e.g. rejecting payloads >1 MB before buffering), and IP-level DDoS throttling.
3. **HTTP Header & Origin Checks**:
   CORS verification, `Host` header validation, and CSRF token verification where applicable.
4. **Body Deserialization**:
   Decoding incoming bytes according to `Content-Type` (`application/json` or `application/x-www-form-urlencoded`) into a raw in-memory dictionary.

---

## 3. What Must NEVER Run Before Validation

Executing expensive or stateful operations before validation is an architectural defect that exposes the server to severe Denial of Service (DoS) and data corruption vulnerabilities:

1. **Database Queries Must Never Run Before Validation**:
   - *Vulnerability*: If the server queries PostgreSQL (`prisma.user.findUnique()`) before validating field shapes, an attacker sending millions of garbage requests will exhaust the database connection pool, spike database CPU utilization, and lock out legitimate users.
   - *Rule*: Never allocate a database connection to inspect an invalid request.
2. **Password Hashing & Verification (Bcrypt / Argon2id) Must Never Run Before Validation**:
   - *Vulnerability*: As proven in our Task 4 Step 4 benchmark (`evidence/08-timing-argon-vs-sha.txt`), calculating a bcrypt hash with work factor 12 consumes **451.95 ms of CPU time**. 
   - If password hashing runs before checking whether the username or email is valid, an adversary can send just 10 concurrent requests per second to completely freeze the server's CPU cores.
   - *Rule*: Password hashing and cryptographic key derivation must run only after all schema assertions have passed.
3. **External Third-Party API Calls (Paystack, Supabase, SMTP)**:
   - Calling remote payment gateways, third-party identity providers, or email delivery dispatchers before input validation introduces massive latency, billing costs, and unrecoverable partial failure states.
4. **Domain State Mutation**:
   - Creating pending bookings, generating ledger credits, or creating temporary tokens must never occur prior to complete boundary consensus.

---

## 4. Why a Declarative Schema Beats Hand-Written Checks

Hand-written validation using imperative `if/else` statements is common in amateur codebases, but fails in production:

```typescript
// Anti-Pattern: Hand-written procedural checks
if (!name || name.length < 3) return "Name too short";
if (!email || !email.includes("@")) return "Bad email";
if (!password || password.length < 8) return "Bad pass";
// Easy to forget, inconsistent error shapes, zero type inference
```

### Advantages of Declarative Zod Schemas:

| Criterion | Hand-Written `if/else` Checks | Declarative Zod Boundary Schema |
| :--- | :--- | :--- |
| **Type Safety** | Disconnected from TypeScript types; requires manual duplicate type declarations. | Single source of truth. TypeScript types are inferred automatically via `z.infer<typeof Schema>`. |
| **Error Aggregation** | Typically "fails fast" on the first failure, forcing users to submit forms multiple times to see all errors. | Collects and reports all field errors across the entire payload in a single pass (`error.flatten()`). |
| **Over-Posting Defense** | Vulnerable to prototype pollution and unexpected payload properties. | Automatically strips unknown fields, preventing attackers from injecting unapproved attributes. |
| **Normalisation & Transformation** | Requires scattered `.trim()` and `.toLowerCase()` calls across multiple handlers. | Transforms data natively during validation (`.transform()`), ensuring downstream handlers receive clean data. |
| **Maintainability** | Rules duplicated across registration, login, profile updates, and admin APIs. | Centralized schema module imported across all server actions, route handlers, and test suites. |

---

## 5. Performance Overhead Analysis

As measured directly on the Builder's CPU (`evidence/11-validation-timing.txt`):
- **Raw unvalidated read**: `0.000075 ms` ($0.075\ \mu\text{s}$)
- **Zod boundary parsing & transformation**: `0.002019 ms` ($2.019\ \mu\text{s}$)
- **Latency overhead added**: **$1.944\ \mu\text{s}$ per request**
- **Throughput capacity**: **~495,374 validated requests per second per core**

At under 2 microseconds, boundary validation is computationally free compared to network transport latency (~50–100 ms) and password hashing (~450 ms). It provides absolute defense with zero user-discernible performance impact.

