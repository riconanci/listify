export default function ManageLoading() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] page-with-nav">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="h-7 w-48 rounded-lg shimmer" />
          <div className="h-10 w-36 rounded-lg shimmer" />
        </div>

        {/* Cards */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-800 p-4 flex items-start gap-4"
            >
              <div
                className="w-16 h-16 rounded-lg shimmer shrink-0"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
              <div className="flex-1 space-y-2">
                <div
                  className="h-5 w-48 rounded shimmer"
                  style={{ animationDelay: `${i * 0.1 + 0.05}s` }}
                />
                <div
                  className="h-3 w-32 rounded shimmer"
                  style={{ animationDelay: `${i * 0.1 + 0.1}s` }}
                />
                <div className="flex gap-4 mt-3">
                  <div
                    className="h-3 w-16 rounded shimmer"
                    style={{ animationDelay: `${i * 0.1 + 0.15}s` }}
                  />
                  <div
                    className="h-3 w-16 rounded shimmer"
                    style={{ animationDelay: `${i * 0.1 + 0.2}s` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
