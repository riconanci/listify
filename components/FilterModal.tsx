"use client";

import { useState, useEffect } from "react";
import { X, Check, MapPin } from "lucide-react";
import { clsx } from "clsx";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterModalState) => void;
  onUseMyLocation?: () => void;
  userCity?: string | null;
  initialFilters?: Partial<FilterModalState>;
  resultCount?: number;
}

export interface FilterModalState {
  cities: string[];
  radius: number;
  industry: string;
  specialties: string[];
  compTypes: string[];
  hourlyMin: number;
  hourlyMax: number;
  schedule: string[];
}

const CITIES = [
  "Encinitas", "Oceanside", "Carlsbad", "San Marcos", "Vista", "Escondido",
  "San Diego", "La Jolla", "Del Mar", "Solana Beach", "Chula Vista", "National City",
];

const INDUSTRY_OPTIONS = [
  { value: "hair", label: "Hair" },
  { value: "tattoo", label: "Tattoo & Piercing" },
];

const SPECIALTY_MAP: Record<string, { value: string; label: string }[]> = {
  hair: [
    { value: "barber", label: "Barber" },
    { value: "cosmetologist", label: "Cosmetologist" },
  ],
  tattoo: [
    { value: "tattoo_artist", label: "Tattoo Artist" },
    { value: "piercer", label: "Piercer" },
  ],
};

const ALL_SPECIALTIES = [
  { value: "barber", label: "Barber" },
  { value: "cosmetologist", label: "Cosmetologist" },
  { value: "tattoo_artist", label: "Tattoo Artist" },
  { value: "piercer", label: "Piercer" },
];

const COMP_TYPES = [
  { value: "hourly", label: "Hourly" },
  { value: "commission", label: "Commission" },
  { value: "booth_rent", label: "Booth Rent" },
  { value: "hybrid", label: "Hybrid" },
];

const SCHEDULE_TYPES = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
];

const DEFAULT_FILTERS: FilterModalState = {
  cities: [],
  radius: 25,
  industry: "",
  specialties: [],
  compTypes: [],
  hourlyMin: 20,
  hourlyMax: 100,
  schedule: [],
};

export default function FilterModal({
  isOpen, onClose, onApply, onUseMyLocation, userCity, initialFilters, resultCount,
}: FilterModalProps) {
  const [filters, setFilters] = useState<FilterModalState>({ ...DEFAULT_FILTERS, ...initialFilters });

  useEffect(() => {
    if (isOpen) setFilters({ ...DEFAULT_FILTERS, ...initialFilters });
  }, [isOpen, initialFilters]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const toggleCity = (city: string) => {
    setFilters((prev) => ({ ...prev, cities: prev.cities.includes(city) ? prev.cities.filter((c) => c !== city) : [...prev.cities, city] }));
  };
  const toggleSpecialty = (s: string) => {
    setFilters((prev) => ({ ...prev, specialties: prev.specialties.includes(s) ? prev.specialties.filter((x) => x !== s) : [...prev.specialties, s] }));
  };
  const toggleComp = (c: string) => {
    setFilters((prev) => ({ ...prev, compTypes: prev.compTypes.includes(c) ? prev.compTypes.filter((x) => x !== c) : [...prev.compTypes, c] }));
  };
  const toggleSchedule = (s: string) => {
    setFilters((prev) => ({ ...prev, schedule: prev.schedule.includes(s) ? prev.schedule.filter((x) => x !== s) : [...prev.schedule, s] }));
  };
  const setIndustry = (val: string) => {
    setFilters((prev) => ({
      ...prev,
      industry: prev.industry === val ? "" : val,
      specialties: prev.industry === val ? [] : prev.specialties.filter((s) => (SPECIALTY_MAP[val] || []).some((opt) => opt.value === s)),
    }));
  };

  const visibleSpecialties = filters.industry ? SPECIALTY_MAP[filters.industry] || [] : ALL_SPECIALTIES;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg-base">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <button onClick={() => setFilters(DEFAULT_FILTERS)} className="text-sm font-semibold text-primary hover:text-primary-light transition-colors">Reset</button>
        <h2 className="text-base font-bold text-white">Filters</h2>
        <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"><X className="w-5 h-5" /></button>
      </div>

      {/* Scrollable Content — compact spacing */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 pb-24">

        {/* USE MY LOCATION — always first, always visible */}
        <button
          onClick={onUseMyLocation}
          className="flex items-center gap-2 w-full rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
        >
          <MapPin className="w-4 h-4" />
          {userCity ? `Using: ${userCity}` : "Use My Current Location"}
        </button>

        {/* LOCATION */}
        <section>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Location</h3>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {CITIES.slice(0, 8).map((city) => {
                const selected = filters.cities.includes(city);
                return (
                  <button key={city} onClick={() => toggleCity(city)} className={clsx("px-3 py-1.5 rounded-full text-xs font-medium transition-colors", selected ? "bg-primary/10 border border-primary/20 text-primary" : "bg-slate-800 border border-slate-700 text-slate-300 hover:border-slate-600")}>
                    {city}
                  </button>
                );
              })}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">Radius</span>
                <span className="text-xs font-bold text-primary">{filters.radius} mi</span>
              </div>
              <input type="range" min="5" max="40" step="5" value={filters.radius} onChange={(e) => setFilters((prev) => ({ ...prev, radius: parseInt(e.target.value) }))} className="w-full" />
            </div>
          </div>
        </section>

        <div className="border-t border-slate-800" />

        {/* INDUSTRY + SPECIALTY — combined section */}
        <section>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Industry & Specialty</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              {INDUSTRY_OPTIONS.map((opt) => {
                const selected = filters.industry === opt.value;
                return (
                  <button key={opt.value} onClick={() => setIndustry(opt.value)} className={clsx("px-3 py-2 rounded-lg text-xs font-semibold transition-colors", selected ? "bg-primary text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700")}>
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2">
              {visibleSpecialties.map((spec) => {
                const selected = filters.specialties.includes(spec.value);
                return (
                  <button key={spec.value} onClick={() => toggleSpecialty(spec.value)} className={clsx("px-3 py-2 rounded-lg text-xs font-semibold transition-colors", selected ? "bg-primary text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700")}>
                    {spec.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <div className="border-t border-slate-800" />

        {/* COMPENSATION */}
        <section>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Compensation</h3>
          <div className="flex flex-wrap gap-2">
            {COMP_TYPES.map((comp) => {
              const selected = filters.compTypes.includes(comp.value);
              return (
                <button key={comp.value} onClick={() => toggleComp(comp.value)} className={clsx("px-3 py-2 rounded-lg text-xs font-semibold transition-colors", selected ? "bg-primary text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700")}>
                  {comp.label}
                </button>
              );
            })}
          </div>
        </section>

        <div className="border-t border-slate-800" />

        {/* SCHEDULE */}
        <section>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Schedule</h3>
          <div className="flex gap-2">
            {SCHEDULE_TYPES.map((sched) => {
              const selected = filters.schedule.includes(sched.value);
              return (
                <button key={sched.value} onClick={() => toggleSchedule(sched.value)} className={clsx("px-3 py-2 rounded-lg text-xs font-semibold transition-colors", selected ? "bg-primary text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700")}>
                  {sched.label}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* Sticky Apply Button */}
      <div className="border-t border-slate-800 bg-bg-base px-4 pt-3 pb-24">
        <button
          onClick={() => { onApply(filters); onClose(); }}
          className="w-full rounded-xl bg-primary px-8 py-4 text-base font-bold text-white shadow-xl shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98]"
        >
          {resultCount !== undefined ? `Show ${resultCount} Results` : "Apply Filters"}
        </button>
      </div>
    </div>
  );
}
