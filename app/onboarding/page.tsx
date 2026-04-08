"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Check,
  ChevronLeft,
  User,
  Settings,
} from "lucide-react";
import { clsx } from "clsx";

const SPECIALTIES_BY_INDUSTRY: Record<string, string[]> = {
  hair: ["Barber", "Cosmetologist"],
  tattoo: ["Tattoo Artist", "Piercer"],
};

const ALL_SPECIALTIES = ["Barber", "Cosmetologist", "Tattoo Artist", "Piercer"];

const STEPS = [
  { label: "Welcome", icon: User },
  { label: "Details", icon: Settings },
  { label: "Done", icon: Check },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<"talent" | "employer">("talent");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [userName, setUserName] = useState("");

  // Fetch user to get role (already set at signup) and name
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setRole(data.user.role === "employer" ? "employer" : "talent");
          setUserName(data.user.name || "");
        }
      })
      .catch(() => {});
  }, []);

  const toggleSpecialty = (s: string) => {
    setSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleFinish = async () => {
    try {
      await fetch("/api/profile/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, specialties }),
      });
    } catch {
      // Continue anyway
    }

    if (role === "employer") {
      router.push("/post");
    } else {
      router.push("/jobs");
    }
    router.refresh();
  };

  const isScout = role === "employer";

  return (
    <main className="min-h-[calc(100dvh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          {step > 0 && step < 2 && (
            <button
              onClick={() => setStep(step - 1)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-primary">
                <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.6" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.6" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.3" />
              </svg>
            </div>
            <span className="text-base font-bold text-white">Listify</span>
          </div>
        </div>
        {step < 2 && (
          <button
            onClick={handleFinish}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Skip
          </button>
        )}
      </div>

      {/* Progress Stepper */}
      <div className="flex items-center justify-center gap-3 px-8 py-6">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === step;
          const isDone = i < step;

          return (
            <div key={s.label} className="flex items-center gap-3">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={clsx(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                    isActive
                      ? "bg-primary text-white"
                      : isDone
                      ? "bg-primary/20 text-primary"
                      : "bg-slate-800 text-slate-500"
                  )}
                >
                  {isDone ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={clsx(
                    "text-[11px] font-medium",
                    isActive ? "text-primary" : "text-slate-500"
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={clsx(
                    "w-16 h-0.5 rounded-full mb-5",
                    isDone ? "bg-primary" : "bg-slate-800"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="flex-1 flex flex-col items-center px-4 pb-8">
        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="flex flex-col items-center text-center max-w-md animate-fade-in-up">
            <div className="w-48 h-36 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center mb-8">
              <Sparkles className="w-12 h-12 text-primary" />
            </div>

            <h1 className="text-3xl font-black text-white">
              Welcome{userName ? `, ${userName}` : " to Listify"}!
            </h1>
            <p className="mt-4 text-base text-slate-400 leading-relaxed">
              {isScout
                ? "Let\u2019s set up your shop profile so talent can find your listings."
                : "Let\u2019s get your profile set up so you can start connecting with shops in San Diego."}
            </p>

            <button
              onClick={() => setStep(1)}
              className="mt-10 w-full max-w-sm rounded-xl bg-primary px-8 py-4 text-base font-bold text-white shadow-xl shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Let&apos;s Go
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 1: Specialties (no role picker — role locked at signup) */}
        {step === 1 && (
          <div className="w-full max-w-md animate-fade-in-up">
            <div className="flex gap-2 mb-8">
              <div className="flex-1 h-1 rounded-full bg-primary" />
              <div className="flex-1 h-1 rounded-full bg-primary" />
              <div className="flex-1 h-1 rounded-full bg-slate-700" />
            </div>

            <h2 className="text-2xl font-black text-white">
              {isScout
                ? "What services does your shop offer?"
                : "What are your specialties?"}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {isScout
                ? "Select the services you hire for. This helps talent find your listings."
                : "Select your skills so we can show you the right opportunities."}
            </p>

            <div className="mt-8">
              <div className="grid grid-cols-2 gap-3">
                {ALL_SPECIALTIES.map((s) => {
                  const selected = specialties.includes(s);
                  return (
                    <button
                      key={s}
                      onClick={() => toggleSpecialty(s)}
                      className={clsx(
                        "flex items-center gap-3 px-4 py-3 rounded-lg border transition-all text-left",
                        selected
                          ? "border-primary bg-primary/10 text-white"
                          : "border-slate-700 text-slate-300 hover:border-slate-600"
                      )}
                    >
                      <div
                        className={clsx(
                          "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0",
                          selected
                            ? "bg-primary border-primary"
                            : "border-slate-600"
                        )}
                      >
                        {selected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-sm font-medium">{s}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="mt-8 w-full rounded-xl bg-primary px-8 py-4 text-base font-bold text-white shadow-xl shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98]"
            >
              Continue
            </button>

            <button
              onClick={() => setStep(0)}
              className="mt-3 w-full text-center text-sm text-slate-400 hover:text-white transition-colors py-2"
            >
              Back
            </button>
          </div>
        )}

        {/* Step 2: Success */}
        {step === 2 && (
          <div className="flex flex-col items-center text-center max-w-md animate-fade-in-up">
            <div className="flex gap-2 mb-8 w-full max-w-xs">
              <div className="flex-1 h-1 rounded-full bg-primary" />
              <div className="flex-1 h-1 rounded-full bg-primary" />
              <div className="flex-1 h-1 rounded-full bg-primary" />
            </div>

            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-8 h-8 text-white" />
                </div>
              </div>
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-primary" />
            </div>

            <h1 className="text-3xl font-black text-white">
              You&apos;re all set{userName ? `, ${userName}` : ""}!
            </h1>
            <p className="mt-4 text-base text-slate-400 leading-relaxed">
              {isScout
                ? "Your shop is ready. Post your first listing to start connecting with talent."
                : "Your profile is set up. Start browsing listings in San Diego County."}
            </p>

            <div className="mt-10 w-full space-y-3 max-w-sm">
              <button
                onClick={handleFinish}
                className="w-full rounded-xl bg-primary px-8 py-4 text-base font-bold text-white shadow-xl shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98]"
              >
                {isScout ? "Post a Listing" : "Start Exploring"}
              </button>
              <button
                onClick={() => router.push("/profile")}
                className="w-full rounded-xl border-2 border-slate-700 px-8 py-4 text-base font-bold text-slate-300 transition-all hover:bg-slate-800 active:scale-[0.98]"
              >
                View My Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
