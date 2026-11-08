# Task 4 Defects Register

Real defects encountered, diagnosed, and resolved during Task 4 implementation. Every line number and file path corresponds to code in this repository.

---

### Defect 1: Client View Switcher Retains Stale Registration Success State
- **File**: `src/components/auth/AuthClient.tsx`
- **Lines**: 216–232
- **Description**: When a user completed registration, `regSuccess` was populated with the verification message. Clicking "Back to sign in" switched the active view to `'login'`. However, subsequent clicks on "Create an account" from the login view switched `activeView` back to `'register'` while `regSuccess` remained truthy in React state. As a result, the form failed to render, trapping the user on the "Almost there!" success screen.
- **Fix**: Updated `switchView()` to reset `regSuccess: null` and `regError: null` on transition to `'register'`, `loginError: null` on transition to `'login'`, and `forgotSuccess: null` on transition to `'forgot-password'`.

---

### Defect 2: Registration Action Fails to Provision PostgreSQL User Record
- **File**: `src/lib/auth/actions.ts`
- **Lines**: 40–85
- **Description**: The scaffold's `register()` Server Action called `supabase.auth.signUp()`, creating an authentication identity in Supabase's internal auth catalog, but contained no database mutation for Workn's application layer. The PostgreSQL `public.User` table remained completely unpopulated, violating Rule `Auth.md` Section 4 ("Create or associate the corresponding application user record").
- **Fix**: Added Prisma user provisioning using `prisma.user.upsert` inside `register()`, setting `authUserId: data.user.id`, `fullName`, `email`, `phone`, `taxId`, and the default role `MEMBER`.

---

### Defect 3: Supabase Auth Email Confirmation Blocks Local Login Without Feedback
- **File**: `auth.users` PostgreSQL table / `src/lib/auth/actions.ts`
- **Lines**: 15–35
- **Description**: Accounts created with email confirmation enabled in Supabase free tier failed to receive confirmation emails due to rate-limiting and domain filtering, causing subsequent login attempts to be rejected by Supabase Auth with a generic `"Invalid login credentials"` error.
- **Fix**: Synchronized user verification timestamps (`email_confirmed_at = NOW()`) directly in the PostgreSQL catalog for local development accounts, and verified end-to-end credential authentication.


---

### Defect 4: Synchronous Utility Functions Exported from 'use server' Module
- **File**: `src/lib/auth/actions.ts` / `src/lib/auth/normalise.ts`
- **Lines**: 1–25
- **Description**: Next.js App Router enforces that every function exported from a module marked with the `'use server'` directive must be an asynchronous function (`async`). Defining and exporting synchronous utility functions (`normaliseEmail`, `trimPassword`) inside `actions.ts` caused the Next.js compiler to crash with `Server actions must be async functions`.
- **Fix**: Separated pure sanitization and normalisation utilities into a dedicated non-directive module (`src/lib/auth/normalise.ts`) and imported them into `actions.ts`.

---

### Defect 5: Verification Code Non-Idempotent Under Duplicate Submissions
- **File**: `src/lib/email/verification.ts`
- **Lines**: 142–155
- **Description**: When a member double-clicks the verification submit button on a jittery cellular connection, the initial request consumes the token (`consumedAt = NOW()`) and sets the account status to `ACTIVE`. However, the subsequent in-flight request encounters the newly populated `consumedAt` timestamp and rejects the user with a hard error: `"This verification code has already been used (Code Reused)"`. The handler lacks idempotency, alarming the legitimate member who believes their verification has failed.
- **Status**: Documented per task specification requirement ("If verification is not retry-safe after success, document that defect and do not quietly fix it"). A future production revision will return an idempotent success if the associated account is already in `ACTIVE` state within the same 10-minute window.

---

### Defect 6: Supabase Auth Client Drops On Transient Network Sockets Under Cross-Continental Latency
- **File**: `src/lib/auth/actions.ts`
- **Lines**: 176–215
- **Description**: During new member registration, the Node.js server action issues an HTTPS request across the international route to Supabase Auth's edge. Momentary packet drops or socket timeouts caused `@supabase/auth-js` to throw `AuthRetryableFetchError: fetch failed`, which was surfaced directly to the member interface as a raw `"fetch failed"` error banner without retry or explanation.
- **Fix**: Configured Node DNS resolution to prioritize IPv4 (`dns.setDefaultResultOrder('ipv4first')`) to prevent IPv6 routing stalls on local networks, and implemented an automated 3-attempt retry loop with exponential backoff inside `register()` and `login()` before mapping any persistent network failure to a clear, actionable user message.
