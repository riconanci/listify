"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import FilterBar, { FilterState } from "@/components/FilterBar";
import FilterModal from "@/components/FilterModal";
import ListHeader from "@/components/ListHeader";
import JobCard from "@/components/JobCard";
import EmptyState from "@/components/EmptyState";
import { ChevronLeft, ChevronRight, SlidersHorizontal, Map, List } from "lucide-react";
import { clsx } from "clsx";

const BrowseMap = dynamic(() => import("@/components/BrowseMap"), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-slate-800 overflow-hidden h-[500px] md:h-[600px] bg-slate-800 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

interface Job {
  id: string;
  businessName: string;
  title: string;
  role: string;
  schedule: string | null;
  compModel: string;
  payMin: number | null;
  payMax: number | null;
  payUnit: string | null;
  experienceText: string | null;
  status: string;
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
      if (f.service) params.set("service", f.service);
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
        // Client-side pagination for list view
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

  // Location detection function (reusable for FilterModal)
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setFilters((prev) => ({ ...prev, lat: latitude, lng: longitude }));

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
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

  // Initial location detection
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

  return (
    <main className="min-h-[calc(100dvh-4rem)] page-with-nav">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Filter Bar (desktop) */}
        <div className="hidden md:block">
          <FilterBar
            onFilterChange={handleFilterChange}
            onViewChange={setCurrentView}
            currentView={currentView}
            locationName={locationName}
            defaultRadius={filters.radius}
          />
        </div>

        {/* Mobile filter button + view toggle */}
        <div className="md:hidden flex items-center justify-between">
          <h1 className="text-xl font-black text-white">Browse Listings</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setCurrentView((v) => (v === "list" ? "map" : "list"))
              }
              className="flex items-center justify-center w-9 h-9 rounded-lg border border-slate-700 bg-bg-surface text-slate-300 hover:text-white transition-colors"
              title={currentView === "list" ? "Map view" : "List view"}
            >
              {currentView === "list" ? (
                <Map className="w-4 h-4" />
              ) : (
                <List className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setFilterModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-bg-surface px-3 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Filter Modal (mobile) */}
        <FilterModal
          isOpen={filterModalOpen}
          onClose={() => setFilterModalOpen(false)}
          onUseMyLocation={detectLocation}
          userCity={locationName || null}
          onApply={(modalFilters) => {
            const updated = {
              ...filters,
              service: modalFilters.serviceTypes[0] || "",
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

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-xl shimmer"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        )}

        {/* Results */}
        {!loading && jobs.length > 0 && currentView === "list" && (
          <div className="rounded-xl border border-slate-800 overflow-hidden">
            {/* Desktop Table Header */}
            <ListHeader />

            {/* Job List */}
            <div>
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  id={job.id}
                  businessName={job.businessName || "Business"}
                  title={job.title}
                  role={job.role}
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
        )}

        {/* Map View */}
        {!loading && allJobs.length > 0 && currentView === "map" && (
          <BrowseMap
            jobs={allJobs
              .filter((j) => j.location?.lat && j.location?.lng)
              .map((j) => ({
                id: j.id,
                businessName: j.businessName || "Business",
                title: j.title,
                role: j.role,
                compModel: j.compModel,
                payMin: j.payMin ? Number(j.payMin) : null,
                payMax: j.payMax ? Number(j.payMax) : null,
                payUnit: j.payUnit,
                lat: j.location!.lat!,
                lng: j.location!.lng!,
                city: j.location?.city,
              }))}
            userLat={filters.lat}
            userLng={filters.lng}
          />
        )}

        {/* Empty State */}
        {!loading && allJobs.length === 0 && (
          <EmptyState onClearFilters={handleClearFilters} />
        )}

        {/* Pagination (list view only) */}
        {!loading && totalPages > 1 && currentView === "list" && (
          <div className="flex items-center justify-center gap-2 py-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
                    "w-10 h-10 rounded-lg text-sm font-bold transition-colors",
                    page === pageNum
                      ? "bg-primary text-white"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
