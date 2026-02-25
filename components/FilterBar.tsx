"use client";

import { useState, useCallback } from "react";
import {
  Search,
  MapPin,
  X,
  List,
  Map,
  LocateFixed,
  SlidersHorizontal,
} from "lucide-react";
import { clsx } from "clsx";

interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void;
  onViewChange?: (view: "list" | "map") => void;
  currentView?: "list" | "map";
  locationName?: string;
  defaultRadius?: number;
}

export interface FilterState {
  search: string;
  service: string;
  schedule: string;
  compModel: string;
  city: string;
  radius: number;
  lat?: number;
  lng?: number;
}

const SERVICE_OPTIONS = [
  { value: "", label: "Any service" },
  { value: "barber", label: "Barber" },
  { value: "cosmetologist", label: "Hair Stylist" },
  { value: "tattoo_artist", label: "Tattoo Artist" },
  { value: "esthetician", label: "Esthetician" },
  { value: "nail_tech", label: "Nail Tech" },
  { value: "lash_tech", label: "Lash Tech" },
  { value: "piercer", label: "Piercer" },
];

const SCHEDULE_OPTIONS = [
  { value: "", label: "Any schedule" },
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
];

const COMP_OPTIONS = [
  { value: "", label: "Any compensation" },
  { value: "hourly", label: "Hourly" },
  { value: "commission", label: "Commission" },
  { value: "booth_rent", label: "Booth Rental" },
  { value: "hybrid", label: "Hybrid" },
];

export default function FilterBar({
  onFilterChange,
  onViewChange,
  currentView = "list",
  locationName,
  defaultRadius = 15,
}: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    service: "",
    schedule: "",
    compModel: "",
    city: "",
    radius: defaultRadius,
  });

  const updateFilter = useCallback(
    (key: keyof FilterState, value: string | number) => {
      const updated = { ...filters, [key]: value };
      setFilters(updated);
      onFilterChange(updated);
    },
    [filters, onFilterChange]
  );

  const resetFilters = () => {
    const reset: FilterState = {
      search: "",
      service: "",
      schedule: "",
      compModel: "",
      city: "",
      radius: defaultRadius,
    };
    setFilters(reset);
    onFilterChange(reset);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const updated = {
          ...filters,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setFilters(updated);
        onFilterChange(updated);
      },
      () => {
        // silently fail
      }
    );
  };

  return (
    <section className="rounded-xl border border-slate-800 bg-bg-surface p-4 space-y-4">
      {/* Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
        >
          {isOpen ? (
            <X className="w-4 h-4" />
          ) : (
            <SlidersHorizontal className="w-4 h-4" />
          )}
          Filters
        </button>
      </div>

      {isOpen && (
        <>
          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                placeholder="Search title or business"
                className="w-full bg-bg-input border-none rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Service */}
            <select
              value={filters.service}
              onChange={(e) => updateFilter("service", e.target.value)}
              className="w-full bg-bg-input border-none rounded-lg px-4 py-2.5 text-sm text-slate-300 appearance-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              {SERVICE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Schedule */}
            <select
              value={filters.schedule}
              onChange={(e) => updateFilter("schedule", e.target.value)}
              className="w-full bg-bg-input border-none rounded-lg px-4 py-2.5 text-sm text-slate-300 appearance-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              {SCHEDULE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Compensation */}
            <select
              value={filters.compModel}
              onChange={(e) => updateFilter("compModel", e.target.value)}
              className="w-full bg-bg-input border-none rounded-lg px-4 py-2.5 text-sm text-slate-300 appearance-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              {COMP_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Location Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-3 border-t border-slate-800/50">
            <div className="flex flex-wrap items-center gap-3">
              {/* City input */}
              <div className="flex items-center bg-bg-input rounded-lg px-3 py-2 border border-slate-800/30">
                <MapPin className="w-4 h-4 text-slate-400 mr-2" />
                <input
                  type="text"
                  value={filters.city}
                  onChange={(e) => updateFilter("city", e.target.value)}
                  placeholder="City (optional)"
                  className="bg-transparent border-none p-0 text-sm text-white placeholder-slate-500 focus:ring-0 w-32"
                />
              </div>

              {/* Current location display */}
              {locationName && (
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <MapPin className="w-4 h-4 text-primary" />
                  {locationName}
                </div>
              )}

              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-bg-input rounded-lg p-1 border border-slate-800/30">
                <button
                  onClick={() => onViewChange?.("list")}
                  className={clsx(
                    "p-1.5 rounded transition-colors",
                    currentView === "list"
                      ? "bg-slate-700 text-white"
                      : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onViewChange?.("map")}
                  className={clsx(
                    "p-1.5 rounded transition-colors",
                    currentView === "map"
                      ? "bg-slate-700 text-white"
                      : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  <Map className="w-4 h-4" />
                </button>
              </div>

              {/* Use My Location */}
              <button
                onClick={handleUseMyLocation}
                className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wide px-3 py-2 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
              >
                <LocateFixed className="w-3.5 h-3.5" />
                Use My Location
              </button>
            </div>

            {/* Radius + Actions */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-bg-input/50 px-4 py-2 rounded-lg border border-slate-800/30">
                <span className="text-xs font-medium text-slate-400 uppercase">
                  Radius
                </span>
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="5"
                  value={filters.radius}
                  onChange={(e) =>
                    updateFilter("radius", parseInt(e.target.value))
                  }
                  className="w-24 accent-primary"
                />
                <span className="text-sm font-bold text-white min-w-[40px]">
                  {filters.radius} mi
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
