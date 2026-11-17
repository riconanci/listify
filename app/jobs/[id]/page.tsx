import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  MapPin,
  CheckCircle2,
  ImageIcon,
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

  const currentUser = await getCurrentUser();
  const userRole = currentUser?.role || null;
  const isOwner = currentUser?.id === job.employerProfile.userId;

  prisma.job
    .update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    })
    .catch(() => {});

  const photoUrl = job.photos?.[0]?.url || null;
  const location = job.location;
  const schedule = formatSchedule(job.schedule);
  const employmentType = job.employmentType?.toUpperCase();

  return (
    <main className="min-h-[calc(100dvh-3.5rem)] pb-40 md:pb-24">
      {/* iOS-style nav bar with chevron back */}
      <div className="sticky top-14 md:top-16 z-[999] ios-blur ios-hairline-bottom">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-2 h-11">
          <Link
            href="/jobs"
            className="flex items-center gap-0.5 text-primary ios-press px-2 py-1"
          >
            <ChevronLeft className="w-[22px] h-[22px]" strokeWidth={2.5} />
            <span className="text-[17px] font-normal">Browse</span>
          </Link>
          <h1 className="text-[17px] font-semibold text-fg-strong truncate max-w-[60%]">
            Listing
          </h1>
          <div className="w-[80px]" /> {/* spacer to balance back button */}
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Hero Image */}
        {photoUrl ? (
          <div className="aspect-[16/9] w-full overflow-hidden bg-surface">
            <img
              src={photoUrl}
              alt={job.businessName || job.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-[16/9] w-full bg-surface flex items-center justify-center">
            <ImageIcon className="w-16 h-16 text-fg-faint" />
          </div>
        )}

        {/* Title block */}
        <div className="px-4 pt-5 pb-3">
          <h1 className="ios-title-1 text-fg-strong">
            {job.businessName || "Business"}
          </h1>
          <p className="ios-callout text-fg-secondary mt-1">{job.title}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {(job.specialties && job.specialties.length > 0 ? job.specialties : [])
              .filter(Boolean)
              .map((spec: string) => (
                <StatusBadge key={spec} variant="primary">
                  {formatRole(spec)}
                </StatusBadge>
              ))}
            {schedule && <StatusBadge variant="default">{schedule}</StatusBadge>}
            {employmentType && (
              <StatusBadge variant="default">{employmentType}</StatusBadge>
            )}
          </div>
        </div>

        {/* Compensation — prominent iOS card */}
        <div className="px-4 pb-5">
          <h3 className="ios-section-header">Compensation</h3>
          <div className="ios-card px-5 py-4">
            <p className="text-3xl font-bold text-fg-strong tracking-tight">
              {formatCompensation(job)}
            </p>
            <p className="ios-subheadline text-fg-secondary mt-1">
              {formatCompModel(job.compModel)}
            </p>
          </div>
        </div>

        {/* Description */}
        {job.description && (
          <div className="px-4 pb-5">
            <h3 className="ios-section-header">About this position</h3>
            <div className="ios-card px-4 py-3.5">
              <p className="ios-body text-fg-bright whitespace-pre-line">
                {job.description}
              </p>
            </div>
          </div>
        )}

        {/* Requirements */}
        {job.experienceText && (
          <div className="px-4 pb-5">
            <h3 className="ios-section-header">Requirements</h3>
            <div className="ios-card">
              <div className="ios-row gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" strokeWidth={2} />
                <span className="ios-body text-fg-bright">
                  {job.experienceText} of professional experience
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Location */}
        {location && (
          <div className="px-4 pb-5">
            <h3 className="ios-section-header">Location</h3>
            <div className="ios-card overflow-hidden">
              {location.lat && location.lng && (job as any).addressVisible !== false ? (
                <LocationMap
                  lat={location.lat}
                  lng={location.lng}
                  className="h-36 w-full"
                />
              ) : (
                <div className="h-36 bg-surface relative flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
              )}
              <div className="ios-row gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0" strokeWidth={2} />
                <div className="flex-1 min-w-0">
                  <span className="ios-body text-fg-bright">
                    {(job as any).addressVisible !== false
                      ? [location.addressLine1, location.city, location.state]
                          .filter(Boolean)
                          .join(", ")
                      : [location.city, location.state].filter(Boolean).join(", ")}
                  </span>
                  {(job as any).addressVisible === false && (
                    <p className="ios-caption text-fg-muted mt-0.5">
                      Approximate location · exact address shared after inquiry
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Inquiry Button */}
      <div className="fixed bottom-16 left-0 right-0 z-[999] ios-hairline-top ios-blur-strong p-4 pb-safe md:bottom-0">
        <div className="max-w-3xl mx-auto">
          <InquiryForm jobId={id} userRole={userRole} isOwner={isOwner} />
        </div>
      </div>
    </main>
  );
}
