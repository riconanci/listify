"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, ImageIcon, Bookmark } from "lucide-react";
import { clsx } from "clsx";

interface JobCardProps {
  id: string;
  businessName: string;
  title: string;
  specialties: string[];
  schedule?: string | null;
  compModel: string;
  payMin?: number | null;
  payMax?: number | null;
  payUnit?: string | null;
  experienceText?: string | null;
  city?: string | null;
  state?: string | null;
  photoUrl?: string | null;
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

function formatCompensation(
  compModel: string,
  payMin?: number | null,
  payMax?: number | null,
  payUnit?: string | null
): string {
  const unit = payUnit?.replace(/^\$/, "") || "";

  if (compModel === "commission") {
    if (payMin && payMax && payMin !== payMax) return `${payMin}-${payMax}% Commission`;
    if (payMin) return `${payMin}% Commission`;
    return "Commission";
  }
  if (compModel === "booth_rent") {
    if (payMin && payMax && payMin !== payMax)
      return `$${payMin}-$${payMax}${unit || "/wk"}`;
    if (payMin) return `$${payMin}${unit || "/wk"}`;
    return "Booth Rent";
  }
  if (compModel === "hybrid") {
    const wage = payMin ? `$${payMin}/hr` : "";
    const comm = payMax ? `${payMax}%` : "";
    if (wage && comm) return `${wage} + ${comm}`;
    if (wage) return wage;
    if (comm) return comm;
    return "Hourly + Comm";
  }
  if (payMin && payMax && payMin !== payMax)
    return `$${payMin}-$${payMax}/hr`;
  if (payMin) return `$${payMin}/hr`;
  return "Hourly";
}

export default function JobCard({
  id,
  businessName,
  title,
  specialties,
  schedule,
  compModel,
  payMin,
  payMax,
  payUnit,
  experienceText,
  city,
  state,
  photoUrl,
}: JobCardProps) {
  const formattedSchedule = formatSchedule(schedule);
  const isFullTime = schedule === "full_time";
  const specLabel = specialties.map(formatRole).join(" · ");
  const payDisplay = formatCompensation(compModel, payMin, payMax, payUnit);

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("listify-saved");
      if (raw) {
        const list = JSON.parse(raw);
        setSaved(list.some((j: any) => j.id === id));
      }
    } catch {}
  }, [id]);

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const raw = localStorage.getItem("listify-saved");
      let list = raw ? JSON.parse(raw) : [];
      if (saved) {
        list = list.filter((j: any) => j.id !== id);
      } else {
        list.push({
          id,
          businessName,
          title,
          specialties,
          schedule,
          compModel,
          payMin,
          payMax,
          payUnit,
          experienceText,
          city,
          state,
          photoUrl,
          savedAt: Date.now(),
        });
      }
      localStorage.setItem("listify-saved", JSON.stringify(list));
      setSaved(!saved);
    } catch {}
  };

  return (
    <Link href={`/jobs/${id}`} className="group block">
      {/* Desktop Row View — preserved */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-5 hover:bg-slate-800/40 transition-colors items-center border-b border-slate-800/50">
        <div className="col-span-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 shrink-0">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={businessName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-600">
                <ImageIcon className="w-5 h-5" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white truncate">
              {businessName}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 truncate">{title}</p>
          </div>
        </div>
        <div className="col-span-1 text-sm text-slate-300">{specLabel}</div>
        <div className="col-span-2 text-center">
          {formattedSchedule && (
            <span
              className={clsx(
                "px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider",
                isFullTime
                  ? "bg-primary/10 text-primary"
                  : "bg-slate-700/50 text-slate-300"
              )}
            >
              {formattedSchedule}
            </span>
          )}
        </div>
        <div className="col-span-1 text-sm text-slate-300">
          {experienceText || "—"}
        </div>
        <div className="col-span-2 text-sm text-slate-300 font-medium">
          {payDisplay}
        </div>
        <div className="col-span-2 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {city && state ? `${city}, ${state}` : city || "—"}
          </span>
          <button
            onClick={toggleSave}
            className="p-1.5 rounded-lg text-slate-500 hover:text-primary transition-colors"
            title={saved ? "Remove from saved" : "Save listing"}
          >
            <Bookmark
              className="w-4 h-4"
              fill={saved ? "currentColor" : "none"}
            />
          </button>
        </div>
      </div>

      {/* Mobile iOS Card View — redesigned */}
      <div className="md:hidden mx-4 mb-3 rounded-2xl bg-bg-surface overflow-hidden ios-press active:bg-slate-800/60 transition-colors">
        <div className="flex gap-3 p-3.5">
          <div className="w-[88px] h-[88px] rounded-xl overflow-hidden bg-slate-800 shrink-0">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={businessName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-600">
                <ImageIcon className="w-7 h-7" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="ios-headline text-white truncate">
                  {businessName}
                </h3>
                <p className="ios-footnote text-slate-400 mt-0.5 truncate">
                  {title}
                </p>
              </div>
              <button
                onClick={toggleSave}
                className="-mt-1 -mr-1 p-1.5 rounded-full text-slate-500 active:text-primary transition-colors shrink-0"
                aria-label={saved ? "Remove from saved" : "Save listing"}
              >
                <Bookmark
                  className="w-[18px] h-[18px]"
                  fill={saved ? "currentColor" : "none"}
                  strokeWidth={2}
                />
              </button>
            </div>

            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="ios-subheadline font-semibold text-white">
                {payDisplay}
              </span>
              {formattedSchedule && (
                <>
                  <span className="text-slate-600">·</span>
                  <span
                    className={clsx(
                      "ios-footnote font-semibold",
                      isFullTime ? "text-primary" : "text-slate-400"
                    )}
                  >
                    {formattedSchedule}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5 mt-auto pt-1.5">
              <span className="text-[11px] font-semibold text-primary truncate">
                {specLabel}
              </span>
              {city && (
                <>
                  <span className="text-slate-600 text-[11px]">·</span>
                  <div className="flex items-center gap-0.5 min-w-0">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" strokeWidth={2.2} />
                    <span className="text-[11px] text-slate-500 truncate">
                      {city}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
