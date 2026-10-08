import { getTicketByPublicToken } from "@/app/actions/ticket.actions";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, CheckCircle2, XCircle, AlertTriangle, Building, ShieldCheck } from "lucide-react";
import { format } from "date-fns";

export const instant = false;

export async function generateMetadata(props: {
  params: Promise<{ token: string }>;
}) {
  const params = await props.params;
  try {
    const ticket = await getTicketByPublicToken(params.token);
    return {
      title: `Ticket: ${ticket.ticketNumber} - ${ticket.eventName}`,
      description: `Official event ticket for ${ticket.participantName}`,
    };
  } catch {
    return {
      title: "Digital Ticket - Ticket Platform",
    };
  }
}

export default async function PublicTicketPage(props: {
  params: Promise<{ token: string }>;
}) {
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
    <div className="min-h-screen bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        {/* Main Digital Ticket Pass Card */}
        <Card className="bg-zinc-900/90 border-zinc-800 shadow-2xl backdrop-blur overflow-hidden rounded-3xl">
          {/* Header Gradient Banner */}
          <div className="h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          <CardContent className="p-7 space-y-6">
            {/* Top Pass Brand & Status */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Digital Event Pass
                </span>
              </div>

              {isIssued && (
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-semibold text-[11px]">
                  <CheckCircle2 className="mr-1 h-3 w-3" /> VALID
                </Badge>
              )}
              {isCheckedIn && (
                <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 font-semibold text-[11px]">
                  ALREADY CHECKED IN
                </Badge>
              )}
              {isRevoked && (
                <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 font-semibold text-[11px]">
                  <XCircle className="mr-1 h-3 w-3" /> REVOKED
                </Badge>
              )}
            </div>

            {/* Event & Organization Info */}
            <div className="space-y-1 text-center">
              <h1 className="text-2xl font-extrabold tracking-tight text-white">{ticket.eventName}</h1>
              <p className="text-xs text-zinc-400 flex items-center justify-center gap-1.5 mt-1">
                <Building className="h-3.5 w-3.5 text-indigo-400" />
                {ticket.organizationName}
              </p>
            </div>

            {/* QR Code Presentation */}
            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800/80 text-center space-y-3">
              <div className="p-3 bg-white rounded-xl inline-block shadow-md">
                <img
                  src={ticket.qrCodeDataUrl}
                  alt={`QR code for ticket ${ticket.ticketNumber}`}
                  className="w-48 h-48 object-contain mx-auto"
                />
              </div>

              <div>
                <p className="text-[10px] uppercase font-semibold tracking-widest text-zinc-500">
                  Ticket Identifier
                </p>
                <p className="font-mono text-base font-bold text-indigo-400 mt-0.5 tracking-wider">
                  {ticket.ticketNumber}
                </p>
              </div>
            </div>

            {/* Attendee Details */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/50">
                <span className="text-zinc-500">Attendee</span>
                <span className="text-zinc-200 font-medium">{ticket.participantName}</span>
              </div>

              {ticket.eventDateStart && (
                <div className="flex justify-between p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/50">
                  <span className="text-zinc-500 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-zinc-400" /> Date
                  </span>
                  <span className="text-zinc-200 font-medium">
                    {format(new Date(ticket.eventDateStart), "PPp")}
                  </span>
                </div>
              )}

              {ticket.eventLocation && (
                <div className="flex justify-between p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/50">
                  <span className="text-zinc-500 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-zinc-400" /> Location
                  </span>
                  <span className="text-zinc-200 font-medium text-right max-w-[200px] truncate">
                    {ticket.eventLocation}
                  </span>
                </div>
              )}
            </div>

            {/* Verification Footer Notes */}
            <div className="text-center pt-2 border-t border-zinc-800/80">
              <p className="text-[11px] text-zinc-500">
                Show this digital ticket on your phone screen upon arrival at the venue.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
