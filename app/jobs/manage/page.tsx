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
  role: string;
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

        {/* Post New CTA */}
        <Link
          href="/post"
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary px-6 py-4 text-base font-bold text-white shadow-xl shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98] mb-8"
        >
          <Plus className="w-5 h-5" />
          Post New Listing
        </Link>

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
                role={job.role}
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

        {/* Empty */}
        {!loading && jobs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-bold text-white">No listings yet</h3>
            <p className="text-sm text-slate-400 mt-2 max-w-xs">
              Post your first listing to start connecting with talent in San
              Diego County.
            </p>
            <Link
              href="/post"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Post a Listing
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
