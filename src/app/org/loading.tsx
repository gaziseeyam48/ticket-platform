export default function OrgLoading() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-28 bg-zinc-200 rounded-lg" />
            <div className="h-5 w-24 bg-zinc-100 rounded-full" />
          </div>
          <div className="h-4 w-72 bg-zinc-100 rounded" />
        </div>
        <div className="flex gap-3">
          <div className="h-9 w-32 bg-zinc-100 rounded-lg" />
          <div className="h-9 w-28 bg-zinc-200 rounded-lg" />
        </div>
      </div>

      {/* Metric cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-zinc-100 rounded" />
              <div className="h-8 w-8 bg-zinc-100 rounded-lg" />
            </div>
            <div className="h-8 w-16 bg-zinc-200 rounded" />
            <div className="h-3 w-32 bg-zinc-100 rounded" />
          </div>
        ))}
      </div>

      {/* Events table skeleton */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-5 w-16 bg-zinc-200 rounded" />
          <div className="h-5 w-8 bg-zinc-100 rounded-full" />
        </div>
        <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-zinc-100 bg-zinc-50/75">
            <div className="flex gap-4">
              {[140, 80, 80, 160, 100].map((w, i) => (
                <div key={i} className={`h-4 bg-zinc-200 rounded`} style={{ width: w }} />
              ))}
            </div>
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border-b border-zinc-100 flex gap-4 items-center">
              <div className="space-y-1.5" style={{ minWidth: 140 }}>
                <div className="h-4 w-36 bg-zinc-200 rounded" />
                <div className="h-3 w-24 bg-zinc-100 rounded" />
              </div>
              <div className="h-5 w-16 bg-zinc-100 rounded-full" />
              <div className="h-5 w-20 bg-zinc-100 rounded-md" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-32 bg-zinc-100 rounded" />
                <div className="h-3 w-24 bg-zinc-100 rounded" />
              </div>
              <div className="flex gap-1.5 ml-auto">
                <div className="h-8 w-16 bg-zinc-100 rounded-lg" />
                <div className="h-8 w-20 bg-zinc-100 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
