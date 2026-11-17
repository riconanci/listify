"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Trash2 } from "lucide-react";
import JobCard from "@/components/JobCard";
import LargeTitle from "@/components/LargeTitle";

interface SavedJob {
  id: string;
  businessName: string;
  title: string;
  role: string;
  specialties?: string[];
  schedule: string | null;
  compModel: string;
  payMin: number | null;
  payMax: number | null;
  payUnit: string | null;
  experienceText: string | null;
  city: string | null;
  state: string | null;
  photoUrl: string | null;
  savedAt: number;
}

export default function SavedPage() {
  const router = useRouter();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("listify-saved");
      if (raw) {
        const parsed: SavedJob[] = JSON.parse(raw);
        parsed.sort((a, b) => b.savedAt - a.savedAt);
        setSavedJobs(parsed);
      }
    } catch {
      // Invalid data
    }
    setLoading(false);
  }, []);

  const removeSaved = (id: string) => {
    const updated = savedJobs.filter((j) => j.id !== id);
    setSavedJobs(updated);
    localStorage.setItem("listify-saved", JSON.stringify(updated));
  };

  const clearAll = () => {
    if (!confirm("Clear all saved listings?")) return;
    setSavedJobs([]);
    localStorage.removeItem("listify-saved");
  };

  if (loading) {
    return (
      <main className="min-h-[calc(100dvh-3.5rem)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  const subtitle =
    savedJobs.length === 0
      ? "Listings you've bookmarked"
      : `${savedJobs.length} ${savedJobs.length === 1 ? "listing" : "listings"}`;

  return (
    <main className="min-h-[calc(100dvh-3.5rem)] page-with-nav">
      <LargeTitle
        title="Saved"
        subtitle={subtitle}
        action={
          savedJobs.length > 0
            ? {
                label: "Clear All",
                onClick: clearAll,
                ariaLabel: "Clear all saved listings",
              }
            : undefined
        }
      />

      <div className="max-w-3xl mx-auto md:px-6">
        {savedJobs.length > 0 ? (
          <>
            {/* Desktop */}
            <div className="hidden md:block rounded-xl border border-line-subtle overflow-hidden">
              {savedJobs.map((job) => (
                <div key={job.id} className="relative group">
                  <JobCard
                    id={job.id}
                    businessName={job.businessName}
                    title={job.title}
                    specialties={job.specialties || (job.role ? [job.role] : [])}
                    schedule={job.schedule}
                    compModel={job.compModel}
                    payMin={job.payMin}
                    payMax={job.payMax}
                    payUnit={job.payUnit}
                    experienceText={job.experienceText}
                    city={job.city}
                    state={job.state}
                    photoUrl={job.photoUrl}
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeSaved(job.id);
                    }}
                    className="absolute top-3 right-3 flex items-center justify-center w-9 h-9 rounded-full bg-surface/80 text-fg-secondary hover:text-danger-fg hover:bg-danger/10 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Mobile */}
            <div className="md:hidden">
              {savedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  id={job.id}
                  businessName={job.businessName}
                  title={job.title}
                  specialties={job.specialties || (job.role ? [job.role] : [])}
                  schedule={job.schedule}
                  compModel={job.compModel}
                  payMin={job.payMin}
                  payMax={job.payMax}
                  payUnit={job.payUnit}
                  experienceText={job.experienceText}
                  city={job.city}
                  state={job.state}
                  photoUrl={job.photoUrl}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-20 h-20 rounded-full bg-surface/60 flex items-center justify-center mb-5">
              <Bookmark className="w-9 h-9 text-fg-faint" strokeWidth={1.5} />
            </div>
            <h2 className="ios-title-2 text-fg-strong">No saved listings</h2>
            <p className="ios-subheadline text-fg-secondary mt-2 max-w-xs">
              Tap the bookmark icon on any listing to save it here for later.
            </p>
            <button
              onClick={() => router.push("/jobs")}
              className="mt-7 rounded-full bg-primary px-6 h-12 text-[17px] font-semibold text-white ios-press active:bg-primary-dark transition-colors"
            >
              Browse Listings
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
