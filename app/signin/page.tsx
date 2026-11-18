"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, Eye, EyeOff } from "lucide-react";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/jobs";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) router.replace("/jobs");
      })
      .catch(() => {});
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/dev-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid credentials");
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100dvh-3.5rem)] flex items-start justify-center px-4 pt-8 pb-12 sm:items-center sm:pt-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/15 mb-5">
            <LogIn className="w-7 h-7 text-primary" strokeWidth={2} />
          </div>
          <h1 className="ios-title-1 text-white">Welcome Back</h1>
          <p className="mt-2 ios-subheadline text-slate-400">
            Sign in to your Listify account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-2xl bg-red-500/12 border border-red-500/15 px-4 py-3">
              <p className="ios-subheadline text-red-400">{error}</p>
            </div>
          )}

          {/* Grouped form card */}
          <div className="ios-card">
            <div className="ios-row gap-3">
              <label className="ios-body text-slate-400 w-20 shrink-0">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoComplete="email"
                inputMode="email"
                className="flex-1 bg-transparent border-0 outline-none ios-body text-white placeholder-slate-500"
              />
            </div>
            <div className="ios-row gap-3">
              <label className="ios-body text-slate-400 w-20 shrink-0">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="flex-1 bg-transparent border-0 outline-none ios-body text-white placeholder-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-500 active:text-slate-300 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-[18px] h-[18px]" strokeWidth={2} />
                ) : (
                  <Eye className="w-[18px] h-[18px]" strokeWidth={2} />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-primary px-6 h-12 text-[17px] font-semibold text-white ios-press active:bg-primary-dark disabled:opacity-50 disabled:active:transform-none transition-colors"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {/* Sign up link */}
        <p className="mt-7 text-center ios-subheadline text-slate-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-primary ios-press"
          >
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}

// useSearchParams() makes the form client-rendered, and Next.js requires a
// Suspense boundary around it for the production build to succeed.
export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}
