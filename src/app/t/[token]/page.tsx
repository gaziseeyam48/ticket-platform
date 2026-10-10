import { connection } from "next/server";
import { getTicketByPublicToken } from "@/app/actions/ticket.actions";
import { TicketPassView } from "@/components/ticket/ticket-pass-view";
import Link from "next/link";
import { AlertCircle, ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export const instant = false;

export async function generateMetadata(props: {
  params: Promise<{ token: string }>;
}) {
  await connection();
  const params = await props.params;
  try {
    const ticket = await getTicketByPublicToken(params.token);
    return {
      title: `Pass #${ticket.ticketNumber} — ${ticket.eventName}`,
      description: `Official event entrance pass for ${ticket.participantName}.`,
    };
  } catch {
    return {
      title: "Digital Pass — Ticket Platform",
      description: "Event ticket verification and entrance pass.",
    };
  }
}

export default async function PublicTicketPage(props: {
  params: Promise<{ token: string }>;
}) {
  await connection();
  const params = await props.params;
  const { token } = params;

  let ticket = null;
  let errorMsg = "";

  try {
    ticket = await getTicketByPublicToken(token);
  } catch (err: any) {
    errorMsg = err.message || "Pass not recognized or expired.";
  }

  // Graceful Invalid / Not Found State
  if (!ticket) {
    return (
      <div className="min-h-screen bg-[#fbfbf9] text-zinc-900 py-12 px-4 sm:px-6 flex flex-col items-center justify-center font-sans">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="p-8 rounded-3xl bg-white border border-zinc-200 shadow-sm space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <ShieldAlert className="h-6 w-6" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-zinc-900">
                Invalid Entrance Pass
              </h2>
              <p className="text-xs text-zinc-500 leading-relaxed">
                {errorMsg.includes("Too many")
                  ? errorMsg
                  : "This entrance pass token is unrecognized or may have expired. Please verify the link from your confirmation email."}
              </p>
            </div>

            <div className="pt-2">
              <Link href="/">
                <Button variant="outline" size="sm" className="w-full text-xs font-semibold gap-1.5">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Return to Homepage
                </Button>
              </Link>
            </div>
          </div>

          <p className="text-[11px] font-mono text-zinc-400">
            TicketPlatform • Anti-Enumeration Protection Active
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfbf9] text-zinc-900 py-10 px-4 sm:px-6 flex flex-col items-center justify-center font-sans">
      <TicketPassView ticket={ticket} />
    </div>
  );
}
