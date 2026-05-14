"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import ManageListingCard from "@/components/ManageListingCard";
import StatusBadge from "@/components/StatusBadge";
import { useToast } from "@/components/Toast";

interface ManagedJob {
  id: string;
  title: string;
  businessName: string;
  specialties: string[];
  status: string;
  viewsCount: number;
  inquiriesCount: number;
  createdAt: string;
  expiresAt: string | null;
  photos: { url: string }[];
}

export default function ManageListingsPage() {
  const [jobs, setJobs] = useState<ManagedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs?manage=true");
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : data.jobs || []);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    try {
      await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      setJobs((prev) => prev.filter((j) => j.id !== id));
      toast("Listing deleted");
    } catch {
      toast("Failed to delete listing", "error");
    }
  };

  const handleToggleStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, status: newStatus } : j))
      );
      toast(newStatus === "active" ? "Listing reactivated" : "Listing paused");
    } catch {
      toast("Failed to update listing", "error");
    }
  };

  const handleRenew = async (id: string) => {
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "renew" }),
      });
      const data = await res.json();

      if (res.ok && data.job) {
        setJobs((prev) =>
          prev.map((j) =>
            j.id === id
              ? { ...j, status: "active", expiresAt: data.job.expiresAt }
              : j
          )
        );
        toast("Listing renewed for 14 days!");
      } else {
        toast(data.error || "Failed to renew", "error");
      }
    } catch {
      toast("Failed to renew listing", "error");
    }
  };

  const activeCount = jobs.filter((j) => {
    if (j.status !== "active") return false;
    if (j.expiresAt && new Date(j.expiresAt) <= new Date()) return false;
    return true;
  }).length;

  const canPost = activeCount === 0;

  return (
    <main className="min-h-[calc(100dvh-4rem)] page-with-nav">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white">My Listings</h1>
            {activeCount > 0 && (
              <StatusBadge variant="primary">
                {activeCount} active
              </StatusBadge>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Manage your professional talent searches
          </p>
        </div>

        {/* Post New CTA — only show when they can post */}
        {canPost && !loading && (
          <Link
            href="/post"
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary px-6 py-4 text-base font-bold text-white shadow-xl shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98] mb-8"
          >
            <Plus className="w-5 h-5" />
            Post New Listing
          </Link>
        )}

        {/* At limit notice */}
        {!canPost && !loading && (
          <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-bg-surface px-4 py-3 mb-8">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-black text-primary">1/1</span>
            </div>
            <p className="text-xs text-slate-400">
              Free accounts are limited to 1 active listing. Delete or let it expire to post a new one.
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-40 rounded-xl shimmer"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}

        {/* Listings */}
        {!loading && jobs.length > 0 && (
          <div className="space-y-4">
            {jobs.map((job) => (
              <ManageListingCard
                key={job.id}
                id={job.id}
                title={job.title}
                businessName={job.businessName || "Business"}
                role={""}
                specialties={job.specialties || []}
                status={job.status}
                viewsCount={job.viewsCount}
                inquiriesCount={job.inquiriesCount}
                createdAt={job.createdAt}
                expiresAt={job.expiresAt}
                photoUrl={job.photos?.[0]?.url || null}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
                onRenew={handleRenew}
              />
            ))}
          </div>
        )}

        {/* Empty — First Time Scout Experience */}
        {!loading && jobs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-primary">
                <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.6" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.6" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.3" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-white">
              Ready to find talent?
            </h3>
            <p className="text-sm text-slate-400 mt-3 max-w-sm leading-relaxed">
              Post your first listing and start connecting with barbers, cosmetologists, tattoo artists, and piercers in San Diego County.
            </p>

            <div className="mt-8 w-full max-w-xs space-y-3">
              <Link
                href="/post"
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary px-6 py-4 text-base font-bold text-white shadow-xl shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98]"
              >
                <Plus className="w-5 h-5" />
                Post Your First Listing
              </Link>
            </div>

            {/* How it works mini */}
            <div className="mt-10 w-full max-w-sm">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <span className="text-xs font-black text-primary">1</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Post a listing with your details</p>
                </div>
                <div>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <span className="text-xs font-black text-primary">2</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Talent sends you inquiries</p>
                </div>
                <div>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <span className="text-xs font-black text-primary">3</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Connect and work together</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
