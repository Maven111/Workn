# Client-Side Validation Rules: Specification, Failure Modes & Legitimate User Costs

*Every validation rule in Workn is derived from the operational context of a coworking business in Lagos, Nigeria. Every rule blocks someone; this document records what each rule enforces, what breaks without it, and which legitimate users it wrongly blocks.*

---

## 1. Empty Fields (On-Blur Validation)

When a user focuses an input field and leaves (`onBlur`) without typing, an inline error with a caution icon appears immediately below that field:

| Field | On-Blur Empty Error Wording |
| :--- | :--- |
| `fullName` | `"Full name cannot be blank."` |
| `email` | `"Email address is required."` |
| `phone` | `"Phone number is required."` |
| `password` | `"Password is required."` |
| `confirmPassword` | `"Please confirm your password."` |

---

## 2. Length, Structure & Format Rules

### 1. `fullName` (Full Name)
- **The Rule**: 3 to 80 characters after trimming (`trimmed.length >= 3 && trimmed.length <= 80`), allowing only letters (including accented Latin characters), spaces, hyphens (`-`), and apostrophes (`'`) via `/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/`.
- **What goes wrong without it**:
  - Without a minimum length, users submit single-character placeholders (`"A"` or `"."`), making it impossible for front-desk staff in Lagos to verify physical IDs at check-in or issue valid corporate tax receipts.
  - Without a maximum length, multi-kilobyte strings overflow dashboard table layouts and PDF receipt headers.
  - Without character restrictions, numeric spam or HTML/script fragments pollute member rosters.
- **Which legitimate user it wrongly blocks**:
  - Legitimate users with two-letter legal names (such as *Jo*, *Li*, *Wu*, or *Ed*), users whose legal names contain generational numerals or periods (e.g., *Chukwuma Obi III* or *Jr.*), or international visitors entering names in non-Latin scripts (e.g., Arabic or Chinese characters).
- **Why the trade-off is accepted**:
  - In our primary Lagos market, legal names on Nigerian NIN/passports are written in Latin characters and exceed 3 characters, while blocking 1–2 character throwaway test strings prevents invalid front-desk check-in records.

---

### 2. `email` (Email Address)
- **The Rule**: Standard structural pattern `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/` requiring a local part, an `@` symbol, a domain name, and a top-level domain of at least 2 letters.
- **What goes wrong without it**:
  - Mistyped addresses (such as `ada@gmail` or `ada.okafor.com`) fail silently when dispatching verification links, password recovery tokens, and Paystack payment receipts, leaving the member locked out with an unverified account.
- **Which legitimate user it wrongly blocks**:
  - Users with internationalized domain names (IDNs) containing non-ASCII Unicode characters in the local part (RFC 6531) or quoted local parts containing spaces.
- **Why the trade-off is accepted**:
  - Over 99.9% of business and personal email providers used by remote workers and startups in Nigeria conform to standard ASCII email syntax, while catching missing TLDs saves significant customer support recovery overhead.

---

### 3. `phone` (Phone Number)
- **The Rule**: Digits only, strictly **10 to 11 digits** (`/^\d{10,11}$/`), matching standard Nigerian mobile numbers (`08031234567` as 11 digits, or `8031234567` as 10 digits once converted via `Number()`).
- **What goes wrong without it**:
  - Truncated 7-digit or 8-digit numbers cannot be dialed by workspace administrators when a meeting room booking overruns or when an interrupted bank transfer requires urgent reconciliation.
- **Which legitimate user it wrongly blocks**:
  - Expatriates, foreign consultants, or diaspora remote workers visiting Lagos who attempt to register using an international roaming number with a country code exceeding 11 digits (e.g., UK `+44` or US `+1` numbers with country prefix).
- **Why the trade-off is accepted**:
  - Workn operates a single physical location in Lagos where local SMS/voice outreach relies on Nigerian mobile carriers; enforcing 10–11 digits catches missing digits in local numbers immediately.

---

### 4. `password` (Password)
- **The Rule**: Minimum **8 characters**, maximum **72 characters** (`value.length >= 8 && value.length <= 72`), with no arbitrary symbol/uppercase composition rules.
- **What goes wrong without it**:
  - Passwords shorter than 8 characters are vulnerable to rapid credential-stuffing and offline brute-force attacks, risking unauthorized access to a member's prepaid coworking days and meeting-room credits.
  - Passwords longer than 72 bytes are silently truncated by bcrypt hashing algorithms, giving users a false sense of entropy beyond the 72nd character.
- **Which legitimate user it wrongly blocks**:
  - Users who rely on a 6-digit or 7-character password habit across low-security portals, or password-manager users generating 128-character passphrases.
- **Why the trade-off is accepted**:
  - 8–72 characters aligns with NIST SP 800-63B guidance and bcrypt's 72-byte ceiling, balancing mobile typing ergonomics with account security.

---

### 5. `confirmPassword` & `acceptTerms`
- **The Rule**: `confirmPassword` must match `password` exactly; `acceptTerms` must be checked (`true`).
- **What goes wrong without it**:
  - A typo inside a masked password field permanently locks the user out on their next visit; an unchecked terms box leaves the business without enforceable facility conduct or cancellation rules.
- **Which legitimate user it wrongly blocks**:
  - Users whose password managers auto-fill only the first password field on mobile browsers, requiring them to manually reveal/copy or type into the confirmation field.

---

## 3. Real-Time Format Check on Registration vs. On-Submit on Login

- **Registration (`onChange` Real-Time)**: As the user types their email on the registration form, format validation runs immediately so typos are caught before they move to the next field (`07-email-realtime-signup.png`).
- **Login (`onSubmit` Only)**: On the sign-in form, email format is validated **only when the user clicks "Sign in"** (`08-email-on-submit-login.png`). Existing members typing their email already know their address; flashing a red error message after their first keystroke (`"a"`) while they are still mid-word is hostile and distracting.

### Why Checking Whether an Email Exists on the Client Is Pointless
Checking whether an email actually exists from the browser is pointless because the only true proof of a live, deliverable inbox that belongs to the user is sending a verification message and having them complete the verification challenge on the server. Furthermore, exposing an endpoint that tells the browser in real time whether an email is already registered creates a textbook **user enumeration vulnerability**, allowing attackers to harvest a confirmed list of Workn customers without ever authenticating.

---

## 4. Numeric Identifiers (`<input type="text">` vs. `<input type="number">`)

- **Why `<input type="number">` is wrong for `phone`**: Phone numbers and PINs are digit strings, not mathematical quantities—using `<input type="number">` introduces a sticky default `0` (where typing `400` yields `0400` and forces the user to move the cursor back to delete the leading zero), renders useless up/down stepper arrows, and allows accidental scroll-wheel increments.
- **How Workn implements it**: `<input type="text" inputMode="numeric">` strips non-digits on change and converts the value in one line via `const numericPhone = Number(regPhone.trim());` right before submission.

### Where a Number Input Is the Correct Choice (Two Sentences)
A `<input type="number">` is the correct choice when collecting a true mathematical quantity that represents a count or measurement with meaningful arithmetic bounds—such as the **number of meeting room hours to book (`1` to `8`)** or the **number of guest day-passes to purchase (`1` to `20`)**. In those cases, incrementing or decrementing by `1` using the stepper arrows or arrow keys is genuinely helpful to the user, and leading zeroes have no semantic meaning.

---

## 5. Password Verification & Submit Button Behavior

### Visibility Toggle vs. Confirm Password Field
- **Workn's Implementation**: Workn provides both a visibility toggle (`EyeIcon`) and a confirmation password field on registration. The visibility toggle reduces typing errors on mobile touch keyboards under glare in Lagos coworking facilities.
- **Why Blind Double-Entry is Better in Stricter Industries**: In high-security environments (such as clinical healthcare, defense, or commercial banking), password visibility toggles are explicitly forbidden because on-screen cleartext creates an unacceptable shoulder-surfing vulnerability in shared spaces. Those industries mandate strict blind double-entry confirmation without cleartext rendering.

### Button States: Visible but Disabled vs. Hidden Until Valid (Two Sentences)
A visible but disabled button provides a permanent visual destination so the user understands the end goal of the form, whereas a hidden button creates cognitive confusion by making the form look unfinished or broken. Furthermore, a visible disabled button can explain itself when clicked by programmatically announcing missing prerequisites (such as an unaccepted Terms of Service checkbox), whereas a hidden element drops out of the accessibility tree with zero explanation.



