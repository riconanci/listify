"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function JobsError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="min-h-[calc(100dvh-4rem)] page-with-nav flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-5">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      <h1 className="text-xl font-bold text-white">
        Failed to load listings
      </h1>
      <p className="mt-2 text-sm text-slate-400 max-w-xs">
        We couldn&apos;t connect to the server. Check your connection and try again.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
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
