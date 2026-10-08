import { Resend } from "resend";
import { getServerEnv } from "@/lib/validators/env.schema";

interface TicketEmailPayload {
  to: string;
  participantName: string;
  eventName: string;
  ticketNumber: string;
  eventDate?: string | null;
  eventLocation?: string | null;
  ticketUrl: string;
  qrCodeDataUrl?: string;
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
 * Builds a beautiful, responsive HTML email for ticket delivery.
 */
export function buildTicketEmailHtml(payload: TicketEmailPayload): string {
  const { participantName, eventName, ticketNumber, eventDate, eventLocation, ticketUrl } = payload;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Ticket for ${eventName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #f4f4f5; margin: 0; padding: 24px; }
    .container { max-width: 580px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #4338ca 0%, #6366f1 100%); padding: 32px 24px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; }
    .content { padding: 32px 24px; }
    .greeting { font-size: 16px; color: #d4d4d8; margin-bottom: 24px; line-height: 1.5; }
    .ticket-card { background-color: #09090b; border: 1px solid #3f3f46; border-radius: 12px; padding: 24px; margin-bottom: 28px; }
    .badge { display: inline-block; background-color: #312e81; color: #a5b4fc; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 10px; border-radius: 9999px; margin-bottom: 12px; }
    .ticket-title { font-size: 20px; font-weight: 700; color: #ffffff; margin: 0 0 16px 0; }
    .meta-row { display: flex; justify-content: space-between; border-bottom: 1px solid #27272a; padding: 8px 0; font-size: 13px; }
    .meta-row:last-child { border-bottom: none; }
    .meta-label { color: #a1a1aa; }
    .meta-value { color: #f4f4f5; font-weight: 600; text-align: right; }
    .ticket-code { font-family: monospace; font-size: 15px; color: #818cf8; letter-spacing: 0.05em; }
    .cta-button { display: block; text-align: center; background-color: #4f46e5; color: #ffffff !important; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 10px; margin: 24px 0 16px 0; }
    .footer { text-align: center; padding: 20px 24px 32px; font-size: 12px; color: #71717a; border-top: 1px solid #27272a; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Event Ticket</h1>
    </div>
    <div class="content">
      <p class="greeting">
        Hello <strong>${participantName}</strong>,<br>
        Your digital admission pass is ready. Please have your ticket or QR code ready for check-in at the entrance.
      </p>

      <div class="ticket-card">
        <div class="badge">Official Pass</div>
        <h2 class="ticket-title">${eventName}</h2>

        <div class="meta-row">
          <span class="meta-label">Ticket ID</span>
          <span class="meta-value ticket-code">${ticketNumber}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Attendee</span>
          <span class="meta-value">${participantName}</span>
        </div>
        ${eventDate ? `<div class="meta-row"><span class="meta-label">Date & Time</span><span class="meta-value">${eventDate}</span></div>` : ""}
        ${eventLocation ? `<div class="meta-row"><span class="meta-label">Location</span><span class="meta-value">${eventLocation}</span></div>` : ""}
      </div>

      <a href="${ticketUrl}" class="cta-button" target="_blank">
        View & Download Ticket
      </a>
    </div>

    <div class="footer">
      This is an automated ticket confirmation. Keep this email accessible during event check-in.
    </div>
  </div>
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

  const fromEmail = env.EMAIL_FROM || "Ticket Platform <tickets@example.com>";
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
