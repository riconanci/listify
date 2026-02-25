import { SearchX, SlidersHorizontal, Bell } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  title?: string;
  description?: string;
  showClearFilters?: boolean;
  showNotify?: boolean;
  onClearFilters?: () => void;
  icon?: React.ReactNode;
}

export default function EmptyState({
  title = "No listings found",
  description = "Try adjusting your filters or search terms. We're constantly adding new opportunities in San Diego County.",
  showClearFilters = true,
  showNotify = true,
  onClearFilters,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      {/* Icon */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-slate-800/50 flex items-center justify-center">
          {icon || <SearchX className="w-10 h-10 text-slate-600" />}
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-primary text-lg">×</span>
        </div>
      </div>

      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="mt-3 text-sm text-slate-400 max-w-sm leading-relaxed">
        {description}
      </p>

      <div className="mt-8 flex flex-col gap-3 w-full max-w-xs">
        {showClearFilters && onClearFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Clear All Filters
          </button>
        )}
        {showNotify && (
          <button className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-slate-700 px-6 py-3.5 text-base font-bold text-slate-300 transition-all hover:bg-slate-800 active:scale-[0.98]">
            <Bell className="w-4 h-4" />
            Notify me of new listings
          </button>
        )}
      </div>
    </div>
  );
}
