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

const variantStyles: Record<BadgeVariant, string> = {
  active: "bg-green-500/10 text-green-400 border-green-500/20",
  paused: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  closed: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  expired: "bg-red-500/10 text-red-400 border-red-500/20",
  expiring: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  sent: "bg-green-500/10 text-green-400 border-green-500/20",
  primary: "bg-primary/10 text-primary border-primary/20",
  default: "bg-slate-700/50 text-slate-300 border-slate-600/30",
  danger: "bg-red-500/10 text-red-400 border-red-500/20",
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
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full border",
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
