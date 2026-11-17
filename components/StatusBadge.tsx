import { clsx } from "clsx";

type BadgeVariant =
  | "active"
  | "paused"
  | "closed"
  | "expired"
  | "expiring"
  | "sent"
  | "primary"
  | "default"
  | "danger";

interface StatusBadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

/**
 * iOS-style status pill.
 *
 * Same API as before — variants and `dot` are unchanged so existing callers
 * keep working. Visual changes:
 *   - Sentence case instead of UPPERCASE
 *   - Softer color saturation (lower opacity backgrounds)
 *   - Thinner border, smaller dot, slightly larger padding
 *   - 13px font matching iOS subheadline scale
 */

const variantStyles: Record<BadgeVariant, string> = {
  active: "bg-green-500/12 text-green-400 border-green-500/15",
  paused: "bg-yellow-500/12 text-yellow-400 border-yellow-500/15",
  closed: "bg-slate-500/12 text-slate-400 border-slate-500/15",
  expired: "bg-red-500/12 text-red-400 border-red-500/15",
  expiring: "bg-amber-500/12 text-amber-400 border-amber-500/15",
  sent: "bg-green-500/12 text-green-400 border-green-500/15",
  primary: "bg-primary/12 text-primary border-primary/15",
  default: "bg-slate-700/40 text-slate-300 border-slate-600/20",
  danger: "bg-red-500/12 text-red-400 border-red-500/15",
};

const dotColors: Record<BadgeVariant, string> = {
  active: "bg-green-400",
  paused: "bg-yellow-400",
  closed: "bg-slate-400",
  expired: "bg-red-400",
  expiring: "bg-amber-400",
  sent: "bg-green-400",
  primary: "bg-primary",
  default: "bg-slate-400",
  danger: "bg-red-400",
};

export default function StatusBadge({
  variant = "default",
  children,
  dot = false,
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[12px] font-semibold rounded-full border",
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className={clsx("w-1.5 h-1.5 rounded-full", dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
}
