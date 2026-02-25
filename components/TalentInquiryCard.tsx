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
    <div className="rounded-xl border border-slate-800 bg-bg-surface p-5 card-hover">
      {/* Header */}
      <div className="flex items-start justify-between">
        {/* Role tag */}
        <StatusBadge variant="primary">{formatRole(role)}</StatusBadge>

        {/* Status */}
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
          <span className="text-xs font-semibold text-green-400 capitalize">
            {status}
          </span>
        </div>
      </div>

      {/* Job Info */}
      <h3 className="mt-3 text-base font-bold text-white">
        {jobTitle} — {businessName}
      </h3>

      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
        {city && (
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {city}, {state || "CA"}
          </div>
        )}
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Sent {timeAgo(createdAt)}
        </div>
      </div>

      {/* Note preview */}
      {note && (
        <div className="mt-3 rounded-lg bg-slate-800/50 p-3">
          <p className="text-sm text-slate-400 italic line-clamp-2">
            &ldquo;{note}&rdquo;
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={() => onWithdraw?.(id)}
          className="flex-1 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-center"
        >
          Withdraw
        </button>
        <Link
          href={`/jobs/${jobId}`}
          className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white text-center hover:bg-primary/90 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
