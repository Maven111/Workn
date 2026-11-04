# Task 2: Known Defects & Scaffold Deficiencies

This document records real defects identified in the Workn repository scaffolding, server actions, database integration, and responsive layout. Each defect cites the exact file and line, the underlying technical flaw, and what it would cost in production.

---

### Defect 1: Unsynchronized Application User Record (False Success on Database Failure)
- **File Reference**: [`src/lib/auth/actions.ts` Lines 40–53](file:///c:/Users/man/Desktop/Workn/src/lib/auth/actions.ts#L40-L53)
  ```typescript
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${siteUrl}/api/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: 'Check your email to confirm your account.' };
  ```
- **Underlying Flaw**:  
  The `register` server action issues a user creation request to Supabase Auth and immediately returns `{ success: true }`, without writing or synchronizing a corresponding application profile record in the local PostgreSQL database managed by Prisma ([`prisma/schema.prisma` `User` model](file:///c:/Users/man/Desktop/Workn/prisma/schema.prisma#L60-L80)). If the persistent PostgreSQL database is disconnected or down, the front-end still reports registration success to the user.
- **Production Cost**:  
  Users believe they have created a valid account and attempt to subscribe or book workspace desks. When backend services, billing logic, or booking queries attempt to join against `User` in PostgreSQL, foreign key lookups fail with orphaned sessions. Workspace managers cannot see the member in administrative records, causing severe customer service escalations, booking reconciliation disputes, and lost revenue.

---

### Defect 2: Rigid Text Wrapping on Hero Display Heading
- **File Reference**: [`src/components/home/HomeClient.tsx` Line 212](file:///c:/Users/man/Desktop/Workn/src/components/home/HomeClient.tsx#L212)
  ```tsx
  <h1
    className="type-display-large"
    style={{
      color: 'var(--color-on-surface)',
      marginBottom: 'var(--space-4)',
      lineHeight: '1.05',
      overflowWrap: 'break-word',
      wordBreak: 'break-word',
      whiteSpace: 'nowrap',
      fontSize: 'clamp(1.5rem, 5vw, 3rem)',
    }}
  >
    Everything, working for you.
  </h1>
  ```
- **Underlying Flaw**:  
  The heading style includes `whiteSpace: 'nowrap'` directly alongside `overflowWrap: 'break-word'`. On compact mobile screens (below 360px viewport width, such as iPhone SE or budget Android devices), the `nowrap` rule overrides soft wrapping, forcing the display heading to break out of its container and overflow horizontally past the viewport margin.
- **Production Cost**:  
  The landing page breaks horizontally on mobile viewports, introducing an unsightly horizontal scrollbar and clipping brand headline copy. First-time visitors arriving on mobile connections in Lagos experience a broken marketing presentation, immediately depressing conversion rates. (This defect directly generated the evidence captured in `18-heading-wrap-bad.png`).

---

### Defect 3: Stale Route Target in Logout Redirect
- **File Reference**: [`src/lib/auth/actions.ts` Lines 89–90](file:///c:/Users/man/Desktop/Workn/src/lib/auth/actions.ts#L89-L90)
  ```typescript
  revalidatePath('/', 'layout');
  redirect('/login');
  ```
- **Underlying Flaw**:  
  When user authentication was consolidated into a single-page architecture at `/auth?view=login`, the legacy dedicated route `/login` was deprecated. However, the `logout` server action still hardcodes a redirect to `/login` instead of `/auth?view=login` or `/`.
- **Production Cost**:  
  When an authenticated member logs out from the application, the browser is redirected to a legacy or non-existent route (`/login`). If route rewrites or fallbacks fail, the member hits an unexpected 404 or redirect loop, eroding trust and preventing a clean sign-in transition.

