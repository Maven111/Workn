# Rate Limiting Architecture: Thresholds, Storage Trade-Offs, and Evasion Analysis

- **Subject**: Rate Limiting Mechanics, Composite Keying, and Legitimate Evasion Verification.

## 1. Selected Parameters & Justification

The following rate limiting policies are enforced across all Workn authentication entry points:

| Route / Action | Window | Maximum Attempts | Lockout Duration | HTTP Status |
| :--- | :--- | :--- | :--- | :--- |
| **Login (`/auth?view=login`)** | **15 minutes** (900s) | **5 attempts** | 15 minutes | `429 Too Many Requests` |
| **Registration (`/auth?view=register`)** | **15 minutes** (900s) | **3 attempts** | 15 minutes | `429 Too Many Requests` |
| **Password Reset (`/auth?view=forgot`)**| **15 minutes** (900s) | **3 attempts** | 15 minutes | `429 Too Many Requests` |

### Justification of Chosen Numbers:
1. **Human Typo Recovery**:
   A legitimate Workn member who makes a typing mistake on their phone keyboard rarely requires more than 2 to 3 attempts to correct it. A 5-attempt ceiling accommodates genuine human error without premature interruption.
2. **Destruction of Automated Brute-Force Economics**:
   At 5 guesses per 15 minutes, an attacker can attempt at most 20 passwords per hour ($480\ \text{guesses/day}$). Exhausting a common 100,000-word dictionary against an account would require **over 208 days** of continuous execution, neutralizing automated credential stuffing.
3. **15-Minute Recovery Window**:
   Locking a user out for 24 hours destroys user trust and drives support ticket volume. A 15-minute sliding window provides adequate cooling time while allowing legitimate members to recover without manual administrator intervention.

---

## 2. Why IP Alone Is Insufficient (The Asymmetry of Evasion)

Relying solely on client IP address (`Remote-Addr` or `X-Forwarded-For`) is a critical security vulnerability that provides a false sense of protection:

### 1. Trivial Attacker Evasion
In our live assessment test (`evidence/14-rate-limit-defeated.txt`), we proved that an attacker who gets locked out after 5 failed attempts on IP `197.210.64.12` can immediately bypass the rate limit simply by rotating to a new IP address (`102.89.23.45`). The rate limiter remained fully enabled on the server, yet the attacker was instantly admitted with a fresh quota of attempts.

In the real world, attackers rotate IPs effortlessly using:
- **Residential Proxy Networks & Mobile Tunnels**: Providing millions of rotating residential IP addresses.
- **Cellular Hotspot Reconnects**: Toggling airplane mode on a mobile connection frequently issues a fresh dynamic carrier IP from the ISP pool within seconds.
- **Distributed Botnets**: Distributing credential-stuffing dictionaries across thousands of compromised IoT devices, sending only 1 request per IP.

### 2. The Shared Office / Campus Problem (Lagos Coworking Context)
In metropolitan Lagos, coworking hubs, university campuses, and shared office facilities utilize Carrier-Grade NAT (CGNAT) or corporate routers where **hundreds of distinct individuals share a single public IP address**.
- If rate limiting is keyed strictly to IP: A single user who forgets their password and attempts 5 bad logins will lock out **every single coworker in the building** from accessing Workn.
- Legitimate members attempting to book desks or check in would receive unexpected `429 Too Many Requests` errors through no fault of their own.

---

## 3. What Serious Applications Key On

To mitigate IP spoofing and avoid penalizing shared networks, production architectures utilize **composite multi-dimensional identifiers**:

1. **Composite Key (`action:ip:normalised_email`)**:
   By keying on both the IP and the targeted email address, failed attempts are partitioned per user account. If user A fails 5 times on office WiFi, only user A is throttled; user B on the exact same WiFi connection can log in normally.
2. **Account-Level Lockout (Independent of IP)**:
   Tracking failed attempts against the specific account record in PostgreSQL regardless of which IP the request originates from. After 5 failed attempts globally, the account enters a temporary locked state requiring email verification.
3. **Browser & Device Fingerprinting**:
   Collecting passive hardware entropy (Canvas rendering hashes, WebGL vendor strings, AudioContext latency, and HTTP Client Hints) to detect the same physical machine rotating through proxy IPs.
4. **Autonomous System Number (ASN) / Subnet Throttling**:
   Aggregating request frequency across entire `/24` IPv4 subnets or cloud datacenter ASNs (e.g. DigitalOcean, AWS, Hetzner) commonly used by automated scraping infrastructure.

---

## 4. Counter Storage Architecture & Trade-Offs

Where rate limit counters reside determines the system's scalability, latency, and fault tolerance:

| Storage Layer | Advantages | Disadvantages & Trade-Offs |
| :--- | :--- | :--- |
| **In-Memory Store (Our Implementation)** | - **Zero network latency** (<0.001 ms access).<br>- No external infrastructure dependencies or costs.<br>- Native sliding-window garbage collection. | - **Instance-Isolated**: Does not share counters across multiple serverless functions or horizontally scaled containers.<br>- **Ephemeral**: Counters reset upon server restart or redeployment. |
| **Distributed Key-Value (Redis / Upstash)** | - **Global consensus**: Unified counters shared across all edge nodes, container clusters, and regions.<br>- Survives server restarts.<br>- Built-in TTL expiration. | - Adds **1–3 ms network round-trip** to every incoming request.<br>- Introduces an external point of failure (requires fail-open / fail-closed disaster policy). |
| **Relational Database (PostgreSQL)** | - Strong ACID consistency and audit traceability.<br>- Leverages existing database cluster. | - **Severe write overhead**: Storing high-frequency counter writes in PostgreSQL exhausts connection pools and causes database table bloat under DDoS traffic. |

---

## 5. HTTP Status Code: Why 429 Is Correct and 403 Is Wrong

When an authentication request exceeds its allocated quota, the server **must return HTTP 429 Too Many Requests**, accompanied by standard RFC 6585 rate limit headers:
```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1794123456
Retry-After: 900
```

### Why HTTP 403 Forbidden Is the Wrong Choice:
- **Semantic Mismatch**: `403 Forbidden` indicates that the client lacks permission or administrative authorization to access the resource (e.g., a Member attempting to view an Admin page). A 403 error implies that repeating the request will **never** succeed regardless of how long the client waits.
- **Temporal Nature of Rate Limits**: Rate limiting is a temporary, time-bound capacity constraint, not an authorization failure. The client has valid credentials and permissions, but must wait until the sliding window resets.
- **Client Recovery**: `429 Too Many Requests` explicitly communicates the `Retry-After` header, allowing client UI components, API consumers, and automated mobile clients to schedule legitimate retries programmatically rather than assuming permanent account revocation.

