"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { clsx } from "clsx";
import { useState, useEffect } from "react";

interface HeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string;
    talentProfile?: { avatarUrl?: string | null } | null;
    employerProfiles?: { logoUrl?: string | null }[];
  } | null;
}

const navLinks = [
  { href: "/jobs", label: "Browse" },
  { href: "/post", label: "Post a Listing", scoutOnly: true },
  { href: "/jobs/manage", label: "Manage", scoutOnly: true },
  { href: "/inbox", label: "Inbox" },
  { href: "/profile", label: "Profile" },
];

export default function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const isScout = user?.role === "employer";

  useEffect(() => {
    if (!user) return;
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUnreadCount(data.filter((n: any) => !n.isRead).length);
        }
      })
      .catch(() => {});
  }, [user, pathname]);

  const filteredLinks = navLinks.filter((link) => !link.scoutOnly || isScout);

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) return email[0].toUpperCase();
    return "U";
  };

  const userAvatar =
    user?.talentProfile?.avatarUrl ||
    user?.employerProfiles?.[0]?.logoUrl ||
    null;

  return (
    <header className="sticky top-0 z-50 w-full ios-blur ios-hairline-bottom">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 ios-press">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/20 sm:w-8 sm:h-8">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className="text-primary sm:w-[18px] sm:h-[18px]"
            >
              <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.6" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.6" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.3" />
            </svg>
          </div>
          <span className="text-[17px] font-bold tracking-tight text-white sm:text-xl">
            Listify
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {filteredLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              {/* Notification Bell */}
              <Link
                href="/notifications"
                className="relative flex items-center justify-center w-9 h-9 rounded-full text-slate-300 ios-press hover:bg-slate-800/60 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-[22px] h-[22px]" strokeWidth={2} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full pulse-dot" />
                )}
              </Link>

              {/* Avatar */}
              <Link
                href="/profile"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-white text-sm font-semibold overflow-hidden ios-press"
                aria-label="Profile"
              >
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getInitials(user.name, user.email)
                )}
              </Link>
            </>
          ) : (
            <>
              {/* Phones have no tab bar when signed out, so Browse lives here.
                  Hidden under 360px, where the three items would not fit. */}
              <Link
                href="/jobs"
                className="md:hidden max-[359px]:hidden whitespace-nowrap px-1 py-2 text-[15px] font-medium text-slate-300 ios-press"
              >
                Browse
              </Link>
              <Link
                href="/signin"
                className="whitespace-nowrap px-1 py-2 text-[15px] font-medium text-slate-300 hover:text-white transition-colors sm:px-3 sm:py-1.5"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="whitespace-nowrap rounded-full bg-primary px-3 py-1.5 text-[14px] font-semibold text-white ios-press sm:px-4"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
