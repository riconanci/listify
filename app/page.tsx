import Link from "next/link";
import { redirect } from "next/navigation";
import { MapPin, ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { TRADE_IMAGES } from "@/components/icons/TradeIcons";

const TRADES = [
  { label: "Barbers", image: TRADE_IMAGES.barber },
  { label: "Cosmetologists", image: TRADE_IMAGES.cosmetologist },
  { label: "Tattoo Artists", image: TRADE_IMAGES.tattoo_artist },
  { label: "Piercers", image: TRADE_IMAGES.piercer },
];

export default async function LandingPage() {
  // Signed-in users skip the landing entirely
  const user = await getCurrentUser();
  if (user) redirect("/jobs");

  return (
    <main className="relative flex flex-col min-h-[calc(100dvh-3.5rem)] sm:min-h-[calc(100dvh-4rem)] overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-bg-base to-bg-base" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />

      {/* Hero — vertically centered */}
      <div className="flex-1 flex flex-col justify-center px-5 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-2xl text-center">
          {/* Headline */}
          <h1 className="ios-large-title text-white sm:text-5xl sm:leading-[1.05] lg:text-6xl">
            From Listing to{" "}
            <span className="text-gradient-hero">Opportunity</span>
          </h1>

          <p className="mt-3 ios-body text-slate-400 sm:text-lg sm:mt-5 max-w-md mx-auto">
            The local marketplace built for the industry.
          </p>

          {/* Trade icons */}
          <div className="mt-7 grid grid-cols-4 gap-3 max-w-sm mx-auto sm:max-w-md sm:mt-9 sm:gap-4">
            {TRADES.map(({ label, image }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="flex h-[68px] w-[68px] items-center justify-center rounded-2xl bg-bg-surface ios-press hover:bg-primary/10 transition-colors sm:h-20 sm:w-20">
                  <img
                    src={image}
                    alt={label}
                    className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
                  />
                </div>
                <span className="text-[11px] font-semibold text-slate-400 sm:text-xs">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center sm:mt-9">
            <Link
              href="/signup?role=talent"
              className="flex items-center justify-center gap-2 w-full rounded-full bg-primary px-6 h-12 text-[17px] font-semibold text-white ios-press active:bg-primary-dark sm:w-auto sm:px-8"
            >
              Find Work
              <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.5} />
            </Link>
            <Link
              href="/signup?role=employer"
              className="flex items-center justify-center gap-2 w-full rounded-full bg-slate-700/60 px-6 h-12 text-[17px] font-semibold text-white ios-press active:bg-slate-700 sm:w-auto sm:px-8"
            >
              Find Talent
              <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.5} />
            </Link>
          </div>

          {/* Location badge */}
          <div className="mt-5 inline-flex items-center gap-1.5 ios-footnote text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-primary/70" strokeWidth={2.2} />
            <span>Currently serving San Diego County</span>
          </div>

          {/* Sign in link — small, low priority */}
          <p className="mt-7 ios-subheadline text-slate-500">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="font-semibold text-primary ios-press"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Tiny footer credit — sits at bottom of viewport */}
      <p className="text-center ios-caption text-slate-600 pb-5">
        &copy; {new Date().getFullYear()} Listify
      </p>
    </main>
  );
}
