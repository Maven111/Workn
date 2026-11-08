# Breached Password Verification Architecture

## 1. Executive Summary

Workn enforces a mandatory breached-password verification check exclusively during new user registration (`Task 4 Step 9`). Before an account identity is persisted to Supabase Auth or PostgreSQL, the candidate password is validated against the global corpus of exposed credentials maintained by the *Have I Been Pwned* (HIBP) repository (over 850 million compromised passwords).

This control enforces **NIST SP 800-63B (Section 5.1.1.2 Memorized Secret Verifiers)**, which mandates that verifiers compare proposed passwords against lists of compromised credentials obtained from previous data breaches.

---

## 2. The k-Anonymity Mathematical Model

The primary architectural challenge of breached password verification is privacy preservation: **How can a server verify whether a user's password exists in a remote database without revealing what that password is?**

Workn solves this using the mathematical model of **k-Anonymity**:

```
[User Input: "password123"]
         │
         ▼
[SHA-1 Hash: CBFDAC6008F9CAB4083784CBD1874F76618D2A97]
         │
         ├─── Prefix (First 5 chars): "CBFDA"  ──────►  [HaveIBeenPwned Range API]
         │                                                      │
         │                                                      ▼
         │                                             Returns ~2,000 suffixes 
         │                                             matching prefix "CBFDA"
         │                                                      │
         └─── Suffix (Last 35 chars): "C6008F9CAB4083784CBD1874F76618D2A97"
                                                                │
                                                                ▼
                                                       [Local In-Memory Search]
                                                       Match found: 2,266,543 times!
                                                                │
                                                                ▼
                                                       [HTTP 400 Refusal Issued]
```

### Mathematical Guarantee:
- A 5-character hexadecimal prefix represents $16^5 = 1,048,576$ possible buckets.
- Across a corpus of hundreds of millions of hashes, querying a 5-character prefix returns a bucket containing roughly **1,500 to 3,000 distinct suffixes**.
- An external eavesdropper or the HIBP service itself learns only that the user's password hash starts with those 5 characters. They cannot distinguish the user's secret from the thousands of other passwords sharing that identical prefix.

---

## 3. Why Naive Implementations are Unacceptable

Two alternative approaches are frequently proposed by naive developers. Both introduce fatal security vulnerabilities:

### Flaw 1: Sending Plaintext Passwords
* **The Naive Method**: Sending the raw password string via POST request to an external verification service.
* **Why It Is Unacceptable**:
  1. **Destroys Zero-Knowledge**: The third-party service provider immediately learns the user's actual password in cleartext.
  2. **Eavesdropping & MITM Exposure**: Any TLS inspection proxy, middlebox, or network tap gains visibility into the raw credential.
  3. **Logging Liability**: The external service's access logs and reverse proxies capture user credentials, creating an enormous target for secondary breaches.
  4. **Legal & Regulatory Non-Compliance**: Explicitly violates data protection mandates (NDPA, GDPR) by transmitting unhashed authenticators to unauthorized third parties.

### Flaw 2: Sending the Full SHA-1 Hash
* **The Naive Method**: Hashing the password locally with SHA-1 and querying `api.pwnedpasswords.com/hash/CBFDAC6008F9CAB4083784CBD1874F76618D2A97`.
* **Why It Is Unacceptable**:
  1. **Rainbow Table Inversion**: SHA-1 is a fast, unsalted hashing algorithm. An attacker or third-party observer can reverse known hashes in microseconds using precomputed rainbow tables.
  2. **Deterministic Fingerprinting**: The external service can record the IP address and exact hash, establishing a database of which users are submitting which specific passwords.
  3. **Destroys Privacy**: It provides zero anonymity, transforming a security check into an active surveillance vector.

---

## 4. Workn Implementation Architecture

The verification pipeline is encapsulated within `src/lib/security/breach-check.ts` and enforced during registration in both the Next.js Server Action (`src/lib/auth/actions.ts`) and the REST API boundary (`src/app/api/auth/register/route.ts`).

### Algorithmic Steps:
1. **Local Digest Generation**:
   The proposed password is converted to an uppercase 40-character hexadecimal SHA-1 digest using Node.js `crypto.createHash('sha1')`.
2. **Prefix Isolation**:
   The string is sliced at index 5. The first 5 characters (`prefix`) are queued for the network query; the remaining 35 characters (`suffix`) are isolated in server memory.
3. **Padded Range Request**:
   The server issues an HTTPS GET request to `https://api.pwnedpasswords.com/range/${prefix}` with the `Add-Padding: true` header. This header instructs the API to inject random dummy records, preventing response-length side-channel attacks.
4. **Local Range Comparison**:
   The returned lines (formatted as `HASH_SUFFIX:OCCURRENCE_COUNT`) are parsed in memory. If a line matches the isolated suffix, the candidate password is confirmed compromised and its breach count is extracted.
5. **Fail-Open Resilience**:
   A strict 3.5-second timeout via `AbortController` guards the request. If the HIBP API suffers an outage or network timeout, the function logs a warning and fails open (`isBreached: false`). A third-party service degradation must never permanently prevent legitimate users from registering.

---

## 5. Verification & Test Evidence

The mechanism was verified on the Builder's CPU using `scripts/test-breach-check.mjs`.

### Test 1: Compromised Password (`password123`)
* **Computed SHA-1**: `CBFDAC6008F9CAB4083784CBD1874F76618D2A97`
* **Prefix Transmitted**: `CBFDA`
* **Suffix Matched Locally**: `C6008F9CAB4083784CBD1874F76618D2A97`
* **HIBP Result**: **BREACHED** (Observed **2,266,543 times** across public data breaches).
* **Application Behavior**: Registration rejected with HTTP 400.

### Test 2: High-Entropy Custom Password (`WorknLag0s!StrongComplex#2026`)
* **Computed SHA-1**: `880DB7F949AE52A3BD9064904CF3B8A6377B175D`
* **Prefix Transmitted**: `880DB`
* **HIBP Result**: **CLEAN** (0 occurrences in breach corpus).
* **Application Behavior**: Request permitted to continue to account creation.

### Evidence Deliverable:
- UI Rejection Capture: `task-04-server-security/evidence/15-breach-check-rejection.png`

