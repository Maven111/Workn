# Task 3 Technical Interview Answers

*Fourteen technical questions answered in the Builder's voice, derived from real implementation work, code defects, and evidence in Workn. Every answer is under 200 words.*

---

### Question 1: Why is client-side validation not enough?

Client-side validation runs in the browser, an execution environment completely controlled by the user. An end-user can open DevTools to delete `required` attributes, manipulate JavaScript state variables, or bypass the browser entirely by sending raw HTTP requests using tools like `curl`, Postman, or custom Python scripts. 

In Step 8, we sent a raw POST request with a 1-character name and unaccepted terms directly to `/auth`. The request completely evaded our React state checks and regex rules. 

Client-side validation exists strictly as a user experience convenience: it gives instant visual feedback, reduces round-trip latency, and spares server bandwidth for cooperative users. But it provides zero security against malicious actors. The server must unconditionally re-validate all data.

*(122 words)*

---

### Question 2: What security checks belong in the frontend, and what must the server enforce regardless?

No true security checks belong exclusively in the frontend. The frontend's role is ergonomic guidance:
- Format hints and regex sanity checks.
- Enforcing field length boundaries for immediate UI feedback.
- Accessible ARIA error associations (`aria-describedby`, `role="alert"`).
- Masking sensitive fields to prevent over-the-shoulder shoulder surfing.

The server must enforce everything else authoritatively:
- Strict schema validation (type, structure, length, allowed characters).
- Authentication and session token verification.
- Server-side authorization and resource ownership (checking that user ID matches record owner).
- Input sanitization against SQL injection and stored XSS.
- Rate limiting and brute-force defenses.
- Business rule invariants (non-overlapping bookings, credit balances, legal terms consent).

*(113 words)*

---

### Question 3: The interface hides the delete button for non-administrators. Is that enough?

No. Hiding a UI element is cosmetic interface presentation, not access control. 

An authenticated member who opens Browser DevTools can easily inspect the DOM, un-hide the button, or observe the underlying API endpoint and issue a direct `DELETE` or `POST` request over HTTP. If the server handler or Server Action checks only whether a request was made rather than verifying the caller's server-side session role, the unauthorized deletion will execute.

In Workn, role-based access control (RBAC) is enforced authoritatively on the server. Every destructive Server Action extracts the authenticated user's session from secure cookies, loads their application role from PostgreSQL, and explicitly aborts with HTTP 403 Forbidden if `user.role !== 'ADMIN'`.

*(120 words)*

---

### Question 4: What is the difference between validation, encoding and sanitisation?

These are three distinct defense-in-depth operations applied at different lifecycle stages:

1. **Validation**: An acceptance gate. It checks whether incoming untrusted input conforms to strict structural rules (type, length, regex format). If it fails, the input is rejected immediately (e.g., rejecting a phone number that contains letters).
2. **Sanitisation**: Cleaning input before storage or processing. It strips dangerous characters or normalizes data while retaining meaning (e.g., trimming whitespace, removing HTML script tags, or converting phone strings to digits).
3. **Encoding**: Transforming data into a safe representation immediately before rendering it in an output context. For example, converting `<` to `&lt;` in HTML contexts prevents the browser from interpreting user data as executable markup, neutralising Cross-Site Scripting (XSS).

*(126 words)*

---

### Question 5: Why should you validate route parameters and query strings, not just the body?

Developers often mistakenly view URL path parameters (`/bookings/[id]`) and query parameters (`?view=register`) as "system routing" rather than user input. In reality, every byte in the URL is untrusted input supplied directly by the client.

Unvalidated route parameters expose the system to:
1. **SQL Injection / Prisma Errors**: Injecting malformed UUIDs into database queries crashes the runtime or triggers unhandled exceptions.
2. **Broken Object-Level Authorisation (BOLA / IDOR)**: Changing `?bookingId=104` to `?bookingId=105` allows attackers to view or cancel other members' reservations unless ownership is checked.
3. **Open Redirects & SSR Exploits**: Attackers use unvalidated query strings like `?redirect=https://evil.com` to phish users after login.

Every route parameter must be strictly type-checked and authorized on the server.

*(126 words)*

---

### Question 6: Explain what a single page application is, and how you make one discoverable by search engines.

A Single Page Application (SPA) loads a single HTML shell and dynamically updates content in the browser via JavaScript as the user interacts, eliminating full-page browser refreshes and preserving in-memory state. In Workn, `/auth` functions as an SPA where switching between login, registration, and password recovery occurs instantly via `?view=` URL query parameters.

To make an SPA discoverable by search engine web crawlers:
1. **Server-Side Rendering (SSR) & Hybrid Hydration**: Using Next.js App Router, the initial page shell and marketing content are pre-rendered into semantic HTML on the server before reaching the client.
2. **Metadata API**: Exporting route-specific `<title>`, `<meta name="description">`, Open Graph, and canonical tags in `page.tsx`.
3. **Semantic HTML & Clean Routing**: Using proper anchor links (`<Link href="...">`), semantic headings (`<h1>`), and sitemaps so search bots can traverse paths without requiring complex client execution.

*(144 words)*

---

### Question 7: What are the advantages and disadvantages of a single page application against a multi-page application?

**Advantages**:
- **Fluid User Experience**: Screen updates and tab switching happen instantly without white-screen flashes or page reload flickers.
- **State Preservation**: In-memory client states, partially entered form data, and active network connections are maintained across view transitions.
- **Lower Server Load per Transition**: Navigating between forms transfers only lightweight query changes rather than re-requesting layout HTML and shared assets.

**Disadvantages**:
- **Initial Bundle Overhead**: SPAs ship larger JavaScript bundles up front, which can increase First Contentful Paint (FCP) on slow 3G cellular connections in Lagos.
- **State Complexity**: Developers must manually manage browser history (`pushState`), focus shifts, screen reader announcements, and scroll position.
- **Security Scope**: Storing session tokens in browser memory risks XSS exfiltration compared to server-rendered MPAs backed by HttpOnly cookies.

*(136 words)*

---

### Question 8: Explain the four principles of the Web Content Accessibility Guidelines, with examples from your own work.

The four WCAG principles form the acronym **POUR**:

1. **Perceivable**: Information must be presentable in ways users can perceive. In Workn, inline error states never rely on red colour alone; each message includes a high-contrast `CautionIcon` SVG alongside explicit error text (WCAG 1.4.1).
2. **Operable**: Interface components must be navigable with a keyboard. We eliminated native `disabled` on submit buttons in favour of `aria-disabled="true"`, ensuring keyboard users can reach the button in the tab order (WCAG 2.1.1) and view focus indicators (WCAG 2.4.7).
3. **Understandable**: Content and controls must be clear. We added live password requirement counters that explain character thresholds dynamically as typing begins.
4. **Robust**: Content must be interpretable by diverse user agents. We programmatically linked inputs to error alerts using `aria-describedby` and `aria-invalid="true"` so screen readers announce errors immediately upon blur.

*(142 words)*

---

### Question 9: Discuss the importance of semantic HTML in the context of accessibility.

Semantic HTML uses tags that communicate structural meaning and purpose (`<main>`, `<form>`, `<label>`, `<button>`, `<input>`) rather than unsemantic wrappers (`<div>`, `<span>`).

In assistive technology like screen readers:
1. **Implicit Roles and Accessible Tree**: A `<button>` automatically announces its role, receives native keyboard focus (`Tab`), and handles `Space` and `Enter` activations. A `<div onClick>` does none of these unless manually retrofitted with dozens of lines of fragile ARIA and key listener code.
2. **Form Association**: Using `<label htmlFor="reg-name">` ensures screen readers announce the field's label upon focus and expands the clickable touch target area for motor-impaired users.
3. **Document Landmarks**: Landmarks like `<main>` and `<h1>` allow blind users using screen reader hotkeys (e.g., `H` in NVDA) to jump directly to primary tasks without listening to repeated navigation headers.

*(141 words)*

---

### Question 10: Tell me about a time when you disagreed with what a customer wanted to build.

A customer operating a shared workspace requested an automated "one-click passwordless auto-login" button directly on the public reception tablet, arguing that remembering passwords created friction for daily drop-in coworkers.

I strongly pushed back. A public kiosk that automatically authenticates anyone touching the screen completely compromises account security. Any visitor could view private payment history, alter active bookings, or impersonate other members.

Instead of dismissing their user experience concern, I proposed a compromise: we maintained strict server-authenticated sessions backed by email magic links and SMS one-time codes for mobile self-check-in, while placing an attendant-facing verification portal for the receptionist. This eliminated member friction without exposing the workspace's administrative boundaries to public compromise.

*(119 words)*

---

### Question 11: How would you explain to a non-technical executive why their AI implementation is not performing as expected?

I would avoid technical jargon and use a practical workplace analogy:

"Imagine hiring an exceptionally articulate intern who has read every business textbook in the world, but whom you placed in a dark room with zero access to your internal inventory, customer database, or pricing sheets. When a client asks a question, the intern wants to please you, so they invent plausible-sounding answers based on memory.

Our AI assistant is currently doing the same thing: it has broad language fluency, but it lacks direct, verified access to our real-time database.

To fix this, we don't need a larger or more expensive model. We need to build secure backend 'tools'—controlled pipelines that give the assistant real-time read access to verified member records and booking schedules. The AI provides the conversational voice, but our trusted database must provide the facts."

*(141 words)*

---

### Question 12: One of your validation rules wrongly blocks a category of legitimate user. Name the rule, name the users, and defend the trade-off or say you got it wrong.

Our `fullName` validation rule enforces a 3-character minimum (`value.trim().length >= 3`).

This rule wrongly blocks legitimate individuals with two-letter legal names—such as Nigerian citizens with names like "Ed", "Ib", or "Tu", as well as international members named "Ng", "Wu", or "Li".

I defend this trade-off for registration convenience: in the vast majority of web onboarding flows, 1- and 2-character names represent accidental single-letter keystrokes or testing garbage (`"a"`, `"xx"`). Requiring at least 3 characters eliminates low-effort test data entry.

However, from an internationalization and inclusion perspective, **this was technically the wrong trade-off.** A legal name can legitimately be 2 characters. The proper solution is lowering the floor to 2 characters while combining it with an alphabet-only character whitelist (`/^[A-Za-z\s'-]{2,80}$/`).

*(138 words)*

---

### Question 13: You sent a request directly to your own endpoint. Say exactly what happened and what it tells you about the rules you spent days writing.

In Step 8, I sent a direct POST request via `curl` with `fullName="A"` and `acceptTerms="false"`. 

The server completely bypassed the client rules. It did not return a 400 Bad Request, nor did it enforce the 3-character name limit or the terms checkbox. The request crashed with an unhandled 500 Internal Server Error because the server action attempted to forward unvalidated parameters directly to downstream auth without applying server-side validation schemas.

This proves that all the client-side validation logic I spent days engineering—the regular expressions, the `aria-describedby` links, the caution icons, and the disabled buttons—are strictly user experience conveniences. They guide polite users in browsers, but offer zero defense against anyone who interacts directly with the network layer.

*(130 words)*

---

### Question 14: Wrong-answer analysis: a candidate says they use strong client-side regex on every field, disable the submit button until valid, and sanitise all inputs in the browser, which covers the main injection and bad-data risks. Say which parts are useless, which are actively misleading, and what the candidate has confused with what.

1. **Which parts are useless**: Disabling the submit button and sanitising inputs in the browser provide zero security protection. An attacker does not click buttons; they send raw HTTP requests directly to endpoints using scripts or DevTools.
2. **Which parts are actively misleading**: Claiming that client-side regex and browser sanitisation "cover injection and bad-data risks" is dangerously misleading. Injection attacks (SQLi, Command Injection, Stored XSS) execute on the server and database, where browser regex has zero jurisdiction.
3. **What the candidate confused**: The candidate confused **client-side UX ergonomics** with **server-side security boundaries**. They failed to realize that input validation, sanitisation, and parameterized query execution must occur authoritatively on the server, where the untrusted network perimeter is enforced.

*(128 words)*
