import fs from 'fs';
import path from 'path';

function generateVerificationEmailHtml({ fullName, code, expiryMinutes = 10, siteUrl = 'http://localhost:3000' }) {
  const firstName = fullName.split(' ')[0] || 'Member';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your Workn account</title>
  <style>
    body { margin: 0; padding: 40px 16px; background-color: #FBF9F5; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1E201E; }
    table { border-collapse: collapse; }
  </style>
</head>
<body style="margin: 0; padding: 40px 16px; background-color: #FBF9F5; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; margin: 0 auto; background-color: #FFFFFF; border-radius: 8px; border: 1px solid #E5E0D8; box-shadow: 0 4px 12px rgba(30, 32, 30, 0.05); overflow: hidden;">
    <!-- Brand Header -->
    <tr>
      <td style="padding: 32px 40px 24px; border-bottom: 1px solid #F0ECE4;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td>
              <span style="font-family: 'Syne', Georgia, serif; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #2A4B3C;">
                workn<span style="color: #C85A32;">.</span>
              </span>
            </td>
            <td align="right">
              <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; color: #5A605A; background-color: #FBF9F5; padding: 4px 10px; border-radius: 4px; border: 1px solid #E5E0D8;">
                Account Security
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Body Content -->
    <tr>
      <td style="padding: 36px 40px 24px;">
        <h1 style="margin: 0 0 16px; font-family: 'Syne', Georgia, serif; font-size: 22px; font-weight: 700; line-height: 1.3; color: #1E201E;">
          Confirm your workspace email
        </h1>
        <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #5A605A;">
          Hello ${firstName}, welcome to Workn. To finalize your membership profile and activate your workspace bookings across our Lagos hubs, please enter this one-time 6-digit confirmation code:
        </p>

        <!-- 6-Digit Code Display Card -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0; background-color: #FBF9F5; border: 1.5px dashed #C85A32; border-radius: 8px;">
          <tr>
            <td align="center" style="padding: 24px 16px;">
              <span style="display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.2px; color: #C85A32; margin-bottom: 8px;">
                Single-Use Verification Code
              </span>
              <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #1E201E; text-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                ${code}
              </span>
              <span style="display: block; font-size: 12px; color: #5A605A; margin-top: 10px;">
                ⏱️ Valid for <strong>${expiryMinutes} minutes</strong> from receipt
              </span>
            </td>
          </tr>
        </table>

        <!-- Security Warning Notice -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0 16px; background-color: #FFF8F6; border-left: 3px solid #C85A32; border-radius: 0 6px 6px 0;">
          <tr>
            <td style="padding: 12px 16px;">
              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #7A3520;">
                <strong>Security Notice:</strong> Workn staff will never ask for this code via phone, WhatsApp, or direct message. If you did not register for an account at Workn, you can safely disregard this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 24px 40px 32px; background-color: #FAF8F4; border-top: 1px solid #F0ECE4;">
        <p style="margin: 0 0 8px; font-size: 12px; color: #5A605A; line-height: 1.5;">
          Workn Coworking Spaces Ltd. &bull; 14B Admiralty Way, Lekki Phase 1, Lagos, Nigeria
        </p>
        <p style="margin: 0; font-size: 11px; color: #8C928C;">
          This is an automated operational transmission. You received this email because an account creation request was initiated on <a href="${siteUrl}" style="color: #2A4B3C; text-decoration: underline;">workn.ng</a>.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

const html = generateVerificationEmailHtml({
  fullName: 'Abdul Salam',
  code: '582914',
  expiryMinutes: 10,
  siteUrl: 'http://localhost:3000',
});

const outPath = path.resolve('task-04-server-security/evidence/email-preview.html');
fs.writeFileSync(outPath, html, 'utf8');
console.log('✅ Generated HTML Email Preview at:', outPath);

