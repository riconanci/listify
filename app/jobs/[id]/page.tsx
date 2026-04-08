import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  MapPin,
  CheckCircle2,
  ImageIcon,
  Send,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import StatusBadge from "@/components/StatusBadge";
import LocationMap from "@/components/LocationMap";
import InquiryForm from "./InquiryForm";

interface PageProps {
  params: { id: string };
}

function formatRole(role: string): string {
  return role
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatSchedule(schedule?: string | null): string | null {
  if (!schedule) return null;
  return schedule
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatCompensation(job: any): string {
  const { compModel, payMin, payMax, payUnit } = job;
  const unit = payUnit?.replace(/^\$/, "") || "";

  if (compModel === "commission") {
    if (payMin && payMax && Number(payMin) !== Number(payMax))
      return `${payMin}-${payMax}%`;
    if (payMin) return `${payMin}%`;
    return "Commission";
  }
  if (compModel === "booth_rent") {
    const suffix = unit || "/wk";
    if (payMin && payMax && Number(payMin) !== Number(payMax))
      return `$${payMin}-$${payMax}${suffix}`;
    if (payMin) return `$${payMin}${suffix}`;
    return "Booth Rent";
  }
  if (compModel === "hybrid") {
    const wage = payMin ? `$${payMin}/hr` : "";
    const comm = payMax ? `${payMax}%` : "";
    if (wage && comm) return `${wage} + ${comm}`;
    if (wage) return wage;
    if (comm) return comm;
    return "Hourly + Commission";
  }
  if (payMin && payMax && Number(payMin) !== Number(payMax))
    return `$${payMin}-$${payMax}/hr`;
  if (payMin) return `$${payMin}/hr`;
  return "Hourly";
}

function formatCompModel(compModel: string): string {
  return compModel
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params;

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      location: true,
      photos: true,
      employerProfile: {
        include: { user: true },
      },
    },
  });

  if (!job) notFound();

  // Get current user for inquiry auth
  const currentUser = await getCurrentUser();
  const userRole = currentUser?.role || null;
  const isOwner = currentUser?.id === job.employerProfile.userId;

  // Increment view count (fire and forget)
  prisma.job.update({
    where: { id },
    data: { viewsCount: { increment: 1 } },
  }).catch(() => {});

  const photoUrl = job.photos?.[0]?.url || null;
  const location = job.location;
  const schedule = formatSchedule(job.schedule);
  const employmentType = job.employmentType?.toUpperCase();

  // Parse requirements from description (split by newlines or bullet points)
  const requirements = job.description
    ?.split(/[\n•]/)
    .map((r: string) => r.trim())
    .filter((r: string) => r.length > 0) || [];

  return (
    <main className="min-h-[calc(100dvh-4rem)] page-with-nav pb-24">
      {/* Header */}
      <div className="sticky top-16 z-40 border-b border-slate-800 bg-bg-base/95 glass-header px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-primary/20 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-primary">
                <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.6" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.6" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.3" />
              </svg>
            </div>
            <span className="text-sm font-bold text-white">Listify</span>
          </div>
          <Link
            href="/jobs"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-light transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Listings
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Hero Image */}
        {photoUrl ? (
          <div className="aspect-[16/9] w-full overflow-hidden bg-slate-800">
            <img
              src={photoUrl}
              alt={job.businessName || job.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-[16/9] w-full bg-slate-800 flex items-center justify-center">
            <ImageIcon className="w-16 h-16 text-slate-600" />
          </div>
        )}

        {/* Content */}
        <div className="px-4 py-6 space-y-6">
          {/* Title */}
          <div>
            <h1 className="text-2xl font-black text-white">
              {job.businessName || "Business"}
            </h1>
            <p className="text-base text-slate-400 mt-1">
              {job.title} — Chair available
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {(job.specialties && job.specialties.length > 0
              ? job.specialties
              : []
            ).filter(Boolean).map((spec: string) => (
              <StatusBadge key={spec} variant="primary">{formatRole(spec)}</StatusBadge>
            ))}
            {schedule && <StatusBadge variant="default">{schedule}</StatusBadge>}
            {employmentType && (
              <StatusBadge variant="default">{employmentType}</StatusBadge>
            )}
          </div>

          {/* Description */}
          {job.description && (
            <section>
              <h2 className="text-lg font-bold text-white mb-3">
                About this position
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </section>
          )}

          {/* Requirements */}
          {job.experienceText && (
            <section>
              <h2 className="text-lg font-bold text-white mb-3">
                Requirements
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-300">
                    {job.experienceText} of professional experience
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* Compensation Card */}
          <section className="rounded-xl border border-slate-800 bg-bg-surface p-5">
            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
              Compensation
            </p>
            <p className="text-3xl font-black text-white">
              {formatCompensation(job)}{" "}
              <span className="text-base font-medium text-slate-400">
                {formatCompModel(job.compModel)}
              </span>
            </p>
          </section>

          {/* Location Card */}
          {location && (
            <section className="rounded-xl border border-slate-800 bg-bg-surface overflow-hidden">
              {location.lat && location.lng ? (
                <LocationMap
                  lat={location.lat}
                  lng={location.lng}
                  className="h-36 w-full"
                />
              ) : (
                <div className="h-36 bg-slate-800 relative flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
              )}
              <div className="p-4">
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                  Location
                </p>
                <p className="text-sm text-slate-300">
                  {[location.addressLine1, location.city, location.state]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Sticky Inquiry Button */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 bg-bg-base/95 glass-header p-4 md:pb-4 pb-safe">
        <div className="max-w-3xl mx-auto">
          <InquiryForm jobId={id} userRole={userRole} isOwner={isOwner} />
        </div>
      </div>
    </main>
  );
}
