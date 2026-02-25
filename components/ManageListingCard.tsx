"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  MessageSquare,
  MoreVertical,
  Pause,
  Trash2,
  Play,
  ImageIcon,
  RefreshCw,
  Clock,
} from "lucide-react";
import StatusBadge from "./StatusBadge";
import { clsx } from "clsx";

interface ManageListingCardProps {
  id: string;
  title: string;
  businessName: string;
  role: string;
  status: string;
  viewsCount: number;
  inquiriesCount: number;
  createdAt: string;
  expiresAt?: string | null;
  photoUrl?: string | null;
  onDelete?: (id: string) => void;
  onToggleStatus?: (id: string, newStatus: string) => void;
  onRenew?: (id: string) => void;
}

function formatRole(role: string): string {
  return role
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function getExpirationInfo(expiresAt?: string | null): {
  isExpired: boolean;
  isExpiringSoon: boolean;
  daysLeft: number;
  label: string;
} {
  if (!expiresAt) {
    return { isExpired: false, isExpiringSoon: false, daysLeft: 99, label: "" };
  }

  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffMs = expiry.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysLeft <= 0) {
    return { isExpired: true, isExpiringSoon: false, daysLeft: 0, label: "Expired" };
  }
  if (daysLeft === 1) {
    return { isExpired: false, isExpiringSoon: true, daysLeft: 1, label: "Expires tomorrow" };
  }
  if (daysLeft <= 3) {
    return { isExpired: false, isExpiringSoon: true, daysLeft, label: `${daysLeft} days left` };
  }
  return { isExpired: false, isExpiringSoon: false, daysLeft, label: `${daysLeft} days left` };
}

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30)
    return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;
  return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? "s" : ""} ago`;
}

export default function ManageListingCard({
  id,
  title,
  businessName,
  role,
  status,
  viewsCount,
  inquiriesCount,
  createdAt,
  expiresAt,
  photoUrl,
  onDelete,
  onToggleStatus,
  onRenew,
}: ManageListingCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const expiration = getExpirationInfo(expiresAt);
  const isExpired = expiration.isExpired && status === "active";
  const effectiveStatus = isExpired ? "expired" : status;

  const statusVariant =
    effectiveStatus === "active"
      ? expiration.isExpiringSoon
        ? "expiring"
        : "active"
      : effectiveStatus === "paused"
      ? "paused"
      : effectiveStatus === "expired"
      ? "expired"
      : "closed";

  const statusLabel =
    effectiveStatus === "active"
      ? "Active"
      : effectiveStatus === "paused"
      ? "Paused"
      : effectiveStatus === "expired"
      ? "Expired"
      : "Closed";

  return (
    <div
      className={clsx(
        "rounded-xl border bg-bg-surface p-5 relative transition-opacity",
        isExpired
          ? "border-slate-800/50 opacity-60"
          : "border-slate-800 card-hover"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        <div
          className={clsx(
            "w-20 h-20 rounded-lg overflow-hidden shrink-0",
            isExpired ? "bg-slate-800/50" : "bg-slate-800"
          )}
        >
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={title}
              className={clsx(
                "w-full h-full object-cover",
                isExpired && "grayscale"
              )}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600">
              <ImageIcon className="w-6 h-6" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3
                className={clsx(
                  "text-base font-bold truncate",
                  isExpired ? "text-slate-400" : "text-white"
                )}
              >
                {title}
              </h3>
              <p className="text-sm text-slate-400 mt-0.5">
                {businessName} &bull; {timeAgo(createdAt)}
              </p>
            </div>
          </div>

          {/* Role tag */}
          <span
            className={clsx(
              "inline-block mt-2 px-2.5 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider",
              isExpired
                ? "text-slate-500 bg-slate-800/50"
                : "text-primary bg-primary/10"
            )}
          >
            {formatRole(role)}
          </span>

          {/* Stats + Expiration row */}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-sm text-slate-400">
              <Eye className="w-4 h-4" />
              <span>{viewsCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-slate-400">
              <MessageSquare className="w-4 h-4" />
              <span>{inquiriesCount}</span>
            </div>

            {/* Countdown timer */}
            {!isExpired && expiration.label && effectiveStatus === "active" && (
              <div
                className={clsx(
                  "flex items-center gap-1 text-xs font-semibold ml-auto",
                  expiration.isExpiringSoon ? "text-amber-400" : "text-slate-500"
                )}
              >
                <Clock className="w-3 h-3" />
                {expiration.label}
              </div>
            )}
          </div>

          {/* Status badge + actions */}
          <div className="flex items-center gap-3 mt-3">
            <StatusBadge variant={statusVariant} dot>
              {statusLabel}
            </StatusBadge>

            {/* Renew button for expired listings */}
            {isExpired && onRenew && (
              <button
                onClick={() => onRenew(id)}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-white hover:bg-primary/90 transition-colors active:scale-[0.97]"
              >
                <RefreshCw className="w-3 h-3" />
                Renew &mdash; 14 Days
              </button>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-lg border border-slate-700 bg-slate-800 shadow-xl py-1">
                <Link
                  href={`/jobs/${id}`}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Listing
                </Link>

                {!isExpired && status === "active" && (
                  <button
                    onClick={() => {
                      onToggleStatus?.(id, "paused");
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    <Pause className="w-4 h-4" />
                    Pause Listing
                  </button>
                )}

                {!isExpired && status === "paused" && (
                  <button
                    onClick={() => {
                      onToggleStatus?.(id, "active");
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Reactivate
                  </button>
                )}

                <button
                  onClick={() => {
                    onDelete?.(id);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Listing
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
