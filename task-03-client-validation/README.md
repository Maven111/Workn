# Task 3: The Form, Attacked from Both Sides

*Technical overview written for a technical interviewer with four minutes.*

---

## 1. What the Task Was

Task 3 focused on building an accessible, high-performance registration and authentication interface for Workn. The core mandate was threefold:
1. Collect clean, structured member data for physical coworking space access in Lagos.
2. Ensure full accessibility (WCAG 2.1 AA) for individuals who cannot see colour or rely on keyboards and screen readers.
3. Attack the interface from both the frontend and directly over the network to prove that client-side validation is purely an ergonomic convenience, not an authoritative security boundary.

---

## 2. What Was Built

- **Single-Page Authentication (SPA)**: Consolidated `/login`, `/register`, and `/forgot-password` into a single view at `/auth?view=` powered by React query parameter switching, eliminating page reloads and state drops.
- **Client Validation Engine**:
  - *On-Blur Empty Checks*: Instant inline error alerts with SVG `CautionIcon` visual cues.
  - *Shape & Boundary Enforcement*: Full name bounded to 3–80 characters; phone sanitized to 10–11 numeric digits via `Number()`.
  - *Real-Time Signup Validation*: Real-time format checking on registration; submit-only checking on login.
  - *Password Requirements*: Progressive disclosure hint appearing only once typing begins; length beats complexity (8–72 characters).
- **Accessibility & Assistive Engine Support**:
  - Programmatic error association via `aria-describedby` and `aria-invalid="true"`.
  - Dual password visibility toggle (`EyeIcon`) and confirmation field.
  - High-contrast `:focus-visible` indicators across all inputs, toggles, and buttons.
  - `aria-disabled="true"` on submit buttons to keep them focusable in the keyboard tab order with contextual spoken warnings.
- **Attack & Bypass Proofs**:
  - Tested 5 attack vectors (single-char names, whitespace passwords, malformed emails, boundary overflows) in [`evidence/15-form-attack-results.txt`](./Evidence/15-form-attack-results.txt).
  - Executed a direct command-line `curl` POST request bypassing the form completely, documented in [`evidence/16-direct-request-command-and-response.txt`](./Evidence/16-direct-request-command-and-response.txt).
- **Deterministic Git Rollback**:
  - Executed a clean, unambiguous revert referencing the exact commit ID (`a87dfd3`), documented in [`evidence/17-commit-list-and-rollback.txt`](./Evidence/17-commit-list-and-rollback.txt) and [`docs/rollback.md`](./docs/rollback.md).

---

## 3. What Was Decided

1. **Text Input with `Number()` Conversion Over `type="number"`**:
   HTML `<input type="number">` causes jarring cursor jumps, leading zeros, and unwanted scrollwheel mutations. We selected a text input with `inputMode="numeric"`, sanitizing non-digits on input and converting to an integer with `Number()` prior to transmission.
2. **Hiding Sensitive Format Indicators on Login**:
   To thwart Hashcat mask attacks and credential stuffing, we removed password length hints and specific validation wording from the login view, ensuring error messages remain strictly generic.
3. **Visible but Disabled Submit Button vs Hidden Button**:
   We chose a visible, `aria-disabled="true"` submit button over hiding the button entirely. Hiding the button creates cognitive friction because users cannot determine how to complete the form. Making it visible but disabled—and announcing missing requirements upon activation—guides the user without mystery.
4. **Derived Numbers Registered**:
   All field limits (Name: 3–80 chars, Phone: 10–11 digits, Password: 8–72 chars) were derived for Workn and recorded in [`Docs/numbers-register.md`](../Docs/numbers-register.md).

---

## 4. What Went Wrong

1. **Disabled Button Eviction from Sequential Focus Order**:
   - *Defect*: Native HTML `disabled` evicted the submit button from the keyboard tab sequence, causing screen readers and keyboard users to skip it without explanation.
   - *Fix*: Replaced native `disabled` with `aria-disabled="true"`, keeping the control focusable while intercepting activation to announce missing requirements.
2. **Server-Side Validation Omission**:
   - *Defect*: In [`src/lib/auth/actions.ts`](../src/lib/auth/actions.ts#L34-L53), the server action passes unvalidated `FormData` directly to Supabase Auth without length checks or terms verification.
   - *Implication*: Direct HTTP requests bypass all browser checks, proving client validation cannot defend the backend. Scheduled for resolution in Task 4 via server-side Zod schemas and transactional database provisioning.
3. **Initial Headroute Text Clipping**:
   - *Defect*: Hero display headings clipped on screens below 360px due to unconstrained `whiteSpace: nowrap`.
   - *Fix*: Wrapped headings in responsive container with soft clause breaks.

---

## 5. Directory Map of Deliverables

```text
task-03-client-validation/
├── README.md                           # This 4-minute overview
├── docs/
│   ├── spa-rationale.md                # SPA query param vs MPA trade-off analysis
│   ├── field-justification.md          # 3-part justification for every form input
│   ├── validation-rules.md             # Validation rules, user impact, and button logic
│   ├── terms-note.md                   # Legal commentary under Nigerian law
│   ├── enumeration.md                  # Sensitive shape protection & Hashcat mask defenses
│   ├── accessibility-audit.md          # WCAG audit across 5 criteria & screen reader transcripts
│   ├── client-side-is-not-security.md  # Disproportionate weight deliverable on server bypass
│   ├── rollback.md                     # Reflog mechanics and commit ID precision
│   ├── defects.md                      # Production cost analysis of real defects
│   └── interview-answers.md            # 14 interview answers under 200 words each
└── Evidence/
    ├── 01-page-count-before.txt        # Initial page count before SPA refactor
    ├── _02-page-count-after.txt        # Single-page consolidated auth count
    ├── 03-url-states1,2,3.png          # Visual verification of query param transitions
    ├── 04-form-switch-logs.txt         # Terminal logs proving zero page reloads
    ├── 15-form-attack-results.txt      # 5 attack vectors blocked by client validation
    ├── 16-direct-request-command-and-response.txt # Real curl request bypassing client
    └── 17-commit-list-and-rollback.txt # Git log and revert proving exact ID rollback
```
