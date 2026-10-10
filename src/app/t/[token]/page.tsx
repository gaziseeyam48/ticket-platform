import { connection } from "next/server";
import { getTicketByPublicToken } from "@/app/actions/ticket.actions";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, CheckCircle2, XCircle, Building } from "lucide-react";
import { format } from "date-fns";

export const instant = false;

export async function generateMetadata(props: {
  params: Promise<{ token: string }>;
}) {
  await connection();
  const params = await props.params;
  try {
    const ticket = await getTicketByPublicToken(params.token);
    return {
      title: `Pass: ${ticket.ticketNumber} — ${ticket.eventName}`,
      description: `Official event pass for ${ticket.participantName}`,
    };
  } catch {
    return {
      title: "Digital Pass — Ticket Platform",
    };
  }
}

export default async function PublicTicketPage(props: {
  params: Promise<{ token: string }>;
}) {
  await connection();
  const params = await props.params;
  const { token } = params;

  let ticket;
  try {
    ticket = await getTicketByPublicToken(token);
  } catch {
    notFound();
  }

  const isCheckedIn = ticket.status === "CHECKED_IN";
  const isRevoked = ticket.status === "REVOKED";
  const isIssued = ticket.status === "ISSUED";

  return (
    <div className="min-h-screen bg-[#fbfbf9] text-zinc-900 py-10 px-4 sm:px-6 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-sm space-y-6">
        {/* Main Digital Pass Card (Boarding Pass aesthetic) */}
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Top Pass Stub Header */}
          <div className="p-6 pb-5 border-b border-zinc-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                Official Digital Pass
              </span>

              {isIssued && (
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Valid
                </span>
              )}
              {isCheckedIn && (
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-sm bg-zinc-100 text-zinc-600 border border-zinc-200 font-semibold">
                  Checked In
                </span>
              )}
              {isRevoked && (
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-sm bg-rose-50 text-rose-700 border border-rose-200 font-semibold flex items-center gap-1">
                  <XCircle className="h-3 w-3" /> Revoked
                </span>
              )}
            </div>

            <div className="space-y-0.5">
              <h1 className="font-editorial text-2xl font-bold tracking-tight text-zinc-900 leading-tight">
                {ticket.eventName}
              </h1>
              <p className="text-xs text-zinc-500 flex items-center gap-1">
                <Building className="h-3 w-3 text-zinc-400" />
                {ticket.organizationName}
              </p>
            </div>
          </div>

          {/* Perforated Divider */}
          <div className="relative py-2 bg-zinc-50 border-y border-dashed border-zinc-200">
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#fbfbf9] border-r border-zinc-200" />
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#fbfbf9] border-l border-zinc-200" />
            <div className="text-center">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                Turnstile Entrance Scan
              </span>
            </div>
          </div>

          {/* QR Code Presentation */}
          <div className="p-6 text-center space-y-4">
            <div className="p-3 bg-white border border-zinc-200 rounded-xl inline-block shadow-2xs">
              <img
                src={ticket.qrCodeDataUrl}
                alt={`QR code for ticket ${ticket.ticketNumber}`}
                className="w-48 h-48 object-contain mx-auto"
              />
            </div>

            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                Identifier Code
              </p>
              <p className="font-mono text-sm font-bold text-zinc-900 mt-0.5 tracking-wider">
                {ticket.ticketNumber}
              </p>
            </div>

            {/* Attendee Details Grid */}
            <div className="pt-4 border-t border-zinc-100 text-left space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-50">
                <span className="text-zinc-400 font-mono">Attendee</span>
                <span className="text-zinc-900 font-semibold">{ticket.participantName}</span>
              </div>

              {ticket.eventDateStart && (
                <div className="flex justify-between py-1 border-b border-zinc-50">
                  <span className="text-zinc-400 font-mono">Date</span>
                  <span className="text-zinc-800 font-medium">
                    {format(new Date(ticket.eventDateStart), "MMM d, yyyy h:mm a")}
                  </span>
                </div>
              )}

              {ticket.eventLocation && (
                <div className="flex justify-between py-1">
                  <span className="text-zinc-400 font-mono">Venue</span>
                  <span className="text-zinc-800 font-medium text-right max-w-[180px] truncate">
                    {ticket.eventLocation}
                  </span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-zinc-400 font-mono pt-2">
              Present this pass at physical turnstile check-in.
            </p>
          </div>
        </div>

        <p className="text-center text-[11px] font-mono text-zinc-400">
          TicketPlatform • Atomic Concurrency Protocol
        </p>
      </div>
    </div>
  );
}
