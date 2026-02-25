// components/SmartBackButton.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function SmartBackButton() {
  const [backUrl, setBackUrl] = useState("/jobs");

  useEffect(() => {
    // Method 1: Check if we came from a jobs page with filters
    if (document.referrer) {
      try {
        const refererUrl = new URL(document.referrer);
        if (refererUrl.pathname === "/jobs" && refererUrl.search) {
          setBackUrl(`/jobs${refererUrl.search}`);
          return;
        }
      } catch (e) {
        // Invalid referrer URL, continue to other methods
      }
    }

    // Method 2: Check localStorage for saved filters
    try {
      const savedFilters = localStorage.getItem("jobsFilters");
      if (savedFilters) {
        const filters = JSON.parse(savedFilters);
        const params = new URLSearchParams();
        
        // Build URL from saved filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value && String(value).trim()) {
            params.set(key, String(value));
          }
        });
        
        if (params.toString()) {
          setBackUrl(`/jobs?${params.toString()}`);
          return;
        }
      }
    } catch (e) {
      // localStorage error, use default
    }

    // Method 3: Check current URL for any job-related params that we should preserve
    const currentUrl = new URL(window.location.href);
    const preserveParams = new URLSearchParams();
    
    // List of params we want to preserve when going back
    const preservableParams = ['role', 'comp', 'sched', 'city', 'address', 'lat', 'lng', 'radius', 'q'];
    
    preservableParams.forEach(param => {
      const value = currentUrl.searchParams.get(param);
      if (value) {
        preserveParams.set(param, value);
      }
    });
    
    if (preserveParams.toString()) {
      setBackUrl(`/jobs?${preserveParams.toString()}`);
    }
  }, []);

  return (
    <Link
      href={backUrl}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700/50 hover:border-slate-500 transition-colors"
    >
      <ChevronLeft className="h-4 w-4" />
      Back to Listings
    </Link>
  );
}