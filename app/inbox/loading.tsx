export default function InboxLoading() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] page-with-nav">
      <div className="border-b border-slate-800 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg shimmer" />
          <div className="h-6 w-32 rounded-lg shimmer" />
        </div>
      </div>
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-4 rounded-xl border border-slate-800 p-4"
          >
            <div
              className="w-11 h-11 rounded-full shimmer shrink-0"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
            <div className="flex-1 space-y-2">
              <div
                className="h-4 w-36 rounded shimmer"
                style={{ animationDelay: `${i * 0.1 + 0.05}s` }}
              />
              <div
                className="h-3 w-48 rounded shimmer"
                style={{ animationDelay: `${i * 0.1 + 0.1}s` }}
              />
              <div
                className="h-3 w-64 rounded shimmer"
                style={{ animationDelay: `${i * 0.1 + 0.15}s` }}
              />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
