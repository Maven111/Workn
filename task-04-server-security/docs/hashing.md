# Hashing Architecture: Why Fast Is Wrong and the Mathematics of Password Security

- **Task**: Task 4 Step 4 Deliverable
- **Subject**: Bcrypt Work Factor Calibration, Non-Deterministic Salting, and Brute-Force Arithmetic
- **Evidence References**:
  - `evidence/07-hash-twice-different.txt`
  - `evidence/08-timing-argon-vs-sha.txt`
  - `Docs/numbers-register.md`
- **Benchmarked Hardware**: Builder Machine (Platform: `win32 x64`, Node.js: `v24.19.0`)
- **Author**: Builder Assessment Team

---

## 1. Executive Summary & Machine Timing Numbers

Password hashing serves a fundamentally different purpose from cryptographic checksums or digital signatures. A general-purpose hash function (such as SHA-256 or MD5) was engineered to calculate digests of megabytes of data in microseconds. When applied to passwords, this high throughput becomes a critical vulnerability.

To prove this quantitatively, a hardware benchmark was executed on the Builder's machine comparing **bcrypt (work factor 12)** against **SHA-256** on the exact same password (`WorknSecureMember2026!`):

| Metric | SHA-256 | Bcrypt (Cost Factor 12) | Disparity / Ratio |
| :--- | :--- | :--- | :--- |
| **Average Time per Hash** | **0.001712 ms** ($1.712\ \mu\text{s}$) | **451.95 ms** | **264,041x slower** |
| **Single-Core Throughput (Builder CPU)** | **~584,221 guesses / sec** | **~2.21 guesses / sec** | Attacker throttled by 5 orders of magnitude |
| **8x NVIDIA RTX 4090 Dedicated GPU Rig** | **~200,000,000,000 hashes / sec** (200 GH/s) | **~800,000 hashes / sec** (800 kH/s) | Bcrypt resists massive parallelization |
| **Time to Crack 8-Char Alphanumeric ($62^8$)** | **18.2 minutes** (Total Collapse) | **8.6 YEARS** (Infeasible) | Proves cryptographic survivability |

---

## 2. The Asymmetric Inversion in Plain Words

In application security, the performance economics of password hashing are deliberately inverted:

> **When a legitimate Workn member logs in to the platform, the server executes exactly one hash verification.** A delay of **451.95 ms** is completely imperceptible to a human sitting at a browser—it feels instantaneous and fits comfortably within standard network round-trip expectations.
>
> **However, when an attacker steals a database dump and attempts an offline brute-force attack, they must compute that hash billions or trillions of times.** That identical 451.95 ms delay, multiplied across billions of candidate dictionary words, destroys the attacker's economics. Slowing the algorithm costs the business nothing, but costs an adversary an entire lifetime of electricity, specialized hardware, and compute time.

---

## 3. Salting: Mechanics, Automation, and What Happens If Skipped

### What a Salt Is
A cryptographic salt is a sequence of cryptographically secure random bytes concatenated with the plaintext password prior to hashing. In bcrypt, a **128-bit (16-byte)** random salt is generated fresh for every single hashing operation using the platform's cryptographically secure pseudorandom number generator (CSPRNG).

### Does Bcrypt Handle Salting Automatically?
**Yes.** Unlike primitive hash functions where the engineer must manually generate random bytes, store them in a separate database column, and concatenate them during query execution, bcrypt generates, embeds, and parses the salt natively within the resulting modular crypt format string:

```
$2b$12$6AsmBo.KwqffdN8cCgCWOuidPLzV.3sCodfnm24TTmlGFNQi46rGe
├───┼──┼──────────────────────┼──────────────────────────────┤
 │   │  │                      └─ 31-char ciphertext hash
 │   │  └─ 22-char base64 salt (128 bits of CSPRNG entropy)
 │   └─ Cost factor (12 rounds -> 2^12 = 4,096 iterations)
 └─ Algorithm identifier (bcrypt revision 2b)
```

In our live test (`evidence/07-hash-twice-different.txt`), hashing `WorknSecureMember2026!` twice produced:
- Hash 1: `$2b$12$6AsmBo.KwqffdN8cCgCWOuidPLzV.3sCodfnm24TTmlGFNQi46rGe`
- Hash 2: `$2b$12$MMep/WQe0raCqJbtIlsY5OL5aUhIKD53X5n87ptk1eCwpKTkHezQ.`

Both hashes validated as `true` against the original password, despite sharing zero common ciphertext characters.

### What an Attacker Could Do If Salting Were Skipped
If salting were skipped (or if a static global salt were used):
1. **Precomputed Rainbow Table Attacks**:
   An attacker can download precomputed lookup tables containing billions of plaintext-to-hash mappings and crack stolen passwords via $O(1)$ dictionary lookups without performing any hashing calculations.
2. **Cross-User Identical Password Revelation**:
   If ten members in Workn choose the password `LagosWorkspace2026!`, unsalted hashes would store the exact same string in the database. An attacker cracking one user instantly cracks all ten.
3. **Batch Parallel Cracking**:
   An attacker testing a single candidate guess checks that guess against every user in the table simultaneously, reducing the attack complexity from $O(U \times K)$ to $O(K)$, where $U$ is the user count and $K$ is the keyspace.

---

## 4. Why Fast Is Wrong: General Hashing vs. Key Derivation Functions

Algorithms like SHA-256, SHA-512, and MD5 are **fast digest functions** designed for:
- Data integrity verification (e.g. verifying a 4 GB ISO file download).
- Content addressing and HMAC message authentication.
- Blockchain proof-of-work.

In those domains, processing gigabytes per second is a core design feature. However, when applied to passwords:
1. **Hardware Acceleration Vulnerability**:
   SHA-256 requires minimal internal state and simple bitwise operations (AND, OR, XOR, ROTATE) that map directly to silicon logic gates. An off-the-shelf GPU contains thousands of ALU cores that execute SHA-256 in parallel at tens of billions of hashes per second.
2. **ASIC Dominance**:
   Application-Specific Integrated Circuits (ASICs) built for Bitcoin mining compute trillions of SHA-256 hashes per second per watt. Storing passwords with SHA-256 renders the database trivial to reverse within seconds of exfiltration.

By contrast, **bcrypt** is an **adaptive key derivation function** based on the Blowfish block cipher. It utilizes an expensive key setup phase (*Eksblowfish*) that:
- Reads and writes to internal 4 KB S-boxes in a pseudo-random pattern.
- Forces high cache access and memory bandwidth, which severely degrades GPU parallelization because GPUs share small cache memory across massive thread warps.
- Allows tuning the computational cost via the work factor without altering the underlying algorithm.

---

## 5. Work Factor Calibration: Why Cost Factor 12 Was Chosen

The bcrypt cost parameter $C$ is logarithmic: the work doubles with every increment ($2^C$ iterations):
- Cost 10: $2^{10} = 1,024$ rounds (~110 ms on Builder hardware)
- Cost 11: $2^{11} = 2,048$ rounds (~225 ms on Builder hardware)
- **Cost 12: $2^{12} = 4,096$ rounds (451.95 ms on Builder hardware)**
- Cost 13: $2^{13} = 8,192$ rounds (~900 ms on Builder hardware)

### Defense of Cost Factor 12 for Workn:
1. **Human Perception Boundary**:
   According to Nielsen Norman Group interface responsiveness standards, delays under 500 ms are perceived as smooth system feedback. At **451.95 ms**, bcrypt provides maximum cryptographic hardening while remaining comfortably within the human interactive threshold.
2. **Denial of Service (DoS) Threshold**:
   Cost 13+ pushes single-thread execution near or above 1,000 ms, making the authentication endpoint vulnerable to thread exhaustion under concurrent login traffic. Cost 12 represents the optimal industrial balance recommended by OWASP and NIST SP 800-63B.
3. **Future Adaptability**:
   As hardware improves over the next decade, Workn can increment the work factor to 13 on subsequent password changes without invalidating existing hashes, because the cost factor is self-describing in the hash header.

