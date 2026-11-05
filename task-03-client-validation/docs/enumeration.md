# Anti-Enumeration: Protecting the Shape of Sensitive Data

*Technical documentation of sensitive field analysis, structural intelligence mitigation, and accepted usability trade-offs.*

---

## 1. The Sensitive Field: Password and Credential Inputs

On authentication interfaces, the **Password** field (and associated verification PINs) constitutes sensitive structural data. While user-facing design often defaults to providing extensive formatting hints or mask placeholders (such as `"8–12 characters with 1 symbol"` or fixed-character masks like `"••••••••"`), revealing the exact shape, bounds, or format of a credential introduces security risks.

In Workn, we explicitly audited the sign-in and registration forms to ensure no placeholder or client-side prompt reveals structural constraints that attackers can weaponize.

---

## 2. Why the Shape of the Data Is Sensitive

When an application publicizes the exact parameters of its credentials—such as fixed lengths, specific character set mandates, or rigid structure rules—it drastically narrows the mathematical complexity required to compromise accounts.

### What an Attacker Gains from Knowing the Shape
1. **Targeted Mask Attacks in Hashcat / Offline Cracking**:  
   If an attacker steals a database hash dump or targets an account, knowing that passwords are constrained to a specific length (e.g., exactly 8 characters or 8–10 characters) cuts the candidate keyspace by several orders of magnitude. Instead of searching a keyspace of $95^{12} \approx 5.4 \times 10^{23}$ combinations, an attacker configures a targeted mask attack strictly for length 8 ($95^8 \approx 6.6 \times 10^{15}$ combinations), reducing brute-force computation time from centuries to hours.
2. **Pruning Credential-Stuffing Dictionaries**:  
   In automated credential-stuffing attacks, bots test stolen credential dumps from other breaches against Workn's login endpoint. If the client-side login form enforces or advertises a specific shape rule (e.g., rejecting submissions under 8 characters client-side), the attacker filters their 10-million-record combo list in advance, eliminating candidates that don't match the pattern and maximizing their request-to-success ratio against rate limiters.
3. **User Account Fingerprinting**:  
   If password requirements differ between older and newer versions of an application, exposing hints can reveal when an account was created or whether it conforms to legacy policies.

---

## 3. What Was Changed on Workn's Forms

1. **Stripped Revealing Placeholders on Login**:  
   On the sign-in form ([`AuthClient.tsx`]
   The password placeholder was kept strictly generic (`placeholder="Enter your password"`). We deliberately avoided placeholders with fixed dot masks (e.g., `placeholder="••••••••"` which hints at an 8-character length) or descriptive hints such as `"Must be 8 characters"`.
2. **Eliminated Pre-Submit Length Refusal on Login**:  
   On login, client-side format checks do not block passwords shorter than 8 characters before submission. If an attacker submits a 6-character password to test whether an account exists, the form submits it to the backend without client-side refusal. The server verifies the credential and returns a completely uniform, generic error message (`"Invalid email or password"`), revealing zero information about whether the failure was due to length, email non-existence, or incorrect characters.
3. **Registration Bounded by Length Only**:  
   On registration, we enforce length over complexity (minimum 8 characters, maximum 72 to prevent bcrypt truncation). We do not advertise an upper limit in the placeholder or force arbitrary symbol/number compositions that encourage predictable substitution patterns (such as ending in `"!"` or replacing `"a"` with `"@"`).

---

## 4. The Usability Trade-Off Accepted

| Dimension | Impact of Removing Structural Placeholders |
| :--- | :--- |
| **Friction for Legitimate Users** | Users cannot see the password requirements passively from an un-interacted placeholder text. They only receive contextual guidance once they begin interacting with the field or if their entry falls below the 8-character threshold. |
| **Cognitive Load** | Legitimate members must rely on their password manager's generated passphrase or standard habits rather than matching an on-screen visual template. |
| **Security Benefit** | Attackers obtain zero structural intelligence from inspecting HTML attributes, placeholders, or login client validation logic. Automated credential stuffing tools cannot pre-validate or prune candidate lists prior to hitting server-side rate limiters. |

### Is the Trade-Off Worth It?
**Yes.** For a coworking platform handling workspace memberships, financial booking transactions, and door access credentials in Lagos, protecting accounts against automated credential stuffing and dictionary optimization far outweighs the minor convenience of seeing formatting rules printed inside an empty input box. Legitimate users receive clear feedback the moment they type an insufficient password, while attackers are denied structural intelligence.

