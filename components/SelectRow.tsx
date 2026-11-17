"use client";

import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { clsx } from "clsx";
import Sheet from "./Sheet";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectRowProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  title?: string;
  /** When true, shows as static text (no tap affordance). Used when there's
   *  only one possible value and the row is informational. */
  staticMode?: boolean;
  className?: string;
}

/**
 * iOS-style picker row. Renders as a tappable list row that opens a bottom
 * sheet with options when tapped. The current value is shown on the right in
 * blue with a chevron-down (iOS convention).
 *
 * When `staticMode` is true (e.g. unit field on Hourly/Commission where there's
 * only one option), it renders as static gray text with no tap affordance.
 *
 * Designed to live inside an `.ios-card` container.
 */
export default function SelectRow({
  label,
  value,
  options,
  onChange,
  title,
  staticMode = false,
  className,
}: SelectRowProps) {
  const [open, setOpen] = useState(false);
  const currentLabel = options.find((o) => o.value === value)?.label || value;

  // Static mode: no tap affordance, gray text
  if (staticMode) {
    return (
      <div className={clsx("ios-row gap-3 justify-between", className)}>
        <span className="ios-body text-slate-400">{label}</span>
        <span className="ios-body text-slate-400">{currentLabel}</span>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={clsx(
          "ios-row gap-3 justify-between w-full text-left active:bg-slate-800/60 transition-colors",
          className
        )}
      >
        <span className="ios-body text-white">{label}</span>
        <span className="flex items-center gap-1 text-primary">
          <span className="ios-body">{currentLabel}</span>
          <ChevronDown className="w-4 h-4" strokeWidth={2.5} />
        </span>
      </button>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={title || label}
      >
        <div className="ios-card mx-4 my-4">
          {options.map((opt) => {
            const selected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className="ios-row gap-3 w-full justify-between active:bg-slate-800/60 transition-colors"
              >
                <span className="ios-body text-white">{opt.label}</span>
                {selected && (
                  <Check className="w-5 h-5 text-primary" strokeWidth={2.5} />
                )}
              </button>
            );
          })}
        </div>
      </Sheet>
    </>
  );
}
