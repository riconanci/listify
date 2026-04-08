"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, ChevronLeft, Trash2 } from "lucide-react";
import JobCard from "@/components/JobCard";

interface SavedJob {
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
        // Sort newest saved first
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
    setSavedJobs([]);
    localStorage.removeItem("listify-saved");
  };

  if (loading) {
    return (
      <main className="min-h-[calc(100dvh-4rem)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100dvh-4rem)] page-with-nav">
      {/* Header */}
      <div className="border-b border-slate-800 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-white">
              Saved Listings
              {savedJobs.length > 0 && (
                <span className="ml-2 text-sm font-normal text-slate-400">
                  ({savedJobs.length})
                </span>
              )}
            </h1>
          </div>
          {savedJobs.length > 0 && (
            <button
              onClick={clearAll}
              className="text-sm font-semibold text-slate-400 hover:text-red-400 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 md:p-6">
        {savedJobs.length > 0 ? (
          <div className="rounded-xl border border-slate-800 overflow-hidden divide-y divide-slate-800/50">
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
                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeSaved(job.id);
                  }}
                  className="absolute top-3 right-3 p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 md:opacity-100"
                  title="Remove from saved"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
              <Bookmark className="w-8 h-8 text-slate-600" />
            </div>
            <h2 className="text-lg font-bold text-white">
              No saved listings yet
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-xs">
              Tap the bookmark icon on any listing to save it here for later.
            </p>
            <button
              onClick={() => router.push("/jobs")}
              className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-colors"
            >
              Browse Listings
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
