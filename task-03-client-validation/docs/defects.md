# Task 3 Defects Register

*Audit of genuine architectural, security, and implementation defects identified in Task 3, with exact file and line references, root causes, and production cost analysis.*

---

## Defect 1: Unvalidated Server-Side Ingestion and Third-Party Pass-Through

- **File Reference**: [`src/lib/auth/actions.ts` Lines 34–53](../../src/lib/auth/actions.ts#L34-L53)
- **Component**: `register(formData: FormData)` Server Action
- **Severity**: High (Security Boundary Failure)
- **Description**:
  The `register` Server Action extracts incoming user parameters (`fullName`, `email`, `password`) directly from untrusted `FormData` using `formData.get(...)` without applying any server-side validation schema (e.g., Zod), type assertions, regex format checks, or length bounding. The raw inputs are passed directly to `supabase.auth.signUp(...)`.
- **Root Cause**:
  In Task 3, validation was implemented exclusively on the client inside `AuthClient.tsx`. The server boundary was left intentionally open to demonstrate the direct request bypass in Step 8.
- **Production Cost**:
  If deployed to production, any malicious actor or script running `curl` or `fetch` can submit arbitrary strings—such as 1-character names, 10,000-character buffer overflow strings, or stored Cross-Site Scripting (XSS) payloads in `fullName`. Furthermore, terms acceptance (`acceptTerms`) is never validated, exposing the business to legal liability for creating accounts without binding contractual consent.
- **Resolution Plan**:
  In Task 4, implement a strict server-side Zod validation schema inside `src/lib/auth/actions.ts` that validates and sanitizes all fields, rejects malformed payloads with HTTP 400 Bad Request, and enforces mandatory `acceptTerms === true` with legal audit logging.

---

## Defect 2: Omission of PostgreSQL User Row and Phone Persistence

- **File Reference**: [`src/lib/auth/actions.ts` Lines 40–53](../../src/lib/auth/actions.ts#L40-L53)
- **Component**: `register` Authentication Flow
- **Severity**: High (Data Integrity & False Success)
- **Description**:
  Upon successful user creation in Supabase Auth, the server action immediately returns `{ success: true, message: 'Check your email to confirm your account.' }`. It does not execute a Prisma query to insert a corresponding application user row into the PostgreSQL `User` table, nor does it persist the member's sanitized phone number (`formData.get('phone')`), which is required for workspace access in Lagos.
- **Root Cause**:
  Decoupled authentication architecture where third-party identity management is not wrapped in an atomic local database transaction.
- **Production Cost**:
  Users receive confirmation of account creation, but exist as "orphans" in the database. When the member signs in and attempts to reserve a desk, deduct an hourly meeting room allowance, or view payment history, the database throws null foreign key exceptions (`memberId: null` or `userId not found`), breaking core member workflows.
- **Resolution Plan**:
  In Task 4, wrap registration in an atomic Prisma transaction (`prisma.$transaction`). Verify that both the Supabase identity and the PostgreSQL `User` record with profile attributes (full name, phone, role) are committed with a `201 Created` status before reporting success to the client.

---

## Defect 3: Disabled Submit Button Tab Order Eviction (Pre-Audit)

- **File Reference**: [`src/components/auth/AuthClient.tsx` Lines 993–1024](../../src/components/auth/AuthClient.tsx#L993-L1024)
- **Component**: `AuthClient` Registration Form Submit Button
- **Severity**: Medium (Accessibility Barrier / WCAG 2.1.1 Failure)
- **Description**:
  Prior to the Step 6 accessibility audit, the registration submit button used HTML native `disabled={!isRegReadyToSubmit}`. In browser rendering engines, native `disabled` elements are completely evicted from the sequential keyboard navigation order (equivalent to `tabindex="-1"`).
- **Root Cause**:
  Relying on native HTML button disabling without considering keyboard navigation order and screen reader focus semantics.
- **Production Cost**:
  Keyboard-only users, motor-impaired individuals using switch controls, and screen reader users navigating the form via `Tab` jumped completely past the submit button from the Terms checkbox to "Sign in instead." Users were given no programmatic explanation of why submission was unavailable, assuming the application was frozen or broken.
- **Resolution**:
  Resolved in Step 6 by replacing native `disabled` with `aria-disabled={!isRegReadyToSubmit}`, retaining keyboard focusability while preventing submission and triggering descriptive spoken alerts upon activation.
