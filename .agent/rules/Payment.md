---
trigger: model_decision
description: Use when implementing or modifying payment processing, payment verification, membership activation, booking payments, refunds, or payment reconciliation in Workn
---

# Workn Payment Rules

## 1. Purpose

This document defines payment processing requirements for Workn, a coworking membership and workspace management platform in Lagos, Nigeria.

Workn uses PostgreSQL and Prisma for financial records. Payments may use Flutterwave/Stripe test mode or a simulated payment adapter during development.

**Core principle:** A payment is successful only when verified by the server through the configured payment provider or approved simulation. Client-side messages and browser redirects are never sufficient proof.

## 2. Supported Payment Use Cases

Workn payments may cover:
- Membership purchases and renewals.
- Paid workspace or meeting-room bookings, where applicable.
- Approved refunds for eligible transactions.

The system must retain payment history and associate every transaction with the correct member and applicable purchase or booking.

Do not invent prices, fees, refund eligibility, cancellation charges, or other financial policies. Use approved configuration and product decisions.

## 3. Payment Lifecycle

A payment should follow this general lifecycle:

1. The member initiates a purchase or booking.
2. The server validates the request, user permissions, applicable price, and transaction eligibility.
3. The server creates a pending payment record with a unique reference.
4. The payment provider processes the payment, or the development adapter simulates the transaction.
5. The server verifies the transaction result.
6. The payment record is updated to reflect the verified outcome.
7. The related membership or booking is activated or confirmed only when its payment requirements are satisfied.
8. The transaction remains available in the member's payment history.

Do not mark a payment successful simply because the member returns to Workn from the payment provider.

## 4. Payment Statuses

Use the payment statuses defined in `schema.md`:

- `PENDING`: Payment has been initiated but its outcome is not yet confirmed.
- `SUCCESSFUL`: The server has verified successful payment.
- `FAILED`: The payment has been verified as unsuccessful.
- `REFUNDED`: The refund outcome has been recorded and the payment is marked refunded according to the approved workflow.

Validate status transitions on the server. Do not allow arbitrary status changes from the client.

If a provider's response is unclear or unavailable, do not assume success or failure. Keep the transaction in an appropriate unresolved state and reconcile it through the provider.

If additional states are required for processing or refunds, document and approve them before changing the schema.

## 5. Server-Side Verification

For every real payment:

- Verify the transaction using the configured provider's server-side verification mechanism.
- Confirm the payment reference matches the intended transaction.
- Confirm the amount and currency match the expected purchase.
- Confirm the provider reports a successful payment.
- Ensure the transaction belongs to the correct member and purchase.
- Record verification details and timestamps where appropriate.
- Reject mismatched, invalid, duplicate, or unverifiable transactions.

Never trust:
- Client-submitted payment status.
- Browser redirects or success-page visits.
- Amounts calculated only in the browser.
- Payment references without verification.
- AI-generated claims about payment success.

Keep provider secret keys and privileged credentials on the server.

## 6. Payment References and Duplicate Processing

Every payment initiation must use a unique reference appropriate to the provider.

The system must:
- Enforce reference uniqueness in the database where applicable.
- Associate each reference with its intended transaction.
- Handle repeated verification requests and provider callbacks safely.
- Prevent the same payment from activating multiple memberships or confirming multiple purchases.
- Avoid creating duplicate financial effects when requests time out or are retried.
- Record relevant processing outcomes for troubleshooting.

Use idempotent server-side processing. Before applying a payment result, check the existing payment and related transaction state.

A retry must not duplicate a membership activation, booking confirmation, benefit deduction, or refund.

## 7. Membership Payments

When a member purchases or renews a paid membership:

1. Validate the selected plan and its current configured price.
2. Create the pending payment record.
3. Process and verify payment server-side.
4. Activate the membership only after successful verification.
5. Record the membership start and expiry timestamps.
6. Preserve the applicable purchase price and currency.
7. Keep previous membership and payment records.

Monthly memberships last one calendar month from activation.

A pending, failed, or unverified payment must not activate a paid membership. Expired memberships cannot access subscription-only benefits until renewed.

Do not create duplicate active memberships when processing repeated callbacks or retries.

## 8. Booking Payments

Where a booking requires payment:

1. Validate the member's identity and booking eligibility.
2. Check resource availability, operating hours, applicable benefits, and charges.
3. Calculate the expected amount on the server.
4. Create and associate the relevant payment record.
5. Verify payment when required.
6. Confirm the booking only after all applicable requirements are satisfied.

Prevent conflicting reservations and duplicate booking confirmations.

A failed payment must not produce a confirmed paid booking or consume benefits. If payment succeeds but booking confirmation fails, record the outcome and implement a safe reconciliation or recovery process. Do not silently discard the successful payment or charge the member again.

The exact payment timing and handling for reservations using membership benefits must follow the approved booking policy.

## 9. Failed, Pending, and Uncertain Payments

When payment fails:
- Record the verified failure.
- Do not activate the membership or confirm a paid booking.
- Do not deduct benefits for a failed booking.
- Show a clear message and allow a safe retry where appropriate.

When payment remains pending:
- Keep the payment pending until its outcome can be verified.
- Do not treat it as successful.
- Avoid initiating duplicate charges while the original outcome is uncertain.
- Reconcile against the provider before deciding whether another attempt is safe.

When a request times out:
- Do not assume the provider failed to process it.
- Check the existing reference and provider status before retrying.
- Preserve the transaction record for reconciliation.

## 10. Refunds

Refunds must follow an approved Workn refund policy.

Before processing a refund:
1. Identify the original payment and related transaction.
2. Verify the payment and determine refund eligibility using the approved policy.
3. Obtain any required administrative authorisation.
4. Initiate the refund through the configured provider or approved simulation.
5. Verify and record the refund outcome.
6. Update the payment record only when the outcome supports that update.
7. Preserve the original payment and relevant audit history.

Do not mark a payment refunded merely because a refund was requested or initiated. If the outcome is pending or uncertain, retain that distinction and reconcile it.

The PRD does not define exact refund eligibility, time limits, fees, or partial-refund rules. Do not invent them.

## 11. Simulated Payments

If Stripe/Flutterwave test mode is not configured, use a clearly identified simulated payment adapter for development.

The simulator must:
- Run through a controlled server-side interface.
- Produce explicit, deterministic test outcomes.
- Use unique payment references.
- Exercise pending, successful, and failed payment workflows.
- Support testing duplicate requests and recovery behaviour.
- Never claim that simulated payments are real financial transactions.

Keep the simulator separate from production payment processing. Do not introduce a client-side shortcut that lets users mark their own payments successful.

## 12. Security and Permissions

- Require authentication for member payment operations.
- Enforce record ownership on the server.
- Restrict payment administration and refunds to authorised administrators.
- Validate prices, amounts, currency, references, and transaction relationships server-side.
- Keep secrets out of client code, logs, and error messages.
- Do not expose another member's financial records.
- Record significant administrative financial actions in the audit log.
- Never let the AI assistant independently declare a payment successful, approve a refund, or bypass payment verification.

## 13. Database Integrity and Reconciliation

Use Prisma transactions for related database updates that must succeed or fail together. External provider requests cannot be made atomic with a PostgreSQL transaction, so payment workflows must handle partial failures.

Ensure:
- Payment references are unique where required.
- Amounts and currencies match the intended purchase.
- Payments are linked to the correct member and transaction.
- Duplicate callbacks do not create duplicate financial effects.


## 14. Definition of Done

Payment functionality is ready when:
- Payment outcomes are verified server-side.
- Memberships and paid bookings cannot rely on client-submitted success.
- Duplicate requests do not create duplicate financial effects.
- Failed and uncertain transactions are handled safely.
- Refund outcomes are accurately recorded.
- Financial records remain auditable and linked to the correct transactions.
- Critical payment tests pass.
- Unspecified financial policies remain documented for approval.