// components/InquiryListClient.tsx
"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Trash2, Shield, Star, X, Instagram, Mail, Phone } from "lucide-react";

type Item = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  email?: string;
  note: string;
  instagram?: string;
  jobId: string;
  jobTitle: string;
  businessName: string;
  cityState: string;
  jobThumbnail?: string | null;
  jobRole?: string;
  senderId?: string;
  isStarred?: boolean;
};

export default function InquiryListClient({
  roleView,
  items,
}: {
  roleView: "talent" | "employer";
  items: Item[];
}) {
  const [local, setLocal] = useState(items);
  const [pending, startTransition] = useTransition();
  const [showMessageModal, setShowMessageModal] = useState<string | null>(null);
  const [showBlockModal, setShowBlockModal] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  
  const [starredInquiries, setStarredInquiries] = useState<Set<string>>(
    new Set(items.filter(item => item.isStarred).map(item => item.id))
  );
  
  const isEmpty = local.length === 0;

  const withFlags = useMemo(() => {
    const now = Date.now();
    return local.map((x) => {
      const ageMs = Math.max(0, now - (x.createdAt ? new Date(x.createdAt).getTime() : now));
      const isNew = ageMs < 48 * 60 * 60 * 1000;
      const isStarred = starredInquiries.has(x.id);
      return { ...x, isNew, isStarred };
    });
  }, [local, starredInquiries]);

  const remove = (id: string) => {
    const prev = local;
    setLocal((cur) => cur.filter((x) => x.id !== id));
    setShowDeleteModal(null);
    setDeletingIds(prev => new Set(prev).add(id));
    
    startTransition(async () => {
      try {
        const res = await fetch(`/api/inquiries/${id}`, { method: "DELETE" });
        if (!res.ok) {
          throw new Error("Failed to delete");
        }
      } catch (error) {
        setLocal(prev);
        alert("Failed to remove inquiry. Please try again.");
      } finally {
        setDeletingIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    });
  };

  const blockUser = (inquiryId: string, senderId: string) => {
    const prev = local;
    setLocal((cur) => cur.filter((x) => x.id !== inquiryId));
    setShowBlockModal(null);
    
    startTransition(async () => {
      try {
        const blockRes = await fetch(`/api/users/block`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: senderId }),
        });
        
        if (!blockRes.ok) {
          throw new Error("Failed to block user");
        }
        
        const deleteRes = await fetch(`/api/inquiries/${inquiryId}`, { 
          method: "DELETE" 
        });
        
        if (!deleteRes.ok) {
          throw new Error("Failed to delete inquiry");
        }
        
      } catch (error) {
        setLocal(prev);
        alert("Failed to block user. Please try again.");
      }
    });
  };

  const toggleStar = (id: string) => {
    const wasStarred = starredInquiries.has(id);
    const willBeStarred = !wasStarred;
    
    setStarredInquiries(prev => {
      const newSet = new Set(prev);
      if (wasStarred) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
    
    startTransition(async () => {
      try {
        const res = await fetch(`/api/inquiries/${id}/star`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ starred: willBeStarred }),
        });
        
        if (!res.ok) {
          // Revert on error
          setStarredInquiries(prev => {
            const newSet = new Set(prev);
            if (willBeStarred) {
              newSet.delete(id);
            } else {
              newSet.add(id);
            }
            return newSet;
          });
          throw new Error("Failed to update star status");
        }
      } catch (error) {
        console.error("Failed to sync star status:", error);
      }
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return `${dateStr} ${timeStr}`;
  };

  // Service-specific placeholder function
  const getServicePlaceholder = (service?: string | null): string => {
    if (!service) return "/placeholder.jpg";
    
    const placeholders: Record<string, string> = {
      barber: "/placeholders/barber-placeholder.png",
      cosmetologist: "/placeholders/cosmetologist-placeholder.png", 
      tattoo_artist: "/placeholders/tattoo-placeholder.png",
      lash_tech: "/placeholders/lash-placeholder.png",
      nail_tech: "/placeholders/nail-placeholder.png",
      esthetician: "/placeholders/esthetician-placeholder.png",
      piercer: "/placeholders/piercer-placeholder.png",
    };
    
    return placeholders[service] || "/placeholder.jpg";
  };

  if (isEmpty) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-white/70">
          {roleView === "employer" 
            ? "Nothing yet." 
            : "No inquiries yet. Find a listing and tap Inquire."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {withFlags.map((x) => {
          const hasJob = Boolean(x.jobId);
          const messageText = x.note || "—";
          const isMessageLong = x.note && x.note.length > 50;
          const isDeleting = deletingIds.has(x.id);
          
          return (
            <div
              key={x.id}
              className={`rounded-xl border ${x.isStarred ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-white/10 bg-white/5'} p-3 overflow-hidden ${isDeleting ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start gap-4 min-h-[60px]">
                {/* Job Thumbnail */}
                <div className="w-20 h-16 flex-shrink-0">
                  <img
                    src={x.jobThumbnail || getServicePlaceholder(x.jobRole)}
                    alt={`${x.businessName} thumbnail`}
                    className="w-full h-full object-cover rounded-lg border border-slate-700"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      // First fallback: try service-specific placeholder
                      if (target.src !== getServicePlaceholder(x.jobRole)) {
                        target.src = getServicePlaceholder(x.jobRole);
                      } else {
                        // Final fallback: generic placeholder
                        target.src = "/placeholder.jpg";
                      }
                    }}
                  />
                </div>

                {/* Job Info Section */}
                <div className="w-[300px] flex flex-col justify-start h-full overflow-hidden">
                  <div className="font-medium text-white leading-tight mb-1">
                    {hasJob ? (
                      <Link 
                        href={`/jobs/${x.jobId}`} 
                        className="hover:text-blue-400 transition-colors"
                      >
                        {x.businessName}
                      </Link>
                    ) : (
                      x.businessName
                    )}
                    {x.isNew && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-emerald-500 text-black rounded-full">
                        NEW
                      </span>
                    )}
                    {x.isStarred && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-500 text-black rounded-full">
                        STARRED
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-slate-300 mb-1">
                    {x.jobTitle} • {x.jobRole ? 
                      x.jobRole.replace('_', ' ').split(' ').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ') 
                      : 'General'}
                  </div>

                  <div className="text-xs text-slate-400">{x.cityState}</div>
                </div>

                {/* Contact Info Section - Removed date/time from here */}
                <div className="w-[220px] flex flex-col justify-start h-full">
                  <div className="font-medium text-slate-200 mb-1">{x.name}</div>
                  
                  <div className="space-y-1">
                    {/* Email */}
                    <div className="flex items-center gap-1 text-sm text-slate-300">
                      <Mail className="h-3 w-3 text-slate-500" />
                      {x.email ? (
                        <a 
                          href={`mailto:${x.email}`}
                          className="hover:text-blue-400 transition-colors truncate max-w-[180px]"
                          title={x.email}
                        >
                          {x.email}
                        </a>
                      ) : (
                        <span className="text-slate-500">No email</span>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="flex items-center gap-1 text-sm text-slate-300">
                      <Phone className="h-3 w-3 text-slate-500" />
                      {x.phone ? (
                        <a 
                          href={`tel:${x.phone}`}
                          className="hover:text-blue-400 transition-colors"
                        >
                          {x.phone}
                        </a>
                      ) : (
                        <span className="text-slate-500">No phone</span>
                      )}
                    </div>
                    
                    {/* Instagram - Only show if present */}
                    {x.instagram && (
                      <div className="flex items-center gap-1 text-sm text-slate-300">
                        <Instagram className="h-3 w-3 text-slate-500" />
                        <a 
                          href={`https://instagram.com/${x.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-400 transition-colors"
                        >
                          @{x.instagram}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Message Section */}
                <div className="flex-1 min-w-0 flex flex-col justify-start h-full">
                  <div className="text-sm text-slate-300 leading-snug">
                    {isMessageLong ? (
                      <>
                        {messageText.slice(0, 50)}...{' '}
                        <button 
                          onClick={() => setShowMessageModal(x.id)}
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          read more
                        </button>
                      </>
                    ) : (
                      messageText
                    )}
                  </div>
                </div>

                {/* Actions Section - NOW WITH DATE/TIME AND RED X BUTTON */}
                <div className="flex flex-col items-end gap-2 min-w-[120px]">
                  {/* Date/Time - MOVED HERE */}
                  <div className="text-xs text-slate-500 text-right">
                    {formatDateTime(x.createdAt)}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    {/* Star functionality - Only for employer */}
                    {roleView === "employer" && (
                      <button
                        onClick={() => toggleStar(x.id)}
                        className={`p-1 rounded transition-colors ${
                          x.isStarred 
                            ? 'text-yellow-400 hover:text-yellow-300' 
                            : 'text-slate-500 hover:text-slate-400'
                        }`}
                        title={x.isStarred ? "Remove star" : "Star inquiry"}
                        disabled={pending}
                      >
                        <Star className={`h-4 w-4 ${x.isStarred ? 'fill-current' : ''}`} />
                      </button>
                    )}

                    {/* Block functionality - Only for employer with senderId */}
                    {roleView === "employer" && x.senderId && (
                      <button
                        onClick={() => setShowBlockModal(x.id)}
                        className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
                        title="Block user and remove inquiry"
                        disabled={pending}
                      >
                        <Shield className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  {/* RED X DELETE BUTTON - MOVED UNDERNEATH */}
                  <button
                    onClick={() => setShowDeleteModal(x.id)}
                    className="p-1 text-red-500 hover:text-red-400 rounded transition-colors border border-red-500/30 hover:border-red-400/50 bg-red-500/10 hover:bg-red-500/20"
                    title="Delete inquiry"
                    disabled={pending || isDeleting}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Full Message</h3>
              <button
                onClick={() => setShowMessageModal(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="text-slate-300 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
              {withFlags.find(x => x.id === showMessageModal)?.note || "—"}
            </div>
          </div>
        </div>
      )}

      {/* Block Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-3">
              Block User?
            </h3>
            <p className="text-slate-300 text-sm mb-6">
              This will permanently block this user from contacting you and remove this inquiry. This action cannot be undone.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowBlockModal(null)}
                className="px-4 py-2 text-sm border border-slate-600 rounded-lg hover:bg-slate-800 transition-colors"
                disabled={pending}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const inquiry = withFlags.find(x => x.id === showBlockModal);
                  if (inquiry?.senderId) {
                    blockUser(showBlockModal, inquiry.senderId);
                  }
                }}
                disabled={pending}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {pending ? "Blocking..." : "Block User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-3">
              Delete Inquiry?
            </h3>
            <p className="text-slate-300 text-sm mb-6">
              Are you sure you want to delete this inquiry? This action cannot be undone.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 text-sm border border-slate-600 rounded-lg hover:bg-slate-800 transition-colors"
                disabled={pending}
              >
                Cancel
              </button>
              <button
                onClick={() => remove(showDeleteModal)}
                disabled={pending}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {pending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}