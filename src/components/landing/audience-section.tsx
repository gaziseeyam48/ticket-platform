export function AudienceSection() {
  const audiences = [
    {
      title: "University Clubs & Student Teams",
      useCase: "Hackathons, campus symposiums, cultural fests, and orientation days.",
      benefit:
        "Collect student roll numbers and department choices directly on the registration form. Manage rapid queue admissions with student volunteers without sharing admin passwords.",
    },
    {
      title: "Workshops & Tech Communities",
      useCase: "Developer meetups, design bootcamps, and weekend masterclasses.",
      benefit:
        "Enforce strict seat capacity limits, collect track preferences, and admit attendees smoothly with zero requirement for guests to create passwords or download apps.",
    },
    {
      title: "NGOs & Professional Gatherings",
      useCase: "Fundraisers, policy forums, roundtables, and annual general meetings.",
      benefit:
        "Accept offline or direct bank transfer payments with manual receipt review. Maintain an immutable audit log of registrations, approvals, and turnstile timestamps.",
    },
    {
      title: "Independent Event Organizers",
      useCase: "Founders, indie creators, art showcases, and private gatherings.",
      benefit:
        "Host ticketed events collecting funds via bKash, Nagad, or cash without paying 5-10% ticket platform commission fees or dealing with complex corporate merchant setups.",
    },
  ];

  return (
    <section id="who-its-for" className="py-20 sm:py-32 bg-[#fbfbf9] border-b border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-wider text-zinc-500 uppercase mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-900" />
            <span>Intended Organizers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 leading-tight">
            Built for people who organize real gatherings.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-600 leading-relaxed max-w-2xl">
            Whether running a 50-person technical seminar or an 800-person campus festival, TicketKoi provides the exact operational structure you need.
          </p>
        </div>

        {/* Editorial Clean Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {audiences.map((item, idx) => (
            <div
              key={idx}
              className="p-7 sm:p-8 rounded-xl border border-zinc-200 bg-white space-y-3.5 shadow-2xs hover:border-zinc-300 transition-colors"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <h3 className="text-lg font-bold text-zinc-900 tracking-tight">
                  {item.title}
                </h3>
                <span className="text-xs font-mono text-zinc-400">0{idx + 1}</span>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80 inline-block">
                  {item.useCase}
                </span>
                <p className="text-sm text-zinc-600 leading-relaxed pt-1">
                  {item.benefit}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
