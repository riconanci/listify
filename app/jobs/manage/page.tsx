"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import ManageListingCard from "@/components/ManageListingCard";
import LargeTitle from "@/components/LargeTitle";
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

  const subtitle =
    jobs.length === 0
      ? loading
        ? "Loading…"
        : "Post your first listing to find talent"
      : `${activeCount} active · ${jobs.length} total`;

  return (
    <main className="min-h-[calc(100dvh-3.5rem)] page-with-nav">
      <LargeTitle title="My Listings" subtitle={subtitle} />

      <div className="max-w-3xl mx-auto px-4 md:px-6 pb-8">
        {/* Post New CTA */}
        {canPost && !loading && jobs.length > 0 && (
          <Link
            href="/post"
            className="flex items-center justify-center gap-2 w-full rounded-full bg-primary px-6 h-12 text-[17px] font-semibold text-white ios-press active:bg-primary-dark transition-colors mb-5"
          >
            <Plus className="w-[18px] h-[18px]" strokeWidth={2.5} />
            Post New Listing
          </Link>
        )}

        {/* At limit notice */}
        {!canPost && !loading && (
          <div className="flex items-center gap-3 rounded-2xl bg-bg-surface px-4 py-3 mb-5">
            <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <span className="text-[11px] font-bold text-primary">1/1</span>
            </div>
            <p className="ios-footnote text-slate-400">
              Free accounts are limited to 1 active listing. Delete or let it expire to post a new one.
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-2xl shimmer"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}

        {/* Listings */}
        {!loading && jobs.length > 0 && (
          <div className="space-y-3">
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

        {/* Empty — First Time Scout */}
        {!loading && jobs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-20 h-20 rounded-3xl bg-primary/15 flex items-center justify-center mb-5">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-primary">
                <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.6" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.6" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.3" />
              </svg>
            </div>
            <h3 className="ios-title-2 text-white">Ready to find talent?</h3>
            <p className="ios-subheadline text-slate-400 mt-2 max-w-sm">
              Post your first listing and start connecting with barbers, cosmetologists, tattoo artists, and piercers in San Diego County.
            </p>

            <Link
              href="/post"
              className="mt-7 flex items-center justify-center gap-2 w-full max-w-xs rounded-full bg-primary px-6 h-12 text-[17px] font-semibold text-white ios-press active:bg-primary-dark transition-colors"
            >
              <Plus className="w-[18px] h-[18px]" strokeWidth={2.5} />
              Post Your First Listing
            </Link>

            {/* How it works mini */}
            <div className="mt-9 w-full max-w-sm">
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { num: "1", text: "Post a listing with your details" },
                  { num: "2", text: "Talent sends you inquiries" },
                  { num: "3", text: "Connect and work together" },
                ].map((s) => (
                  <div key={s.num}>
                    <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-2">
                      <span className="ios-footnote font-bold text-primary">{s.num}</span>
                    </div>
                    <p className="ios-caption text-slate-400 leading-tight">
                      {s.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
