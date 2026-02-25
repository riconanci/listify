export default function JobsLoading() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] page-with-nav">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Filter bar skeleton */}
        <div className="hidden md:block h-14 rounded-xl shimmer" />

        {/* Mobile header skeleton */}
        <div className="md:hidden flex items-center justify-between">
          <div className="h-7 w-40 rounded-lg shimmer" />
          <div className="h-9 w-20 rounded-lg shimmer" />
        </div>

        {/* Card skeletons */}
        <div className="rounded-xl border border-slate-800 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-4 md:px-6 py-5 border-b border-slate-800/50"
            >
              <div
                className="w-12 h-12 rounded-lg shimmer shrink-0"
                style={{ animationDelay: `${i * 0.08}s` }}
              />
              <div className="flex-1 space-y-2">
                <div
                  className="h-4 w-48 rounded shimmer"
                  style={{ animationDelay: `${i * 0.08 + 0.05}s` }}
                />
                <div
                  className="h-3 w-32 rounded shimmer"
                  style={{ animationDelay: `${i * 0.08 + 0.1}s` }}
                />
              </div>
              <div
                className="hidden md:block h-4 w-20 rounded shimmer"
                style={{ animationDelay: `${i * 0.08 + 0.15}s` }}
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
