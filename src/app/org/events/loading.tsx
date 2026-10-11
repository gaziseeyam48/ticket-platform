export default function EventsLoading() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80">
        <div className="space-y-2">
          <div className="h-8 w-44 bg-zinc-200 rounded-lg" />
          <div className="h-4 w-72 bg-zinc-100 rounded" />
        </div>
        <div className="h-9 w-28 bg-zinc-200 rounded-lg" />
      </div>

      {/* Event cards grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="border border-zinc-200/80 rounded-2xl bg-white p-5 flex flex-col justify-between shadow-2xs space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-5 w-16 bg-zinc-100 rounded-full" />
                <div className="h-5 w-20 bg-zinc-100 rounded-md" />
              </div>
              <div className="space-y-1">
                <div className="h-5 w-40 bg-zinc-200 rounded" />
                <div className="h-3 w-24 bg-zinc-100 rounded" />
              </div>
              <div className="space-y-1">
                <div className="h-3 w-full bg-zinc-100 rounded" />
                <div className="h-3 w-3/4 bg-zinc-100 rounded" />
              </div>
              <div className="space-y-1.5 pt-2 border-t border-zinc-100">
                <div className="h-3 w-36 bg-zinc-100 rounded" />
                <div className="h-3 w-28 bg-zinc-100 rounded" />
              </div>
            </div>
            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
              <div className="flex gap-1.5">
                <div className="h-8 w-14 bg-zinc-100 rounded-lg" />
                <div className="h-8 w-14 bg-zinc-100 rounded-lg" />
              </div>
              <div className="h-8 w-20 bg-zinc-100 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
