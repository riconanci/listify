"use client";

import { useId } from "react";
import { clsx } from "clsx";

export interface ChipOption {
  value: string;
  label: string;
}

interface ChipSelectProps {
  label: string;
  value: string;
  options: ChipOption[];
  onChange: (value: string) => void;
  /** For optional fields: tapping the selected chip clears it (onChange("")). */
  clearable?: boolean;
  className?: string;
}

/**
 * A single-choice field shown inline as chips, for short option lists.
 *
 * Every option is visible and one tap picks it, with no overlay. Use this for
 * a handful of choices; a bottom sheet is still the better fit for long lists
 * such as the browse filters.
 *
 * The label and the chips share one line when there is room (desktop) and the
 * chips wrap underneath the label when there is not (phones). Designed to live
 * inside an `.ios-card` container.
 */
export default function ChipSelect({
  label,
  value,
  options,
  onChange,
  clearable = false,
  className,
}: ChipSelectProps) {
  const labelId = useId();

  return (
    <div
      className={clsx(
        "flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3",
        className
      )}
    >
      <span id={labelId} className="ios-body text-white">
        {label}
      </span>
      <div role="group" aria-labelledby={labelId} className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(selected && clearable ? "" : opt.value)}
              className={clsx(
                "px-4 py-2 rounded-full text-[14px] font-semibold ios-press transition-colors",
                selected
                  ? "bg-primary text-white"
                  : "bg-slate-700/60 text-slate-200 active:bg-slate-700"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
