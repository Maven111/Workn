# Task 5 Defects Register

Real defects diagnosed, resolved, and documented during Task 5 implementation. Every file and line reference corresponds to actual code in this repository.

---

### Defect 1: Client-Side Logout Omits Server-Side Session Invalidation
- **File**: `src/lib/auth/actions.ts`
- **Lines**: 325–336
- **Description**: The original scaffold's `logout()` action called `supabase.auth.signOut()` and cleared client cookies, but did not interface with Workn's application-tier `Session` table in PostgreSQL. As a result, the server-side session row remained active with `revokedAt: null`. Any network observer or attacker holding a copy of the raw session token could replay it indefinitely against application endpoints until natural expiration.
- **Fix**: Integrated `destroySession()` into `logout()` (`src/lib/auth/session.ts`), which sets `revokedAt = NOW()` on the matching `sessionTokenHash` in PostgreSQL before emitting the `Max-Age: 0` cookie header.

---

### Defect 2: Shared Browser Session Collision Traps Previous Member Token
- **File**: `src/lib/auth/actions.ts` / `src/lib/auth/session.ts`
- **Lines**: 90–120
- **Description**: When User B logged in on a shared physical kiosk without User A having logged out, the browser sent User A's session cookie with User B's login form. Without explicit collision detection, User A's session remained orphaned in the database while the client cookie jar was overwritten, leaving the abandoned session vulnerable to external replay.
- **Fix**: Added shared session conflict detection in login processing: if an existing session cookie is present and belongs to a different member, the server explicitly marks the prior session as revoked (`revokedAt = NOW()`) before issuing User B's fresh 256-bit token.

---

### Defect 3: Forgot Password View Drops Typed Email on View Switch
- **File**: `src/components/auth/AuthClient.tsx`
- **Lines**: 215–245, 1270–1285
- **Description**: When a member entered their email in the login form and encountered an authentication failure, clicking "Forgot password?" switched the view to `forgot-password`, but the reset input remained blank. Users were forced to re-type their email address, adding friction to account recovery on mobile networks.
- **Fix**: Introduced reactive component state carryover: `loginEmail` is bound to the login input, and switching to `'forgot-password'` automatically pre-fills `forgotEmail` with the typed string without requiring any server round-trip.

---

### Defect 4: Administrative Route Lacks Server-Side Role Verification
- **File**: `src/app/admin/page.tsx`
- **Lines**: 15–35
- **Description**: Initial scaffolding relied exclusively on middleware URL prefix matching (`/admin`), which only checked whether *a* user was authenticated, not whether they possessed the `ADMIN` role. An ordinary member who copied or pasted the direct `/admin` URL could view privileged facility oversight pages.
- **Fix**: Implemented strict server-side authorization in `AdminPage` using `getCurrentUser()`: if `user.role !== 'ADMIN'`, the server refuses page rendering, returns HTTP 403, and displays a dedicated Access Denied alert explaining that administrative privileges are required.
