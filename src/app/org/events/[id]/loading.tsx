export default function EventDetailLoading() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      {/* Event header skeleton */}
      <div className="space-y-3 pb-5 border-b border-zinc-200/80">
        <div className="flex items-center gap-2">
          <div className="h-4 w-12 bg-zinc-100 rounded" />
          <div className="h-4 w-4 bg-zinc-100 rounded" />
          <div className="h-4 w-32 bg-zinc-100 rounded" />
        </div>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-zinc-200 rounded-lg" />
            <div className="flex gap-2">
              <div className="h-5 w-16 bg-zinc-100 rounded-full" />
              <div className="h-5 w-20 bg-zinc-100 rounded-md" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-24 bg-zinc-100 rounded-lg" />
            <div className="h-9 w-24 bg-zinc-200 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Metrics skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-2xs space-y-2">
            <div className="h-3 w-20 bg-zinc-100 rounded" />
            <div className="h-7 w-12 bg-zinc-200 rounded" />
          </div>
        ))}
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-1 border-b border-zinc-200">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-9 w-24 bg-zinc-100 rounded-t-lg" />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-2xs overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="px-4 py-3.5 border-b border-zinc-100 flex items-center gap-4">
            <div className="h-4 w-32 bg-zinc-200 rounded" />
            <div className="h-4 w-24 bg-zinc-100 rounded" />
            <div className="h-4 w-20 bg-zinc-100 rounded ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
