"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Search as SearchIcon } from "lucide-react";
import { clsx } from "clsx";

interface LargeTitleProps {
  title: string;
  /** Optional subtitle shown below the title in muted text */
  subtitle?: string;
  /** Optional back button. Pass `true` for default behavior (router.back()),
   *  or an object with custom label / onClick. */
  back?: boolean | { label?: string; onClick?: () => void };
  /** Optional trailing action button (e.g. filter, edit) */
  action?: {
    label?: string;
    icon?: React.ReactNode;
    onClick: () => void;
    ariaLabel?: string;
  };
  /** Optional search bar shown below the large title */
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  /** Reduce vertical spacing — useful when stacking with other headers */
  compact?: boolean;
  className?: string;
}

/**
 * iOS large-title page header.
 *
 * Drop in at the top of a page's main content area. Renders the iOS-style
 * 34pt bold title with optional back button, trailing action, subtitle,
 * and inline search bar.
 *
 * Usage:
 *   <LargeTitle title="Browse" subtitle="124 listings near you" />
 *   <LargeTitle title="Settings" back />
 *   <LargeTitle title="Inbox" action={{ icon: <Plus />, onClick: ... }} />
 */
export default function LargeTitle({
  title,
  subtitle,
  back,
  action,
  search,
  compact,
  className,
}: LargeTitleProps) {
  const router = useRouter();

  const backLabel =
    typeof back === "object" && back?.label ? back.label : "Back";
  const handleBack = () => {
    if (typeof back === "object" && back?.onClick) {
      back.onClick();
    } else {
      router.back();
    }
  };

  return (
    <div
      className={clsx(
        "px-4",
        compact ? "pt-2 pb-3" : "pt-4 pb-5",
        className
      )}
    >
      {/* Back button row */}
      {back && (
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-0.5 -ml-2 mb-2 text-primary ios-press"
          aria-label={`${backLabel}`}
        >
          <ChevronLeft className="w-[22px] h-[22px]" strokeWidth={2.5} />
          <span className="text-[17px] font-normal">{backLabel}</span>
        </button>
      )}

      {/* Title + optional action */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="ios-large-title text-fg-strong">{title}</h1>
          {subtitle && (
            <p className="ios-subheadline text-fg-secondary mt-1">{subtitle}</p>
          )}
        </div>

        {action && (
          <button
            type="button"
            onClick={action.onClick}
            aria-label={action.ariaLabel || action.label}
            className={clsx(
              "shrink-0 ios-press",
              action.label
                ? "h-9 px-4 rounded-full bg-primary/15 text-primary text-[15px] font-semibold"
                : "flex items-center justify-center w-9 h-9 rounded-full bg-elevated/60 text-fg-bright"
            )}
          >
            {action.icon}
            {action.label && <span>{action.label}</span>}
          </button>
        )}
      </div>

      {/* Optional search bar */}
      {search && (
        <div className="ios-search-bar mt-4">
          <SearchIcon className="w-[18px] h-[18px] text-fg-secondary" strokeWidth={2} />
          <input
            type="text"
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            placeholder={search.placeholder || "Search"}
            className="text-[16px]"
          />
        </div>
      )}
    </div>
  );
}
