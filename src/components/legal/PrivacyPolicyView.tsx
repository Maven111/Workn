import React from 'react';

interface PrivacyPolicyViewProps {
  onBack: () => void;
  onSwitchToTerms: () => void;
}

export default function PrivacyPolicyView({ onBack, onSwitchToTerms }: PrivacyPolicyViewProps) {
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
            Privacy Policy
          </span>
          <button
            onClick={onSwitchToTerms}
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
            View Terms of Service &rarr;
          </button>
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
          Privacy Policy
        </h1>
        <p
          style={{
            color: 'var(--color-on-surface-variant)',
            fontSize: 'var(--type-body-medium-font-size)',
            lineHeight: 1.6,
          }}
        >
          <strong>Effective Date:</strong> November 1, 2026 &bull; <strong>Jurisdiction:</strong> Federal Republic of Nigeria
        </p>
        <p
          style={{
            color: 'var(--color-on-surface-variant)',
            fontSize: 'var(--type-body-medium-font-size)',
            lineHeight: 1.6,
            marginTop: 'var(--space-2)',
          }}
        >
          Issued in accordance with the <strong>Nigeria Data Protection Act (NDPA) 2023</strong> and regulated by the <strong>Nigeria Data Protection Commission (NDPC)</strong>.
        </p>
      </div>

      {/* Main Legal Content Container */}
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
            1. Introduction &amp; Data Controller Information
          </h2>
          <p style={{ marginBottom: 'var(--space-3)' }}>
            <strong>Workn Technologies Ltd</strong> (&ldquo;Workn&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) operates the Workn coworking membership and workspace management platform in Lagos, Nigeria. We are committed to safeguarding your privacy and ensuring the lawful, fair, and transparent processing of your personal data.
          </p>
          <p>
            Under the <strong>Nigeria Data Protection Act (NDPA) 2023</strong>, Workn Technologies Ltd acts as the <strong>Data Controller</strong> for all personal information collected via our website, digital platform, AI assistant, and physical coworking facilities located in Lagos, Nigeria.
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
            2. Statutory Nigerian Legal Framework
          </h2>
          <p style={{ marginBottom: 'var(--space-3)' }}>
            This Privacy Policy is established in strict adherence to Nigerian data protection legislation, including:
          </p>
          <ul style={{ paddingLeft: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <li>The <strong>Nigeria Data Protection Act (NDPA) 2023</strong>.</li>
            <li>Regulatory directives and operational frameworks issued by the <strong>Nigeria Data Protection Commission (NDPC)</strong>.</li>
            <li>The <strong>Cybercrimes (Prohibition, Prevention, etc.) Act 2015 (as amended)</strong>.</li>
            <li>Applicable consumer protection and commercial regulations under Nigerian federal and Lagos State laws.</li>
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
            3. Personal Data We Collect
          </h2>
          <p style={{ marginBottom: 'var(--space-3)' }}>
            To provide coworking memberships, desk and meeting room reservations, and automated assistant operations, we collect the following categories of personal data:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            <div
              style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'color-mix(in srgb, var(--color-surface) 80%, transparent)',
                border: '1px solid var(--color-outline-variant)',
              }}
            >
              <h3 style={{ fontWeight: 600, color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>Identity &amp; Account Data</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>
                Full name, email address, telephone number, encrypted password hash, and assigned role (Member or Administrator).
              </p>
            </div>

            <div
              style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'color-mix(in srgb, var(--color-surface) 80%, transparent)',
                border: '1px solid var(--color-outline-variant)',
              }}
            >
              <h3 style={{ fontWeight: 600, color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>Membership &amp; Benefit Records</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>
                Subscribed plan details, activation and expiry timestamps, remaining coworking day passes, and meeting room hour allotments.
              </p>
            </div>

            <div
              style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'color-mix(in srgb, var(--color-surface) 80%, transparent)',
                border: '1px solid var(--color-outline-variant)',
              }}
            >
              <h3 style={{ fontWeight: 600, color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>Workspace Booking Data</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>
                Desk and meeting room reservations, scheduled dates, start and end times, room capacity requirements, and cancellation records.
              </p>
            </div>

            <div
              style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'color-mix(in srgb, var(--color-surface) 80%, transparent)',
                border: '1px solid var(--color-outline-variant)',
              }}
            >
              <h3 style={{ fontWeight: 600, color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>Financial &amp; Transaction Details</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>
                Transaction references, amounts billed in Nigerian Naira (NGN), payment timestamps, and payment statuses. <em>We do not store complete cardholder numbers on our servers; payments are processed via PCI-DSS compliant providers.</em>
              </p>
            </div>

            <div
              style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'color-mix(in srgb, var(--color-surface) 80%, transparent)',
                border: '1px solid var(--color-outline-variant)',
              }}
            >
              <h3 style={{ fontWeight: 600, color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>AI Assistant Interactions</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>
                Conversational inquiries and action audit logs submitted to the Workn member assistant for checking benefits, querying availability, or booking actions.
              </p>
            </div>

            <div
              style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'color-mix(in srgb, var(--color-surface) 80%, transparent)',
                border: '1px solid var(--color-outline-variant)',
              }}
            >
              <h3 style={{ fontWeight: 600, color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>Technical &amp; Access Logs</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>
                IP addresses, session identifiers, browser characteristics, and security audit logs used to prevent unauthorized access and detect fraudulent activity.
              </p>
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
            4. Lawful Bases for Processing Under NDPA 2023
          </h2>
          <p style={{ marginBottom: 'var(--space-3)' }}>
            In compliance with Section 25 of the NDPA 2023, Workn processes your personal data strictly under the following lawful bases:
          </p>
          <ul style={{ paddingLeft: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <li>
              <strong>Performance of a Contract:</strong> Processing necessary to fulfill your membership agreement, activate workspace access, reserve meeting rooms, and execute bookings requested by you.
            </li>
            <li>
              <strong>Legal &amp; Regulatory Obligation:</strong> Processing required to comply with Nigerian corporate, taxation, and anti-financial crime obligations.
            </li>
            <li>
              <strong>Legitimate Interests:</strong> Securing the platform, preventing double-bookings, conducting internal audit investigations, and maintaining workspace safety in Lagos.
            </li>
            <li>
              <strong>Explicit Consent:</strong> Where you provide consent for optional communications or specialized AI assistant features.
            </li>
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
            5. Your Data Subject Rights
          </h2>
          <p style={{ marginBottom: 'var(--space-3)' }}>
            Under Part VI of the Nigeria Data Protection Act 2023, you are entitled to exercise the following fundamental rights regarding your personal information:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ padding: 'var(--space-3) var(--space-4)', borderLeft: '3px solid var(--color-primary)', backgroundColor: 'color-mix(in srgb, var(--color-primary) 5%, transparent)' }}>
              <strong>Right to Access:</strong> You may request confirmation and an extract of the personal data Workn holds concerning your profile, bookings, and payments.
            </div>
            <div style={{ padding: 'var(--space-3) var(--space-4)', borderLeft: '3px solid var(--color-primary)', backgroundColor: 'color-mix(in srgb, var(--color-primary) 5%, transparent)' }}>
              <strong>Right to Rectification:</strong> You may correct inaccurate, incomplete, or outdated profile and business details.
            </div>
            <div style={{ padding: 'var(--space-3) var(--space-4)', borderLeft: '3px solid var(--color-primary)', backgroundColor: 'color-mix(in srgb, var(--color-primary) 5%, transparent)' }}>
              <strong>Right to Erasure (&ldquo;Right to be Forgotten&rdquo;):</strong> You may request the deletion of your personal records where data is no longer necessary for the contractual or statutory purpose for which it was gathered.
            </div>
            <div style={{ padding: 'var(--space-3) var(--space-4)', borderLeft: '3px solid var(--color-primary)', backgroundColor: 'color-mix(in srgb, var(--color-primary) 5%, transparent)' }}>
              <strong>Right to Restrict or Object to Processing:</strong> You have the right to object to processing based on legitimate interests or direct communications.
            </div>
            <div style={{ padding: 'var(--space-3) var(--space-4)', borderLeft: '3px solid var(--color-primary)', backgroundColor: 'color-mix(in srgb, var(--color-primary) 5%, transparent)' }}>
              <strong>Right to Data Portability:</strong> You may obtain your transaction and booking records in a structured, commonly used digital format.
            </div>
            <div style={{ padding: 'var(--space-3) var(--space-4)', borderLeft: '3px solid var(--color-primary)', backgroundColor: 'color-mix(in srgb, var(--color-primary) 5%, transparent)' }}>
              <strong>Right to Lodge a Complaint with the NDPC:</strong> If you believe Workn has processed your personal information in violation of the NDPA 2023, you have the right to lodge a complaint directly with the <strong>Nigeria Data Protection Commission (NDPC)</strong> (contactable via <em>info@ndpc.gov.ng</em>).
            </div>
          </div>
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
            6. Data Security, Retention &amp; Cross-Border Transfers
          </h2>
          <p style={{ marginBottom: 'var(--space-3)' }}>
            We implement comprehensive technical and organizational safeguards including end-to-end HTTPS/TLS encryption in transit, strict database access controls, server-side role validation, and comprehensive audit trail logging.
          </p>
          <p style={{ marginBottom: 'var(--space-3)' }}>
            <strong>Retention Period:</strong> Member and transaction records are retained for the duration of your active subscription and up to statutory limitation periods mandated by Nigerian commercial and tax laws (typically 6 years following contract conclusion).
          </p>
          <p>
            <strong>Cross-Border Transfers:</strong> When cloud infrastructure or third-party service providers host data outside Nigeria, transfers are conducted strictly under Sections 41, 42, and 43 of the NDPA 2023, ensuring adequate data protection safeguards and contractual clauses.
          </p>
        </section>

        {/* Section 7 */}
        <section
          style={{
            padding: 'var(--space-6)',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)',
            border: '1px solid var(--color-primary)',
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
            7. Contact the Data Protection Officer (DPO)
          </h2>
          <p style={{ marginBottom: 'var(--space-3)' }}>
            For privacy inquiries, to exercise your data subject rights, or to submit requests regarding your personal records under the NDPA 2023, please contact our designated Data Protection team:
          </p>
          <p style={{ fontSize: '14px', lineHeight: 1.8 }}>
            <strong>Workn Technologies Ltd — Data Protection Office</strong><br />
            Lagos, Nigeria<br />
            <strong>Email:</strong> privacy@workn.ng &bull; support@workn.ng<br />
            <strong>Regulatory Supervisory Body:</strong> Nigeria Data Protection Commission (NDPC)
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
