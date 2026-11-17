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
  active: "bg-success/12 text-success-fg border-success/15",
  paused: "bg-warning/12 text-warning-fg border-warning/15",
  closed: "bg-fg-muted/12 text-fg-secondary border-fg-muted/15",
  expired: "bg-danger/12 text-danger-fg border-danger/15",
  expiring: "bg-caution/12 text-caution-fg border-caution/15",
  sent: "bg-success/12 text-success-fg border-success/15",
  primary: "bg-primary/12 text-primary border-primary/15",
  default: "bg-elevated/40 text-fg border-line-strong/20",
  danger: "bg-danger/12 text-danger-fg border-danger/15",
};

const dotColors: Record<BadgeVariant, string> = {
  active: "bg-success-fg",
  paused: "bg-warning-fg",
  closed: "bg-fg-secondary",
  expired: "bg-danger-fg",
  expiring: "bg-caution-fg",
  sent: "bg-success-fg",
  primary: "bg-primary",
  default: "bg-fg-secondary",
  danger: "bg-danger-fg",
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
