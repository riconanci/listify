"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, ImageIcon, Bookmark } from "lucide-react";
import { clsx } from "clsx";

interface JobCardProps {
  id: string;
  businessName: string;
  title: string;
  role: string;
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
  if (compModel === "commission") {
    if (payMin && payMax && payMin !== payMax) return `${payMin}-${payMax}% Commission`;
    if (payMin) return `${payMin}% Commission`;
    return "Commission";
  }
  if (compModel === "booth_rent") {
    if (payMin && payMax && payMin !== payMax)
      return `$${payMin}-$${payMax}${payUnit || "/wk"}`;
    if (payMin) return `$${payMin}${payUnit || "/wk"}`;
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
  // Hourly
  if (payMin && payMax && payMin !== payMax)
    return `$${payMin}-$${payMax}/hr`;
  if (payMin) return `$${payMin}/hr`;
  return "Hourly";
}

export default function JobCard({
  id,
  businessName,
  title,
  role,
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
          role,
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
    <Link
      href={`/jobs/${id}`}
      className="group block"
    >
      {/* Desktop Row View */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-5 hover:bg-slate-800/40 transition-colors items-center border-b border-slate-800/50">
        {/* Business & Title */}
        <div className="col-span-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-800 shrink-0">
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
        {/* Service */}
        <div className="col-span-1 text-sm text-slate-300">{formatRole(role)}</div>
        {/* Schedule */}
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
        {/* Experience */}
        <div className="col-span-1 text-sm text-slate-300">
          {experienceText || "—"}
        </div>
        {/* Compensation */}
        <div className="col-span-2 text-sm text-slate-300 font-medium">
          {formatCompensation(compModel, payMin, payMax, payUnit)}
        </div>
        {/* Location + Save */}
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

      {/* Mobile Card View */}
      <div className="md:hidden flex items-center gap-4 px-4 py-4 border-b border-slate-800/50 active:bg-slate-800/30 transition-colors">
        <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-800 shrink-0">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={businessName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600">
              <ImageIcon className="w-5 h-5" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white truncate">
            {businessName}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 truncate">{title}</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-2 text-xs">
            <span className="text-slate-400">{formatRole(role)}</span>
            <span className="text-slate-600">•</span>
            {formattedSchedule && (
              <>
                <span
                  className={clsx(
                    "font-bold",
                    isFullTime ? "text-primary" : "text-slate-300"
                  )}
                >
                  {formattedSchedule}
                </span>
                <span className="text-slate-600">•</span>
              </>
            )}
            <span className="text-slate-300 font-medium">
              {formatCompensation(compModel, payMin, payMax, payUnit)}
            </span>
          </div>
          {city && (
            <div className="flex items-center gap-1 mt-1.5">
              <MapPin className="w-3 h-3 text-slate-500" />
              <span className="text-[11px] text-slate-500">{city}, {state || "CA"}</span>
            </div>
          )}
        </div>
        <button
          onClick={toggleSave}
          className="p-2 rounded-lg text-slate-500 hover:text-primary transition-colors shrink-0"
          title={saved ? "Remove from saved" : "Save listing"}
        >
          <Bookmark
            className="w-5 h-5"
            fill={saved ? "currentColor" : "none"}
          />
        </button>
      </div>
    </Link>
  );
}
