# Workn

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

> **Pull Request #1 (Information Design & Scaffold Review)**: [https://github.com/Maven111/Workn/pull/1](https://github.com/Maven111/Workn/pull/1)  
> **Assessed Milestones**: [Design System (Task 1)](./Design%20system/README.md) • [Repository & Scaffold (Task 2)](./task-02-repository-and-scaffold/README.md) • [Client Validation (Task 3)](./task-03-client-validation/docs/validation-rules.md) • [Numbers Register](./Docs/numbers-register.md)

---

## Table of Contents
- [1. What This Is](#1-what-this-is)
  - [Repository Architecture & Task Milestones](#repository-architecture--task-milestones)
  - [Project Directory Map](#project-directory-map)
- [2. The Stack, with Reasons](#2-the-stack-with-reasons)
  - [Architectural Flow Diagram](#architectural-flow-diagram)
- [3. Getting Started](#3-getting-started)
  - [1. Prerequisites](#1-prerequisites)
  - [2. Step-by-Step Installation](#2-installation--setup)
  - [3. Available Scripts](#3-available-scripts)
  - [4. Application Endpoints](#4-application-endpoints)
  - [5. Quality & Build Verification](#5-quality--build-verification)
- [4. Environment Variables](#4-environment-variables)
- [5. What This Deliberately Does Not Do](#5-what-this-deliberately-does-not-do)
- [6. Known Defects](#6-known-defects)

---

## 1. What This Is

Workn is a coworking membership and workspace management platform for freelancers, remote professionals, and small business owners in Lagos, Nigeria, where booking a workspace desk or meeting room must reliably verify availability, membership eligibility, and payment before granting access.

### Repository Architecture & Task Milestones

Per Section 4 of the build specification, this project is structured as **one repository containing five top-level task milestone modules** alongside the active Next.js web application:

| Milestone Module | Status | Primary Focus & Deliverables | Quick Link |
| :--- | :--- | :--- | :--- |
| **Task 1: Design System** | Completed | 3-tier CSS token export, 14-tone palette, contrast matrices, typography scale. | [Task 1 README](./Design%20system/README.md) |
| **Task 2: Repository & Scaffold** | Completed | Clean scaffold, 3 server failure & recovery proofs, false-success DB audit, PR #1. | [Task 2 README](./task-02-repository-and-scaffold/README.md) |
| **Task 3: Client Validation** | In Progress | Accessible SPA authentication (`/auth`), on-blur validation, WCAG AA screen reader audit. | [Task 3 Docs](./task-03-client-validation/docs/validation-rules.md) |
| **Task 4: Server Security** | Planned | Cryptographic session tokens, server action gatekeeping, rate-limiting, audit log. | `task-04-server-security/` |
| **Task 5: Compliance & Defence** | Planned | Retention matrices, account deletion lifecycle, live owner interview, viva defence. | `task-05-sessions-compliance-defence/` |
| **Numbers Register** | Active | Canonical record of all Builder-chosen numbers, hashing timings, and field limits. | [Numbers Register](./Docs/numbers-register.md) |

### Project Directory Map

```text
Workn/
├── Design system/                   # Task 1: Design system, token JSONs, defect logs, evidence
├── task-02-repository-and-scaffold/ # Task 2: Scaffold audit, failure/recovery logs, hand-drawn tree
├── task-03-client-validation/       # Task 3: Client validation rules, accessibility audit, attack logs
├── Docs/                            # Canonical project records (Numbers register, system context)
├── prisma/                          # Relational schema (schema.prisma) & migration history
├── public/                          # Static assets, branding marks, and favicons
├── scripts/                         # Build scripts (scripts/build-tokens.js)
├── src/
│   ├── app/                         # Next.js App Router routes (/, /auth, /dashboard, API routes)
│   ├── components/                  # UI components (auth SPA client, home hero, navbar, layout)
│   └── lib/                         # Server actions (actions.ts), Supabase client, DB utilities
├── tokens.css                       # Compiled 3-tier CSS design tokens (primitive, semantic, component)
└── README.md                        # Master repository documentation (Assessed)
```

---

## 2. The Stack, with Reasons

- **Next.js 14 (App Router)**: Chosen for unified Server Actions, hybrid SSR/SSG rendering for SEO, and built-in route handlers, rather than Vite/SPA which would require a separated backend API.
- **TypeScript**: Chosen for strict compile-time type safety across database models and auth states, rather than plain JavaScript where runtime type mismatches cause silent bugs.
- **PostgreSQL**: Chosen for ACID-compliant transactional guarantees and strict relational integrity across payments, memberships, and bookings, rather than MongoDB/NoSQL where document denormalization risks orphaned financial records.
- **Prisma ORM**: Chosen for declarative schema modeling and automatic TypeScript type generation, rather than TypeORM or raw SQL drivers which require repetitive boilerplate mapping.
- **Supabase Auth**: Chosen for battle-tested cryptographic session management, cookie refresh handling, and token security, rather than rolling custom authentication from scratch.
- **Tailwind CSS & CSS Variables**: Chosen for zero-runtime utility styling directly bound to our 3-tier design token architecture, rather than CSS-in-JS (styled-components) which incurs runtime style-calculation overhead.

### Architectural Flow Diagram

```mermaid
flowchart TD
    Client["Browser (Next.js Client / SPA Auth)"]
    ServerActions["Next.js Server Actions & Route Handlers"]
    SupabaseAuth["Supabase Auth (Identity & Sessions)"]
    PrismaORM["Prisma Client"]
    PostgresDB[(PostgreSQL Database)]
    PaystackAPI["Paystack Payment Gateway (Simulated / Test)"]

    Client -->|Form Submissions / Auth Requests| ServerActions
    ServerActions -->|Session & User Auth| SupabaseAuth
    ServerActions -->|Typed Queries & Transactions| PrismaORM
    PrismaORM -->|Relational Data Storage| PostgresDB
    ServerActions -.->|Payment Initialisation & Webhooks| PaystackAPI
```

---

## 3. Getting Started

Follow these exact commands in order from a fresh clone to set up and run the application locally:

### 1. Prerequisites
- **Node.js**: v18.18.0 or later (Node 20 LTS recommended)
- **npm**: v9+ (or pnpm/yarn)
- **PostgreSQL**: A running local or hosted instance (e.g., Supabase / Neon / Docker)

### 2. Installation & Setup

```bash
# 1. Clone the repository
git clone https://github.com/Maven111/Workn.git

# 2. Navigate into the project directory
cd Workn

# 3. Install project dependencies
npm install

# 4. Configure local environment variables
cp .env.example .env.local
# (Open .env.local and populate DATABASE_URL and Supabase keys)

# 5. Generate the Prisma database client
npx prisma generate

# 6. Synchronize database schema
npx prisma db push

# 7. Start the local development server
npm run dev
```

### 3. Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts local Next.js development server at `http://localhost:3000`. |
| `npm run build` | Builds optimized production bundle; verifies types and routes. |
| `npm run start` | Runs the compiled production build locally. |
| `npm run lint` | Runs ESLint across all codebase files. |
| `npm run build:tokens` | Compiles raw Figma token JSON into `tokens.css`. |
| `npm run db:push` | Pushes Prisma schema updates directly to the connected PostgreSQL instance. |
| `npm run db:studio` | Launches Prisma Studio GUI data browser at `http://localhost:5555`. |
| `npx tsc --noEmit` | Executes strict TypeScript compilation check without emitting files. |

### 4. Application Endpoints

Once the dev server is active, access the core application routes:
- **Landing & Discovery**: [http://localhost:3000](http://localhost:3000)
- **Authentication SPA**: [http://localhost:3000/auth?view=login](http://localhost:3000/auth?view=login) (or `?view=register`, `?view=forgot-password`)
- **Member Dashboard**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard) *(requires authenticated session)*
- **Prisma Studio (Data Inspector)**: [http://localhost:5555](http://localhost:5555) *(when running `npx prisma studio`)*

### 5. Quality & Build Verification
```bash
# 1. Verify strict TypeScript compliance (0 errors expected)
npx tsc --noEmit

# 2. Verify complete Next.js production compilation
npm run build
```

---

## 4. Environment Variables

All secrets live in `.env.local` and must never be committed to source control. The repository includes an [`.env.example`](./.env.example) template.

| Variable Name | Purpose | Example Format |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string including pooling & direct credentials. | `postgresql://user:pass@host:5432/workn_db?schema=public` |
| `NEXT_PUBLIC_SUPABASE_URL` | Public project URL for Supabase authentication service. | `https://xyzcompany.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anonymous API key for client-side Supabase operations. | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Privileged server-only Supabase secret key for admin operations. | `eyJhbGciOi...` |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`| Paystack public test key for browser checkout modal initialization. | `pk_test_...` |
| `PAYSTACK_SECRET_KEY` | Paystack secret key for backend charge verification and webhooks. | `sk_test_...` |
| `AI_PROVIDER_API_KEY` | Secret API key for backend LLM workspace assistant tool calling. | `sk-proj-...` |
| `NEXT_PUBLIC_APP_URL` | Canonical base URL of the deployed application (used for OG meta & auth redirects). | `http://localhost:3000` |

---

## 5. What This Deliberately Does Not Do

1. **Multi-Location / Multi-Tenant Franchising**: Workn intentionally focuses on single-operator coworking spaces in Lagos to avoid prematurely abstracting multi-tenancy before core booking workflows are solid.
2. **Physical IoT Door / Turnstile Integration**: Access control is handled via digital booking verification badges rather than hardware turnstiles, avoiding brittle embedded device dependencies.
3. **Autonomous AI Financial Deductions**: The AI assistant is strictly informational and assistive; it cannot deduct credits or initiate refunds without explicit, verified server-side business logic and member approval.
4. **Live Production Credit Card Charges**: Operates strictly against sandbox and test credentials (Paystack test mode) until audit logging, reconciliation, and refund workflows pass full validation.

---

## 6. Known Defects

1. **Pinned Primary Foreground Contrast Failure**:
   - *Reference*: [`tokens.css` Lines 169–170](./tokens.css#L169-L170)
   - *Description*: Standard white text (`--color-on-primary`: `#f9fff5`) placed on pinned primary green (`--color-primary`: `#16a34a`) yields a contrast ratio of **3.24:1**, failing WCAG AA (4.5:1) for standard text.
   - *Mitigation*: Restricted `--color-primary` to high-area button fills, icons, and surface tints; body text uses on-surface roles.
2. **Unsynchronized Application User Record**:
   - *Reference*: [`src/lib/auth/actions.ts` Lines 40–53](./src/lib/auth/actions.ts#L40-L53)
   - *Description*: The registration server action reports success upon Supabase user creation without verifying or writing a corresponding application `User` row in PostgreSQL, creating false success if the database is disconnected.
   - *Resolution Path*: Handled in Task 4 via atomic transactional user provisioning and status code verification.
3. **Display Headline Text Overflow on Narrow Viewports**:
   - *Reference*: [`src/components/home/HomeClient.tsx` Line 212](./src/components/home/HomeClient.tsx#L212)
   - *Description*: Combining `whiteSpace: 'nowrap'` with the hero display heading causes horizontal text clipping on mobile viewports below 360px width.
   - *Resolution Path*: Resolved by wrapping in a `maxWidth: 800px` container with soft clause breaks (`evidence/19-heading-wrap-good.png`).
