---
trigger: always_on
---

# Workn Authentication & Authorization

## 1. Purpose

Define how Workn identifies users, manages authenticated sessions, assigns access permissions, and protects member and admin data.

## 2. Authentication Stack

- Authentication provider: Supabase Auth.
- Application framework: Next.js with TypeScript.
- Database: PostgreSQL, managed through Prisma.
- Authorization: Server-side role and resource ownership checks.
- Session handling: Supabase-supported secure session management.

Use the existing project configuration and supported Supabase Auth integration. Do not introduce a second authentication provider without approval.

## 3. User Roles

Workn has two application roles:

### Member
Can:
- Access their own account and profile.
- View their membership, subscription status, and benefits.
- View their payment history.
- Browse available workspace resources.
- Check booking availability and eligibility.
- Create and manage their own permitted bookings.
- Use the AI assistant to access authorized account information.

Cannot:
- Access another member's private records.
- Manage membership plans or business resources.
- Modify payment records or membership status directly.
- Access administrative functions.

### Admin
Can:
- Access authorized administrative pages and operations.
- View and manage member records.
- Manage membership plans and workspace resources.
- Review memberships, bookings, payments, and benefit records.
- Perform permitted administrative actions, including eligible cancellations and refunds.

Admin access must be explicitly granted. A user must never become an admin simply by registering, editing their profile, or modifying a client-side value.

Do not introduce additional roles unless a product requirement explicitly defines them.

## 4. Registration and Account Access

Implement the registration and sign-in flows supported by the existing Supabase Auth configuration.

### Registration
1. Validate submitted input on the server.
2. Create the authentication identity through Supabase Auth.
3. Create or associate the corresponding application user record.
4. Assign the default `member` role through trusted server-side logic.
5. Establish the session using the supported authentication flow.
6. Redirect the user to the appropriate member experience.

If account creation succeeds but application user provisioning fails, handle the incomplete state safely and support recovery. Do not create duplicate user records during retries.

### Sign-in
1. Validate the submitted credentials.
2. Authenticate through Supabase Auth.
3. Establish and validate the session.
4. Load the user's application profile and role.
5. Redirect the user to an authorized destination.

Never expose whether an account exists through unnecessarily specific authentication error messages.

### Sign-out
- Use the supported Supabase sign-out flow.
- Clear or invalidate the relevant session state.
- Redirect the user to an appropriate public page.
- Ensure protected pages and server operations reject an invalidated session.

Do not invent password-reset, email-verification, or social-login requirements. Implement these only as defined by the configured authentication flow or an approved product requirement.

## 5. Session Management

- Use the official Supabase Auth libraries and supported Next.js integration.
- Follow Supabase's recommended cookie and session-refresh patterns for the deployed Next.js version.
- Keep session credentials out of application logs, URLs, local storage, and client-visible application data where avoidable.
- Never expose service-role keys or other privileged secrets to the browser.
- Validate the current user on the server before performing protected operations.
- Handle expired, missing, invalid, or revoked sessions safely.
- Do not rely on a client-side session state alone to authorize sensitive operations.
- Avoid unnecessary reauthentication or session refresh operations on every component render.

If a session is invalid, reject the protected request and direct the user through the appropriate sign-in flow.

## 6. Authorization Rules

Authentication establishes who the user is. Authorization determines what that user may do.

Enforce authorization on the server for every protected page, Server Action, Route Handler, service operation, and data access path.

### Member data ownership

A member may access or modify only records they are authorized to manage.

For member-scoped operations:
- Derive the authenticated user ID from the verified server-side session.
- Use that identity to determine record ownership.
- Do not trust a submitted `userId`, `memberId`, role, or ownership field.
- Verify ownership and relevant business rules before reading or changing a record.

Apply these rules to memberships, bookings, payment history, benefit records, and profiles.

### Admin access

- Verify the authenticated user's trusted application role on the server.
- Reject unauthorized administrative operations, even if the user manually opens an admin URL or calls an API directly.
- Protect both administrative page rendering and the underlying data mutations.
- Restrict role assignment and role changes to explicitly authorized administrative provisioning processes.

### Public access

Only explicitly designated public pages and endpoints may be accessed without authentication.

Do not expose member records, private business operations, or administrative data through public endpoints.

Use the existing schema as the source of truth for field names, relationships, and constraints. Do not create a competing user or role model.

## 7. Protected Routes

Group routes by access requirements rather than scattering inconsistent checks throughout the application.

Typical route groups:

- Public: sign-in, registration, and approved public pages.
- Member: profile, membership, benefits, payment history, workspace discovery, and personal bookings.
- Admin: member management, plan management, resource management, booking oversight, payment operations, and reporting.

Use the actual route structure defined in the project.

Middleware or proxy-level checks may handle early redirects, but they do not replace server-side authorization in the operation that accesses or changes protected data.

For unauthorized access:
- Unauthenticated users should be redirected to sign-in where appropriate.
- Authenticated members attempting admin-only actions should receive a forbidden response or an appropriate access-denied page.
- API endpoints should return suitable HTTP status codes instead of relying on browser redirects for every case.

## 8. AI Assistant Security

The Workn AI assistant must follow the same authentication and authorization rules as the rest of the application.

- Identify the current user from the verified server-side session.
- Derive member identity from that session, not from user-supplied prompts or tool arguments.
- Restrict tools to the permissions of the authenticated user.
- Verify authorization inside each tool implementation before accessing data or performing a mutation.
- Do not expose another member's membership, benefits, bookings, payment history, or private records.
- Apply admin-only permissions to administrative tools.
- Validate tool inputs and enforce the same business rules used by normal application operations.

The model must not receive privileged credentials or have unrestricted database access. AI-generated claims must never replace server-side checks or trusted database state.

## 9. Security Requirements

- Validate and sanitize inputs on the server.
- Use secure, supported session and cookie handling.
- Protect sensitive mutations against cross-site request forgery where applicable to the chosen session and request architecture.
- Apply rate limiting to authentication endpoints and other sensitive operations where appropriate.
- Avoid logging passwords, access tokens, refresh tokens, session cookies, or unnecessary personal information.
- Return generic authentication errors and safe authorization errors.
- Keep environment secrets in server-side environment variables.
- Use only the Supabase public/anonymous key in browser code where required by the configured architecture, alongside appropriate RLS policies. Never expose the service-role key.
- Do not bypass authorization to make a failing request work.
- Preserve audit history for sensitive administrative actions using the existing audit model.


## 10. Implementation Rules

- Inspect the existing authentication setup before changing it.
- Reuse the project's configured Supabase client utilities and session patterns.
- Keep authentication, authorization, and business logic separated.
- Use server-side helpers for repeated identity and permission checks.
- Keep route protection consistent with the actual application structure.
- Follow the existing schema and project conventions.
- Do not introduce new dependencies, authentication providers, roles, or account policies without a clear requirement.
- Do not weaken security to resolve implementation errors.
- Document any unresolved authentication decision instead of silently inventing a rule.

