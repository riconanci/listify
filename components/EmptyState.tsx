import { SearchX, SlidersHorizontal, Bell } from "lucide-react";

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
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Icon */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-slate-800/50 flex items-center justify-center">
          {icon || <SearchX className="w-10 h-10 text-slate-600" strokeWidth={1.5} />}
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-primary text-lg leading-none">×</span>
        </div>
      </div>

      <h3 className="ios-title-2 text-white">{title}</h3>
      <p className="mt-2 ios-subheadline text-slate-400 max-w-sm">
        {description}
      </p>

      <div className="mt-7 flex flex-col gap-3 w-full max-w-xs">
        {showClearFilters && onClearFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center justify-center gap-2 w-full rounded-full bg-primary px-6 h-12 text-[17px] font-semibold text-white ios-press active:bg-primary-dark transition-colors"
          >
            <SlidersHorizontal className="w-[18px] h-[18px]" strokeWidth={2} />
            Clear All Filters
          </button>
        )}
        {showNotify && (
          <button className="flex items-center justify-center gap-2 w-full rounded-full bg-slate-700/60 px-6 h-12 text-[17px] font-semibold text-white ios-press active:bg-slate-700 transition-colors">
            <Bell className="w-[18px] h-[18px]" strokeWidth={2} />
            Notify me of new listings
          </button>
        )}
      </div>
    </div>
  );
}
