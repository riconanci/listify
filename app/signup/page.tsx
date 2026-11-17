"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  UserPlus, Users, Building2, Eye, EyeOff, Check, ArrowRight, ChevronLeft,
} from "lucide-react";
import { TRADE_IMAGES, TradeIcon } from "@/components/icons/TradeIcons";
import { clsx } from "clsx";

const INDUSTRY_OPTIONS = [
  { value: "hair", label: "Hair", desc: "Barbershops & Salons", image: TRADE_IMAGES.cosmetologist },
  { value: "tattoo", label: "Tattoo & Piercing", desc: "Tattoo Shops & Studios", image: TRADE_IMAGES.tattoo_artist },
];

const LICENSE_OPTIONS: Record<string, { value: string; label: string; image: string }[]> = {
  hair: [
    { value: "barber", label: "Barber License", image: TRADE_IMAGES.barber },
    { value: "cosmetologist", label: "Cosmetologist License", image: TRADE_IMAGES.cosmetologist },
  ],
  tattoo: [
    { value: "tattoo_artist", label: "Tattoo Artist", image: TRADE_IMAGES.tattoo_artist },
    { value: "piercer", label: "Piercer", image: TRADE_IMAGES.piercer },
  ],
};

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "employer" ? "employer" : "talent";

  const [step, setStep] = useState(0);
  const [role, setRole] = useState<"talent" | "employer">(defaultRole);
  const [industry, setIndustry] = useState("");
  const [licenses, setLicenses] = useState<string[]>([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
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

  useEffect(() => {
    setLicenses([]);
  }, [industry]);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const toggleLicense = (val: string) => {
    setLicenses((prev) =>
      prev.includes(val) ? prev.filter((l) => l !== val) : [...prev, val]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/dev-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone.replace(/\D/g, ""),
          password,
          role,
          industry: industry || undefined,
          licenses: role === "talent" ? licenses : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      router.push(role === "employer" ? "/post" : "/jobs");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const canProceedStep1 = !!industry && (
    role === "talent" ? licenses.length > 0 : true
  );

  return (
    <main className="min-h-[calc(100dvh-3.5rem)] flex items-start justify-center px-4 pt-8 pb-12 sm:items-center sm:pt-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/15 mb-5">
            <UserPlus className="w-7 h-7 text-primary" strokeWidth={2} />
          </div>
          <h1 className="ios-title-1 text-fg-strong">Join Listify</h1>
          <p className="mt-2 ios-subheadline text-fg-secondary">
            {step === 0 && "How do you want to use Listify?"}
            {step === 1 && "Tell us about your field"}
            {step === 2 && "Create your account"}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-7">
          {[0, 1, 2].map((s) => (
            <div
              key={s}
              className={clsx(
                "h-1.5 rounded-full transition-all",
                s === step ? "bg-primary w-6" : s < step ? "bg-primary/40 w-1.5" : "bg-elevated w-1.5"
              )}
            />
          ))}
        </div>

        {/* ─── Step 0: Role Selection ─── */}
        {step === 0 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("talent")}
                className={clsx(
                  "relative flex flex-col items-center gap-3 rounded-2xl p-5 ios-press transition-all",
                  role === "talent"
                    ? "bg-primary/15 ring-2 ring-primary"
                    : "bg-surface"
                )}
              >
                <div className={clsx(
                  "flex items-center justify-center w-12 h-12 rounded-2xl",
                  role === "talent" ? "bg-primary text-white" : "bg-elevated/60 text-fg"
                )}>
                  <Users className="w-6 h-6" strokeWidth={2} />
                </div>
                <div className="text-center">
                  <p className="ios-headline text-fg-strong">Talent</p>
                  <p className="ios-caption text-fg-secondary mt-0.5">Looking for work</p>
                </div>
                {role === "talent" && (
                  <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full bg-primary">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setRole("employer")}
                className={clsx(
                  "relative flex flex-col items-center gap-3 rounded-2xl p-5 ios-press transition-all",
                  role === "employer"
                    ? "bg-primary/15 ring-2 ring-primary"
                    : "bg-surface"
                )}
              >
                <div className={clsx(
                  "flex items-center justify-center w-12 h-12 rounded-2xl",
                  role === "employer" ? "bg-primary text-white" : "bg-elevated/60 text-fg"
                )}>
                  <Building2 className="w-6 h-6" strokeWidth={2} />
                </div>
                <div className="text-center">
                  <p className="ios-headline text-fg-strong">Scout</p>
                  <p className="ios-caption text-fg-secondary mt-0.5">Hiring for my shop</p>
                </div>
                {role === "employer" && (
                  <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full bg-primary">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                )}
              </button>
            </div>

            <button
              onClick={() => setStep(1)}
              className="flex items-center justify-center gap-2 w-full rounded-full bg-primary px-6 h-12 text-[17px] font-semibold text-white ios-press active:bg-primary-dark transition-colors"
            >
              Continue
              <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.5} />
            </button>
          </div>
        )}

        {/* ─── Step 1: Industry & Specialty ─── */}
        {step === 1 && (
          <div className="space-y-5">
            {/* Back */}
            <button
              onClick={() => setStep(0)}
              className="flex items-center gap-0.5 text-primary ios-press -ml-2 -mt-2"
            >
              <ChevronLeft className="w-[22px] h-[22px]" strokeWidth={2.5} />
              <span className="text-[17px] font-normal">Back</span>
            </button>

            {/* Industry */}
            <div>
              <h3 className="ios-section-header">What field are you in?</h3>
              <div className="grid grid-cols-2 gap-3">
                {INDUSTRY_OPTIONS.map((opt) => {
                  const selected = industry === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setIndustry(opt.value)}
                      className={clsx(
                        "relative flex flex-col items-center gap-3 rounded-2xl p-5 ios-press transition-all",
                        selected ? "bg-primary/15 ring-2 ring-primary" : "bg-surface"
                      )}
                    >
                      <TradeIcon src={opt.image} className="w-10 h-10" />
                      <div className="text-center">
                        <p className="ios-headline text-fg-strong">{opt.label}</p>
                        <p className="ios-caption text-fg-secondary mt-0.5 leading-tight">{opt.desc}</p>
                      </div>
                      {selected && (
                        <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full bg-primary">
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Licenses (talent only) */}
            {industry && role === "talent" && (
              <div>
                <h3 className="ios-section-header">
                  What do you do? <span className="normal-case font-normal text-fg-muted tracking-normal">(select all)</span>
                </h3>
                <div className="ios-card">
                  {LICENSE_OPTIONS[industry]?.map((opt) => {
                    const selected = licenses.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => toggleLicense(opt.value)}
                        className="ios-row gap-3 w-full active:bg-surface/60 transition-colors"
                      >
                        <div className={clsx(
                          "w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors",
                          selected ? "bg-primary" : "bg-elevated/60"
                        )}>
                          {selected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                        </div>
                        <TradeIcon src={opt.image} className="w-6 h-6" />
                        <span className="ios-body text-fg-strong">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {industry && role === "employer" && (
              <p className="ios-subheadline text-fg-secondary px-1">
                You&apos;ll be able to specify exactly who you&apos;re looking for when you post a listing.
              </p>
            )}

            <button
              onClick={() => canProceedStep1 && setStep(2)}
              disabled={!canProceedStep1}
              className="flex items-center justify-center gap-2 w-full rounded-full bg-primary px-6 h-12 text-[17px] font-semibold text-white ios-press active:bg-primary-dark disabled:opacity-40 disabled:active:transform-none transition-colors"
            >
              Continue
              <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.5} />
            </button>
          </div>
        )}

        {/* ─── Step 2: Credentials ─── */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Back */}
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-0.5 text-primary ios-press -ml-2 -mt-2 -mb-1"
            >
              <ChevronLeft className="w-[22px] h-[22px]" strokeWidth={2.5} />
              <span className="text-[17px] font-normal">Back</span>
            </button>

            {error && (
              <div className="rounded-2xl bg-danger/12 border border-danger/15 px-4 py-3">
                <p className="ios-subheadline text-danger-fg">{error}</p>
              </div>
            )}

            {/* Grouped form */}
            <div className="ios-card">
              <div className="ios-row gap-3">
                <label className="ios-body text-fg-secondary w-20 shrink-0">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                  autoComplete="name"
                  className="flex-1 bg-transparent border-0 outline-none ios-body text-fg-strong placeholder-fg-muted"
                />
              </div>
              <div className="ios-row gap-3">
                <label className="ios-body text-fg-secondary w-20 shrink-0">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  required
                  autoComplete="email"
                  inputMode="email"
                  className="flex-1 bg-transparent border-0 outline-none ios-body text-fg-strong placeholder-fg-muted"
                />
              </div>
              <div className="ios-row gap-3">
                <label className="ios-body text-fg-secondary w-20 shrink-0">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="(555) 123-4567"
                  autoComplete="tel"
                  inputMode="tel"
                  className="flex-1 bg-transparent border-0 outline-none ios-body text-fg-strong placeholder-fg-muted"
                />
              </div>
              <div className="ios-row gap-3">
                <label className="ios-body text-fg-secondary w-20 shrink-0">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="flex-1 bg-transparent border-0 outline-none ios-body text-fg-strong placeholder-fg-muted"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-fg-muted active:text-fg transition-colors"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-primary px-6 h-12 text-[17px] font-semibold text-white ios-press active:bg-primary-dark disabled:opacity-50 disabled:active:transform-none transition-colors mt-2"
            >
              {loading ? "Creating Account…" : "Create Account"}
            </button>
          </form>
        )}

        {/* Sign in link */}
        <p className="mt-7 text-center ios-subheadline text-fg-secondary">
          Already have an account?{" "}
          <Link href="/signin" className="font-semibold text-primary ios-press">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

// useSearchParams() makes the form client-rendered, and Next.js requires a
// Suspense boundary around it for the production build to succeed.
export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpForm />
    </Suspense>
  );
}
