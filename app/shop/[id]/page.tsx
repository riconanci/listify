"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Share2,
  MapPin,
  Star,
  Briefcase,
  Users,
  Shield,
  Globe,
  Instagram,
  ExternalLink,
  PlusCircle,
  ChevronRight,
  ImageIcon,
  Building2,
} from "lucide-react";

interface ShopProfileData {
  id: string;
  shopName: string;
  city?: string;
  state?: string;
  verified?: boolean;
  activeJobs?: number;
  teamSize?: number;
  rating?: number;
  about?: string;
  services?: string[];
  listings?: {
    id: string;
    title: string;
    schedule?: string;
    compensation?: string;
  }[];
  website?: string;
  instagram?: string;
  coverUrl?: string;
  logoUrl?: string;
}

export default function ShopProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<ShopProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/shops/${params.id}/profile`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchProfile();
  }, [params.id]);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  if (loading) {
    return (
      <main className="min-h-[calc(100dvh-4rem)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!loading && !profile) {
    return (
      <main className="min-h-[calc(100dvh-4rem)] flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
          <Building2 className="w-8 h-8 text-slate-600" />
        </div>
        <h2 className="text-lg font-bold text-white">Shop not found</h2>
        <p className="text-sm text-slate-400 mt-2">This shop profile doesn&apos;t exist or has been removed.</p>
        <button
          onClick={() => router.back()}
          className="mt-6 rounded-lg border border-slate-700 px-6 py-2.5 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          Go Back
        </button>
      </main>
    );
  }

  const data = profile!;

  return (
    <main className="min-h-[calc(100dvh-4rem)] page-with-nav">
      {/* Header */}
      <div className="sticky top-16 z-40 border-b border-slate-800 bg-bg-base/95 glass-header px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold text-white">Shop Profile</h1>
          <button className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto pb-28">
        {/* Cover Image */}
        <div className="relative">
          {data.coverUrl ? (
            <div className="h-48 overflow-hidden">
              <img
                src={data.coverUrl}
                alt={data.shopName}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="h-48 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-slate-700" />
            </div>
          )}

          {/* Logo overlapping cover */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
            {data.logoUrl ? (
              <img
                src={data.logoUrl}
                alt={data.shopName}
                className="w-20 h-20 rounded-full object-cover border-4 border-bg-base shadow-xl"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-bg-surface border-4 border-bg-base shadow-xl flex items-center justify-center text-primary text-xl font-bold">
                {getInitials(data.shopName)}
              </div>
            )}
          </div>
        </div>

        {/* Shop Name + Info */}
        <div className="text-center pt-14 px-4">
          <h2 className="text-2xl font-black text-white">{data.shopName}</h2>
          <div className="flex items-center justify-center gap-3 mt-2">
            {data.city && (
              <div className="flex items-center gap-1 text-sm text-slate-400">
                <MapPin className="w-3.5 h-3.5" />
                {data.city}, {data.state || "CA"}
              </div>
            )}
            {data.verified && (
              <div className="flex items-center gap-1 text-xs font-bold text-green-400">
                <Shield className="w-3.5 h-3.5" />
                Verified Shop
              </div>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 px-4 mt-6">
          <div className="flex flex-col rounded-xl border border-slate-800 bg-bg-surface p-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Active Jobs
            </span>
            <span className="text-2xl font-black text-white mt-1">
              {data.activeJobs || 0}
            </span>
          </div>
          <div className="flex flex-col rounded-xl border border-slate-800 bg-bg-surface p-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Team Size
            </span>
            <span className="text-2xl font-black text-white mt-1">
              {data.teamSize || "—"}
            </span>
          </div>
          <div className="flex flex-col rounded-xl border border-slate-800 bg-bg-surface p-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Rating
            </span>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-2xl font-black text-white">
                {data.rating || "—"}
              </span>
              {data.rating && (
                <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
              )}
            </div>
          </div>
        </div>

        {/* About */}
        {data.about && (
          <section className="px-4 mt-8">
            <h3 className="text-base font-bold text-white mb-3">
              About the Shop
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {data.about}
            </p>
          </section>
        )}

        {/* Services Offered */}
        {data.services && data.services.length > 0 && (
          <section className="px-4 mt-8">
            <h3 className="text-base font-bold text-white mb-3">
              Services Offered
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.services.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 bg-bg-surface text-sm text-slate-300"
                >
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Active Opportunities */}
        {data.listings && data.listings.length > 0 && (
          <section className="px-4 mt-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white">
                Active Opportunities
              </h3>
              <button className="text-xs font-semibold text-primary hover:text-primary-light transition-colors">
                View All
              </button>
            </div>
            <div className="space-y-2">
              {data.listings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/jobs/${listing.id}`}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-bg-surface px-4 py-4 hover:border-primary/30 transition-colors group"
                >
                  <div>
                    <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                      {listing.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {[listing.schedule, listing.compensation]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Contact & Social */}
        <section className="px-4 mt-8">
          <h3 className="text-base font-bold text-white mb-3">
            Contact & Social
          </h3>
          <div className="space-y-2">
            {data.website && (
              <a
                href={`https://${data.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-slate-800 bg-bg-surface px-4 py-3.5 hover:border-primary/30 transition-colors group"
              >
                <Globe className="w-5 h-5 text-primary" />
                <span className="flex-1 text-sm text-slate-300 group-hover:text-white transition-colors">
                  {data.website}
                </span>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors" />
              </a>
            )}
            {data.instagram && (
              <a
                href={`https://instagram.com/${data.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-slate-800 bg-bg-surface px-4 py-3.5 hover:border-primary/30 transition-colors group"
              >
                <Instagram className="w-5 h-5 text-primary" />
                <span className="flex-1 text-sm text-slate-300 group-hover:text-white transition-colors">
                  @{data.instagram}
                </span>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors" />
              </a>
            )}
          </div>
        </section>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 bg-bg-base/95 glass-header p-4 pb-safe">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => setFollowing(!following)}
            className={`flex items-center justify-center gap-2 rounded-xl border-2 px-5 py-3.5 text-sm font-bold transition-all ${
              following
                ? "border-primary bg-primary/10 text-primary"
                : "border-slate-700 text-slate-300 hover:border-slate-600"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            {following ? "Following" : "Follow Shop"}
          </button>
          <Link
            href={`/jobs?shop=${data.id}`}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            <Briefcase className="w-4 h-4" />
            View All Listings
          </Link>
        </div>
      </div>
    </main>
  );
}
