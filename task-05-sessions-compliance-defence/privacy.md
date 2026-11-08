# Workn Member Privacy Notice & Erasure Framework

## 1. Plain-Language Introduction

Workn operates physical coworking spaces, meeting rooms, and collaborative amenities across Lagos (Lekki Phase 1, Victoria Island, Ikeja). We believe you should know exactly what data we hold, where it lives, how long we keep it, and what happens when you leave.

---

## 2. What We Collect and Why

We collect only what is required to provide safe, reliable workspace operations:
- **Contact Details**: Your name, email, and phone number so you can log in, receive emergency facility notices, and verify access at hub turnstiles.
- **Tax Identification (`taxId`)**: Nigerian commercial tax regulations (LIRS and CAMA 2020) require corporate workspace operators to record tax IDs on commercial invoices.
- **Security Logs**: Your IP address, browser type, and active session tokens to defend your account against credential stuffing and session hijacking.
- **Facility Bookings & Payments**: Dates, room reservations, and Paystack transaction references to process payments and resolve billing questions.

---

## 3. Account Deletion: The Grace Period & Real-World Erasure

When you ask us to delete your account:

1. **Immediate Lockout (Soft Delete)**:
   - Your account is locked immediately. All active sessions across all laptops and phones are revoked instantly.
   - Your name and phone number are replaced with an anonymous placeholder (`Anonymised Member`) so you can no longer be identified in live operations.
2. **The 30-Day Grace Period**:
   - Your data enters an inactive 30-day holding window.
   - *Why 30 days?* This window allows you to recover your account if the deletion was requested by mistake or unauthorized access. It also covers the standard 30-day commercial dispute and banking reconciliation window.
3. **The Hard Delete (Permanent Purge)**:
   - Once the 30 days expire, our automated background purge job permanently deletes your user record and session rows from PostgreSQL in a single atomic transaction.

---

## 4. What We Retain and Why We Must Keep It

We believe in radical honesty. We do **not** wipe 100% of your records, because Nigerian law makes that illegal:

- **Financial and Tax Ledgers**: Under CAMA 2020 Section 375 and LIRS tax guidelines, corporate businesses must retain accounting books, VAT invoices, and transaction references for a statutory minimum of **6 years**. We detach your personal contact details from these records, but we retain the financial amount, currency, and transaction reference.
- **Disaster Recovery Backups**: Our encrypted database snapshots rotate on a rolling **30-day lifecycle** in AWS S3 Frankfurt. Live deletions are not injected into immutable backup tapes immediately; instead, old backups expire naturally, and any restored backup automatically re-executes our deletion purge log before serving live users.

---

## 5. How to Exercise Your Right to Erasure

To request complete deletion of your personal account under NDPA 2023 Section 34 or GDPR Article 17:
1. Log in to your member dashboard at [**http://localhost:3000/dashboard**](http://localhost:3000/dashboard).
2. Navigate to **Account Security** &rarr; **Request Account Deletion**.
3. Confirm with your password. Your account will lock immediately, your sessions will terminate, and the 30-day countdown will begin.

---

## 6. How Broken Privacy Promises Get Written

Such promises get written when marketing or compliance copywriters borrow aspirational privacy boilerplate without consulting database engineers or reviewing statutory retention obligations. The author attempts to project maximum customer trust by promising absolute immediate erasure, unaware that financial regulations and backup architectures make instantaneous total erasure technically impossible and legally unlawful.

