---
trigger: model_decision
description: Use when implementing or modifying payment processing, payment verification, membership activation, booking payments, refunds, or payment reconciliation in Workn
---


# Workn Project Structure

## 1. Purpose

This document defines the recommended folder and file structure for Workn, a coworking membership and workspace management platform built with Next.js, TypeScript, Tailwind CSS, Prisma, PostgreSQL, and Supabase Auth.

The structure should support maintainable code, clear separation of responsibilities, secure server-side operations, and reliable testing.

**Before creating folders or moving files, inspect the existing repository.** Follow established conventions where they are already appropriate. Do not restructure working code unnecessarily.

## 2. Recommended Structure

```text
workn/
├── public/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── docs/
│   ├── PRD.md
│   ├── data-model.md
│   ├── schema.md
│   ├── payment.md
│   ├── git.md
│   └── structure.md
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (member)/
│   │   │   ├── dashboard/
│   │   │   ├── membership/
│   │   │   ├── bookings/
│   │   │   ├── payments/
│   │   │   └── assistant/
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   ├── members/
│   │   │   ├── memberships/
│   │   │   ├── resources/
│   │   │   ├── bookings/
│   │   │   └── payments/
│   │   ├── api/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── forms/
│   │   └── shared/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── memberships/
│   │   ├── bookings/
│   │   ├── payments/
│   │   ├── resources/
│   │   ├── benefits/
│   │   ├── admin/
│   │   └── assistant/
│   │
│   ├── lib/
│   │   ├── auth/
│   │   ├── db/
│   │   ├── payments/
│   │   ├── validation/
│   │   └── utils/
│   │
│   ├── server/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── ai-tools/
│   │
│   ├── hooks/
│   ├── types/
│   └── middleware.ts
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example
├── .gitignore
├── AGENTS.md
├── README.md
├── package.json
├── tsconfig.json
└── next.config.ts
```

This is a proposed structure. Some folders should be created only when needed. The exact Next.js routing, middleware, and configuration files must match the installed framework version.

## 3. Folder Responsibilities

### `src/app/`
Contains Next.js routes, layouts, loading states, error states, and route-specific page components.

- `(auth)/`: Login and registration routes.
- `(member)/`: Authenticated member-facing pages.
- `admin/`: Administrator-facing pages.
- `api/`: Route handlers for webhooks, external integrations, and endpoints where needed.

Route groups such as `(auth)` and `(member)` organise routes without adding those group names to their URLs.

Pages should coordinate the interface and call appropriate application services. Avoid placing complex payment, booking, or membership business logic directly inside page components.

### `src/components/`
Contains reusable interface components.

- `ui/`: Basic and interactive reusable interface elements.
- `layout/`: Navigation, sidebars, headers, and page shells.
- `forms/`: Reusable form components.
- `shared/`: Components used across multiple features.

Keep components accessible and consistent with Workn's design system. Avoid creating duplicates when an appropriate component already exists.

### `src/features/`
Organises code by business capability.

Each feature may contain its own components, validation schemas, types, hooks, and feature-specific utilities when needed.

Examples:
- `memberships/`: Membership display and member-facing membership interactions.
- `bookings/`: Booking interfaces and booking-related client logic.
- `payments/`: Payment status and transaction interfaces.
- `benefits/`: Benefit usage and balance displays.
- `assistant/`: AI assistant interface and conversation state.

Keep sensitive business operations and authoritative data changes on the server.

### `src/lib/`
Contains shared technical utilities and integrations.

- `auth/`: Authentication helpers and session utilities.
- `db/`: Prisma client setup.
- `payments/`: Payment-provider configuration and shared integration utilities.
- `validation/`: Reusable input validation.
- `utils/`: General-purpose utilities.

Do not expose server-only credentials or privileged clients to browser code.

### `src/server/`
Contains server-side application logic.

- `services/`: Business operations such as membership activation, booking creation, cancellation, and refund processing.
- `repositories/`: Database access functions when a repository layer is useful.
- `ai-tools/`: Approved backend tools called by the AI assistant.

Services must enforce authentication, permissions, validation, and Workn's business rules. Do not duplicate business logic across API routes, server actions, and AI tools.

Use the repository layer only where it improves separation or reuse. Avoid unnecessary abstraction for a small application.

### `prisma/`
Contains the Prisma schema and database migrations.

- `schema.prisma`: Models, enums, relations, and database mappings.
- `migrations/`: Versioned database changes.

Keep the schema aligned with `docs/schema.md`. Review migrations before applying them and preserve existing data.

### `tests/`
Contains automated tests.

- `unit/`: Individual functions and business rules.
- `integration/`: Database, service, authentication, and payment workflow tests.
- `e2e/`: End-to-end user journeys.

Use the testing tools already configured in the repository.

### `docs/`
Contains approved product requirements, data specifications, payment rules, Git workflow, and project structure documentation.

Update relevant documentation when approved behaviour or architecture changes.

## 4. Architectural Boundaries

Workn should follow a modular monolith architecture. Keep related functionality within one application rather than introducing separate services without a clear requirement.

Use this general request flow:

```text
Page or UI Component
        |
        v
Server Action or Route Handler
        |
        v
Authentication and Authorisation
        |
        v
Application Service
        |
        v
Prisma / PostgreSQL
        |
        v
Validated Result
```

External payment providers and AI models must be accessed through controlled server-side integrations.

The AI assistant must call approved backend tools rather than accessing the database directly.

## 5. Naming Conventions

Follow existing repository conventions. If none exist, use:

- React components: `PascalCase.tsx`
- Hooks: `useSomething.ts`
- Utility files: `kebab-case.ts`
- Route files: Next.js conventions such as `page.tsx`, `layout.tsx`, and `route.ts`
- Types: Descriptive names in `PascalCase`
- Prisma models: Singular `PascalCase`
- Database fields: `camelCase`
- Environment variables: `UPPER_SNAKE_CASE`

Use descriptive names that communicate purpose. Avoid vague names such as `helpers2`, `misc`, or `temp` for permanent code.

## 6. Security Rules

- Keep database access and privileged operations on the server.
- Derive user identity from the authenticated session.
- Check record ownership and administrator permissions for protected operations.
- Validate untrusted input at server boundaries.
- Keep API keys and secrets in environment variables.
- Never expose service-role keys or payment-provider secrets to client components.
- Do not rely on hidden UI elements as an access-control mechanism.
- Verify payment outcomes server-side.
- Protect booking and benefit operations against duplicate requests and concurrency issues.

## 7. Environment and Configuration

Use `.env.example` to document required environment variable names with safe placeholder values.

Never commit `.env` or real credentials.

Configuration may include database connections, Supabase authentication, the LLM provider, and payment integration. Inspect the actual project configuration before adding new variables.

Keep development, testing, and production credentials separate.

## 8. Rules for Adding New Code

Before adding a file or folder:

1. Inspect the current structure.
2. Identify the correct feature or layer.
3. Check for existing reusable code.
4. Place the implementation where its responsibility belongs.
5. Avoid moving unrelated files.
6. Add or update tests.
7. Update documentation if the architecture or behaviour changes.

Do not create every proposed folder in advance. Introduce folders as real implementation needs arise.

Do not add new architectural layers or dependencies merely to follow this document literally.

## 9. Definition of Done

The project structure is being followed when:

- Routes and interface components remain separate from core business logic.
- Server-side operations enforce permissions and business rules.
- Database access follows established patterns.
- Features are organised consistently.
- Tests and documentation have appropriate locations.
- Secrets remain outside version control.
- New code fits the existing architecture without unnecessary restructuring.
