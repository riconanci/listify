"use client";

import { useState, useEffect } from "react";
import { SlidersHorizontal, Inbox as InboxIcon } from "lucide-react";
import InquiryCard from "@/components/InquiryCard";
import TalentInquiryCard from "@/components/TalentInquiryCard";
import LargeTitle from "@/components/LargeTitle";

interface InquiryData {
  id: string;
  senderId: string;
  name: string | null;
  phone: string | null;
  note: string | null;
  instagram: string | null;
  createdAt: string;
  sender?: {
    id: string;
    name: string | null;
    email: string | null;
    talentProfile?: {
      avatarUrl?: string | null;
      headline?: string | null;
      portfolio?: { url: string }[];
    } | null;
  };
  job: {
    id: string;
    title: string;
    businessName: string | null;
    specialties?: string[];
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
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState<"talent" | "employer">("talent");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const meRes = await fetch("/api/auth/me", { cache: "no-store" });
        const meData = await meRes.json();
        if (meData.user) {
          setUserRole(meData.user.role);
        }

        const res = await fetch("/api/inbox/enquiries", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load inquiries");
          setInquiries([]);
          return;
        }

        setInquiries(Array.isArray(data) ? data : data.inquiries || []);
      } catch (err: any) {
        setError(err.message || "Failed to load inquiries");
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
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this inquiry?")) return;
    try {
      await fetch(`/api/inquiries/${id}`, { method: "DELETE" });
      setInquiries((prev) => prev.filter((inq) => inq.id !== id));
    } catch {}
  };

  const handleWithdraw = async (id: string) => {
    if (!confirm("Withdraw this inquiry?")) return;
    try {
      await fetch(`/api/inquiries/${id}`, { method: "DELETE" });
      setInquiries((prev) => prev.filter((inq) => inq.id !== id));
    } catch {}
  };

  const isScout = userRole === "employer";
  const newCount = inquiries.filter((inq) => {
    const age = Date.now() - new Date(inq.createdAt).getTime();
    return age < 24 * 60 * 60 * 1000;
  }).length;

  const sorted = [...inquiries].sort((a, b) => {
    if (sortBy === "newest")
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const title = isScout ? "Inquiries" : "My Inquiries";
  const subtitle =
    inquiries.length === 0
      ? loading
        ? "Loading…"
        : "No inquiries yet"
      : isScout && newCount > 0
      ? `${newCount} new today · ${inquiries.length} total`
      : `${inquiries.length} ${inquiries.length === 1 ? "inquiry" : "inquiries"}`;

  return (
    <main className="min-h-[calc(100dvh-3.5rem)] page-with-nav">
      <LargeTitle
        title={title}
        subtitle={subtitle}
        action={
          inquiries.length > 0
            ? {
                label: sortBy === "newest" ? "Newest" : "Oldest",
                onClick: () =>
                  setSortBy((s) => (s === "newest" ? "oldest" : "newest")),
                ariaLabel: "Toggle sort order",
                icon: <SlidersHorizontal className="w-3.5 h-3.5 mr-1 inline" strokeWidth={2.2} />,
              }
            : undefined
        }
      />

      <div className="max-w-3xl mx-auto px-4 md:px-6 pb-8">
        {/* Error */}
        {error && (
          <div className="rounded-2xl bg-danger/12 border border-danger/15 px-4 py-3 mb-4">
            <p className="ios-subheadline text-danger-fg">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-40 rounded-2xl shimmer"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}

        {/* Scout view */}
        {!loading && isScout && sorted.length > 0 && (
          <div className="space-y-3">
            {sorted.map((inq) => (
              <InquiryCard
                key={inq.id}
                id={inq.id}
                senderId={inq.sender?.id || inq.senderId}
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
                senderPhotoUrl={inq.sender?.talentProfile?.avatarUrl || null}
                senderHeadline={inq.sender?.talentProfile?.headline || null}
                portfolioPhotos={
                  inq.sender?.talentProfile?.portfolio?.map((p) => p.url) || []
                }
                onStar={handleStar}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Talent view */}
        {!loading && !isScout && sorted.length > 0 && (
          <div className="space-y-3">
            {sorted.map((inq) => (
              <TalentInquiryCard
                key={inq.id}
                id={inq.id}
                jobTitle={inq.job.title}
                businessName={inq.job.businessName || ""}
                jobId={inq.job.id}
                role={
                  inq.job.specialties
                    ?.map((s: string) =>
                      s
                        .split("_")
                        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ")
                    )
                    .join(" · ") || ""
                }
                city={inq.job.location?.city}
                state={inq.job.location?.state}
                note={inq.note}
                createdAt={inq.createdAt}
                onWithdraw={handleWithdraw}
              />
            ))}

            <div className="text-center pt-4">
              <button className="rounded-full bg-elevated/60 px-6 h-10 text-[15px] font-semibold text-fg-strong ios-press active:bg-elevated transition-colors">
                View Past Inquiries
              </button>
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && inquiries.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-surface/60 flex items-center justify-center mb-5">
              <InboxIcon className="w-9 h-9 text-fg-faint" strokeWidth={1.5} />
            </div>
            <h3 className="ios-title-2 text-fg-strong">
              {isScout ? "No inquiries yet" : "No sent inquiries"}
            </h3>
            <p className="ios-subheadline text-fg-secondary mt-2 max-w-xs">
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
