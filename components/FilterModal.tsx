"use client";

import { useState, useEffect, useRef } from "react";
import { X, MapPin, Search } from "lucide-react";
import { clsx } from "clsx";
import Sheet from "./Sheet";

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
  "Poway", "El Cajon", "Santee", "La Mesa", "Coronado", "Imperial Beach",
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

// iOS-style chip button
function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "px-4 py-2 rounded-full text-[14px] font-semibold ios-press transition-colors",
        selected
          ? "bg-primary text-white"
          : "bg-elevated/60 text-fg-bright active:bg-elevated"
      )}
    >
      {children}
    </button>
  );
}

export default function FilterModal({
  isOpen, onClose, onApply, onUseMyLocation, userCity, initialFilters, resultCount,
}: FilterModalProps) {
  const [filters, setFilters] = useState<FilterModalState>({ ...DEFAULT_FILTERS, ...initialFilters });
  const [cityQuery, setCityQuery] = useState("");
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const cityInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFilters({ ...DEFAULT_FILTERS, ...initialFilters });
      setCityQuery("");
      setShowCitySuggestions(false);
    }
  }, [isOpen, initialFilters]);

  const addCity = (city: string) => {
    if (!filters.cities.includes(city)) {
      setFilters((prev) => ({ ...prev, cities: [...prev.cities, city] }));
    }
    setCityQuery("");
    setShowCitySuggestions(false);
  };

  const removeCity = (city: string) => {
    setFilters((prev) => ({ ...prev, cities: prev.cities.filter((c) => c !== city) }));
  };

  const toggleSpecialty = (s: string) => {
    setFilters((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(s)
        ? prev.specialties.filter((x) => x !== s)
        : [...prev.specialties, s],
    }));
  };
  const toggleComp = (c: string) => {
    setFilters((prev) => ({
      ...prev,
      compTypes: prev.compTypes.includes(c)
        ? prev.compTypes.filter((x) => x !== c)
        : [...prev.compTypes, c],
    }));
  };
  const toggleSchedule = (s: string) => {
    setFilters((prev) => ({
      ...prev,
      schedule: prev.schedule.includes(s)
        ? prev.schedule.filter((x) => x !== s)
        : [...prev.schedule, s],
    }));
  };
  const setIndustry = (val: string) => {
    setFilters((prev) => ({
      ...prev,
      industry: prev.industry === val ? "" : val,
      specialties:
        prev.industry === val
          ? []
          : prev.specialties.filter((s) =>
              (SPECIALTY_MAP[val] || []).some((opt) => opt.value === s)
            ),
    }));
  };

  const citySuggestions =
    cityQuery.length > 0
      ? CITIES.filter(
          (c) =>
            c.toLowerCase().startsWith(cityQuery.toLowerCase()) &&
            !filters.cities.includes(c)
        ).slice(0, 5)
      : [];

  const visibleSpecialties = filters.industry
    ? SPECIALTY_MAP[filters.industry] || []
    : ALL_SPECIALTIES;

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setCityQuery("");
  };

  return (
    <Sheet
      open={isOpen}
      onClose={onClose}
      title="Filters"
      leadingAction={{ label: "Reset", onClick: handleReset }}
      maxHeight="92vh"
    >
      <div className="flex flex-col h-full">
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* Use my location */}
          <button
            onClick={onUseMyLocation}
            className="flex items-center gap-2 w-full rounded-2xl bg-primary/15 px-4 py-3.5 text-[15px] font-semibold text-primary ios-press"
          >
            <MapPin className="w-[18px] h-[18px]" strokeWidth={2} />
            {userCity ? `Using: ${userCity}` : "Use My Current Location"}
          </button>

          {/* LOCATION */}
          <section>
            <h3 className="ios-section-header">Location</h3>
            <div className="space-y-3">
              {/* City search */}
              <div className="relative">
                <div className="ios-search-bar">
                  <Search className="w-[18px] h-[18px] text-fg-secondary" strokeWidth={2} />
                  <input
                    ref={cityInputRef}
                    type="text"
                    value={cityQuery}
                    onChange={(e) => {
                      setCityQuery(e.target.value);
                      setShowCitySuggestions(true);
                    }}
                    onFocus={() => setShowCitySuggestions(true)}
                    placeholder="Search city"
                  />
                </div>
                {/* Suggestions */}
                {showCitySuggestions && citySuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-surface overflow-hidden z-10 shadow-xl">
                    {citySuggestions.map((city, idx) => (
                      <button
                        key={city}
                        onClick={() => addCity(city)}
                        className={clsx(
                          "w-full text-left px-4 py-3 text-[15px] text-fg-strong active:bg-elevated transition-colors",
                          idx > 0 && "border-t border-line/50"
                        )}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected cities */}
              {filters.cities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {filters.cities.map((city) => (
                    <button
                      key={city}
                      onClick={() => removeCity(city)}
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/15 text-[13px] font-semibold text-primary ios-press"
                    >
                      {city}
                      <X className="w-3 h-3" strokeWidth={2.5} />
                    </button>
                  ))}
                </div>
              )}

              {/* Radius */}
              <div className="rounded-2xl bg-surface px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[15px] font-medium text-fg-strong">Radius</span>
                  <span className="text-[15px] font-semibold text-primary">{filters.radius} mi</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="5"
                  value={filters.radius}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, radius: parseInt(e.target.value) }))
                  }
                  className="w-full"
                />
              </div>
            </div>
          </section>

          {/* INDUSTRY + SPECIALTY */}
          <section>
            <h3 className="ios-section-header">Industry & Specialty</h3>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {INDUSTRY_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.value}
                    selected={filters.industry === opt.value}
                    onClick={() => setIndustry(opt.value)}
                  >
                    {opt.label}
                  </Chip>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {visibleSpecialties.map((spec) => (
                  <Chip
                    key={spec.value}
                    selected={filters.specialties.includes(spec.value)}
                    onClick={() => toggleSpecialty(spec.value)}
                  >
                    {spec.label}
                  </Chip>
                ))}
              </div>
            </div>
          </section>

          {/* COMPENSATION */}
          <section>
            <h3 className="ios-section-header">Compensation</h3>
            <div className="flex flex-wrap gap-2">
              {COMP_TYPES.map((comp) => (
                <Chip
                  key={comp.value}
                  selected={filters.compTypes.includes(comp.value)}
                  onClick={() => toggleComp(comp.value)}
                >
                  {comp.label}
                </Chip>
              ))}
            </div>
          </section>

          {/* SCHEDULE */}
          <section>
            <h3 className="ios-section-header">Schedule</h3>
            <div className="flex flex-wrap gap-2">
              {SCHEDULE_TYPES.map((sched) => (
                <Chip
                  key={sched.value}
                  selected={filters.schedule.includes(sched.value)}
                  onClick={() => toggleSchedule(sched.value)}
                >
                  {sched.label}
                </Chip>
              ))}
            </div>
          </section>

          {/* Bottom padding so apply button doesn't cover content */}
          <div className="h-4" />
        </div>

        {/* Sticky Apply Button */}
        <div className="ios-hairline-top px-4 pt-3 pb-2 bg-canvas">
          <button
            onClick={handleApply}
            className="w-full rounded-full bg-primary px-6 py-3.5 text-[17px] font-semibold text-white ios-press active:bg-primary-dark"
          >
            {resultCount !== undefined ? `Show ${resultCount} Results` : "Apply Filters"}
          </button>
        </div>
      </div>
    </Sheet>
  );
}
