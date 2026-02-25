"use client";

import {
  Star,
  Download,
  Trash2,
  Mail,
  Phone,
  Instagram,
} from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

interface InquiryCardProps {
  id: string;
  senderName: string;
  senderEmail?: string | null;
  phone?: string | null;
  instagram?: string | null;
  note?: string | null;
  jobTitle: string;
  businessName: string;
  jobId: string;
  createdAt: string;
  isStarred?: boolean;
  senderPhotoUrl?: string | null;
  onStar?: (id: string) => void;
  onDelete?: (id: string) => void;
  onBlock?: (senderId: string) => void;
}

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return `${Math.floor(diffDays / 7)}w ago`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

export default function InquiryCard({
  id,
  senderName,
  senderEmail,
  phone,
  instagram,
  note,
  jobTitle,
  businessName,
  jobId,
  createdAt,
  isStarred = false,
  senderPhotoUrl,
  onStar,
  onDelete,
}: InquiryCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-bg-surface p-5 card-hover">
      {/* Avatar + Name */}
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="shrink-0">
          {senderPhotoUrl ? (
            <img
              src={senderPhotoUrl}
              alt={senderName}
              className="w-12 h-12 rounded-full object-cover border-2 border-primary/30"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
              {getInitials(senderName)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-white">{senderName}</h3>

          {/* Contact details */}
          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
            {senderEmail && (
              <a
                href={`mailto:${senderEmail}`}
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <Mail className="w-3 h-3" />
                {senderEmail}
              </a>
            )}
            {phone && (
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <Phone className="w-3 h-3" />
                {formatPhone(phone)}
              </a>
            )}
          </div>

          {instagram && (
            <a
              href={`https://instagram.com/${instagram.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-1 text-xs text-primary hover:text-primary-light transition-colors"
            >
              <Instagram className="w-3 h-3" />
              @{instagram.replace("@", "")}
            </a>
          )}

          {/* Timestamp */}
          <p className="text-[11px] text-slate-500 uppercase tracking-wider mt-2 font-medium">
            {timeAgo(createdAt)}
          </p>
        </div>
      </div>

      {/* Note */}
      {note && (
        <div className="mt-4 pl-16">
          <p className="text-sm text-slate-300 italic leading-relaxed">
            &ldquo;{note}&rdquo;
          </p>
        </div>
      )}

      {/* Inquiring About */}
      <div className="mt-4 pl-16 flex items-center gap-3 text-xs">
        <span className="text-slate-500 uppercase tracking-wider font-medium">
          Inquiring About:
        </span>
        <Link
          href={`/jobs/${jobId}`}
          className="text-primary hover:text-primary-light font-semibold transition-colors"
        >
          {jobTitle} - {businessName}
        </Link>
      </div>

      {/* Actions */}
      <div className="mt-4 pl-16 flex items-center gap-2">
        <button
          onClick={() => onStar?.(id)}
          className={clsx(
            "p-2 rounded-lg transition-colors",
            isStarred
              ? "text-yellow-400 bg-yellow-400/10"
              : "text-slate-500 hover:text-yellow-400 hover:bg-slate-800"
          )}
          aria-label={isStarred ? "Unstar inquiry" : "Star inquiry"}
        >
          <Star
            className="w-4 h-4"
            fill={isStarred ? "currentColor" : "none"}
          />
        </button>
        <button
          className="p-2 rounded-lg text-slate-500 hover:text-primary hover:bg-slate-800 transition-colors"
          aria-label="Download contact"
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete?.(id)}
          className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          aria-label="Delete inquiry"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
