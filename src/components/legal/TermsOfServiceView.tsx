import React from 'react';

interface TermsOfServiceViewProps {
  onBack: () => void;
  onSwitchToPrivacy: () => void;
}

export default function TermsOfServiceView({ onBack, onSwitchToPrivacy }: TermsOfServiceViewProps) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: '900px',
        margin: '0 auto',
        padding: 'var(--space-8) var(--space-6)',
        color: 'var(--color-on-surface)',
        fontFamily: 'var(--type-body-large-font-family)',
      }}
    >
      {/* Top navigation actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-8)',
          paddingBottom: 'var(--space-4)',
          borderBottom: '1px solid var(--color-outline-variant)',
          position: 'relative',
          zIndex: 20,
        }}
      >
        <button
          onClick={onBack}
          type="button"
          id="btn-back-to-home"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)',
            border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-primary)',
            fontFamily: 'var(--type-label-large-font-family)',
            fontSize: 'var(--type-label-large-font-size)',
            fontWeight: 600,
            cursor: 'pointer',
            padding: 'var(--space-2) var(--space-4)',
            transition: 'background-color 150ms ease, transform 100ms ease',
            pointerEvents: 'auto',
          }}
        >
          <span aria-hidden="true">&larr;</span> Back to Home
        </button>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button
            onClick={onSwitchToPrivacy}
            type="button"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-on-surface-variant)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 'var(--space-1) var(--space-2)',
            }}
          >
            &larr; View Privacy Policy
          </button>
          <span
            style={{
              padding: 'var(--space-1) var(--space-3)',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary-container)',
              color: 'var(--color-on-primary-container)',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            Terms of Service
          </span>
        </div>
      </div>

      {/* Header */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1
          className="type-headline-large"
          style={{
            fontFamily: 'var(--type-headline-large-font-family)',
            fontSize: 'var(--type-headline-large-font-size)',
            fontWeight: 700,
            color: 'var(--color-on-surface)',
            marginBottom: 'var(--space-2)',
            letterSpacing: '-1px',
          }}
        >
          Terms of Service
        </h1>
        <p
          style={{
            color: 'var(--color-on-surface-variant)',
            fontSize: 'var(--type-body-medium-font-size)',
            lineHeight: 1.6,
          }}
        >
          <strong>Effective Date:</strong> November 1, 2026 &bull; <strong>Jurisdiction:</strong> Lagos State, Federal Republic of Nigeria
        </p>
        <p
          style={{
            color: 'var(--color-on-surface-variant)',
            fontSize: 'var(--type-body-medium-font-size)',
            lineHeight: 1.6,
            marginTop: 'var(--space-2)',
          }}
        >
          Governing individual memberships, day passes, workspace resource bookings, and digital platform access for Workn.
        </p>
      </div>

      {/* Main Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-8)',
          lineHeight: 1.7,
          fontSize: '15px',
        }}
      >
        {/* Section 1 */}
        <section
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-surface-variant) 30%, transparent)',
            padding: 'var(--space-6)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-outline-variant)',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--type-title-large-font-family)',
              fontSize: 'var(--type-title-large-font-size)',
              fontWeight: 700,
              color: 'var(--color-primary)',
              marginBottom: 'var(--space-3)',
            }}
          >
            1. Agreement to Terms &amp; Scope of Services
          </h2>
          <p style={{ marginBottom: 'var(--space-3)' }}>
            These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you (&ldquo;Member&rdquo;, &ldquo;User&rdquo;, or &ldquo;you&rdquo;) and <strong>Workn Technologies Ltd</strong> (&ldquo;Workn&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;).
          </p>
          <p>
            Workn provides digital subscription management, workspace reservation services, meeting room access, and AI-supported operations for our physical coworking facilities situated in Lagos, Nigeria. By registering an account, purchasing access, or reserving resources, you agree to comply with and be bound by these Terms.
          </p>
        </section>

        {/* Section 2 */}
        <section>
          <h2
            style={{
              fontFamily: 'var(--type-title-large-font-family)',
              fontSize: 'var(--type-title-large-font-size)',
              fontWeight: 700,
              color: 'var(--color-on-surface)',
              marginBottom: 'var(--space-3)',
            }}
          >
            2. User Eligibility &amp; Account Security
          </h2>
          <ul style={{ paddingLeft: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <li>You must be at least 18 years of age or possess legal business capacity under Nigerian law to register for an account.</li>
            <li>You agree to provide accurate, current, and verifiable contact and identification information upon registration.</li>
            <li>You are solely responsible for safeguarding your login credentials. You must immediately notify Workn if you suspect any unauthorized access to your account.</li>
            <li>Accounts are personal to the registered user and may not be transferred, sold, or shared with third parties.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section>
          <h2
            style={{
              fontFamily: 'var(--type-title-large-font-family)',
              fontSize: 'var(--type-title-large-font-size)',
              fontWeight: 700,
              color: 'var(--color-on-surface)',
              marginBottom: 'var(--space-3)',
            }}
          >
            3. Memberships, Subscriptions &amp; Benefit Rules
          </h2>
          <p style={{ marginBottom: 'var(--space-3)' }}>
            In accordance with Workn&rsquo;s commercial policies:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ padding: 'var(--space-3) var(--space-4)', borderLeft: '3px solid var(--color-primary)', backgroundColor: 'color-mix(in srgb, var(--color-primary) 5%, transparent)' }}>
              <strong>Monthly Subscriptions:</strong> Run for exactly one calendar month starting from verified activation, with timestamped records for start and expiry.
            </div>
            <div style={{ padding: 'var(--space-3) var(--space-4)', borderLeft: '3px solid var(--color-primary)', backgroundColor: 'color-mix(in srgb, var(--color-primary) 5%, transparent)' }}>
              <strong>Non-Rollover of Benefits:</strong> Included benefits (such as coworking access days and allotted meeting room hours) reset at the end of each billing cycle and do not roll over to subsequent months by default.
            </div>
            <div style={{ padding: 'var(--space-3) var(--space-4)', borderLeft: '3px solid var(--color-primary)', backgroundColor: 'color-mix(in srgb, var(--color-primary) 5%, transparent)' }}>
              <strong>Day Passes:</strong> Valid solely for the specific booked operating day and automatically expire at the conclusion of that day&rsquo;s facility operating hours.
            </div>
            <div style={{ padding: 'var(--space-3) var(--space-4)', borderLeft: '3px solid var(--color-primary)', backgroundColor: 'color-mix(in srgb, var(--color-primary) 5%, transparent)' }}>
              <strong>Expired Status:</strong> Members with expired or inactive subscriptions cannot access workspace-only benefits until a subscription is renewed and verified.
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section>
          <h2
            style={{
              fontFamily: 'var(--type-title-large-font-family)',
              fontSize: 'var(--type-title-large-font-size)',
              fontWeight: 700,
              color: 'var(--color-on-surface)',
              marginBottom: 'var(--space-3)',
            }}
          >
            4. Workspace &amp; Meeting Room Reservations
          </h2>
          <ul style={{ paddingLeft: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <li><strong>Benefit Verification:</strong> Available subscription allowances or applicable rates must be verified by the platform before any booking is confirmed.</li>
            <li><strong>Anti-Overlap Enforcement:</strong> Our reservation system prevents double-bookings or conflicting allocations for identical resources (desks and meeting rooms).</li>
            <li><strong>Capacity Limits:</strong> Meeting room bookings must not exceed the stated room capacity for safety and fire code compliance.</li>
            <li><strong>Punctuality:</strong> Meeting room sessions begin and end strictly at the confirmed reservation timestamps to respect adjacent member bookings.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section>
          <h2
            style={{
              fontFamily: 'var(--type-title-large-font-family)',
              fontSize: 'var(--type-title-large-font-size)',
              fontWeight: 700,
              color: 'var(--color-on-surface)',
              marginBottom: 'var(--space-3)',
            }}
          >
            5. Pricing, Payments &amp; Refund Policy
          </h2>
          <p style={{ marginBottom: 'var(--space-3)' }}>
            <strong>Currency:</strong> All fees are quoted and payable in Nigerian Naira (NGN). Prices and tax rates are managed centrally by Workn administration.
          </p>
          <p style={{ marginBottom: 'var(--space-3)' }}>
            <strong>Payment Verification:</strong> Paid subscriptions and stand-alone bookings are activated only after payment confirmation from our accredited payment gateway partners.
          </p>
          <p style={{ marginBottom: 'var(--space-3)' }}>
            <strong>Cancellations &amp; Refunds:</strong>
          </p>
          <ul style={{ paddingLeft: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <li>Bookings canceled with sufficient advance notice (minimum 2 hours prior to start time for meeting rooms) will have the deducted benefit hours or credit returned to the member account.</li>
            <li>Financial refund requests are subject to administrative review, must satisfy statutory consumer protection criteria under Nigerian law, and are recorded with complete audit trails before disbursement.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section>
          <h2
            style={{
              fontFamily: 'var(--type-title-large-font-family)',
              fontSize: 'var(--type-title-large-font-size)',
              fontWeight: 700,
              color: 'var(--color-on-surface)',
              marginBottom: 'var(--space-3)',
            }}
          >
            6. Physical Facility Conduct &amp; Safety in Lagos
          </h2>
          <p style={{ marginBottom: 'var(--space-3)' }}>
            When present at Workn&rsquo;s coworking facility:
          </p>
          <ul style={{ paddingLeft: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <li>Members must conduct themselves professionally and respectfully toward other coworkers, staff, and visitors.</li>
            <li>Phone calls and audio meetings must be held in designated call booths or meeting spaces rather than quiet open desk zones.</li>
            <li>Damage to physical equipment, furniture, or high-speed connectivity hardware will result in liability for repair costs and potential account revocation.</li>
            <li>Workn maintains high-speed internet and power backup systems; however, scheduled utility maintenance and force majeure events will be communicated promptly.</li>
          </ul>
        </section>

        {/* Section 7 */}
        <section>
          <h2
            style={{
              fontFamily: 'var(--type-title-large-font-family)',
              fontSize: 'var(--type-title-large-font-size)',
              fontWeight: 700,
              color: 'var(--color-on-surface)',
              marginBottom: 'var(--space-3)',
            }}
          >
            7. AI-Powered Member Assistant
          </h2>
          <p style={{ marginBottom: 'var(--space-3)' }}>
            Workn integrates an intelligent assistant to retrieve member records, verify benefit balances, explain pricing policies, and execute permitted booking actions.
          </p>
          <ul style={{ paddingLeft: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <li>The AI assistant operates strictly within your authorized account session and cannot access private records belonging to other members.</li>
            <li>Administrative actions (such as fee waivers or manual refund issuance) require explicit administrative authorization and cannot be self-directed via AI.</li>
            <li>In the event of an automated decision or booking dispute, you may request escalation to a human workspace administrator.</li>
          </ul>
        </section>

        {/* Section 8 */}
        <section>
          <h2
            style={{
              fontFamily: 'var(--type-title-large-font-family)',
              fontSize: 'var(--type-title-large-font-size)',
              fontWeight: 700,
              color: 'var(--color-on-surface)',
              marginBottom: 'var(--space-3)',
            }}
          >
            8. Governing Law &amp; Dispute Resolution
          </h2>
          <p style={{ marginBottom: 'var(--space-3)' }}>
            These Terms of Service are governed by and construed in accordance with the <strong>Laws of the Federal Republic of Nigeria</strong>.
          </p>
          <p>
            Any dispute, controversy, or claim arising out of or relating to these Terms or the breach thereof shall first be settled amicably through negotiation. Where negotiation fails, disputes shall be submitted to the exclusive jurisdiction of the competent courts of <strong>Lagos State, Nigeria</strong>.
          </p>
        </section>

        {/* Section 9 */}
        <section
          style={{
            padding: 'var(--space-6)',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'color-mix(in srgb, var(--color-surface-variant) 30%, transparent)',
            border: '1px solid var(--color-outline-variant)',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--type-title-large-font-family)',
              fontSize: 'var(--type-title-large-font-size)',
              fontWeight: 700,
              color: 'var(--color-primary)',
              marginBottom: 'var(--space-3)',
            }}
          >
            9. Contact Information &amp; Support
          </h2>
          <p style={{ fontSize: '14px', lineHeight: 1.8 }}>
            <strong>Workn Technologies Ltd</strong><br />
            Coworking Space Operations &bull; Lagos, Nigeria<br />
            <strong>Member Support:</strong> support@workn.ng<br />
            <strong>General Enquiries:</strong> hello@workn.ng
          </p>
        </section>
      </div>

      {/* Bottom return link */}
      <div style={{ marginTop: 'var(--space-10)', textAlign: 'center' }}>
        <button
          onClick={onBack}
          className="home-btn-primary"
          type="button"
          style={{ cursor: 'pointer' }}
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}
