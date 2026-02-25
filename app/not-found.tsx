import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-6">
        <span className="text-3xl font-black text-slate-600">404</span>
      </div>
      <h1 className="text-2xl font-black text-white">Page Not Found</h1>
      <p className="mt-3 text-sm text-slate-400 max-w-xs">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex items-center gap-3">
        <Link
          href="/jobs"
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-colors"
        >
          Browse Listings
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-slate-700 px-6 py-2.5 text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </main>
  );
}
