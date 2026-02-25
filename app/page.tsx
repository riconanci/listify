import Link from "next/link";
import {
  MapPin,
  Users,
  Building2,
  MessageSquare,
  Star,
  Bell,
  Briefcase,
  Shield,
} from "lucide-react";

export default function LandingPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-bg-base to-bg-base" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Connect Local Service Talent with{" "}
              <span className="text-gradient-hero">Shops</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-400 sm:text-xl max-w-2xl mx-auto">
              Listify connects talented barbers, cosmetologists, and tattoo
              artists with shops in San Diego County. Find your next chair
              or your next star employee today.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/signup"
                className="w-full rounded-xl bg-primary px-8 py-4 text-base font-bold text-white shadow-xl shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98] sm:w-auto"
              >
                Get Started
              </Link>
              <Link
                href="/jobs"
                className="w-full rounded-xl border-2 border-slate-700 bg-transparent px-8 py-4 text-base font-bold text-slate-100 transition-all hover:bg-slate-800 active:scale-[0.98] sm:w-auto"
              >
                Browse Listings
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-2 text-sm font-medium text-slate-500">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Currently serving San Diego County, CA</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* For Talent Card */}
            <div className="group relative flex flex-col gap-6 rounded-2xl border border-slate-800 bg-bg-surface p-8 transition-all hover:border-primary/30">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  For Talent
                </h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">
                    Barbers
                  </span>
                  <span className="text-xs text-slate-600">•</span>
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">
                    Cosmetologists
                  </span>
                  <span className="text-xs text-slate-600">•</span>
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">
                    Tattoo Artists
                  </span>
                </div>
              </div>
              <ul className="space-y-4 text-slate-300">
                <li className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span>
                    Showcase your portfolio to top San Diego shops
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span>
                    Direct messaging with shop owners and managers
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span>
                    Get verified reviews from previous chair rentals
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span>
                    Real-time local listing alerts for your specialty
                  </span>
                </li>
              </ul>
            </div>

            {/* For Shops Card */}
            <div className="group relative flex flex-col gap-6 rounded-2xl border border-slate-800 bg-bg-surface p-8 transition-all hover:border-primary/30">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  For Shops
                </h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">
                    Shop Owners
                  </span>
                  <span className="text-xs text-slate-600">•</span>
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">
                    Scouts
                  </span>
                </div>
              </div>
              <ul className="space-y-4 text-slate-300">
                <li className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span>
                    Post open chairs and booths in minutes
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span>
                    Browse vetted portfolios of local artists
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span>
                    Streamlined communication tools for hiring
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span>
                    Access a community of 500+ San Diego professionals
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-bg-base via-primary/5 to-bg-base" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-black text-white sm:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Join the fastest-growing community of beauty professionals in
              Southern California. Your next career move starts here.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/signup?role=talent"
                className="w-full rounded-xl bg-primary px-8 py-4 text-base font-bold text-white shadow-xl shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98] sm:w-auto"
              >
                I&apos;m Looking for Work
              </Link>
              <Link
                href="/signup?role=employer"
                className="w-full rounded-xl border-2 border-slate-700 bg-transparent px-8 py-4 text-base font-bold text-slate-100 transition-all hover:bg-slate-800 active:scale-[0.98] sm:w-auto"
              >
                I&apos;m Hiring Talent
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xl font-bold text-primary">Listify</span>
          <p className="mt-2 text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Listify. All rights reserved.
            San Diego County, CA.
          </p>
          <div className="mt-4 flex justify-center gap-6 text-sm text-slate-500">
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
