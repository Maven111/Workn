Hard Gating vs. Soft Gating

## 1. Definitions & Implementation Mechanics

### 1.1 Hard Gating (Shipped as Primary for Workn)
In a Hard Gated onboarding pipeline:
1. **Account Creation**: The user submits registration credentials (name, email, phone, password, terms).
2. **State Assignment**: The server provisions the `User` record in PostgreSQL with `accountStatus: 'INACTIVE'` (or `PENDING_VERIFICATION`).
3. **Session Denial**: **Zero** session tokens or authentication cookies are issued. The user is strictly prevented from accessing authenticated routes (`/dashboard`, `/membership`, `/bookings`).
4. **Verification Gate**: The user is presented with the 6-digit confirmation PIN view (`/auth?view=verify`).
5. **Activation**: Upon submitting the valid CSPRNG code, the database updates `accountStatus: 'ACTIVE'` and consumes the token.
6. **Explicit Login**: The user must manually navigate to sign-in and authenticate with their credentials to receive their first `workn_session` cookie.

### 1.2 Soft Gating (Evaluated on Branch)
In a Soft Gated onboarding pipeline:
1. **Account Creation**: The user submits registration credentials.
2. **Immediate Session**: The server immediately creates an active session (`createSession()`), writes the `workn_session` cookie, and logs the user directly into `/dashboard`.
3. **Asynchronous Verification**: An email verification job is queued in the background. The user explores the application while an un-intrusive banner prompts: *"Please confirm your email address to unlock resource booking and payment features."*
4. **Conditional Permission Gating**: High-risk operations (e.g., executing a Paystack payment, booking a private meeting room, unlocking IoT door access) are blocked at the action level until verification completes.

## 2. Why Workn Ships Hard Gating

The decision to enforce Hard Gating is driven by the physical and financial realities of operating coworking facilities in Lagos, Nigeria:

### 2.1 Physical Facility Liability & Security
Unlike purely digital SaaS platforms (e.g. project management tools), Workn provisions **physical access to real-world commercial premises** across Lagos hubs (Lekki Phase 1, Victoria Island, Ikeja). 
- Members receive automated QR codes and PINs for electronic turnstiles, private meeting booths, and high-speed dedicated fiber networks.
- Allowing unverified accounts to establish authenticated sessions creates a critical physical security exposure: malicious actors could provision fraudulent accounts using stolen identity fragments to survey spaces, access premises, or consume resources before vanishing.

### 2.2 Combating Fake Registrations & Disposable Bots
In high-growth digital markets, automated credential-stuffing bots and disposable email providers frequently register ghost accounts. Hard gating ensures that every account in Workn's active user table is tethered to a functional, monitored inbox.

### 3.3 Financial & Regulatory Compliance (LIRS & NDPA)
In Nigeria, corporate facility access and commercial workspace invoicing carry tax reporting obligations under the Lagos State Internal Revenue Service (LIRS). Tax identification numbers (`taxId`) and member identities must be verifiable. Providing authenticated platform access to unverified inboxes increases compliance risk.

---

## 4. The Cost of Hard Gating: Drop-off & Conversion Friction

Security controls inherently introduce operational friction. In digital product analytics, hard gating introduces a measurable drop-off:

| Metric | Soft Gating | Hard Gating | Impact of Hard Gating |
| :--- | :--- | :--- | :--- |
| **Initial Registration Completion** | 82% – 88% | 62% – 70% | **15% – 20% conversion drop-off** |
| **Time to First Value (TTFV)** | < 10 seconds | 2 – 5 minutes | Substantially delayed by email network latency |
| **Cellular Network Vulnerability** | Immune | High | Network jitter on local telcos (MTN/Airtel) can delay email delivery by 1–3 minutes, leading users to abandon the tab |
| **Support Overhead** | Low (initial) | Moderate | Users who mistype their email or experience spam-folder routing require resend logic |

By choosing Hard Gating, Workn accepts a **15% to 20% drop-off in completed registrations** in exchange for a **100% verified member base**, eliminating ghost accounts and securing physical workspaces.

---

## 5. The Condition That Would Make Workn Switch

Workn would transition to Soft Gating if and only if:

1. **Product Decoupling (Digital-Only Tier)**:
   - If Workn introduces a purely digital, zero-liability freemium offering (such as a digital founder community forum, job board, or downloadable tech ecosystem reports) that does **not** grant physical facility access or process financial transactions.
2. **Verified Payment as an Alternative Gate**:
   - If payment verification (e.g. a successful 3D-Secure card authorization via Paystack) replaces email confirmation as the primary identity gate. In that model, entering payment details proves identity and financial commitment, rendering upfront email confirmation redundant.

---

## 6. Evidence & Dual-Flow Implementation

- **Hard Gating Flow Evidence**: Captured in [`task-05-sessions-compliance-defence/evidence/04-hard-gating-flow`](file:///c:/Users/man/Desktop/Workn/task-05-sessions-compliance-defence/evidence/04-hard-gating-flow).
- **Soft Gating Flow Evidence**: Captured on branch `feat/soft-gating` in [`task-05-sessions-compliance-defence/evidence/03-soft-gating-flow`](file:///c:/Users/man/Desktop/Workn/task-05-sessions-compliance-defence/evidence/03-soft-gating-flow).

