# Email Verification Security & Protocol Design

## 1. Executive Summary

Workn implements an out-of-band email verification protocol enforcing account activation security prior to granting workspace resource reservations. The architecture addresses three critical engineering requirements:
1. **Cryptographically Secure Code Generation**: Eliminating entropy vulnerabilities in random token creation.
2. **Deterministic Expiry Window**: Balancing Nigerian telecommunications delivery latency against brute-force search space exposure.
3. **Decoupled Asynchronous Dispatch**: Isolating HTTP request threads from external SMTP latency spikes.

---

## 2. Code Generation: CSPRNG vs. Pseudo-Random Number Generators

Verification tokens are generated exclusively via Node.js `crypto.randomInt(100000, 1000000)` rather than the language default `Math.random()`.

```typescript
// SECURE: Cryptographically Secure Pseudo-Random Number Generator (CSPRNG)
const verificationCode = crypto.randomInt(100000, 1000000).toString();
```

### Vulnerability of Predictable PRNGs (`Math.random()`):
- Modern JavaScript engines (such as V8 in Node.js) implement `Math.random()` using algorithms like **xoshiro128+** or **XorShift128+**.
- These algorithms are designed for statistical performance, **not cryptographic secrecy**. Their internal state space consists of only 128 bits.
- **Attack Mechanics**: By registering several dummy accounts and observing 3 to 5 consecutive 6-digit codes emitted by `Math.random()`, an attacker can mathematically reconstruct the internal state matrix of the PRNG using Z3 constraint solvers. Once the seed is recovered, the attacker can deterministically calculate every upcoming verification code across the platform, hijacking accounts before legitimate members check their inboxes.
- **The CSPRNG Guarantee**: `crypto.randomInt()` interfaces directly with the operating system kernel entropy pool (`/dev/urandom` on Unix or `BCryptGenRandom` on Windows). It incorporates hardware environmental noise (disk interrupts, thermal sensors, memory timings), rendering forward prediction computationally impossible ($2^{256}$ entropy bounds).

---

## 3. Expiry Window Justification: 10 Minutes (600 Seconds)

Workn specifies an active lifetime of **10 minutes** (`600 seconds`) per verification token, as recorded in `Docs/numbers-register.md`.

### The Engineering Trade-off:

| Evaluation Factor | 2-Minute Window | 10-Minute Window (Workn Choice) | 60-Minute Window |
| :--- | :--- | :--- | :--- |
| **Local Cellular Latency** | Severe failure rate. In Lagos, mobile data network jitter (MTN, Airtel) frequently delays SMS and email delivery by 90–180 seconds. | **Optimal**. Accommodates ISP handoff latency, captive portals, and corporate spam firewall inspection delays. | Excessive. Leaves dormant codes exposed long after user abandonment. |
| **Attack Surface Window** | Extremely narrow, but severely degrades member conversion and triggers user frustration. | **Mathematically Protected**. Paired with rate limiting, brute force remains impossible. | Unacceptable. Allows prolonged offline or distributed dictionary attacks. |

### Mathematical Brute-Force Immunity:
- A 6-digit decimal PIN provides $10^6 = 1,000,000$ unique combinations.
- Workn's rate limiter restricts verification attempts to **5 attempts per 15-minute window**.
- Within a 10-minute expiry window, an attacker can issue at most 5 guesses before triggering an HTTP 429 lockout:
  $$\text{Probability of Successful Guess} = \frac{5}{1,000,000} = 0.0005\%$$
- To achieve a 50% probability of guessing the code, an attacker would require $500,000$ attempts. At 5 attempts per 15 minutes, this attack would require:
  $$\frac{500,000}{5} \times 15\text{ minutes} = 1,500,000\text{ minutes} \approx 2.85\text{ years}$$
- Consequently, extending the window from 2 to 10 minutes introduces zero measurable security exposure while completely eliminating drop-off caused by regional delivery jitter.

---

## 4. Failure Modes & State Enforcement

Workn models three explicit failure conditions inside `src/lib/email/verification.ts`:

```
               [Member Submits Verification Code]
                              │
                              ▼
           [Query Database for Active Token by Email]
                              │
            ┌─────────────────┴─────────────────┐
            ▼                                   ▼
    [No Record Found]                   [Record Exists]
            │                                   │
            ▼                                   ├─► If consumedAt !== null:
     HTTP 404 Failure                           │   Reject: "Code Reused" (Mode 3)
   "No active token"                            │
                                                ├─► If Date.now() > expiresAt:
                                                │   Reject: "Code Expired" (Mode 1)
                                                │
                                                ├─► If record.code !== input:
                                                │   Increment attempts count
                                                │   Reject: "Wrong Code" (Mode 2)
                                                │
                                                ▼
                                    [All Validations Pass]
                                    Set consumedAt = NOW()
                                    Set accountStatus = ACTIVE
                                    Return HTTP 200 OK
```

### 1. Code Expired (`20-verification-expired.png`)
Tokens submitted after `expiresAt` are rejected. Expired rows are preserved in the audit trail to track delivery drop-off.

### 2. Wrong Code (`21-verification-wrong-code.png`)
Mismatched entries increment the row's `attempts` counter and return a generic error. Multiple failures on the same key trigger the global rate limiter.

### 3. Code Reused (`22-verification-code-reused.png`)
Once verified, `consumedAt` is stamped with the current timestamp in a single atomic transaction. Any replay attempt using the same code is immediately refused, preventing token reuse attacks.

---

## 5. Architectural Performance: Synchronous vs. Asynchronous Queue

As demonstrated in `task-04-server-security/evidence/18-registration-timing-sync-vs-job.txt`:
- **Synchronous SMTP Round-Trip**: Bound the HTTP request thread for an average of **206.02 ms**.
- **Asynchronous Background Queue**: Handled database persistence and enqueued delivery via `setImmediate`, returning an HTTP response in **16.47 ms**.
- **Result**: A **12.5x speedup** (189.56 ms latency reduction) ensuring that external SMTP provider latency, connection timeouts, or TLS handshakes never block the client registration experience.

