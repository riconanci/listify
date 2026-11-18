"use client";

import Link from "next/link";
import { MapPin, Clock, CheckCircle2 } from "lucide-react";
import StatusBadge from "./StatusBadge";

interface TalentInquiryCardProps {
  id: string;
  jobTitle: string;
  businessName: string;
  jobId: string;
  role: string;
  city?: string | null;
  state?: string | null;
  note?: string | null;
  createdAt: string;
  status?: string;
  onWithdraw?: (id: string) => void;
}

function formatRole(role: string): string {
  return role
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;
}

export default function TalentInquiryCard({
  id,
  jobTitle,
  businessName,
  jobId,
  role,
  city,
  state,
  note,
  createdAt,
  status = "sent",
  onWithdraw,
}: TalentInquiryCardProps) {
  return (
    <div className="rounded-2xl bg-surface p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <StatusBadge variant="primary">{formatRole(role)}</StatusBadge>
        <div className="flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-success-fg" strokeWidth={2.2} />
          <span className="ios-footnote font-semibold text-success-fg capitalize">
            {status}
          </span>
        </div>
      </div>

      {/* Job info */}
      <h3 className="mt-3 ios-headline text-fg-strong">
        {jobTitle} — {businessName}
      </h3>

      <div className="flex flex-wrap items-center gap-3 mt-1.5 ios-footnote text-fg-secondary">
        {city && (
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" strokeWidth={2.2} />
            {city}, {state || "CA"}
          </div>
        )}
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" strokeWidth={2.2} />
          Sent {timeAgo(createdAt)}
        </div>
      </div>

      {/* Note preview */}
      {note && (
        <div className="mt-3 rounded-xl bg-surface/60 p-3">
          <p className="ios-subheadline text-fg-secondary italic line-clamp-2">
            &ldquo;{note}&rdquo;
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={() => onWithdraw?.(id)}
          className="flex-1 rounded-full bg-elevated/60 px-4 h-10 text-[15px] font-semibold text-fg-strong ios-press active:bg-elevated transition-colors text-center"
        >
          Withdraw
        </button>
        <Link
          href={`/jobs/${jobId}`}
          className="flex-1 rounded-full bg-primary px-4 h-10 text-[15px] font-semibold text-white ios-press active:bg-primary-dark transition-colors text-center flex items-center justify-center"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
