import { Resend } from 'resend';

/**
 * Escapes HTML characters in visitor-supplied text to prevent HTML injection in email clients.
 *
 * @param {string} str
 * @returns {string}
 */
const escapeHtml = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Strips carriage returns and newlines to prevent email header injection in subject lines and email fields.
 *
 * @param {string} str
 * @param {number} [maxLength=100]
 * @returns {string}
 */
const sanitizeHeaderValue = (str, maxLength = 100) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[\r\n\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
};

let cachedApiKey = null;
let resendClient = null;

/**
 * Returns a singleton or lazy-initialized Resend client instance.
 * Updates the instance if RESEND_API_KEY changes.
 * Returns null if RESEND_API_KEY is not configured.
 *
 * @returns {Resend|null}
 */
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    cachedApiKey = null;
    resendClient = null;
    return null;
  }
  if (!resendClient || cachedApiKey !== apiKey) {
    cachedApiKey = apiKey;
    resendClient = new Resend(apiKey);
  }
  return resendClient;
};

/**
 * Dispatches an email notification to the portfolio owner when a new contact inquiry is received.
 *
 * @param {Object} params
 * @param {string} params.name - Visitor name
 * @param {string} params.email - Visitor email
 * @param {string} [params.phone] - Visitor phone (optional)
 * @param {string} params.message - Visitor message
 * @param {string} [params.createdAt] - Submission timestamp
 * @returns {Promise<{ success: boolean, id?: string, skipped?: boolean, reason?: string, error?: string }>}
 */
export const sendContactNotification = async ({ name, email, phone, message, createdAt }) => {
  const recipientEmail = process.env.CONTACT_NOTIFICATION_EMAIL?.trim();
  const resend = getResendClient();

  if (!resend) {
    console.warn('[Email Notification] Skipped: RESEND_API_KEY is not configured in environment variables.');
    return { success: false, skipped: true, reason: 'RESEND_API_KEY missing' };
  }

  if (!recipientEmail) {
    console.warn('[Email Notification] Skipped: CONTACT_NOTIFICATION_EMAIL is not configured in environment variables.');
    return { success: false, skipped: true, reason: 'CONTACT_NOTIFICATION_EMAIL missing' };
  }

  // Header injection defense: sanitize visitor name before placing in email subject
  const cleanName = sanitizeHeaderValue(name) || 'Visitor';
  const cleanEmail = sanitizeHeaderValue(email, 254);
  const cleanPhone = sanitizeHeaderValue(phone || '', 50);
  const safeMessageText = typeof message === 'string' ? message.trim() : '';
  const formattedDate = createdAt ? new Date(createdAt).toUTCString() : new Date().toUTCString();

  // From address: default to official Resend testing domain (onboarding@resend.dev) or user-configured custom domain
  const fromAddress = process.env.RESEND_FROM_EMAIL?.trim() || 'Portfolio Contact <onboarding@resend.dev>';

  const subject = `New Portfolio Contact — ${cleanName}`;

  // Plain text email content
  const textContent = [
    'New Portfolio Contact',
    '',
    `Name: ${cleanName}`,
    `Email: ${cleanEmail}`,
    ...(cleanPhone ? [`Phone: ${cleanPhone}`] : []),
    '',
    'Message:',
    safeMessageText,
    '',
    'Received:',
    formattedDate,
  ].join('\n');

  // HTML email content (clean, responsive, modern dark styling matching portfolio)
  const safeName = escapeHtml(cleanName);
  const safeEmail = escapeHtml(cleanEmail);
  const safePhone = cleanPhone ? escapeHtml(cleanPhone) : null;
  const safeMessage = escapeHtml(safeMessageText).replace(/\n/g, '<br />');
  const safeDate = escapeHtml(formattedDate);

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Portfolio Contact</title>
</head>
<body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0b0f; color: #f4f4f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #121217; border-radius: 12px; border: 1px solid #27272a; overflow: hidden;">
    <tr>
      <td style="padding: 28px 32px; background: linear-gradient(135deg, #18181b 0%, #09090b 100%); border-bottom: 1px solid #27272a;">
        <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.12em; color: #a1a1aa; text-transform: uppercase;">Portfolio Notification</span>
        <h1 style="margin: 8px 0 0 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">New Contact Inquiry</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
          <tr>
            <td style="padding: 8px 0; color: #71717a; font-size: 13px; width: 90px; vertical-align: top;">Name</td>
            <td style="padding: 8px 0; color: #ffffff; font-size: 14px; font-weight: 600;">${safeName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #71717a; font-size: 13px; vertical-align: top;">Email</td>
            <td style="padding: 8px 0; font-size: 14px;"><a href="mailto:${safeEmail}" style="color: #60a5fa; text-decoration: none;">${safeEmail}</a></td>
          </tr>
          ${safePhone ? `
          <tr>
            <td style="padding: 8px 0; color: #71717a; font-size: 13px; vertical-align: top;">Phone</td>
            <td style="padding: 8px 0; color: #e4e4e7; font-size: 14px;">${safePhone}</td>
          </tr>` : ''}
          <tr>
            <td style="padding: 8px 0; color: #71717a; font-size: 13px; vertical-align: top;">Received</td>
            <td style="padding: 8px 0; color: #a1a1aa; font-size: 13px;">${safeDate}</td>
          </tr>
        </table>

        <div style="margin-top: 16px; padding: 18px 20px; background-color: #1c1c22; border-left: 3px solid #3b82f6; border-radius: 6px;">
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #93c5fd; margin-bottom: 8px;">Message</div>
          <div style="font-size: 14px; line-height: 1.6; color: #f4f4f5; word-break: break-word;">${safeMessage}</div>
        </div>

        <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #27272a; text-align: center;">
          <a href="mailto:${safeEmail}?subject=${encodeURIComponent(`Re: ${subject}`)}" style="display: inline-block; padding: 10px 24px; background-color: #ffffff; color: #000000; text-decoration: none; font-size: 13px; font-weight: 600; border-radius: 6px;">
            Reply to ${safeName}
          </a>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [recipientEmail],
      replyTo: cleanEmail,
      reply_to: cleanEmail,
      subject,
      text: textContent,
      html: htmlContent,
    });

    if (error) {
      console.error('[Email Notification] Resend API responded with error:', error.message || error);
      return { success: false, error: error.message || 'Resend error' };
    }

    console.log('[Email Notification] Email sent successfully via Resend. ID:', data?.id);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error('[Email Notification] Network or unexpected error calling Resend:', err.message || err);
    return { success: false, error: err.message || 'Network error' };
  }
};
