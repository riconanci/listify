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

function getExpirationInfo(expiresAt?: string | null) {
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
    return { isExpired: false, isExpiringSoon: true, daysLeft: 1, label: "1d left" };
  }
  if (daysLeft <= 3) {
    return { isExpired: false, isExpiringSoon: true, daysLeft, label: `${daysLeft}d left` };
  }
  return { isExpired: false, isExpiringSoon: false, daysLeft, label: `${daysLeft}d left` };
}

export default function ManageListingCard({
  id,
  title,
  businessName,
  role,
  status,
  viewsCount,
  inquiriesCount,
  expiresAt,
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
        "rounded-xl border bg-bg-surface relative transition-opacity",
        isExpired
          ? "border-slate-800/50 opacity-60"
          : "border-slate-800 card-hover"
      )}
    >
      {/* Main content */}
      <div className="px-4 py-4">
        {/* Row 1: Title + menu */}
        <div className="flex items-start justify-between gap-2">
          <Link href={`/jobs/${id}`} className="flex-1 min-w-0">
            <h3
              className={clsx(
                "text-[15px] font-bold leading-snug line-clamp-2",
                isExpired ? "text-slate-400" : "text-white"
              )}
            >
              {title}
            </h3>
          </Link>

          {/* Menu */}
          <div className="relative shrink-0">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 -mr-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
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

        {/* Row 2: Business · Role */}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-sm text-slate-400 truncate">
            {businessName}
          </span>
          <span className="text-slate-600">&middot;</span>
          <span
            className={clsx(
              "text-[10px] font-bold uppercase tracking-wider shrink-0",
              isExpired ? "text-slate-500" : "text-primary"
            )}
          >
            {formatRole(role)}
          </span>
        </div>

        {/* Row 3: Status + countdown + stats — all one line */}
        <div className="flex items-center gap-3 mt-3">
          <StatusBadge variant={statusVariant} dot>
            {statusLabel}
          </StatusBadge>

          {/* Countdown */}
          {!isExpired && expiration.label && effectiveStatus === "active" && (
            <div
              className={clsx(
                "flex items-center gap-1 text-[11px] font-semibold",
                expiration.isExpiringSoon ? "text-amber-400" : "text-slate-500"
              )}
            >
              <Clock className="w-3 h-3" />
              {expiration.label}
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Stats */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Eye className="w-3.5 h-3.5" />
              <span>{viewsCount}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{inquiriesCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Renew bar for expired listings */}
      {isExpired && onRenew && (
        <div className="border-t border-slate-800/50 px-4 py-3">
          <button
            onClick={() => onRenew(id)}
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-colors active:scale-[0.98]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Renew Listing &mdash; 14 Days
          </button>
        </div>
      )}
    </div>
  );
}
