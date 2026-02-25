"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Bell } from "lucide-react";
import NotificationItem from "@/components/NotificationItem";

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
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true }))
    );
    try {
      await fetch("/api/notifications", { method: "PATCH" });
    } catch {
      // Revert on failure would go here
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Group by time
  const groups: Record<string, Notification[]> = {};
  for (const n of notifications) {
    const group = getGroup(n.createdAt);
    if (!groups[group]) groups[group] = [];
    groups[group].push(n);
  }

  // Maintain order: Today, Yesterday, Earlier
  const orderedGroups = ["Today", "Yesterday", "Earlier"].filter(
    (g) => groups[g]?.length > 0
  );

  if (loading) {
    return (
      <main className="min-h-[calc(100dvh-4rem)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100dvh-4rem)] page-with-nav">
      {/* Header */}
      <div className="border-b border-slate-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-white">Notifications</h1>
            {unreadCount > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-primary text-[11px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-sm font-semibold text-primary hover:text-primary-light transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Notification List */}
      <div className="max-w-2xl mx-auto">
        {orderedGroups.map((group) => (
          <div key={group}>
            <div className="px-4 py-3 bg-bg-base">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {group}
              </h2>
            </div>
            <div className="divide-y divide-slate-800/50">
              {groups[group].map((notification) => (
                <NotificationItem
                  key={notification.id}
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
              ))}
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-lg font-semibold text-white">All caught up!</p>
            <p className="text-sm text-slate-400 mt-2">
              No notifications to show.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
