import { Sun, QrCode } from "lucide-react";

export function VisualInterlude() {
  return (
    <section className="relative py-24 sm:py-36 bg-zinc-950 text-white overflow-hidden border-y border-zinc-900">
      {/* Subtle fine architectural grid on dark surface */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.08]"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 items-center">
          
          {/* Typographic Statement: Confident, Editorial, High-Contrast */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 text-xs font-mono tracking-wider text-emerald-400 uppercase">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Event Day Execution</span>
              <span className="text-zinc-700">/</span>
              <span>Zero Panic</span>
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08]">
              When the doors open, there is{" "}
              <span className="font-editorial italic font-normal text-emerald-400">
                no room for confusion.
              </span>
            </h2>

            <p className="text-base sm:text-lg text-zinc-400 max-w-xl font-normal leading-relaxed">
              At 9:00 AM when a crowd is waiting outside and your volunteers are on the line, TicketKoi gives your team instant, unambiguous feedback.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-zinc-900 text-xs">
              <div className="space-y-1.5">
                <span className="font-mono text-white font-semibold uppercase text-[11px] block">
                  Atomic Concurrency
                </span>
                <p className="text-zinc-400 leading-normal">
                  Passes lock permanently upon first scan. If someone presents a screenshot or duplicate, the turnstile sounds an alert immediately.
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="font-mono text-white font-semibold uppercase text-[11px] block">
                  High-Contrast Daylight Pass
                </span>
                <p className="text-zinc-400 leading-normal">
                  Attendees have a 1-tap Outdoor Brightness Mode to ensure quick QR reads even under direct blazing sun.
                </p>
              </div>
            </div>
          </div>

          {/* Genuine Digital Pass Composition on Dark Canvas */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl relative">
              
              {/* Pass Header */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
                    Official Entrance Pass
                  </span>
                  <span className="text-xs font-bold text-white tracking-tight">
                    TicketKoi Digital Pass
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>VALID PASS</span>
                </div>
              </div>

              {/* Event Details */}
              <div className="pt-4 pb-3 space-y-1">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Design Systems Colloquium
                </h3>
                <p className="text-xs text-zinc-400">
                  Dhaka University Senate Bhaban • Saturday, 10:00 AM
                </p>
              </div>

              {/* Attendee Info Strip */}
              <div className="py-3 px-3.5 rounded-lg bg-zinc-950/80 border border-zinc-800/80 my-3 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Attendee</span>
                  <span className="font-semibold text-zinc-100">Sophia Al-Mansoor</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Category</span>
                  <span className="font-mono text-emerald-400">Speaker Access</span>
                </div>
              </div>

              {/* High-Contrast QR View */}
              <div className="p-5 rounded-xl bg-white text-zinc-950 flex flex-col items-center justify-center space-y-3 my-4">
                <div className="w-40 h-40 bg-white p-2 rounded flex items-center justify-center">
                  <QrCode className="w-36 h-36 text-zinc-950 stroke-[1.5]" />
                </div>
                <div className="text-center">
                  <span className="font-mono text-xs font-bold text-zinc-900 tracking-wider">
                    #TK-82910-E9
                  </span>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    Scan with any phone camera at door turnstile
                  </p>
                </div>
              </div>

              {/* Pass Actions & Security Guarantee */}
              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <Sun className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-[10px] font-mono">Outdoor Contrast Ready</span>
                </div>
                <span className="font-mono text-[10px] text-zinc-500">
                  Single-Use Token Locked
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
