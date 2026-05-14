"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, X } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const isScout = user?.role === "employer";

  // Fetch unread notification count
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
  }, [user, pathname]); // Refetch on navigation

  const filteredLinks = navLinks.filter(
    (link) => !link.scoutOnly || isScout
  );

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

  const userAvatar = user?.talentProfile?.avatarUrl || user?.employerProfiles?.[0]?.logoUrl || null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/90 glass-header">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className="text-primary"
            >
              <rect
                x="3"
                y="3"
                width="7"
                height="7"
                rx="1.5"
                fill="currentColor"
              />
              <rect
                x="14"
                y="3"
                width="7"
                height="7"
                rx="1.5"
                fill="currentColor"
                opacity="0.6"
              />
              <rect
                x="3"
                y="14"
                width="7"
                height="7"
                rx="1.5"
                fill="currentColor"
                opacity="0.6"
              />
              <rect
                x="14"
                y="14"
                width="7"
                height="7"
                rx="1.5"
                fill="currentColor"
                opacity="0.3"
              />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
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
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Role Badge */}
              <div className="hidden sm:flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                  {isScout ? "Scout" : "Talent"}
                </span>
              </div>

              {/* Notification Bell */}
              <Link
                href="/notifications"
                className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full pulse-dot" />
                )}
              </Link>

              {/* Avatar */}
              <Link
                href="/profile"
                className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold overflow-hidden"
              >
                {userAvatar ? (
                  <img src={userAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  getInitials(user.name, user.email)
                )}
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="hidden sm:block px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95 sm:px-5 sm:py-2.5 sm:text-sm"
              >
                Create Account
              </Link>
            </>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {user && (
              <div className="flex items-center gap-3 px-3 py-3 mb-2 border-b border-slate-800">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-bold overflow-hidden">
                  {userAvatar ? (
                    <img src={userAvatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    getInitials(user.name, user.email)
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {user.name || "User"}
                  </p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
                <span className="ml-auto px-2 py-0.5 bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase rounded-full">
                  {isScout ? "Scout" : "Talent"}
                </span>
              </div>
            )}
            {filteredLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={clsx(
                    "block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            {!user && (
              <div className="pt-2 mt-2 border-t border-slate-800 space-y-2">
                <Link
                  href="/signin"
                  className="block px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="block px-3 py-2.5 text-sm font-bold text-white bg-primary rounded-lg text-center"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
