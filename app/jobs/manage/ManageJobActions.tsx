// app/jobs/manage/ManageJobActions.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Props {
  jobId: string;
}

export default function ManageJobActions({ jobId }: Props) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to delete job" }));
        throw new Error(errorData.message || "Failed to delete job");
      }

      // Close modal first
      setShowDeleteConfirm(false);
      
      // Use window.location.reload() for immediate UI update
      window.location.reload();
    } catch (error) {
      console.error("Delete error:", error);
      alert(`Failed to delete listing: ${error instanceof Error ? error.message : "Please try again."}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <Link
        href={`/jobs/${jobId}`}
        className="rounded-md border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-sm text-blue-200 hover:bg-blue-500/20 transition-colors"
      >
        View
      </Link>
      
      <button
        onClick={() => setShowDeleteConfirm(true)}
        className="flex items-center justify-center w-8 h-8 rounded-md border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-colors"
        title="Delete listing"
        disabled={deleting}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-3">
              Remove Listing?
            </h3>
            <p className="text-slate-300 text-sm mb-6">
              Are you sure you want to permanently delete this job listing? This action cannot be undone.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm border border-slate-600 rounded-lg hover:bg-slate-800 transition-colors"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}