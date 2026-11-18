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
  senderId?: string;
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
  senderHeadline?: string | null;
  portfolioPhotos?: string[];
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
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
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
  senderId,
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
  senderHeadline,
  portfolioPhotos,
  onStar,
  onDelete,
}: InquiryCardProps) {
  return (
    <div className="rounded-2xl bg-surface p-4">
      {/* Avatar + Name */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="shrink-0">
          {senderPhotoUrl ? (
            <img
              src={senderPhotoUrl}
              alt={senderName}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/30"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white ios-headline">
              {getInitials(senderName)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="ios-headline text-fg-strong">{senderName}</h3>
            <span className="ios-caption text-fg-muted shrink-0">
              {timeAgo(createdAt)}
            </span>
          </div>

          {/* Contact details */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 ios-footnote text-fg-secondary">
            {senderEmail && (
              <a
                href={`mailto:${senderEmail}`}
                className="flex items-center gap-1 active:text-primary transition-colors"
              >
                <Mail className="w-3 h-3" strokeWidth={2.2} />
                <span className="truncate max-w-[180px]">{senderEmail}</span>
              </a>
            )}
            {phone && (
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-1 active:text-primary transition-colors"
              >
                <Phone className="w-3 h-3" strokeWidth={2.2} />
                {formatPhone(phone)}
              </a>
            )}
          </div>

          {instagram && (
            <a
              href={`https://instagram.com/${instagram.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-1 ios-footnote text-primary active:text-primary-light transition-colors"
            >
              <Instagram className="w-3 h-3" strokeWidth={2.2} />
              @{instagram.replace("@", "")}
            </a>
          )}
        </div>
      </div>

      {/* Note */}
      {note && (
        <div className="mt-3 rounded-xl bg-surface/60 p-3">
          <p className="ios-subheadline text-fg italic">
            &ldquo;{note}&rdquo;
          </p>
        </div>
      )}

      {/* Inquiring About */}
      <div className="mt-3 flex items-center gap-2 flex-wrap ios-footnote">
        <span className="text-fg-muted">Inquiring about:</span>
        <Link
          href={`/jobs/${jobId}`}
          className="text-primary font-semibold ios-press"
        >
          {jobTitle} — {businessName}
        </Link>
      </div>

      {/* Portfolio Thumbnails */}
      {portfolioPhotos && portfolioPhotos.length > 0 && (
        <div className="mt-3">
          <p className="ios-section-header !pb-1.5 !px-0">Their Work</p>
          <div className="flex gap-2">
            {portfolioPhotos.slice(0, 4).map((photo, i) => (
              <div
                key={i}
                className="w-16 h-16 rounded-xl overflow-hidden bg-surface shrink-0"
              >
                <img
                  src={photo}
                  alt={`Work ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2">
        {senderId && (
          <Link
            href={`/talent/${senderId}`}
            className="flex-1 rounded-full bg-primary/15 px-4 h-10 text-[15px] font-semibold text-primary ios-press active:bg-primary/25 transition-colors text-center flex items-center justify-center"
          >
            View Profile
          </Link>
        )}
        <button
          onClick={() => onStar?.(id)}
          className={clsx(
            "flex items-center justify-center w-10 h-10 rounded-full ios-press transition-colors shrink-0",
            isStarred
              ? "bg-warning-fg/15 text-warning-fg"
              : "bg-elevated/60 text-fg-secondary active:bg-elevated"
          )}
          aria-label={isStarred ? "Unstar inquiry" : "Star inquiry"}
        >
          <Star
            className="w-[18px] h-[18px]"
            fill={isStarred ? "currentColor" : "none"}
            strokeWidth={2}
          />
        </button>
        <button
          className="flex items-center justify-center w-10 h-10 rounded-full bg-elevated/60 text-fg-secondary ios-press active:bg-elevated transition-colors shrink-0"
          aria-label="Download contact"
        >
          <Download className="w-[18px] h-[18px]" strokeWidth={2} />
        </button>
        <button
          onClick={() => onDelete?.(id)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-elevated/60 text-danger-fg ios-press active:bg-danger/15 transition-colors shrink-0"
          aria-label="Delete inquiry"
        >
          <Trash2 className="w-[18px] h-[18px]" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
