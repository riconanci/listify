"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  UserPlus, Users, Building2, Eye, EyeOff, Check, ArrowRight, ChevronLeft,
} from "lucide-react";
import {
  StraightRazorIcon,
  ShearsIcon,
  TattooMachineIcon,
  PiercingNeedleIcon,
} from "@/components/icons/TradeIcons";
import { clsx } from "clsx";

const INDUSTRY_OPTIONS = [
  { value: "hair", label: "Hair", desc: "Barbershops & Salons", icon: ShearsIcon },
  { value: "tattoo", label: "Tattoo & Piercing", desc: "Tattoo Shops & Studios", icon: TattooMachineIcon },
];

const LICENSE_OPTIONS: Record<string, { value: string; label: string; icon: any }[]> = {
  hair: [
    { value: "barber", label: "Barber License", icon: StraightRazorIcon },
    { value: "cosmetologist", label: "Cosmetologist License", icon: ShearsIcon },
  ],
  tattoo: [
    { value: "tattoo_artist", label: "Tattoo Artist", icon: TattooMachineIcon },
    { value: "piercer", label: "Piercer", icon: PiercingNeedleIcon },
  ],
};

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "employer" ? "employer" : "talent";

  // Step 0: role, Step 1: industry/details, Step 2: credentials
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

  // Redirect if already logged in
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) router.replace("/jobs");
      })
      .catch(() => {});
  }, [router]);

  // Reset sub-selections when industry changes
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

      router.push("/onboarding");
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
    <main className="min-h-[calc(100dvh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-800 bg-bg-surface p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-800">
              <UserPlus className="w-7 h-7 text-primary" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-white">Join Listify</h1>
            <p className="mt-2 text-sm text-slate-400">
              {step === 0 && "How do you want to use Listify?"}
              {step === 1 && "Tell us about your field"}
              {step === 2 && "Create your account"}
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {[0, 1, 2].map((s) => (
              <div
                key={s}
                className={clsx(
                  "w-2 h-2 rounded-full transition-colors",
                  s === step ? "bg-primary" : s < step ? "bg-primary/40" : "bg-slate-700"
                )}
              />
            ))}
          </div>

          {/* ─── Step 0: Role Selection ─── */}
          {step === 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("talent")}
                  className={clsx(
                    "relative flex items-center gap-3 rounded-xl border-2 p-4 transition-all",
                    role === "talent"
                      ? "border-primary bg-primary/5"
                      : "border-slate-700 bg-transparent hover:border-slate-600"
                  )}
                >
                  <div className={clsx(
                    "flex items-center justify-center w-10 h-10 rounded-lg",
                    role === "talent" ? "bg-primary text-white" : "bg-slate-700 text-slate-400"
                  )}>
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">Talent</p>
                    <p className="text-[11px] text-slate-400 leading-tight">Looking for work</p>
                  </div>
                  {role === "talent" && (
                    <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full bg-primary">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setRole("employer")}
                  className={clsx(
                    "relative flex items-center gap-3 rounded-xl border-2 p-4 transition-all",
                    role === "employer"
                      ? "border-primary bg-primary/5"
                      : "border-slate-700 bg-transparent hover:border-slate-600"
                  )}
                >
                  <div className={clsx(
                    "flex items-center justify-center w-10 h-10 rounded-lg",
                    role === "employer" ? "bg-primary text-white" : "bg-slate-700 text-slate-400"
                  )}>
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">Scout</p>
                    <p className="text-[11px] text-slate-400 leading-tight">Hiring for my shop</p>
                  </div>
                  {role === "employer" && (
                    <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full bg-primary">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              </div>

              <button
                onClick={() => setStep(1)}
                className="flex items-center justify-center gap-2 w-full rounded-lg bg-primary px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98]"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ─── Step 1: Industry & Specialty ─── */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Back button */}
              <button
                onClick={() => setStep(0)}
                className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors -mt-2 mb-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              {/* Industry selection */}
              <div>
                <p className="text-sm font-semibold text-slate-300 mb-3">
                  What field are you in?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {INDUSTRY_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const selected = industry === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setIndustry(opt.value)}
                        className={clsx(
                          "relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                          selected
                            ? "border-primary bg-primary/5"
                            : "border-slate-700 bg-transparent hover:border-slate-600"
                        )}
                      >
                        <Icon size={24} className={clsx(selected ? "text-primary" : "text-slate-400")} />
                        <div className="text-center">
                          <p className="text-sm font-bold text-white">{opt.label}</p>
                          <p className="text-[10px] text-slate-500 leading-tight">{opt.desc}</p>
                        </div>
                        {selected && (
                          <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full bg-primary">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Specialty/shop type selection (shown after industry picked) */}
              {industry && role === "talent" && (
                <div>
                  <p className="text-sm font-semibold text-slate-300 mb-3">
                    What do you do?
                    <span className="text-xs text-slate-500 font-normal ml-1">(select all that apply)</span>
                  </p>
                  <div className="space-y-2">
                    {LICENSE_OPTIONS[industry]?.map((opt) => {
                      const Icon = opt.icon;
                      const selected = licenses.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => toggleLicense(opt.value)}
                          className={clsx(
                            "flex items-center gap-3 w-full rounded-lg border-2 p-3.5 transition-all",
                            selected
                              ? "border-primary bg-primary/5"
                              : "border-slate-700 hover:border-slate-600"
                          )}
                        >
                          <div className={clsx(
                            "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0",
                            selected ? "bg-primary border-primary" : "border-slate-600"
                          )}>
                            {selected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <Icon size={16} className={clsx(selected ? "text-primary" : "text-slate-400")} />
                          <span className="text-sm font-medium text-white">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {industry && role === "employer" && (
                <div>
                  <p className="text-sm text-slate-400">
                    You&apos;ll be able to specify exactly who you&apos;re looking for when you post a listing.
                  </p>
                </div>
              )}

              <button
                onClick={() => canProceedStep1 && setStep(2)}
                disabled={!canProceedStep1}
                className="flex items-center justify-center gap-2 w-full rounded-lg bg-primary px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ─── Step 2: Credentials ─── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors -mt-2 mb-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              {error && (
                <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-bg-input px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-bg-input px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Phone <span className="text-slate-500 font-normal">(optional)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="(555) 123-4567"
                  className="w-full rounded-lg border border-slate-700 bg-bg-input px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full rounded-lg border border-slate-700 bg-bg-input px-4 py-3 pr-12 text-sm text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-primary px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          )}

          {/* Sign in link */}
          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link href="/signin" className="font-semibold text-primary hover:text-primary-light transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
