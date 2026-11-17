"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Check,
  ChevronLeft,
} from "lucide-react";
import { clsx } from "clsx";

const ALL_SPECIALTIES = ["Barber", "Cosmetologist", "Tattoo Artist", "Piercer"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<"talent" | "employer">("talent");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [userName, setUserName] = useState("");

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
    } catch {}

    if (role === "employer") {
      router.push("/post");
    } else {
      router.push("/jobs");
    }
    router.refresh();
  };

  const isScout = role === "employer";

  return (
    <main className="min-h-[calc(100dvh-3.5rem)] flex flex-col">
      {/* Top bar — back + skip */}
      <div className="flex items-center justify-between px-2 h-12 ios-hairline-bottom">
        {step > 0 && step < 2 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-0.5 text-primary ios-press px-2 py-1"
          >
            <ChevronLeft className="w-[22px] h-[22px]" strokeWidth={2.5} />
            <span className="text-[17px] font-normal">Back</span>
          </button>
        ) : (
          <div />
        )}
        {step < 2 && (
          <button
            onClick={handleFinish}
            className="text-[17px] text-primary ios-press px-3 py-1"
          >
            Skip
          </button>
        )}
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mt-6 mb-2">
        {[0, 1, 2].map((s) => (
          <div
            key={s}
            className={clsx(
              "h-1.5 rounded-full transition-all",
              s === step ? "bg-primary w-6" : s < step ? "bg-primary/40 w-1.5" : "bg-slate-700 w-1.5"
            )}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="flex flex-col items-center text-center max-w-md animate-fade-in-up w-full">
            <div className="w-24 h-24 rounded-3xl bg-primary/15 flex items-center justify-center mb-7">
              <Sparkles className="w-12 h-12 text-primary" strokeWidth={1.8} />
            </div>

            <h1 className="ios-title-1 text-white">
              Welcome{userName ? `, ${userName}` : " to Listify"}!
            </h1>
            <p className="mt-3 ios-body text-slate-400 max-w-sm">
              {isScout
                ? "Let's set up your shop profile so talent can find your listings."
                : "Let's get your profile set up so you can start connecting with shops in San Diego."}
            </p>

            <button
              onClick={() => setStep(1)}
              className="mt-9 w-full max-w-sm rounded-full bg-primary px-6 h-12 text-[17px] font-semibold text-white ios-press active:bg-primary-dark transition-colors flex items-center justify-center gap-2"
            >
              Let&apos;s Go
              <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.5} />
            </button>
          </div>
        )}

        {/* Step 1: Specialties */}
        {step === 1 && (
          <div className="w-full max-w-md animate-fade-in-up">
            <h2 className="ios-title-1 text-white">
              {isScout
                ? "What services does your shop offer?"
                : "What are your specialties?"}
            </h2>
            <p className="mt-2 ios-subheadline text-slate-400">
              {isScout
                ? "Select the services you hire for. This helps talent find your listings."
                : "Select your skills so we can show you the right opportunities."}
            </p>

            <div className="ios-card mt-7">
              {ALL_SPECIALTIES.map((s) => {
                const selected = specialties.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleSpecialty(s)}
                    className="ios-row gap-3 w-full active:bg-slate-800/60 transition-colors"
                  >
                    <div
                      className={clsx(
                        "w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors",
                        selected ? "bg-primary" : "bg-slate-700/60"
                      )}
                    >
                      {selected && (
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      )}
                    </div>
                    <span className="ios-body text-white">{s}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep(2)}
              className="mt-7 w-full rounded-full bg-primary px-6 h-12 text-[17px] font-semibold text-white ios-press active:bg-primary-dark transition-colors flex items-center justify-center gap-2"
            >
              Continue
              <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.5} />
            </button>
          </div>
        )}

        {/* Step 2: Success */}
        {step === 2 && (
          <div className="flex flex-col items-center text-center max-w-md animate-fade-in-up w-full">
            <div className="relative mb-7">
              <div className="w-24 h-24 rounded-full bg-primary/15 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-9 h-9 text-white" strokeWidth={3} />
                </div>
              </div>
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-primary" strokeWidth={1.8} />
            </div>

            <h1 className="ios-title-1 text-white">
              You&apos;re all set{userName ? `, ${userName}` : ""}!
            </h1>
            <p className="mt-3 ios-body text-slate-400 max-w-sm">
              {isScout
                ? "Your shop is ready. Post your first listing to start connecting with talent."
                : "Your profile is set up. Start browsing listings in San Diego County."}
            </p>

            <div className="mt-9 w-full space-y-3 max-w-sm">
              <button
                onClick={handleFinish}
                className="w-full rounded-full bg-primary px-6 h-12 text-[17px] font-semibold text-white ios-press active:bg-primary-dark transition-colors"
              >
                {isScout ? "Post a Listing" : "Start Exploring"}
              </button>
              <button
                onClick={() => router.push("/profile")}
                className="w-full rounded-full bg-slate-700/60 px-6 h-12 text-[17px] font-semibold text-white ios-press active:bg-slate-700 transition-colors"
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
