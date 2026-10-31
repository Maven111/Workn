# Workn

**A coworking space membership and workspace management platform.**

Workn is a web application that helps members manage coworking subscriptions, book workspaces and meeting rooms, track membership benefits, and get assistance from an AI-powered workspace assistant.

Built for a coworking business in Lagos, Nigeria, Workn brings membership management, bookings, payments and customer support into one platform.

## The Problem

Freelancers, remote workers and small business owners need reliable workspaces without committing to traditional office leases. Managing memberships, booking spaces, tracking benefits and confirming payments manually can create unnecessary friction for both members and workspace operators.

Workn centralises these activities, helping members manage their workspace experience while giving administrators better control over daily operations.

## Core Features

### Member Experience

- User registration, login and profile management.
- Membership plan discovery and subscription management.
- Workspace and meeting-room browsing.
- Booking creation, viewing and cancellation.
- Membership status and expiry tracking.
- Remaining coworking days and meeting-room hours.
- Payment history and transaction status.
- AI-powered member assistance.

### Workspace Administration

- Member record management.
- Membership plan and pricing management.
- Workspace resource and availability management.
- Booking oversight and exception handling.
- Payment review and eligible refund management.
- Audit logs for important administrative actions.

### AI Workspace Assistant

The AI assistant helps members understand their memberships, check available benefits, retrieve payment information and explore booking options. It can also perform authorised booking actions through approved backend tools.

The assistant must retrieve current business records before answering record-dependent questions. It must never invent information, bypass permissions or claim an action succeeded before the backend confirms it.

## Technology Stack

| Technology                                     | Purpose                                       |
| ---------------------------------------------- | --------------------------------------------- |
| Next.js                                        | Web application and server-side functionality |
| TypeScript                                     | Type-safe application development             |
| Tailwind CSS                                   | Styling and responsive layouts                |
| Accessible React component library             | Reusable interface components                 |
| PostgreSQL                                     | Persistent application database               |
| Prisma                                         | Database modelling, migrations and queries    |
| Supabase Auth                                  | Authentication and session management         |
| LLM API with tool calling                      | AI assistant and backend tool orchestration   |
| Paystack test environment or simulated adapter | Payment lifecycle testing                     |
| Vercel                                         | Application deployment                        |
| Git and GitHub                                 | Version control and collaboration             |
| Vitest                                         | Unit and integration testing                  |
| Playwright                                     | Browser-based end-to-end testing              |

The application will use a modular architecture within a Next.js project. PostgreSQL will remain the source of truth for memberships, payments, bookings and benefit records.

## Design Direction

Workn should feel professional, modern, welcoming and dependable.

**Typography**

- **Space Grotesk:** Display styles and larger headline styles.
- **Manrope:** Smaller headlines, titles, body text, labels, forms, navigation, tables and operational information.

**Core brand colours**

- Forest green: `#166534`
- Accent green: `#22C55E`
- Warm background: `#F7F8F5`
- Main text: `#1F2937`
- Pale green surface: `#E7F5E9`
- Muted text: `#64748B`

The interface should prioritise readability, clear navigation, generous whitespace, responsive layouts and accessible contrast.

## Business Rules and Data Integrity

Workn must follow these principles:

1. Payment must be verified before a subscription or paid service is activated.
2. Expired memberships cannot access subscription-only benefits until renewed.
3. Workspace availability and member eligibility must be checked before confirming a booking.
4. Conflicting bookings must be prevented.
5. Benefit deductions must be recorded and must not occur for unsuccessful bookings.
6. Members must only access their own private records.
7. Administrative actions must respect role-based permissions and be auditable.
8. AI actions must use authorised backend tools and follow the same business rules as the interface.

## Project Scope

The initial release focuses on a single coworking business and its core membership and workspace operations.

The MVP includes authentication, subscriptions, workspace resources, bookings, payment tracking, member and administrator dashboards, audit logging and the AI assistant.

The MVP excludes multiple locations, physical access control, WhatsApp or SMS automation, complex enterprise account management, private office leasing and unrestricted autonomous financial actions.

Payment processing will initially use simulated transactions or a test environment. Production payment collection requires a properly verified payment integration and security testing.

## Environment Variables

Secrets must remain in local environment files or the deployment platform's secret manager. Do not commit API keys, database passwords or authentication secrets to GitHub.

The application will require environment configuration for:

- PostgreSQL database connection.
- Supabase project URL and public client key.
- Supabase server-side authentication configuration, where required.
- AI provider API key.
- Payment provider credentials when payment integration is implemented.
- Application URL and other environment-specific settings.

The exact variable names will be defined during implementation.

## Testing

Testing must cover both successful workflows and failure scenarios, including:

- Registration and login.
- Successful, failed and unconfirmed payments.
- Subscription activation and expiry.
- Remaining benefit calculations.
- Workspace availability and booking conflicts.
- Booking cancellation rules.
- Unauthorised access to member records.
- AI tool permissions and inaccurate or unavailable backend data.
- Administrative actions and audit logging.

Correctness, data integrity and permission enforcement take priority over maximising AI autonomy.

---

**Workn — Your workspace, managed simply.**
