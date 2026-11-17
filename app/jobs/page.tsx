"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import FilterBar, { FilterState } from "@/components/FilterBar";
import FilterModal from "@/components/FilterModal";
import ListHeader from "@/components/ListHeader";
import JobCard from "@/components/JobCard";
import EmptyState from "@/components/EmptyState";
import LargeTitle from "@/components/LargeTitle";
import { resolveDisplayCoords } from "@/lib/cityCentroids";
import {
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Map,
  List,
  Search as SearchIcon,
} from "lucide-react";
import { clsx } from "clsx";

const BrowseMap = dynamic(() => import("@/components/BrowseMap"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl overflow-hidden h-[500px] md:h-[600px] bg-surface flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

interface Job {
  id: string;
  businessName: string;
  title: string;
  industry: string;
  specialties: string[];
  schedule: string | null;
  compModel: string;
  payMin: number | null;
  payMax: number | null;
  payUnit: string | null;
  experienceText: string | null;
  status: string;
  addressVisible?: boolean;
  location: {
    lat: number | null;
    lng: number | null;
    city: string | null;
    state: string | null;
  } | null;
  photos: { url: string }[];
}

const PAGE_SIZE = 10;

export default function BrowseListingsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<"list" | "map">("list");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [locationName, setLocationName] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    service: "",
    schedule: "",
    compModel: "",
    city: "",
    radius: 15,
  });
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const fetchJobs = useCallback(async (f: FilterState, p: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.search) params.set("search", f.search);
      if ((f as any).industry) params.set("industry", (f as any).industry);
      if ((f as any).specialty) params.set("specialty", (f as any).specialty);
      if (f.service) params.set("specialty", f.service);
      if (f.schedule) params.set("schedule", f.schedule);
      if (f.compModel) params.set("compModel", f.compModel);
      if (f.city) params.set("city", f.city);
      if (f.lat) params.set("lat", String(f.lat));
      if (f.lng) params.set("lng", String(f.lng));
      if (f.radius) params.set("radius", String(f.radius));

      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setAllJobs(data);
        setTotalCount(data.length);
        const start = (p - 1) * PAGE_SIZE;
        setJobs(data.slice(start, start + PAGE_SIZE));
      } else if (data.jobs) {
        setAllJobs(data.jobs);
        setTotalCount(data.total || data.jobs.length);
        setJobs(data.jobs);
      }
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setFilters((prev) => ({ ...prev, lat: latitude, lng: longitude }));
        try {
          const res = await fetch(
            `/api/geocode?lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          if (data.address) {
            const name = [
              data.address.road || data.address.neighbourhood,
              data.address.city || data.address.town,
            ]
              .filter(Boolean)
              .join(", ");
            setLocationName(name);
          }
        } catch {
          setLocationName("San Diego, CA");
        }
      },
      () => {
        setLocationName("San Diego, CA");
      }
    );
  }, []);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  useEffect(() => {
    fetchJobs(filters, page);
  }, [filters, page, fetchJobs]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleClearFilters = () => {
    const reset: FilterState = {
      search: "",
      service: "",
      schedule: "",
      compModel: "",
      city: "",
      radius: 15,
    };
    setFilters(reset);
    setPage(1);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const subtitle = locationName
    ? `${totalCount} ${totalCount === 1 ? "listing" : "listings"} near ${locationName}`
    : `${totalCount} ${totalCount === 1 ? "listing" : "listings"}`;

  return (
    <main className="min-h-[calc(100dvh-3.5rem)] page-with-nav">
      {/* Desktop Filter Bar */}
      <div className="hidden md:block max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <FilterBar
          onFilterChange={handleFilterChange}
          onViewChange={setCurrentView}
          currentView={currentView}
          locationName={locationName}
          defaultRadius={filters.radius}
        />
      </div>

      {/* Mobile iOS Header */}
      <div className="md:hidden">
        <LargeTitle title="Browse" subtitle={loading ? "Loading..." : subtitle} />

        {/* Search + filter row */}
        <div className="pl-4 pr-5 pb-3 flex items-center gap-2">
          <div className="ios-search-bar flex-1 min-w-0">
            <SearchIcon className="w-[18px] h-[18px] text-fg-secondary shrink-0" strokeWidth={2} />
            <input
              type="text"
              value={filters.search}
              onChange={(e) =>
                handleFilterChange({ ...filters, search: e.target.value })
              }
              placeholder="Search listings"
            />
          </div>
          <button
            onClick={() => setFilterModalOpen(true)}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/15 text-primary ios-press shrink-0"
            aria-label="Filters"
          >
            <SlidersHorizontal className="w-[18px] h-[18px]" strokeWidth={2} />
          </button>
          <button
            onClick={() =>
              setCurrentView((v) => (v === "list" ? "map" : "list"))
            }
            className={clsx(
              "flex items-center justify-center w-9 h-9 rounded-full shrink-0 ios-press",
              currentView === "map"
                ? "bg-yellow-500/15 text-yellow-400"
                : "bg-elevated/60 text-fg-bright"
            )}
            aria-label={currentView === "list" ? "Map view" : "List view"}
          >
            {currentView === "list" ? (
              <Map className="w-[18px] h-[18px]" strokeWidth={2} />
            ) : (
              <List className="w-[18px] h-[18px]" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        onUseMyLocation={detectLocation}
        userCity={locationName || null}
        onApply={(modalFilters) => {
          const updated: any = {
            ...filters,
            industry: modalFilters.industry || "",
            specialty: modalFilters.specialties.join(",") || "",
            service: "",
            schedule: modalFilters.schedule[0] || "",
            compModel: modalFilters.compTypes[0] || "",
            city: modalFilters.cities[0] || "",
            radius: modalFilters.radius,
          };
          setFilters(updated);
          handleFilterChange(updated);
        }}
        resultCount={totalCount}
      />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-0 md:px-6 md:pb-6">
        {/* Loading State */}
        {loading && (
          <div className="space-y-3 px-4 md:px-0 mt-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-[120px] rounded-2xl shimmer md:h-20 md:rounded-xl"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        )}

        {/* Results — Desktop: table-like in border. Mobile: stacked cards */}
        {!loading && jobs.length > 0 && currentView === "list" && (
          <>
            {/* Desktop */}
            <div className="hidden md:block rounded-xl border border-line-subtle overflow-hidden">
              <ListHeader />
              <div>
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    id={job.id}
                    businessName={job.businessName || "Business"}
                    title={job.title}
                    specialties={job.specialties || []}
                    schedule={job.schedule}
                    compModel={job.compModel}
                    payMin={job.payMin ? Number(job.payMin) : null}
                    payMax={job.payMax ? Number(job.payMax) : null}
                    payUnit={job.payUnit}
                    experienceText={job.experienceText}
                    city={job.location?.city}
                    state={job.location?.state}
                    photoUrl={job.photos?.[0]?.url || null}
                  />
                ))}
              </div>
            </div>

            {/* Mobile */}
            <div className="md:hidden">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  id={job.id}
                  businessName={job.businessName || "Business"}
                  title={job.title}
                  specialties={job.specialties || []}
                  schedule={job.schedule}
                  compModel={job.compModel}
                  payMin={job.payMin ? Number(job.payMin) : null}
                  payMax={job.payMax ? Number(job.payMax) : null}
                  payUnit={job.payUnit}
                  experienceText={job.experienceText}
                  city={job.location?.city}
                  state={job.location?.state}
                  photoUrl={job.photos?.[0]?.url || null}
                />
              ))}
            </div>
          </>
        )}

        {/* Map View */}
        {!loading && allJobs.length > 0 && currentView === "map" && (
          <div className="px-4 md:px-0">
            <BrowseMap
              jobs={allJobs
                .map((j) => {
                  const display = resolveDisplayCoords({
                    lat: j.location?.lat,
                    lng: j.location?.lng,
                    city: j.location?.city,
                    addressVisible: (j as any).addressVisible,
                  });
                  if (!display) return null;
                  return {
                    id: j.id,
                    businessName: j.businessName || "Business",
                    title: j.title,
                    specialties: j.specialties || [],
                    compModel: j.compModel,
                    payMin: j.payMin ? Number(j.payMin) : null,
                    payMax: j.payMax ? Number(j.payMax) : null,
                    payUnit: j.payUnit,
                    lat: display.lat,
                    lng: display.lng,
                    city: j.location?.city,
                    isApproximate: display.isApproximate,
                  };
                })
                .filter((j): j is NonNullable<typeof j> => j !== null)}
              userLat={filters.lat}
              userLng={filters.lng}
              radiusMiles={filters.radius || 15}
            />
          </div>
        )}

        {/* Empty State */}
        {!loading && allJobs.length === 0 && (
          <div className="px-4 md:px-0 mt-3">
            <EmptyState onClearFilters={handleClearFilters} />
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && currentView === "list" && (
          <div className="flex items-center justify-center gap-2 py-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-full text-fg-secondary active:bg-surface disabled:opacity-30 ios-press transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={clsx(
                    "w-10 h-10 rounded-full text-[15px] font-semibold ios-press transition-colors",
                    page === pageNum
                      ? "bg-primary text-white"
                      : "text-fg-secondary active:bg-surface"
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-full text-fg-secondary active:bg-surface disabled:opacity-30 ios-press transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
