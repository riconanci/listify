import {
  Eye,
  MessageSquare,
  UserPlus,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { clsx } from "clsx";

type NotificationType =
  | "inquiry"
  | "message"
  | "follow"
  | "system"
  | "verified";

interface NotificationItemProps {
  type: NotificationType;
  title: string;
  body: string;
  timeAgo: string;
  isRead?: boolean;
  onClick?: () => void;
}

const iconMap: Record<
  NotificationType,
  { icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  inquiry: { icon: Eye, color: "bg-primary/20 text-primary" },
  message: { icon: MessageSquare, color: "bg-primary/20 text-primary" },
  follow: { icon: UserPlus, color: "bg-primary/20 text-primary" },
  system: { icon: AlertTriangle, color: "bg-yellow-500/20 text-yellow-400" },
  verified: { icon: Shield, color: "bg-green-500/20 text-green-400" },
};

export default function NotificationItem({
  type,
  title,
  body,
  timeAgo,
  isRead = false,
  onClick,
}: NotificationItemProps) {
  const { icon: Icon, color } = iconMap[type];

  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-start gap-4 w-full px-4 py-4 text-left transition-colors",
        isRead
          ? "hover:bg-slate-800/30"
          : "bg-slate-800/20 hover:bg-slate-800/40"
      )}
    >
      {/* Icon */}
      <div
        className={clsx(
          "flex items-center justify-center w-10 h-10 rounded-full shrink-0",
          color
        )}
      >
        <Icon className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4
            className={clsx(
              "text-sm font-semibold",
              isRead ? "text-slate-300" : "text-white"
            )}
          >
            {title}
          </h4>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-500">{timeAgo}</span>
            {!isRead && (
              <span className="w-2 h-2 rounded-full bg-primary pulse-dot" />
            )}
          </div>
        </div>
        <p className="text-sm text-slate-400 mt-1 leading-relaxed">
          {body}
        </p>
      </div>
    </button>
  );
}
