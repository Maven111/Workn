# Workn

> **Pull Request #1 (Information Design & Scaffold Review)**: [https://github.com/Maven111/Workn/pull/1](https://github.com/Maven111/Workn/pull/1)

---

## 1. What This Is

Workn is a coworking membership and workspace management platform for freelancers, remote professionals, and small business owners in Lagos, Nigeria, where booking a workspace desk or meeting room must reliably verify availability, membership eligibility, and payment before granting access.

---

## 2. The Stack, with Reasons

- **Next.js (App Router)**: Chosen for unified Server Actions, hybrid SSR/SSG rendering for SEO, and route handlers, rather than Vite/SPA which would require a separated backend API.
- **TypeScript**: Chosen for strict compile-time type safety across database models and auth states, rather than plain JavaScript where runtime type mismatches cause silent bugs.
- **PostgreSQL**: Chosen for ACID-compliant transactional guarantees and strict relational integrity across payments, memberships, and bookings, rather than MongoDB/NoSQL where document denormalization risks orphaned financial records.
- **Prisma ORM**: Chosen for declarative schema modeling and automatic TypeScript type generation, rather than TypeORM or raw SQL drivers which require repetitive boilerplate mapping.
- **Supabase Auth**: Chosen for battle-tested cryptographic session management, cookie refresh handling, and token security, rather than rolling custom authentication from scratch.
- **Tailwind CSS & CSS Variables**: Chosen for zero-runtime utility styling directly bound to our 3-tier design token architecture, rather than CSS-in-JS (styled-components) which incurs runtime style-calculation overhead.

---

## 3. Getting Started

Follow these exact commands in order from a fresh clone to run the application locally:

```bash
# 1. Clone the repository
git clone https://github.com/Maven111/Workn.git

# 2. Navigate into the project directory
cd Workn

# 3. Install dependencies
npm install

# 4. Configure local environment variables
cp .env.example .env.local

# 5. Generate the Prisma database client
npx prisma generate

# 6. Start the local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The landing page and authentication views are now running.

---

## 4. Environment Variables

All secrets live in `.env.local` and must never be committed to source control. Required environment variables:

| Variable Name | Purpose |
| :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string including host, user, password, port, and database name. |
| `NEXT_PUBLIC_SUPABASE_URL` | Public project URL for the Supabase authentication backend. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anonymous API key for client-side Supabase authentication operations. |
| `SUPABASE_SERVICE_ROLE_KEY` | Privileged server-only Supabase secret key for administrative user operations. |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`| Paystack public test key for browser-based checkout modal initialization. |
| `PAYSTACK_SECRET_KEY` | Paystack secret key used server-side to verify transaction webhooks and payment charges. |
| `AI_PROVIDER_API_KEY` | Secret API key for backend LLM workspace assistant tool orchestration. |
| `NEXT_PUBLIC_APP_URL` | Canonical base URL of the deployed application used for Open Graph metadata and auth redirects. |

---

## 5. What This Deliberately Does Not Do

1. **Multi-Location / Multi-Tenant Franchising**: Workn intentionally focuses on single-operator coworking spaces in Lagos to avoid prematurely abstracting multi-tenancy before core booking workflows are solid.
2. **Physical IoT Door / Turnstile Integration**: Access control is handled via digital booking verification badges rather than hardware turnstiles, avoiding brittle embedded device dependencies.
3. **Autonomous AI Financial Deductions**: The AI assistant is strictly informational and assistive; it cannot deduct credits or initiate refunds without explicit, verified server-side business logic and member approval.
4. **Live Production Credit Card Charges**: Operates strictly against sandbox and test credentials (Paystack test mode) until audit logging, reconciliation, and refund workflows pass full validation.

---

## 6. Known Defects

1. **Pinned Primary Foreground Contrast Failure**:
   - *Reference*: [`tokens.css` Lines 169–170](file:///c:/Users/man/Desktop/Workn/tokens.css#L169-L170)
   - *Description*: Standard white text (`--color-on-primary`: `#f9fff5`) placed on pinned primary green (`--color-primary`: `#16a34a`) yields a contrast ratio of **3.24:1**, failing WCAG AA (4.5:1) for standard text.
2. **Unsynchronized Application User Record**:
   - *Reference*: [`src/lib/auth/actions.ts` Lines 40–53](file:///c:/Users/man/Desktop/Workn/src/lib/auth/actions.ts#L40-L53)
   - *Description*: The registration server action reports success upon Supabase user creation without verifying or writing a corresponding application `User` row in PostgreSQL, creating false success if the database is disconnected.
3. **Display Headline Text Overflow on Narrow Viewports**:
   - *Reference*: [`src/components/home/HomeClient.tsx` Line 212](file:///c:/Users/man/Desktop/Workn/src/components/home/HomeClient.tsx#L212)
   - *Description*: Combining `whiteSpace: 'nowrap'` with the hero display heading causes horizontal text clipping on mobile viewports below 360px width.
