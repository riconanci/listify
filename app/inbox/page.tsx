"use client";

import { useState, useEffect } from "react";
import { SlidersHorizontal } from "lucide-react";
import InquiryCard from "@/components/InquiryCard";
import TalentInquiryCard from "@/components/TalentInquiryCard";
import StatusBadge from "@/components/StatusBadge";
import { clsx } from "clsx";

interface InquiryData {
  id: string;
  senderId: string;
  name: string | null;
  phone: string | null;
  note: string | null;
  instagram: string | null;
  createdAt: string;
  sender?: {
    name: string | null;
    email: string | null;
  };
  job: {
    id: string;
    title: string;
    businessName: string | null;
    role: string;
    location?: {
      city: string | null;
      state: string | null;
    } | null;
  };
  stars?: { id: string }[];
}

export default function InboxPage() {
  const [inquiries, setInquiries] = useState<InquiryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<"talent" | "employer">("talent");
  const [filterListing, setFilterListing] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user role
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        if (meData.user) {
          setUserRole(meData.user.role);
        }

        // Get inquiries
        const res = await fetch("/api/inbox/enquiries");
        const data = await res.json();
        setInquiries(Array.isArray(data) ? data : data.inquiries || []);
      } catch {
        setInquiries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStar = async (id: string) => {
    try {
      await fetch(`/api/inquiries/${id}/star`, { method: "POST" });
      setInquiries((prev) =>
        prev.map((inq) => {
          if (inq.id === id) {
            const isStarred = inq.stars && inq.stars.length > 0;
            return {
              ...inq,
              stars: isStarred ? [] : [{ id: "temp" }],
            };
          }
          return inq;
        })
      );
    } catch {
      // handle error
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this inquiry?")) return;
    try {
      await fetch(`/api/inquiries/${id}`, { method: "DELETE" });
      setInquiries((prev) => prev.filter((inq) => inq.id !== id));
    } catch {
      // handle error
    }
  };

  const handleWithdraw = async (id: string) => {
    if (!confirm("Withdraw this inquiry?")) return;
    try {
      await fetch(`/api/inquiries/${id}`, { method: "DELETE" });
      setInquiries((prev) => prev.filter((inq) => inq.id !== id));
    } catch {
      // handle error
    }
  };

  const isScout = userRole === "employer";
  const newCount = inquiries.filter((inq) => {
    const age = Date.now() - new Date(inq.createdAt).getTime();
    return age < 24 * 60 * 60 * 1000; // last 24 hours
  }).length;

  // Sort
  const sorted = [...inquiries].sort((a, b) => {
    if (sortBy === "newest")
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return (
    <main className="min-h-[calc(100dvh-4rem)] page-with-nav">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-white">
            {isScout ? "Inquiries" : "My Inquiries"}
          </h1>
          {isScout && newCount > 0 && (
            <p className="text-sm text-slate-400 mt-1">
              You have{" "}
              <span className="text-primary font-bold">{newCount} new</span>{" "}
              talent inquiries today.
            </p>
          )}
          {!isScout && inquiries.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge variant="primary">
                {inquiries.length} Active
              </StatusBadge>
            </div>
          )}
        </div>

        {/* Filters (Scout view) */}
        {isScout && inquiries.length > 0 && (
          <div className="flex items-center gap-3 mb-6">
            <select
              value={filterListing}
              onChange={(e) => setFilterListing(e.target.value)}
              className="rounded-lg border border-slate-700 bg-bg-input px-3 py-2 text-sm text-slate-300 appearance-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="all">All Listings</option>
            </select>

            <button
              onClick={() =>
                setSortBy((s) => (s === "newest" ? "oldest" : "newest"))
              }
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-bg-input px-3 py-2 text-sm text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Sort: {sortBy === "newest" ? "Newest" : "Oldest"}
            </button>
          </div>
        )}

        {/* Talent view filter */}
        {!isScout && inquiries.length > 0 && (
          <div className="flex items-center justify-end mb-6">
            <button className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filter
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-xl shimmer"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}

        {/* Scout (Employer) View */}
        {!loading && isScout && sorted.length > 0 && (
          <div className="space-y-4">
            {sorted.map((inq) => (
              <InquiryCard
                key={inq.id}
                id={inq.id}
                senderName={inq.sender?.name || inq.name || "Unknown"}
                senderEmail={inq.sender?.email}
                phone={inq.phone}
                instagram={inq.instagram}
                note={inq.note}
                jobTitle={inq.job.title}
                businessName={inq.job.businessName || ""}
                jobId={inq.job.id}
                createdAt={inq.createdAt}
                isStarred={Boolean(inq.stars && inq.stars.length > 0)}
                onStar={handleStar}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Talent View */}
        {!loading && !isScout && sorted.length > 0 && (
          <div className="space-y-4">
            {sorted.map((inq) => (
              <TalentInquiryCard
                key={inq.id}
                id={inq.id}
                jobTitle={inq.job.title}
                businessName={inq.job.businessName || ""}
                jobId={inq.job.id}
                role={inq.job.specialties?.map((s: string) => s.split("_").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")).join(" · ") || ""}
                city={inq.job.location?.city}
                state={inq.job.location?.state}
                note={inq.note}
                createdAt={inq.createdAt}
                onWithdraw={handleWithdraw}
              />
            ))}

            {/* View Past */}
            <div className="text-center pt-4">
              <button className="rounded-lg border border-slate-700 px-6 py-2.5 text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                View Past Inquiries
              </button>
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && inquiries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
              <span className="text-2xl text-slate-600">📬</span>
            </div>
            <h3 className="text-lg font-bold text-white">
              {isScout ? "No inquiries yet" : "No sent inquiries"}
            </h3>
            <p className="text-sm text-slate-400 mt-2 max-w-xs">
              {isScout
                ? "When talent sends an inquiry about your listings, it will appear here."
                : "Browse listings and send inquiries to connect with shops in San Diego."}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
