"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Share2,
  MapPin,
  Star,
  Briefcase,
  Shield,
  Globe,
  Instagram,
  Bookmark,
  Mail,
  ExternalLink,
  ImageIcon,
  User,
} from "lucide-react";
import { clsx } from "clsx";

interface TalentProfileData {
  id: string;
  name: string;
  headline?: string;
  verified?: boolean;
  yearsExperience?: number;
  city?: string;
  state?: string;
  rating?: number;
  specialties?: string[];
  bio?: string;
  portfolio?: string[];
  website?: string;
  instagram?: string;
  email?: string;
  avatarUrl?: string;
}

export default function TalentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<TalentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/users/${params.id}/profile`);
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
          <User className="w-8 h-8 text-slate-600" />
        </div>
        <h2 className="text-lg font-bold text-white">Profile not found</h2>
        <p className="text-sm text-slate-400 mt-2">This talent profile doesn&apos;t exist or has been removed.</p>
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
          <h1 className="text-base font-bold text-white">Talent Profile</h1>
          <button className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 pb-28">
        {/* Avatar + Name */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative">
            {data.avatarUrl ? (
              <img
                src={data.avatarUrl}
                alt={data.name}
                className="w-28 h-28 rounded-full object-cover border-4 border-slate-800"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold border-4 border-slate-800">
                {getInitials(data.name)}
              </div>
            )}
            {data.verified && (
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-bg-base">
                <Shield className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          <h2 className="mt-4 text-2xl font-black text-white">{data.name}</h2>
          {data.headline && (
            <p className="text-sm text-primary mt-1">{data.headline}</p>
          )}
          {data.verified && (
            <div className="flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <Shield className="w-3 h-3 text-primary" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                Verified Pro
              </span>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="flex flex-col items-center gap-1 rounded-xl border border-slate-800 bg-bg-surface p-4">
            <Briefcase className="w-5 h-5 text-primary mb-1" />
            <span className="text-xl font-black text-white">
              {data.yearsExperience || "—"}+
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Years Exp
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-xl border border-slate-800 bg-bg-surface p-4">
            <MapPin className="w-5 h-5 text-primary mb-1" />
            <span className="text-base font-bold text-white">
              {data.city || "—"}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {data.state || "CA"}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-xl border border-slate-800 bg-bg-surface p-4">
            <Star className="w-5 h-5 text-primary mb-1" />
            <span className="text-xl font-black text-white">
              {data.rating || "—"}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Rating
            </span>
          </div>
        </div>

        {/* Specialized Services */}
        {data.specialties && data.specialties.length > 0 && (
          <section className="mb-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Specialized Services
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.specialties.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1.5 rounded-lg border border-primary/20 bg-primary/5 text-sm font-medium text-primary"
                >
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Professional Bio */}
        {data.bio && (
          <section className="mb-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Professional Bio
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {data.bio}
            </p>
          </section>
        )}

        {/* Portfolio */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Portfolio
            </h3>
            {data.portfolio && data.portfolio.length > 6 && (
              <button className="text-xs font-semibold text-primary hover:text-primary-light transition-colors">
                View All
              </button>
            )}
          </div>
          {data.portfolio && data.portfolio.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {data.portfolio.slice(0, 6).map((photo, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg overflow-hidden bg-slate-800"
                >
                  <img
                    src={photo}
                    alt={`Portfolio ${i + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg bg-slate-800 flex items-center justify-center"
                >
                  <ImageIcon className="w-6 h-6 text-slate-700" />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Links & Social */}
        <section className="mb-8">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Links & Social
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
            onClick={() => setSaved(!saved)}
            className={clsx(
              "flex items-center justify-center gap-2 rounded-xl border-2 px-5 py-3.5 text-sm font-bold transition-all",
              saved
                ? "border-primary bg-primary/10 text-primary"
                : "border-slate-700 text-slate-300 hover:border-slate-600"
            )}
          >
            <Bookmark
              className="w-4 h-4"
              fill={saved ? "currentColor" : "none"}
            />
            Save
          </button>
          <a
            href={data.email ? `mailto:${data.email}` : "#"}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            <Mail className="w-4 h-4" />
            Contact Talent
          </a>
        </div>
      </div>
    </main>
  );
}
