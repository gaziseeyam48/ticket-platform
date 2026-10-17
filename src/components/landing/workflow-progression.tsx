
export function WorkflowProgression() {
  const steps = [
    {
      number: "01",
      tag: "SETUP",
      title: "Set up your event",
      description:
        "Add your event details and choose what information attendees need to provide.",
      details: [
        "Configure capacity limits, dates, venue, and descriptions.",
        "Design custom registration questions (university ID, workshop track, dietary needs).",
        "Set as Free or Paid with direct payment instructions (bKash, Nagad, Bank, Cash).",
      ],
      annotation: "Ready in under 3 minutes",
    },
    {
      number: "02",
      tag: "REGISTRATIONS",
      title: "Collect registrations",
      description:
        "Share your event page and keep registrations organized in one place.",
      details: [
        "Attendees sign up directly with zero password creation or app downloads.",
        "For paid gatherings: review submitted transaction references and approve passes.",
        "Automatic digital ticket dispatch with unique QR code directly to attendee inboxes.",
      ],
      annotation: "Organized intake & payment review",
    },
    {
      number: "03",
      tag: "OPERATIONS",
      title: "Get ready for the door",
      description:
        "Issue tickets and manage attendee entry with your event team.",
      details: [
        "Delegate gate access via single-use staff scanner links to volunteers.",
        "Scan passes using any mobile browser with instant turnstile verification.",
        "Atomic concurrency stops duplicate or screenshotted passes from entering twice.",
      ],
      annotation: "Zero-confusion gate control",
    },
  ];

  return (
    <section id="workflow" className="py-20 sm:py-32 bg-white border-b border-[#DDE5E2]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-wider text-[#52615D] uppercase mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#006B5B]" />
            <span>Operational Workflow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#17211F] leading-tight">
            How TicketKoi simplifies an organizer’s work.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#52615D] leading-relaxed max-w-2xl">
            A clear three-stage sequence designed to minimize manual overhead from initial announcement to venue doors closing.
          </p>
        </div>

        {/* Editorial Horizontal Sequence */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
          {steps.map((step) => (
            <div
              key={step.number}
              className="flex flex-col justify-between p-7 sm:p-8 rounded-xl border border-[#DDE5E2] bg-white relative group hover:border-[#006B5B]/50 transition-colors shadow-2xs"
            >
              <div>
                {/* Step Index & Tag Header */}
                <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#DDE5E2]/70">
                  <span className="text-3xl sm:text-4xl font-mono font-bold text-[#17211F] tracking-tight">
                    {step.number}
                  </span>
                  <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-[#EDF4F2] text-[#006B5B] border border-[#006B5B]/20 font-semibold">
                    {step.tag}
                  </span>
                </div>

                {/* Step Title & Core Description */}
                <h3 className="text-xl font-bold text-[#17211F] tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm text-[#52615D] leading-relaxed">
                  {step.description}
                </p>

                {/* Operational Details List */}
                <ul className="mt-6 space-y-2.5 text-xs text-[#52615D]">
                  {step.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="h-4 w-4 rounded-full bg-[#EDF4F2] text-[#006B5B] font-semibold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                        ✓
                      </span>
                      <span className="leading-normal">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom Operational Annotation */}
              <div className="mt-8 pt-4 border-t border-[#DDE5E2]/70 flex items-center justify-between text-[11px] font-mono text-[#66736F]">
                <span>{step.annotation}</span>
                <span className="text-[#006B5B] font-semibold group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
