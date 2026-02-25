export default function JobDetailLoading() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] page-with-nav">
      <div className="max-w-3xl mx-auto">
        {/* Hero image skeleton */}
        <div className="h-56 md:h-72 shimmer" />

        <div className="px-4 py-6 space-y-6">
          {/* Title */}
          <div className="space-y-3">
            <div className="h-7 w-64 rounded-lg shimmer" />
            <div className="h-4 w-40 rounded shimmer" style={{ animationDelay: "0.05s" }} />
            <div className="flex gap-2 mt-3">
              <div className="h-6 w-20 rounded-full shimmer" style={{ animationDelay: "0.1s" }} />
              <div className="h-6 w-24 rounded-full shimmer" style={{ animationDelay: "0.15s" }} />
              <div className="h-6 w-16 rounded-full shimmer" style={{ animationDelay: "0.2s" }} />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 w-full rounded shimmer" style={{ animationDelay: "0.25s" }} />
            <div className="h-4 w-full rounded shimmer" style={{ animationDelay: "0.3s" }} />
            <div className="h-4 w-3/4 rounded shimmer" style={{ animationDelay: "0.35s" }} />
          </div>

          {/* Cards */}
          <div className="h-28 rounded-xl shimmer" style={{ animationDelay: "0.4s" }} />
          <div className="h-48 rounded-xl shimmer" style={{ animationDelay: "0.45s" }} />
        </div>
      </div>
    </main>
  );
}
