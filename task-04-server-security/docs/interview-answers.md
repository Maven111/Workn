# Task 4 Interview Answers

### 1. Why should you hash passwords?
Passwords must never be stored in readable form because storage environments eventually suffer breaches through application vulnerabilities, compromised database backups, insider threats, or server misconfigurations. Hashing applies a one-way cryptographic transformation that cannot be reversed. When a database dump is leaked, hashing ensures the adversary obtains only irreversible mathematical digests rather than plaintext credentials. Because users routinely reuse passwords across multiple personal and banking services, failing to hash credentials directly compromises member security across the broader internet.

---

### 2. Why use bcrypt instead of SHA-256 for passwords?
SHA-256 is designed for high-throughput data integrity verification. It processes data in microseconds; on my CPU, Node.js computed SHA-256 in 0.0017 ms (over 584,000 hashes per second on a single core). A modern 8-GPU rig computes billions of SHA-256 digests per second, cracking common 8-character passwords in minutes. By contrast, bcrypt is an adaptive, computationally expensive password hashing algorithm parameterized by a configurable work factor. At cost 12 on my machine, bcrypt takes 451.95 ms—over 264,000 times slower than SHA-256. This computational friction is negligible for a legitimate user logging in once, but financially and computationally prohibitive for an attacker attempting billions of brute-force candidate evaluations.

---

### 3. What is a salt and why do you need it?
A salt is a unique, cryptographically random string generated and prepended to a password before hashing. It solves two critical vulnerabilities: identical passwords and precomputation attacks. Without a salt, two members who choose the identical password produce identical hashes in the database, allowing an attacker to deduce shared credentials immediately. More critically, unsalted hashes can be instantly reversed using rainbow tables—massive precomputed lookup tables mapping common passwords to their digests. Salting ensures every password produces a completely unique hash, forcing an attacker to compute a dedicated brute-force attack for every individual account rather than cracking the entire database simultaneously.

---

### 4. What salt rounds or work factor should you use? Give a number and defend it.
Workn uses a work factor of 12 rounds ($2^{12} = 4,096$ iterations). On the host server CPU, cost 12 benchmarked at an average execution time of 451.95 ms. This defends against brute-force attacks by reducing single-core cracking throughput to just 2.21 guesses per second. Simultaneously, 452 ms remains comfortably below the 500 ms threshold where human users perceive interface lag during interactive form submissions. Setting the cost factor to 10 is too fast for modern cloud GPU rigs (yielding over 10,000 guesses/sec), while cost 14 takes nearly two seconds per login, which exhausts server worker threads and triggers connection timeouts under concurrent morning login spikes.

---

### 5. You store user passwords. Of plain text, SHA-256, AES-256 encryption and adaptive hashing, which is correct and why are the other three wrong? One of the three is wrong for a different reason from the other two.
Adaptive hashing (such as bcrypt or Argon2id) is the only correct choice. Plaintext is catastrophic because any unauthorized read exposes credentials immediately. SHA-256 is wrong because it is designed to be fast; its speed allows modern GPUs to compute billions of guesses per second, rendering brute-force trivial. AES-256 encryption is wrong for a fundamentally different reason: encryption is a two-way reversible process requiring an encryption key. Storing passwords with AES-256 introduces the impossible burden of key protection. If the server application is compromised, the attacker extracts the key from memory or configuration and decrypts the entire database back to plaintext. Adaptive hashing is one-way, salted, and intentionally slow.

---

### 6. Why is client-side validation not enough?
Client-side validation runs entirely in an untrusted environment controlled by the user. An attacker can inspect client code, toggle debugger breakpoints, modify JavaScript state, use developer tools to remove the HTML `required` attribute, or completely bypass the browser by sending HTTP POST requests directly via `curl`, Postman, or custom Python scripts. Client-side validation exists purely for user experience—offering immediate visual feedback as users type. The server is the only trusted boundary and must independently validate and sanitize every payload before touching business logic or the database.

---

### 7. What security checks belong in the frontend, and what must the server enforce regardless?
The frontend should enforce instant UX checks: inline syntax validation, character counts, password strength bars, and visual formatting warnings that help legitimate users correct honest mistakes before network latency is incurred. The server must enforce all security rules regardless: strict schema validation, type narrowing, string trimming, email case normalization, password length and character complexity boundaries, breached password checks against known leak corpora, cryptographic signature checks, database uniqueness constraints, and rate limiting. The server must assume every client-side check was bypassed.

---

### 8. The interface hides the delete button for non-administrators. Is that enough? If not, what does an attacker do instead?
Hiding the delete button in the user interface is completely ineffective for security. An interface element is merely client-side presentation. An attacker inspects the application's network traffic or client bundle to discover the administrative endpoint (for example, `DELETE /api/admin/members/:id`), and issues an HTTP request directly using `fetch` or `curl`. If the server route handler only checks whether the user is logged in rather than enforcing server-side role-based authorization (`user.role === 'ADMIN'`), the deletion succeeds. The server must enforce authorization on every request regardless of UI visibility.

---

### 9. What is the difference between validation, encoding and sanitisation?
Validation inspects untrusted input against an explicit schema (checking types, formats, string length, and value ranges) and rejects the request if it does not conform. Sanitization cleans or modifies input to make it safe or canonical—such as trimming whitespace or lowercasing an email—before further processing. Encoding translates data into a different format (such as HTML entity encoding `&lt;` for `<`) so that a target interpreter treats the characters strictly as raw data rather than executable code, preventing Cross-Site Scripting (XSS) or SQL injection.

---

### 10. Why replace the incoming request body with the parsed and validated data rather than leaving both available?
Leaving the unparsed, raw request body accessible alongside validated data creates mass assignment vulnerabilities and security confusion. If downstream service handlers, background workers, or ORM mutations accidentally reference properties from the raw `req.body` rather than the validated schema object, an attacker can smuggle unauthorized fields (such as `role: "ADMIN"`, `accountStatus: "ACTIVE"`, or malicious prototype pollution keys). Replacing the raw payload entirely ensures that downstream application code can only access strictly sanitized, type-safe, and authorized properties.

---

### 11. Why validate route parameters and query strings, not just the body?
Route parameters and query strings are untrusted user inputs transmitted in the HTTP request line. If unvalidated, route parameters (such as `/:id`) expose the system to SQL injection, path traversal attacks, and unauthorized object reference vulnerabilities (IDOR). Query strings used for pagination, filtering, or sorting can cause severe Denial of Service if an attacker submits negative numbers, enormous limits (`?limit=99999999`), or malformed search queries that lock up database CPU threads. Every input channel must be bounded by server schemas.

---

### 12. How do you rate limit unauthenticated requests, and what is the problem with the header you would reach for first?
Unauthenticated requests are rate-limited by tracking client IP addresses across a sliding-window counter. The header developers reach for first is `X-Forwarded-For`. The problem is that `X-Forwarded-For` is an arbitrary, client-controlled HTTP request header that can be spoofed trivially by an attacker injecting false IP strings (`X-Forwarded-For: 1.1.1.1`). To prevent spoofing, the application server must only trust `X-Forwarded-For` when positioned behind a verified reverse proxy (such as Cloudflare or AWS ALB) that explicitly overwrites or appends the true remote socket IP to the header chain.

---

### 13. Which rate limiting algorithm would you choose for a production API, and what is the boundary burst problem?
For production APIs, the sliding window log or token bucket algorithm is preferred. Fixed window counters suffer from the boundary burst problem: if a limit allows 100 requests per minute and a client sends 100 requests at second 59 followed immediately by 100 requests at second 01 of the next minute, the client executes 200 requests within a 2-second window without triggering the rate limiter. The sliding window algorithm resolves this by tracking individual request timestamps within a moving window, guaranteeing that request velocity never exceeds the configured threshold across any rolling timeframe.

---

### 14. Why use a shared store for counters rather than in-memory counters on each server?
In modern cloud architectures, applications scale horizontally across multiple stateless containers or serverless instances behind a load balancer. If counters are stored in server memory (like a local JavaScript `Map`), each server instance maintains an isolated counter. An attacker whose requests are distributed across 10 application pods effectively multiplies their allowed attempt quota by 10x before triggering any single instance's limit. Furthermore, deploying new code or restarting an instance wipes all in-memory counters. A shared, high-speed atomic store (such as Redis) ensures that request counts are synchronized globally across all nodes.

---

### 15. What HTTP status code should a rate limiter return, and why is 403 the wrong choice?
A rate limiter must return `HTTP 429 Too Many Requests`. Returning `HTTP 403 Forbidden` is incorrect because 403 indicates an authorization failure—meaning the client lacks permission to access the resource and that re-authenticating or retrying with the same credentials will not change the outcome. By contrast, 429 explicitly communicates that the client has exceeded its rate limit quota, and it should be accompanied by a `Retry-After` response header specifying the number of seconds the client must wait before retrying the request.

---

### 16. When your rate limit store is unavailable, do you fail open or fail closed? Answer for Workn specifically.
For Workn, sensitive authentication and mutation endpoints (such as login, registration, and payment verification) must **fail closed**, whereas public catalog browsing (such as searching workspace resources) should **fail open**. If the rate limit store crashes during a brute-force credential stuffing attack or automated payment card testing, failing open leaves member accounts and financial integrations completely undefended. Failing closed on authentication preserves credential and ledger integrity while alerting site reliability engineers to immediately restore the caching layer.

---

### 17. You have two hashing timing numbers from your own machine. What do they mean for an attacker who has stolen your user table?
On my machine, SHA-256 hashed in 0.0017 ms (~584,000 hashes/sec on 1 core), while bcrypt cost 12 hashed in 451.95 ms (~2.21 hashes/sec). To an attacker who has stolen Workn's user table, this 264,000x disparity is decisive. If passwords were stored with SHA-256, an attacker running an 8-GPU rig (testing 30 billion guesses/sec) could crack an 8-character alphanumeric password in approximately 18 minutes. Under Workn's bcrypt cost 12 configuration, that same GPU rig is throttled by memory-hard computation to ~8,000 guesses per second, taking **8.6 years** to crack the identical password.

---

### 18. How does a breached password check avoid sending the password anywhere? Explain the mechanism, then say what the naive version would leak.
Workn uses k-anonymity. The server computes the 40-character SHA-1 hash of the candidate password locally, extracts strictly the first 5 hexadecimal characters (`prefix`), and queries HaveIBeenPwned. The remote service returns ~2,000 hash suffixes sharing that identical prefix, and Workn matches the remaining 35 characters locally in memory. The external service learns only that the password hash starts with 5 characters, which matches thousands of completely different passwords. The naive version—sending the plaintext password or the full hash—would expose the user's password directly over the network or allow the third-party to reverse it using rainbow tables.

---

### 19. Wrong-answer analysis: a candidate says they hash passwords with SHA-256 plus a random salt per user, so a stolen database cannot be reversed because hashing is one-way, and they rate limit login by IP so brute force is not possible. Say what is wrong, in order of severity, and what the candidate has misunderstood about the threat model.
The most severe error is believing SHA-256 is secure for passwords. Fast hashing algorithms can be computed billions of times per second on commercial GPUs; even with a unique salt, an attacker with a stolen database bypasses network rate limits entirely and executes high-speed offline dictionary attacks against each salted hash. The second error is relying on IP-based rate limiting as absolute brute-force protection: attackers trivially bypass IP limits using botnets, residential proxies, and mobile network rotation (as proven in Workn's Step 8 defeat test). The candidate fundamentally misunderstands the threat model: they assume attacks only happen online across the network, completely ignoring offline cracking of stolen database dumps.

