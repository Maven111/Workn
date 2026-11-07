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

