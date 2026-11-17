"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import NotificationItem from "@/components/NotificationItem";
import LargeTitle from "@/components/LargeTitle";

interface Notification {
  id: string;
  type: "inquiry" | "message" | "follow" | "system" | "verified";
  title: string;
  body: string;
  isRead: boolean;
  linkUrl: string | null;
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

function getGroup(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return "Earlier";
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setNotifications(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await fetch("/api/notifications", { method: "PATCH" });
    } catch {
      // revert on failure would go here
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const groups: Record<string, Notification[]> = {};
  for (const n of notifications) {
    const group = getGroup(n.createdAt);
    if (!groups[group]) groups[group] = [];
    groups[group].push(n);
  }

  const orderedGroups = ["Today", "Yesterday", "Earlier"].filter(
    (g) => groups[g]?.length > 0
  );

  if (loading) {
    return (
      <main className="min-h-[calc(100dvh-3.5rem)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  const subtitle =
    notifications.length === 0
      ? "All caught up"
      : unreadCount > 0
      ? `${unreadCount} unread`
      : `${notifications.length} ${notifications.length === 1 ? "notification" : "notifications"}`;

  return (
    <main className="min-h-[calc(100dvh-3.5rem)] page-with-nav">
      <LargeTitle
        title="Notifications"
        subtitle={subtitle}
        back
        action={
          unreadCount > 0
            ? {
                label: "Mark all read",
                onClick: markAllRead,
              }
            : undefined
        }
      />

      <div className="max-w-2xl mx-auto">
        {orderedGroups.map((group) => (
          <div key={group} className="mb-3">
            <h2 className="ios-section-header">{group}</h2>
            <div className="ios-card mx-4">
              {groups[group].map((notification, idx) => (
                <div
                  key={notification.id}
                  className={idx > 0 ? "ios-hairline-top" : ""}
                >
                  <NotificationItem
                    type={notification.type}
                    title={notification.title}
                    body={notification.body}
                    timeAgo={timeAgo(notification.createdAt)}
                    isRead={notification.isRead}
                    onClick={
                      notification.linkUrl
                        ? () => router.push(notification.linkUrl!)
                        : undefined
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-20 h-20 rounded-full bg-surface/60 flex items-center justify-center mb-5">
              <Bell className="w-9 h-9 text-fg-faint" strokeWidth={1.5} />
            </div>
            <p className="ios-title-2 text-fg-strong">All caught up!</p>
            <p className="ios-subheadline text-fg-secondary mt-2">
              No notifications to show.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
