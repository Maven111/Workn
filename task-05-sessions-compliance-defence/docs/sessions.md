# Session Architecture, Security Guarantees & Threat Modelling

## 1. Summary

In Workn's security model, authentication establishes identity (who the user is), while session management preserves that identity across stateless HTTP requests. 
---

## 2. Cryptographic Token Generation & Hashed Storage

### 2.1 The Two-Tier Token Pattern
Workn implements a two-tier session token model:
1. **The Client Tier (Raw Token)**:
   - Generated using Node.js cryptographically secure pseudo-random number generator: `crypto.randomBytes(32).toString('hex')`.
   - Produces a 64-character hexadecimal string with **256 bits of entropy** ($2^{256}$ possible combinations).
   - Transmitted to the browser via an HTTP-only cookie (`workn_session`).
2. **The Server Tier (Hashed Digest)**:
   - The database **never** stores the raw session token.
   - Prior to insertion, the server computes a one-way cryptographic hash:
     $$\text{sessionTokenHash} = \text{SHA-256}(\text{rawToken})$$
   - Only this 64-character hash is persisted in the PostgreSQL `Session` table.

### 2.2 Security Justification: Pre-Image Resistance Under Data Breach
If an adversary compromises the database (via SQL injection, unauthorized backups access, or read replica exposure), storing raw session tokens would hand the attacker immediate, active access to every logged-in user account, bypassing passwords, multi-factor authentication, and IP restrictions.

Because Workn persists strictly the SHA-256 digest:
- The raw token has 256 bits of entropy, rendering rainbow tables and offline brute-force attacks computationally infeasible ($1.15 \times 10^{77}$ combinations).
- The attacker cannot reverse the hash to reconstruct the raw token required for the `Cookie` header.
- The stolen database rows are completely useless for session impersonation.

---

## 3. Session Hijacking & Exploitation Mechanics

### 3.1 What is Session Hijacking?
Session hijacking (or cookie theft) occurs when an unauthorized party intercepts or steals a legitimate user's active session token. Because HTTP is stateless, the server trusts any incoming request bearing a valid session identifier that maps to an active database record.

### 3.2 How an Attacker Uses a Stolen Token
Once an attacker acquires the raw session token:
1. They bypass the login interface entirely. They do not need to know the user's password, bypass bcrypt verification, or solve CAPTCHAs.
2. They inject the token into their browser's cookie jar (via developer tools or an automated HTTP client like `curl`):
   ```bash
   curl -H "Cookie: workn_session=240b988a02ebdf1724e4abfe6b8e6583fb33f056d27de410577545e9497cfbdf" \
        https://workn.ng/dashboard
   ```
3. When the request arrives at Workn's server, the middleware and `getCurrentUser()` hash the submitted cookie, query the database, find the corresponding active record, and grant full access to the victim's profile, workspace bookings, and payment instruments.

---

## 4. The Anatomy of Logout: Server Invalidation vs. Client Erasure

### 4.1 The Flawed Client-Side Pattern
Many web applications implement logout simply by deleting the cookie in the user's browser (e.g. `document.cookie = "session=; max-age=0"`). 

**Why this is dangerous**: If an attacker or malicious network observer has already copied the token prior to logout (e.g. via an insecure public Wi-Fi access point or local malware), deleting the token on the victim's machine leaves the token **100% active on the server**. The attacker can continue using the stolen token indefinitely until the natural expiration time.

### 4.2 Workn's Authoritative Server-Side Invalidation
Workn enforces authoritative two-step destruction in `destroySession()`:
1. **Server-Side Revocation**:
   - The server hashes the active cookie, locates the row in PostgreSQL, and sets `revokedAt = NOW()` (or removes the row).
   - Any future request presenting this token is immediately rejected by `validateSessionToken()`, returning `null`.
2. **Client-Side Clearance**:
   - The response emits an expired `Set-Cookie` header with `Max-Age=0` and `expires=1970-01-01` to purge the value from browser storage.

Once `destroySession()` executes, even if an attacker possesses the raw token, it is dead on the server.

---

## 5. Defense-in-Depth: Limiting the Blast Radius

To minimize damage in the event of token exposure, Workn layers five defensive controls:

| Defensive Control | Implementation | Threat Mitigated |
| :--- | :--- | :--- |
| **`HttpOnly` Flag** | Cookie attribute set on server | Prevents Cross-Site Scripting (XSS) attacks from accessing `document.cookie`. Even if an injected script executes, it cannot exfiltrate the session token. |
| **`Secure` Flag** | `secure: process.env.NODE_ENV === 'production'` | Restricts cookie transmission strictly to encrypted HTTPS connections, preventing plaintext sniffing over unencrypted local networks. |
| **`SameSite=Lax` Flag** | Cookie attribute set on server | Blocks cross-site request forgery (CSRF) on state-changing requests, ensuring third-party websites cannot trick the browser into submitting authenticated actions. |
| **Strict 7-Day Window** | `SESSION_MAX_AGE_SECONDS = 604800` | Limits the temporal window of exploitation. An unrevoked session automatically expires after 7 days, preventing indefinite persistence. |
| **Cascade Revocation on Reset** | `revokeAllUserSessions(userId)` | When a member triggers a password reset or reports compromise, Workn revokes **all** active sessions across all devices simultaneously, kicking out active attackers. |
| **Client Context Auditing** | `ipAddress` and `userAgent` stored in row | Enables security monitoring to detect anomalous geographic IP shifts or browser fingerprint mutations during an active session. |

---

## 6. Verification Evidence Reference

- **Dual Fresh Token Generation**: [`task-05-sessions-compliance-defence/evidence/01-two-session-ids.txt`](file:///c:/Users/man/Desktop/Workn/task-05-sessions-compliance-defence/evidence/01-two-session-ids.txt)
- **Token Parameters**: Registered in [`Docs/numbers-register.md`](file:///c:/Users/man/Desktop/Workn/Docs/numbers-register.md) lines 60–63 (256-bit CSPRNG entropy, 7-day TTL).

