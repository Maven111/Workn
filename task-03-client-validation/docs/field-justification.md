# Information Design on the Form: Field Justification

*Every field on Workn's authentication and registration forms is evaluated against three strict operational criteria: (1) Why it is needed, (2) What the business does with it, and (3) What happens if the user gets it wrong. Any field failing all three is excluded.*

---

## 1. Retained Form Fields

### 1. `fullName` (Full Name)
- **Why it is needed**: Identifies the physical person arriving at the Workn coworking facility in Lagos, populates official payment receipts, and labels desk and meeting-room bookings.
- **What the business does with it**: Persisted in `User.fullName` in PostgreSQL and user metadata in Supabase Auth. Displayed on the member's dashboard, shown to administrators in the booking oversight and member management views, and used by the AI assistant when referencing account records.
- **What happens if the user gets it wrong**: Front-desk workspace staff cannot match the member's government or work ID against their active reservation at check-in, and generated corporate expense receipts carry an inaccurate name, requiring manual administrative verification to amend.

### 2. `email` (Email Address)
- **Why it is needed**: Serves as the unique primary identifier for account sign-in and the delivery channel for verification links, password recovery tokens, booking confirmations, and payment receipts.
- **What the business does with it**: Normalized, indexed in `User.email`, and bound to the authentication identity. Used by backend services to dispatch transactional notifications and reconcile Paystack payment webhooks with the correct member record.
- **What happens if the user gets it wrong**: The user cannot receive their account verification link or password reset emails, locking them out of their account and preventing delivery of payment and booking confirmations.

### 3. `phone` (Phone Number)
- **Why it is needed**: Provides a direct, low-latency contact channel for urgent on-site workspace operations in Lagos (such as meeting-room overruns, sudden facility/power updates, or resolving interrupted local bank transfer / USSD payments).
- **What the business does with it**: Stored on `User.phone` (defined in `prisma/schema.prisma`) for administrative member outreach and urgent booking exception handling. Converted to a numeric value before reaching the server to strip formatting characters.
- **What happens if the user gets it wrong**: Workspace administrators cannot reach the member by phone during time-sensitive booking conflicts or facility alerts, forcing reliance on slower email communication.

### 4. `password` (Password)
- **Why it is needed**: Authenticates the member on return visits so that private membership balances, remaining coworking days, meeting-room hours, and payment histories remain protected from unauthorized access.
- **What the business does with it**: Passed to the authentication provider to compute a salted cryptographic hash. The plain-text password is never stored in PostgreSQL, written to application logs, or exposed to administrators.
- **What happens if the user gets it wrong**: On login, authentication is refused with a generic error message. On registration, mistyping an unconfirmed password would lock the member out on their next visit, forcing an immediate password reset flow.

### 5. `confirmPassword` (Confirm Password)
- **Why it is needed**: Prevents accidental self-lockout caused by typographical errors inside a masked password field during registration.
- **What the business does with it**: Compared against `password` prior to submission to verify that the user typed what they intended; discarded immediately after validation and never persisted to the database.
- **What happens if the user gets it wrong**: Form submission is halted immediately with an inline mismatch error before a broken credential can be created.

### 6. `acceptTerms` (Terms of Service & Privacy Policy Acceptance)
- **Why it is needed**: Establishes a binding agreement under Nigerian law governing physical facility conduct, non-rollover monthly subscription benefits, the 2-hour meeting-room cancellation window, AI assistant limitations, and Nigeria Data Protection Act (NDPA) data processing consent.
- **What the business does with it**: Checked prior to account creation; if unchecked, registration is blocked and a prompt explains that agreement is required to create an account.
- **What happens if the user gets it wrong (leaves unchecked)**: The form refuses submission, protecting the business from unenforceable workspace rules and protecting the user from unconsented personal data processing.

---

## 2. Fields Evaluated and Removed (Failed the Three Questions)

| Candidate Field | Reason for Exclusion |
| :--- | :--- |
| **Residential / Street Address** | Workn provides on-site coworking desks and meeting rooms rather than shipping physical goods. Collecting home addresses increases registration friction and creates unnecessary personal data liability under the NDPA. |
| **Company Name / Job Title** | Neither desk availability nor subscription eligibility depends on a member's employer. Removing it keeps registration fast on mobile connections. |
| **Username / Public Handle** | Workn is an operational workspace platform, not a social network. `email` already serves as a unique identifier without forcing users to invent a separate handle. |
| **Date of Birth** | Age eligibility (18+) is covered contractually via the Terms of Service acceptance checkbox; storing exact birthdates adds sensitive PII risk without operational benefit. |

---

## 3. Removal of Non-Functional Decoration

- **Functional Brand Link**: The top-left `W Workn` mark inside the authentication card is wrapped in a functional `<Link href="/">` with `aria-label="Workn Home"`, giving users a clear escape hatch back to the landing page.
- **Eliminated Decorative Clutter**: Decorative secondary icons, marketing banners, and non-interactive divider badges inside the form body were stripped out so every visual element inside the card serves either navigation, input collection, or validation feedback.

