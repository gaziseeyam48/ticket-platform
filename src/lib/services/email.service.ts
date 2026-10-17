import { Resend } from "resend";
import { getServerEnv } from "@/lib/validators/env.schema";
import { TicketDesignConfig } from "@/lib/types/ticket-design";

export interface TicketEmailPayload {
  to: string;
  participantName: string;
  eventName: string;
  ticketNumber: string;
  category?: string;
  eventDate?: string | null;
  eventLocation?: string | null;
  organizationName?: string;
  ticketUrl: string;
  qrCodeDataUrl?: string;
  ticketDesign?: TicketDesignConfig | null;
}

let resendInstance: Resend | null = null;

function getResendClient(): Resend | null {
  if (resendInstance) return resendInstance;

  const env = getServerEnv();
  if (!env.RESEND_API_KEY) {
    return null;
  }

  resendInstance = new Resend(env.RESEND_API_KEY);
  return resendInstance;
}

/**
 * Escapes user-supplied content to prevent HTML injection in email clients.
 */
function escapeHtml(str: string | null | undefined): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Builds a premium, email-client-compatible HTML email that displays
 * the full digital admission pass directly inside the email body.
 */
export function buildTicketEmailHtml(payload: TicketEmailPayload): string {
  const {
    participantName,
    eventName,
    ticketNumber,
    category = "General Admission",
    eventDate,
    eventLocation,
    organizationName,
    ticketUrl,
    qrCodeDataUrl,
    ticketDesign,
  } = payload;

  const escapedParticipantName = escapeHtml(participantName);
  const escapedEventName = escapeHtml(eventName);
  const escapedTicketNumber = escapeHtml(ticketNumber);
  const escapedCategory = escapeHtml(category || "General Admission");
  const escapedEventDate = escapeHtml(eventDate);
  const escapedEventLocation = escapeHtml(eventLocation);
  const escapedOrgName = escapeHtml(organizationName);

  // Apply custom event branding if available, with accessible fallbacks
  const primaryColor = ticketDesign?.primaryColor || "#171923";
  const accentColor = ticketDesign?.accentColor || "#059669";
  const buttonBg = primaryColor === "#FFFFFF" || primaryColor === "#ffffff" ? "#171923" : primaryColor;

  // Event logo segment
  const logoHtml =
    ticketDesign?.logoUrl
      ? `<div style="margin-bottom: 12px;"><img src="${escapeHtml(ticketDesign.logoUrl)}" alt="${escapedOrgName || 'Event'} Logo" height="36" style="max-height: 36px; max-width: 140px; height: auto; object-fit: contain; display: block; border: 0;" /></div>`
      : "";

  // Organization name segment
  const orgHtml =
    organizationName && ticketDesign?.showOrganizationName !== false
      ? `<p style="margin: 0; font-size: 13px; color: #64748B; font-weight: 500;">${escapedOrgName}</p>`
      : "";

  // QR Code segment: high contrast with scannable quiet zone
  const qrHtml = qrCodeDataUrl
    ? `<img src="${qrCodeDataUrl}" alt="Scan QR at entrance gate — Ticket #${escapedTicketNumber}" width="160" height="160" style="display: block; width: 160px; height: 160px; border: 0; border-radius: 4px;" />`
    : `<div style="width: 160px; height: 160px; background-color: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: 8px; text-align: center; color: #64748B; font-size: 11px; padding: 48px 12px; box-sizing: border-box;">Ticket #${escapedTicketNumber}<br><span style="font-size: 10px; color: #94A3B8;">Present at turnstile</span></div>`;

  // Date row segment
  const dateRowHtml = escapedEventDate
    ? `<tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-size: 13px; color: #64748B; vertical-align: top;">
          Date &amp; Time
        </td>
        <td align="right" style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-size: 13px; font-weight: 600; color: #0F172A; vertical-align: top;">
          ${escapedEventDate}
        </td>
      </tr>`
    : "";

  // Location row segment
  const locationRowHtml = escapedEventLocation
    ? `<tr>
        <td style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-size: 13px; color: #64748B; vertical-align: top;">
          Location
        </td>
        <td align="right" style="padding: 9px 0; border-bottom: 1px solid #F1F5F9; font-size: 13px; font-weight: 600; color: #0F172A; vertical-align: top;">
          ${escapedEventLocation}
        </td>
      </tr>`
    : "";

  // Footer text
  const orgFooterText = organizationName ? `on behalf of <strong>${escapedOrgName}</strong>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Your Ticket for ${escapedEventName}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body {
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      background-color: #F8FAFC;
    }
    table, td {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
      }
      .pass-card {
        border-radius: 16px !important;
      }
      .pass-content {
        padding: 20px 16px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0F172A;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Email Container (max 580px) -->
        <table role="presentation" class="email-container" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 580px; margin: 0 auto; text-align: left;">
          
          <!-- A. COMPACT BRAND HEADER -->
          <tr>
            <td style="padding: 0 0 20px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 800; letter-spacing: 0.12em; color: #0F172A; text-transform: uppercase;">
                    TICKETKOI
                  </td>
                  <td style="padding: 0 6px; color: #6366F1; font-weight: bold; font-size: 13px;">
                    •
                  </td>
                  <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #64748B; font-weight: 500;">
                    Digital Admission Pass
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- B. CONFIRMATION MESSAGE -->
          <tr>
            <td style="padding: 0 0 24px 0;">
              <h1 style="margin: 0 0 8px 0; font-size: 26px; font-weight: 800; color: #0F172A; letter-spacing: -0.025em; line-height: 1.25;">
                Your ticket is ready.
              </h1>
              <p style="margin: 0; font-size: 15px; color: #475569; line-height: 1.5;">
                Hi <strong>${escapedParticipantName}</strong>, you’re all set for <strong>${escapedEventName}</strong>. Your ticket is below—keep this email handy for event day.
              </p>
            </td>
          </tr>

          <!-- C. TICKET DISPLAYED DIRECTLY INSIDE THE EMAIL -->
          <tr>
            <td>
              <table role="presentation" class="pass-card" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border: 1px solid #E2E8F0; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);">
                
                <!-- Brand Accent Top Bar -->
                <tr>
                  <td style="background-color: ${primaryColor}; height: 6px; font-size: 0; line-height: 0;">&nbsp;</td>
                </tr>

                <!-- Pass Top Header (Badges & Event Info) -->
                <tr>
                  <td class="pass-content" style="padding: 24px 28px 16px 28px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <!-- Left: Verified Pass Label -->
                        <td align="left" style="vertical-align: middle;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="color: ${accentColor}; font-size: 14px; line-height: 1; padding-right: 5px; font-weight: bold;">
                                &#10003;
                              </td>
                              <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.08em;">
                                VERIFIED ADMISSION PASS
                              </td>
                            </tr>
                          </table>
                        </td>

                        <!-- Right: Admission Category Pill -->
                        <td align="right" style="vertical-align: middle;">
                          <span style="display: inline-block; background-color: #F1F5F9; color: #334155; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; border: 1px solid #E2E8F0;">
                            ${escapedCategory}
                          </span>
                        </td>
                      </tr>
                    </table>

                    <!-- Event Logo (if available) -->
                    ${logoHtml}

                    <!-- Event Title -->
                    <h2 style="margin: 14px 0 4px 0; font-size: 24px; font-weight: 800; color: #0F172A; line-height: 1.25; letter-spacing: -0.015em;">
                      ${escapedEventName}
                    </h2>

                    <!-- Organization Name -->
                    ${orgHtml}
                  </td>
                </tr>

                <!-- Perforated Tear Line Separator -->
                <tr>
                  <td style="padding: 4px 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="border-top: 1px dashed #CBD5E1; font-size: 0; line-height: 0; height: 1px;">&nbsp;</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- QR Section: Centered High-Contrast Scannable Area -->
                <tr>
                  <td align="center" style="padding: 20px 24px 16px 24px; background-color: #FAFAFA;">
                    <div style="font-size: 10px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 12px;">
                      SCAN GATE ENTRANCE TOKEN
                    </div>

                    <!-- White QR Container Box -->
                    <table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border: 1px solid #E2E8F0; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); margin: 0 auto;">
                      <tr>
                        <td align="center" style="padding: 14px;">
                          ${qrHtml}
                        </td>
                      </tr>
                    </table>

                    <!-- Ticket Reference ID -->
                    <div style="margin-top: 14px;">
                      <span style="font-family: 'SF Mono', Menlo, Consolas, Monaco, monospace; font-size: 16px; font-weight: 800; letter-spacing: 0.08em; color: ${primaryColor};">
                        #${escapedTicketNumber}
                      </span>
                    </div>
                    <div style="font-size: 11px; color: #64748B; margin-top: 4px;">
                      Present this digital entrance pass on your mobile device at turnstiles
                    </div>
                  </td>
                </tr>

                <!-- Perforated Tear Line Separator -->
                <tr>
                  <td style="padding: 4px 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="border-top: 1px dashed #CBD5E1; font-size: 0; line-height: 0; height: 1px;">&nbsp;</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Pass Metadata Rows (Attendee, Date, Location) -->
                <tr>
                  <td class="pass-content" style="padding: 16px 28px 24px 28px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      
                      <!-- Attendee Row -->
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #F1F5F9; font-size: 13px; color: #64748B;">
                          Attendee
                        </td>
                        <td align="right" style="padding: 8px 0; border-bottom: 1px solid #F1F5F9; font-size: 13px; font-weight: 700; color: #0F172A;">
                          ${escapedParticipantName}
                        </td>
                      </tr>

                      <!-- Date & Time Row -->
                      ${dateRowHtml}

                      <!-- Location Row -->
                      ${locationRowHtml}

                      <!-- Pass Status Row -->
                      <tr>
                        <td style="padding: 8px 0; font-size: 13px; color: #64748B;">
                          Pass Status
                        </td>
                        <td align="right" style="padding: 8px 0; font-size: 13px; font-weight: 700; color: #059669;">
                          <span style="display: inline-block; width: 6px; height: 6px; background-color: #10B981; border-radius: 50%; margin-right: 4px; vertical-align: middle;"></span>
                          Active &bull; Ready for Check-in
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- D. PRIMARY ACTION (Open Full Ticket) -->
          <tr>
            <td style="padding: 24px 0 16px 0; text-align: center;">
              <a href="${ticketUrl}" target="_blank" style="display: block; background-color: ${buttonBg}; color: #ffffff !important; font-size: 15px; font-weight: 700; text-align: center; text-decoration: none; padding: 14px 28px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.06);">
                Open Full Ticket
              </a>
            </td>
          </tr>

          <!-- E. HELPFUL CLOSING NOTE -->
          <tr>
            <td style="padding: 0 0 24px 0; text-align: center;">
              <p style="margin: 0; font-size: 13px; color: #64748B; line-height: 1.5;">
                Keep this email available when you arrive. Present your ticket to the event staff at the entrance.
              </p>
            </td>
          </tr>

          <!-- F. COMPACT FOOTER -->
          <tr>
            <td style="padding: 20px 0 0 0; border-top: 1px solid #E2E8F0; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748B; font-weight: 500;">
                Sent by TicketKoi ${orgFooterText}
              </p>
              <p style="margin: 0; font-size: 11px; color: #94A3B8;">
                This entrance pass is valid for admission. Anti-enumeration and verification security enabled.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Sends a ticket email to the participant using Resend.
 * If RESEND_API_KEY is not configured, logs the email safely and returns a simulated success.
 */
export async function sendTicketEmail(payload: TicketEmailPayload): Promise<{ success: boolean; simulated?: boolean; messageId?: string; error?: string }> {
  const env = getServerEnv();
  const resend = getResendClient();

  const fromEmail = env.EMAIL_FROM || "TicketKoi <tickets@example.com>";
  const html = buildTicketEmailHtml(payload);
  const subject = `Your Ticket: ${payload.eventName} (${payload.ticketNumber})`;

  if (!resend) {
    console.info(`[Email Service Simulation] Sent ticket email to ${payload.to} for event "${payload.eventName}" (Ticket: ${payload.ticketNumber})`);
    return {
      success: true,
      simulated: true,
    };
  }

  try {
    const response = await resend.emails.send({
      from: fromEmail,
      to: payload.to,
      subject,
      html,
    });

    if (response.error) {
      console.error("[Email Service Error] Failed to send email via Resend:", response.error);
      return {
        success: false,
        error: response.error.message,
      };
    }

    return {
      success: true,
      messageId: response.data?.id,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown email dispatch error";
    console.error("[Email Service Exception]:", errorMsg);
    return {
      success: false,
      error: errorMsg,
    };
  }
}

export interface VerifierInviteEmailPayload {
  to: string;
  verifierName: string;
  eventName: string;
  organizationName: string;
  magicLinkUrl: string;
  expiresInText: string;
}

/**
 * Builds HTML template for event gate verifier invitation with magic link.
 */
export function buildVerifierInviteEmailHtml(payload: VerifierInviteEmailPayload): string {
  const { verifierName, eventName, organizationName, magicLinkUrl, expiresInText } = payload;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gate Verifier Invitation for ${eventName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #f4f4f5; margin: 0; padding: 24px; }
    .container { max-width: 580px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px 24px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; }
    .content { padding: 32px 24px; }
    .greeting { font-size: 15px; color: #d4d4d8; margin-bottom: 20px; line-height: 1.6; }
    .info-card { background-color: #09090b; border: 1px solid #3f3f46; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
    .badge { display: inline-block; background-color: #064e3b; color: #6ee7b7; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 10px; border-radius: 9999px; margin-bottom: 10px; }
    .cta-button { display: block; text-align: center; background-color: #059669; color: #ffffff !important; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 10px; margin: 24px 0 16px 0; }
    .note { font-size: 12px; color: #a1a1aa; line-height: 1.5; margin-top: 16px; }
    .footer { text-align: center; padding: 20px 24px; font-size: 12px; color: #71717a; border-top: 1px solid #27272a; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Turnstile Verifier Access</h1>
    </div>
    <div class="content">
      <p class="greeting">Hello <strong>${verifierName}</strong>,</p>
      <p class="greeting">
        You have been appointed as an entrance gate verifier for <strong>${eventName}</strong> by <strong>${organizationName}</strong>.
      </p>
      <div class="info-card">
        <span class="badge">Gate Staff Delegation</span>
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #ffffff; font-weight: 600;">Event: ${eventName}</p>
        <p style="margin: 0; font-size: 13px; color: #a1a1aa;">Access Window: <strong>${expiresInText}</strong></p>
      </div>
      <a href="${magicLinkUrl}" class="cta-button">Open Turnstile Scanner</a>
      <p class="note">
        This link uses single-click authentication to open the mobile scanner without requiring a password. Do not forward this email to unauthorized personnel.
      </p>
    </div>
    <div class="footer">
      TicketKoi • Ephemeral Verifier Protocol
    </div>
  </div>
</body>
</html>`;
}

/**
 * Dispatches an invitation email with a magic link to a designated event verifier.
 */
export async function sendVerifierInviteEmail(payload: VerifierInviteEmailPayload) {
  const resend = getResendClient();
  const env = getServerEnv();
  const fromEmail = env.EMAIL_FROM || "TicketKoi <tickets@example.com>";
  const html = buildVerifierInviteEmailHtml(payload);
  const subject = `Gate Verifier Invitation: ${payload.eventName}`;

  if (!resend) {
    console.info(`[Email Service Simulation] Sent verifier invitation email to ${payload.to} for event "${payload.eventName}" (Link: ${payload.magicLinkUrl})`);
    return {
      success: true,
      simulated: true,
    };
  }

  try {
    const response = await resend.emails.send({
      from: fromEmail,
      to: payload.to,
      subject,
      html,
    });

    if (response.error) {
      console.error("[Email Service Error] Failed to send verifier invite email:", response.error);
      return {
        success: false,
        error: response.error.message,
      };
    }

    return {
      success: true,
      messageId: response.data?.id,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown email dispatch error";
    console.error("[Email Service Exception]:", errorMsg);
    return {
      success: false,
      error: errorMsg,
    };
  }
}
