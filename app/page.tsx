import Link from "next/link";
import {
  MapPin,
  Search,
  Send,
  Handshake,
  ArrowRight,
  Zap,
  Clock,
  Shield,
} from "lucide-react";
import {
  StraightRazorIcon,
  ShearsIcon,
  TattooMachineIcon,
  PiercingNeedleIcon,
} from "@/components/icons/TradeIcons";

const TRADES = [
  { label: "Barbers", icon: StraightRazorIcon },
  { label: "Cosmetologists", icon: ShearsIcon },
  { label: "Tattoo Artists", icon: TattooMachineIcon },
  { label: "Piercers", icon: PiercingNeedleIcon },
];

const STEPS = [
  {
    num: "01",
    icon: Search,
    title: "Browse or Post",
    desc: "Scouts post open positions. Talent browses local listings by specialty, location, and pay.",
  },
  {
    num: "02",
    icon: Send,
    title: "Send an Inquiry",
    desc: "Found a match? Send a direct inquiry with your info. No public applications.",
  },
  {
    num: "03",
    icon: Handshake,
    title: "Connect & Work",
    desc: "Handle the details between yourselves. Listify gets you in the door.",
  },
];

export default function LandingPage() {
  return (
    <main className="page-with-nav">
      {/* ========== HERO ========== */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-32 lg:pb-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-bg-base to-bg-base" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />

        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-[2rem] font-black leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
              From Listing to{" "}
              <span className="text-gradient-hero">Opportunity</span>
            </h1>

            <p className="mt-4 text-base leading-relaxed text-slate-400 sm:text-lg sm:mt-6 max-w-md mx-auto">
              The local marketplace built for the industry.
            </p>

            {/* Trade icons — large, prominent */}
            <div className="mt-8 grid grid-cols-4 gap-3 max-w-xs mx-auto sm:max-w-sm sm:mt-10">
              {TRADES.map(({ label, icon: Icon }) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/80 border border-slate-700/50 transition-colors hover:border-primary/30 hover:bg-primary/5 sm:h-16 sm:w-16">
                    <Icon size={26} className="text-primary" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 sm:text-xs">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center sm:mt-10">
              <Link
                href="/signup?role=talent"
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary px-6 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98] sm:w-auto sm:px-8"
              >
                Find Work
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/signup?role=employer"
                className="flex items-center justify-center gap-2 w-full rounded-xl border border-slate-700 bg-slate-800/50 px-6 py-3.5 text-[15px] font-bold text-slate-100 transition-all hover:bg-slate-800 active:scale-[0.98] sm:w-auto sm:px-8"
              >
                Find Talent
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-primary/70" />
              <span>Currently serving San Diego County</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="py-14 sm:py-20 border-t border-slate-800/50">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-xl font-black text-white sm:text-3xl">
              How It Works
            </h2>
            <p className="mt-2 text-sm text-slate-400 sm:text-base">
              Simple by design. No algorithms, no noise.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3 sm:gap-8 max-w-3xl mx-auto">
            {STEPS.map(({ num, icon: Icon, title, desc }) => (
              <div key={num} className="relative flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="absolute top-0 right-0 sm:right-auto sm:-left-2 sm:-top-2 text-[10px] font-black text-primary/40 tracking-widest">
                  {num}
                </span>
                <h3 className="text-[15px] font-bold text-white">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-400 max-w-[260px]">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== WHY LISTIFY ========== */}
      <section className="py-14 sm:py-20 bg-slate-900/30 border-t border-slate-800/50">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-xl font-black text-white sm:text-3xl">
              Built Different
            </h2>
            <p className="mt-2 text-sm text-slate-400 sm:text-base">
              No more digging through Facebook groups and DMs.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            {[
              {
                icon: MapPin,
                title: "Local by Default",
                desc: "Filter by city and radius. See what\u2019s open near you, not across the country.",
              },
              {
                icon: Zap,
                title: "Post in Minutes",
                desc: "Scouts post a listing in under 2 minutes. Talent browses instantly.",
              },
              {
                icon: Clock,
                title: "Always Fresh",
                desc: "Listings expire after 14 days. No stale posts from 6 months ago.",
              },
              {
                icon: null,
                title: "Industry Focused",
                desc: "Built for barbers, cosmetologists, tattoo artists, and piercers.",
              },
              {
                icon: Send,
                title: "Direct Inquiries",
                desc: "No public applications. Send your info directly to the shop.",
              },
              {
                icon: Shield,
                title: "No Spam",
                desc: "One listing per account. Real shops, real opportunities.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex gap-4 rounded-xl border border-slate-800/50 bg-bg-surface/50 p-4 sm:p-5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  {Icon ? (
                    <Icon className="w-4 h-4 text-primary" />
                  ) : (
                    <StraightRazorIcon size={16} className="text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-slate-400">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== BOTTOM CTA ========== */}
      <section className="relative py-14 sm:py-20 border-t border-slate-800/50">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-md text-center sm:max-w-lg">
            <h2 className="text-xl font-black text-white sm:text-3xl">
              Your Next Opportunity is Local
            </h2>
            <p className="mt-3 text-sm text-slate-400 sm:text-base">
              Whether you&apos;re behind the chair or filling one, Listify is where it starts.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/jobs"
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary px-6 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98] sm:w-auto sm:px-8"
              >
                Browse Listings
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/signup"
                className="flex items-center justify-center gap-2 w-full rounded-xl border border-slate-700 bg-slate-800/50 px-6 py-3.5 text-[15px] font-bold text-slate-100 transition-all hover:bg-slate-800 active:scale-[0.98] sm:w-auto sm:px-8"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="border-t border-slate-800/50 py-8">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 text-center">
          <span className="text-base font-bold text-primary">Listify</span>
          <p className="mt-1.5 text-xs text-slate-600">
            &copy; {new Date().getFullYear()} Listify. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
