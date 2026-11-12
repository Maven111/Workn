# The Architecture of Ease: Workn Technical Onboarding Handbook.

*How Workn is designed, structured and engineered to make workspace management simple*

## Introduction & Philosophy

Welcome to the Workn codebase. This handbook is not an abstract architectural manifesto; it is a field manual forged through five rigorous development sprints building a commercial workspace platform in Lagos, Nigeria.

Every pattern here was learned through real friction: dealing with intermittent power, fragile cellular data networks, shared kiosk security risks, and conflicting Nigerian statutory mandates. As you build upon this foundation, treat every convention not as ceremonial red tape, but as a deliberate defense against a real failure that already cost us time, security, or compliance sanity.

---

## Section 1: Typography, Shadows, and the Design System Export

### 1. The Concept in Plain Words
A **design token** is a single, authoritative variable representing a repeatable visual attribute—such as a specific font size, line-height ratio, or elevation shadow level. Rather than scattering arbitrary hex color codes, raw pixel measurements, or handcrafted CSS shadow strings throughout individual components, design tokens export a centralized design language into machine-readable CSS Custom Properties (`var(--token-name)`).

### 2. Why It Exists (The Failure It Prevents)
Without design tokens, a team inevitably suffers from **visual fragmentation** and **styling drift**. Different engineers implement cards with slightly differing border radii (`8px` vs `10px`), inconsistent box shadows (`rgba(0,0,0,0.1)` vs `rgba(0,0,0,0.25)`), and arbitrary font sizes. When the business introduces Dark Mode or rebrands typography, engineers must manually inspect and modify hundreds of disparate files. Tokens enforce a single source of truth across both design and engineering tools.

### 3. Real Scenario: Folake's Floating Modal
Folake, an engineer on our team, was tasked with building the resource booking confirmation modal and the day-pass pricing card. Working quickly from Figma screenshots, she manually wrote:
```css
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
font-size: 15px;
color: #333333;
```
When placed on top of the dashboard's neutral background, her modal looked visually disconnected from the rest of the workspace cards. More critically, when dark mode was toggled, her modal rendered dark charcoal text against a dark grey background—making the text completely invisible and failing WCAG 2.1 contrast minimums.

### 4. How It Is Done
1. Design tokens are exported from Figma into a standardized CSS Custom Properties file (`src/app/globals.css`).
2. Scales are strictly categorized into semantic tiers:
   - **Type Scale**: `--type-body-small-font-size: 13px;`, `--type-body-default-font-size: 15px;`, `--type-headline-h2-font-size: 24px;`.
   - **Elevation Shadows**: `--shadow-sm`, `--shadow-md`, `--shadow-card: 0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.08)`.
   - **Semantic Color Roles**: Surface, text, border, and accent colors switch values automatically under `[data-theme='dark']`.
3. Components consume strictly semantic variables:
   ```css
   .workn-card {
     background-color: var(--color-surface);
     color: var(--color-text-primary);
     box-shadow: var(--shadow-card);
     border-radius: var(--radius-md);
   }
   ```

### 5. Where It Goes Wrong and What That Costs
Styling drift occurs when an engineer uses arbitrary "one-off" Tailwind utility classes or custom pixel overrides (`style={{ fontSize: '14.5px' }}`). This breaks global theme inheritance, increases total stylesheet payload sizes, and creates an inconsistent visual rhythm. In our initial sprint, fixing inconsistent hardcoded shadows across six views consumed an entire afternoon of engineering time that should have gone toward authentication testing.

### 6. What the Builder Got Wrong (Verified in Commit History)
In early commit `7882478` (*"feat: responsive-layout-dark-mode-tokens"*), the builder initially declared custom component styling in `src/components/auth/AuthClient.tsx` using inline hex codes (`#1a1a1a`, `#ffffff`) and fixed pixel box-shadows. When the dark mode toggle was enabled, the authentication card retained a stark white background with unreadable white labels. The entire component had to be refactored to consume `var(--color-surface)` and `var(--color-border-subtle)`.

---

## Section 2: Scaffolding, the Development Server, and Database Diagnostics

### 1. The Concept in Plain Words
**Scaffolding** is the foundational setup of a software application—establishing the framework structure (Next.js App Router), declaring strict TypeScript typings, binding database ORM drivers (Prisma), and wiring environment configurations. **Database diagnostics** refers to automated connection health checks and pre-flight probes that verify database accessibility before accepting traffic.

### 2. Why It Exists (The Failure It Prevents)
Without automated diagnostics and structured scaffolding, an application will exhibit **silent startup failures**. A developer starts the local server, the console logs `Ready on http://localhost:3000`, and the app appears healthy. However, the first database query triggers an unhandled network timeout because the database connection string was misconfigured, a connection pool limit was exceeded, or local network interfaces failed to route IPv6 packets.

### 3. Real Scenario: Chidi's 30-Second Spinning Freeze
Chidi, a new developer setting up Workn locally on Windows, copied `.env.example` to `.env.local` but left the default connection strings pointing to a direct Supabase pooler URL without port overrides. When he navigated to `/auth?view=register`, the browser tab spun for exactly 30 seconds before dying with an obscure `UND_ERR_CONNECT_TIMEOUT`. Because there were no pre-flight connection diagnostics, Chidi spent three hours debugging frontend React hydration errors before discovering that his local machine could not resolve the Supabase IPv6 endpoint.

### 4. How It Is Done
1. Provide an authoritative `.env.example` documenting every required secret with dummy structures.
2. Initialize Prisma with explicit connection pooling and timeout ceilings in `src/lib/prisma.ts`.
3. In network-sensitive Node.js runtimes (especially on Windows), enforce IPv4 resolution precedence before connecting to remote cloud databases:
   ```ts
   import dns from 'node:dns';
   try {
     dns.setDefaultResultOrder('ipv4first');
   } catch {}
   ```
4. Build automated pre-flight audit scripts (e.g., `scripts/audit-task-5.mjs`) that probe environment variables and database tables before allowing builds to pass.

### 5. Where It Goes Wrong and What That Costs
If serverless functions open direct, unpooled connections to PostgreSQL (`postgres://` on port 5432) rather than using transaction poolers (`port 6543`), a sudden spike of 50 concurrent registrations will exhaust PostgreSQL's connection pool (`FATAL: remaining connection slots are reserved for non-replication superuser connections`). The database crashes, taking down all active member sessions.

### 6. What the Builder Got Wrong (Verified in Commit History)
During the Task 5 dev server restart, the builder ran `npm run dev` inside an isolated terminal container without host port binding (`task-2850`). The server reported `Ready in 2.4s`, but the developer's external browser was blocked with `EACCES` and connection refused errors. Furthermore, placing executable `dns.setDefaultResultOrder('ipv4first')` code at the top level of `src/lib/auth/actions.ts` caused a Webpack module export error during SSR until properly relocated into `src/lib/auth/server.ts` (Commit `90dfaf0`).

---

## Section 3: Information Design, the Browser Head, and Responsive Type

### 1. The Concept in Plain Words
**Information design** is the intentional, logical structuring of user interfaces so that critical content is immediately understandable and scannable. **The browser `<head>`** contains the invisible metadata (viewport configuration, document titles, OpenGraph social cards, canonical tags) that instructs browsers and web crawlers how to scale and preview the page. **Responsive type** is typography that smoothly scales between mobile viewports and large desktop monitors using fluid CSS mathematical functions (`clamp()`) rather than static pixel breakpoints.

### 2. Why It Exists (The Failure It Prevents)
Without responsive typography and proper viewport metadata, mobile devices render web pages as zoomed-out, microscopic desktop sheets, forcing users to pinch and pan across the screen. Without social metadata, links shared across WhatsApp, Slack, or LinkedIn appear as broken blank grey cards with uninformative URLs, destroying user acquisition and trust.

### 3. Real Scenario: Amina's Invisible WhatsApp Campaign
Amina, managing member growth at Workn, shared a special registration link for a Lagos tech founder meetup on a 500-person WhatsApp community. Because the page lacked dynamic OpenGraph metadata tags (`og:title`, `og:image`, `og:description`), WhatsApp rendered the link as raw text: `https://workn.ng/auth?view=register`. Prospective members suspected it was a phishing link. Furthermore, those who clicked from budget Android devices (360px screen width) found the submit button pushed off-screen because the form container had a static width of `480px`.

### 4. How It Is Done
1. Configure dynamic metadata in Next.js Server Components (`src/app/layout.tsx` and `src/app/auth/page.tsx`):
   ```ts
   export const metadata: Metadata = {
     title: 'Authentication — Workn',
     description: 'Sign in, register, or manage your Workn workspace account.',
     viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
     openGraph: {
       title: 'Join Workn — Coworking in Lagos',
       description: 'Flexible desks, private offices, and meeting rooms in Yaba and Victoria Island.',
       images: ['/brand/og-preview.png'],
     },
   };
   ```
2. Utilize fluid typography with CSS `clamp()`:
   ```css
   font-size: clamp(1rem, 0.95rem + 0.25vw, 1.25rem);
   ```
3. Ensure every form container utilizes `max-width` with a relative width fallback (`width: 100%; max-width: 440px; margin: 0 auto;`).

### 5. Where It Goes Wrong and What That Costs
Hardcoding fixed widths (`width: 480px;`) or using fixed pixel font sizes (`font-size: 16px;` on mobile headers) causes layout clipping, horizontal scrollbars, and high bounce rates. On Nigerian mobile networks, where over 82% of web traffic originates from budget mobile handsets, a broken mobile layout instantly eliminates more than half of prospective members.

### 6. What the Builder Got Wrong (Verified in Commit History)
In Task 3 (`User-interaction` branch), the builder implemented the main dashboard card with a fixed padding of `48px` and an explicit width container of `520px`. On smaller mobile displays (e.g. Tecno and Infinix devices with 360px viewport widths), the edge of the card overflowed the screen, truncating the "Request Account Deletion" button and hiding the terms of service agreement checkbox. It was resolved in commit `7882478` by enforcing `width: min(100%, 460px)` and responsive padding variables.

---

## Section 4: The Working Tree, Branching, and Client-Side Validation

### 1. The Concept in Plain Words
**The working tree** is the local set of files you are actively modifying; **branching** is Git's mechanism for isolating new features or experimental code from the production baseline (`main`). **Client-side validation** is the immediate verification of user input directly inside the browser using JavaScript before a network request is dispatched.

### 2. Why It Exists (The Failure It Prevents)
Working directly on `main` causes catastrophic merge conflicts and pushes unfinished, broken features into production. Lacking client-side validation creates severe user friction: on high-latency mobile networks, submitting a form with a simple typo (e.g., typing an email without an `@` symbol) forces the user to wait seconds for a server round-trip, only to have the page refresh and clear their entered data.

### 3. Real Scenario: Emeka's Lost Registration Data
Emeka, a prospective member standing in a noisy coworking lobby in Yaba, attempted to register over a fluctuating 3G connection. He entered a 7-character password (violating the 8-character rule) and mistyped his phone number as `08012345` (8 digits instead of 11). Because client-side validation was disabled on the form, clicking "Create Account" sent the full payload to the server. Four seconds later, the server responded with an error, the page re-rendered, and both password fields were wiped clean. Frustrated by the delay and lost input, Emeka gave up and paid cash at the counter instead.

### 4. How It Is Done
1. Enforce strict Git branch boundaries:
   - Features, security compliance, and migrations live in dedicated branches (`feat/sessions-compliance`, `fix/rate-limiter`).
   - Code is merged to `main` only through validated pull requests accompanied by green audit scripts.
2. Implement reactive client-side validation in React (`src/components/auth/AuthClient.tsx`):
   ```tsx
   function validatePhone(phone: string): string | undefined {
     const cleaned = phone.replace(/[\s-]/g, '');
     if (!cleaned) return undefined;
     if (!/^\d{10,11}$/.test(cleaned)) {
       return 'Phone number must be 10 or 11 digits (e.g. 08012345678).';
     }
     return undefined;
   }
   ```
3. Provide live, accessible inline feedback using ARIA attributes (`aria-invalid="true"`, `role="alert"`) so screen readers and mobile users receive instant guidance without page reloads.

### 5. Where It Goes Wrong and What That Costs
Treating client-side validation as a security boundary is a critical mistake: any attacker can bypass browser validation using `curl` or Postman. Client validation exists exclusively for **user experience and latency reduction**. Conversely, omitting client-side validation floods the backend API with malformed requests, inflating server compute costs and database connection overhead.

### 6. What the Builder Got Wrong (Verified in Commit History)
In commit `107d18c` (*"feat: implement server-side security"*), the builder updated the server schema to require 11-digit Nigerian phone numbers, but forgot to update the client-side regex in `AuthClient.tsx`. When users entered valid Nigerian landlines or 10-digit formats without leading zeros, the client allowed submission, but the server rejected it with a cryptic schema error. The client validation had to be harmonized in commit `fbc6adb` to permit both 10 and 11-digit formats seamlessly.

---

## Section 5: Migrations, Schema Design, and Email Delivery

### 1. The Concept in Plain Words
A **database migration** is a version-controlled, repeatable SQL script that transforms the database schema (adding tables, altering columns, creating indices) without manual database administration. **Schema design** defines how tables, foreign keys, and constraints represent business entities. **Email delivery** refers to dispatching transactional notifications (verification PINs, password resets) via an external SMTP or API gateway (such as Resend or Postmark).

### 2. Why It Exists (The Failure It Prevents)
Manually running `ALTER TABLE` commands in production is disastrous: it leads to schema drift between development and production environments, unrecoverable syntax mistakes, and application downtime. Similarly, sending transactional emails synchronously within the user's HTTP request thread causes the user interface to freeze; if the email provider experiences a 5-second network hiccup, the user's registration request times out.

### 3. Real Scenario: Zainab's Locked Production Table
Zainab needed to add a required `taxId` column to the `User` table to satisfy corporate tax reporting. In her first draft, she wrote:
```sql
ALTER TABLE "User" ADD COLUMN "taxId" VARCHAR(255) NOT NULL;
```
When executed against a database containing 2,000 existing member rows, PostgreSQL immediately threw an error: `column "taxId" contains null values`. Had this occurred during a production migration, it would have aborted halfway, leaving the schema in an inconsistent state and preventing existing members from logging in.

### 4. How It Is Done
1. **Three-Phase Zero-Downtime Migration** (Task 4 Step 5 pattern):
   - **Step 1**: Add the new column as **nullable**:
     ```sql
     ALTER TABLE "User" ADD COLUMN "taxId" VARCHAR(255);
     ```
   - **Step 2**: Backfill existing records with valid deterministic data:
     ```sql
     UPDATE "User" SET "taxId" = 'NIG-TAX-' || UPPER(SUBSTRING(id, 1, 8)) WHERE "taxId" IS NULL;
     ```
   - **Step 3**: Alter the column to enforce the **`NOT NULL` constraint**:
     ```sql
     ALTER TABLE "User" ALTER COLUMN "taxId" SET NOT NULL;
     ```
2. **Asynchronous Email Decoupling**:
   - Insert an email job record into an `EmailJob` or transactional outbox table within the same database transaction that creates the user.
   - Dispatch the email asynchronously or handle failures gracefully with exponential backoff rather than holding the HTTP thread open.

### 5. Where It Goes Wrong and What That Costs
If an email delivery failure crashes the registration transaction, a user might be created in Supabase Auth but missing from the application database, creating an "orphaned identity" who can never log in and whose email is locked against re-registration.

### 6. What the Builder Got Wrong (Verified in Commit History)
In early Task 4 development, the builder attempted to add `taxId` as a non-nullable field directly in `prisma/schema.prisma` without a backfill step. Running `prisma migrate dev` failed against existing seed data, halting development. The builder had to write a bespoke backfill script (`scripts/apply-tax-migration.mjs`) to populate `taxId` values before the `NOT NULL` constraint could be applied cleanly.

---

## Section 6: Server-Side Validation, Hashing, Rate Limiting, and Verification

### 1. The Concept in Plain Words
**Server-side validation** is the non-negotiable verification of every incoming request payload at the API boundary using schema validators (Zod). **Password hashing** is the one-way cryptographic transformation (using bcrypt or Argon2 with cryptographic salts) of plaintext credentials into irreversible digests. **Rate limiting** restricts the number of permitted requests an IP or identity can execute within a specific time window. **Breach checking** compares candidate passwords against known global breach corpuses using mathematical k-anonymity.

### 2. Why It Exists (The Failure It Prevents)
Client validation can be bypassed effortlessly by an attacker. Without server-side validation, malicious inputs can inject SQL payloads, corrupt database states, or trigger remote code execution. Without rate limiting, automated botnets can launch dictionary and credential-stuffing attacks—submitting 10,000 passwords a second until an account is breached. Without breach detection, users register with trivially compromised passwords (`password123`) that are immediately cracked.

### 3. Real Scenario: Kelechi's Brute-Force Nightmare
Kelechi, a member who operates a cryptocurrency consulting desk at Workn, was targeted by an automated brute-force attack originating from an overseas botnet. Over a 20-minute window, the bot submitted 1,200 login attempts guessing common passwords against his email. Because Workn implemented a strict sliding-window rate limit (5 attempts per 15 minutes per IP/email pair), the system locked the endpoint on the 6th attempt, returning HTTP 429 (`Too Many Requests`) with a clear `Retry-After` header. Kelechi's account remained completely secure.

### 4. How It Is Done
1. **Strict Zod Boundary Validation** (`src/lib/validation/auth.ts`):
   ```ts
   export const LoginSchema = z.object({
     email: z.string().trim().email().transform(normaliseEmail),
     password: z.string().min(8).max(72),
   });
   ```
2. **Sliding-Window In-Memory Rate Limiting** (`src/lib/security/rate-limiter.ts`):
   - Key on compound identifiers: `login:${clientIp}:${email}`.
   - Enforce explicit policies: 5 login attempts / 15 mins, 3 registration attempts / 15 mins.
   - Return generic error messages on authentication failure that never disclose whether the email or the password was the incorrect element.
3. **HaveIBeenPwned k-Anonymity Breach Check** (`src/lib/security/breach-check.ts`):
   - Hash password locally using SHA-1.
   - Send only the first 5 hexadecimal characters (`prefix`) to the HIBP API.
   - Match the remaining 35 characters (`suffix`) locally in memory—ensuring plaintext credentials and full hashes never leave the server boundary.

### 5. Where It Goes Wrong and What That Costs
A flawed rate limiter that keys *only* on the client IP address will lock out an entire coworking space of 200 developers if three people fail their logins, because all 200 devices share the same public NAT gateway IP address. Rate limiters must key on compound identifiers (`IP + Email`).

### 6. What the Builder Got Wrong (Verified in Commit History)
In Task 4 Step 9, the builder implemented the k-anonymity breach check, but in development mode hardcoded a mock check that rejected any password matching `password123` with a mock count of `789,279`. When testing registration locally, common test passwords (including `Password123!`) were repeatedly blocked, halting manual verification. The builder had to introduce an explicit development bypass (`process.env.NODE_ENV !== 'production'`) in `src/lib/security/breach-check.ts` (Commit `90dfaf0`) so developer workflows remained smooth.

---

## Section 7: Sessions, Logout, Account Deletion, and Compliance

### 1. The Concept in Plain Words
A **session** is a server-tracked state linking an authenticated user to their client browser across multiple HTTP requests using a cryptographic token stored in an `HttpOnly`, `SameSite=Lax`, `Secure` cookie. **Session revocation** is the explicit server-side invalidation of that token in the database. **Account deletion and compliance** represents the technical implementation of data subject rights under the Nigeria Data Protection Act (NDPA 2023) and GDPR Article 17, balanced against statutory corporate record-keeping laws (CAMA 2020).

### 2. Why It Exists (The Failure It Prevents)
If logout only deletes the cookie on the browser without marking the session revoked in the database, the raw session token remains live on the server. If an attacker stole the cookie prior to logout (or retrieved it from browser memory on a shared physical kiosk), they can replay that token indefinitely to impersonate the user. Furthermore, if a platform immediately executes a destructive `DELETE FROM "User"` when a user requests account deletion, the business violates CAMA Section 332 and LIRS tax laws requiring 6 years of financial audit retention—exposing the company to severe legal penalties.

### 3. Real Scenario: Kunle's Shared iMac Exposure
Kunle, a member using a shared iMac at the Workn reception lounge, checked his private booking schedule, clicked "Sign Out", and walked away to grab coffee. Five minutes later, another member sat at the iMac, opened the browser developer tools, copied the raw `workn_session` cookie from the network cache, and pasted it into a script on their laptop. Because the initial implementation only removed the cookie from the browser without updating the database, the server accepted the stolen token, exposing Kunle's billing history and private membership details.

### 4. How It Is Done
1. **Cryptographic Token Architecture**:
   - Issue 256-bit CSPRNG tokens on login; store strictly the **SHA-256 hash** (`sessionTokenHash`) in the PostgreSQL `Session` table.
   - Transmit raw tokens strictly over `HttpOnly`, `SameSite=Lax`, `Secure` cookies with a 7-day TTL (`604,800` seconds).
2. **Server-Side Logout Invalidation** (`src/lib/auth/session.ts`):
   ```ts
   export async function destroySession(): Promise<void> {
     const token = (await cookies()).get('workn_session')?.value;
     if (token) {
       const tokenHash = createHash('sha256').update(token).digest('hex');
       await prisma.session.updateMany({
         where: { sessionTokenHash: tokenHash, revokedAt: null },
         data: { revokedAt: new Date() },
       });
     }
     (await cookies()).set('workn_session', '', { maxAge: 0, path: '/' });
   }
   ```
3. **Statutory Account Lockout vs. Destructive Erasure** (`src/lib/compliance/deletion.ts`):
   - When a user requests erasure, do **not** run an immediate database `DELETE`.
   - Update `accountStatus = 'INACTIVE'`, set `deletionRequestedAt = NOW()`, revoke all active sessions (`revokedAt = NOW()`), and display a statutory lockout screen informing the user of the 30-day grace period and CAMA 6-year tax retention hold.
   - A scheduled cron job purges non-fiscal personal data only after the statutory grace period expires.

### 5. Where It Goes Wrong and What That Costs
Failing to invalidate sessions upon a **password reset** means that if an account is compromised, the attacker retains full access through their existing active session even after the legitimate owner resets their password. In financial and coworking domains, password resets must trigger a global session revocation (`revokeAllUserSessions`) across all devices simultaneously.

### 6. What the Builder Got Wrong (Verified in Commit History)
As documented in the Defects Register (`docs/defects.md`, Defect 1), the initial logout action in `src/lib/auth/actions.ts` called `supabase.auth.signOut()` but completely forgot to invoke `destroySession()`. As a result, PostgreSQL `Session` rows remained active with `revokedAt = null` even after users logged out. This was caught and corrected in commit `c7cfa87`, ensuring that database session revocation and cookie destruction occur synchronously in every sign-out flow.

---

## Conclusion: The Golden Rules for the Next Cohort

1. **Never trust client state**: If it didn't pass through a server-side Zod schema and a session authorization check, it does not exist.
2. **Never delete financial history**: Privacy rights exist alongside statutory retention laws; implement soft lockouts, anonymization, and grace periods rather than raw database deletions.
3. **Never roll your own crypto**: Use established, audited primitives—bcrypt/Argon2 for passwords, CSPRNG for session tokens, and SHA-256 for token hashing.
4. **Always build pre-flight diagnostics**: A script that fails your build locally in 2 seconds is ten thousand times cheaper than an unhandled runtime error in front of a paying member.

