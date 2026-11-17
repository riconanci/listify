"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, X } from "lucide-react";
import { clsx } from "clsx";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

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
  const [mounted, setMounted] = useState(false);
  const isScout = user?.role === "employer";
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Portal needs to wait for client mount
  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Close mobile menu on outside tap. Listens at document level so it works
  // regardless of stacking contexts or nested positioned ancestors.
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handlePointerDown = (e: Event) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (menuRef.current?.contains(target)) return; // tap inside menu
      if (triggerRef.current?.contains(target)) return; // tap on toggle button
      setMobileMenuOpen(false);
    };
    // Use both for full coverage across web + iOS Safari
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [mobileMenuOpen]);

  // Also close on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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
              <Link
                href="/signin"
                className="hidden sm:block px-3 py-1.5 text-[15px] font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-primary px-4 py-1.5 text-[14px] font-semibold text-white ios-press"
              >
                Sign Up
              </Link>
            </>
          )}

          {/* Mobile menu button */}
          <button
            ref={triggerRef}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-full text-slate-300 ios-press hover:bg-slate-800/60 transition-colors"
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-[22px] h-[22px]" strokeWidth={2} />
            ) : (
              <Menu className="w-[22px] h-[22px]" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu + backdrop are portaled to document.body so they escape
          the header's stacking context. This is critical for backdrop-filter
          to work — a parent with backdrop-filter prevents descendants' own
          backdrop-filter from sampling the actual page content behind. */}
      {mounted && mobileMenuOpen &&
        createPortal(
          <>
            {/* Passive visual dim — close handled by document listener above.
                Note: NO backdrop-filter here. The menu panel above does the blur work;
                stacking two backdrop-filter layers makes the upper one sample the lower
                one's already-blurred output, which kills the visible glass effect. */}
            <div
              aria-hidden
              className="fixed inset-x-0 bottom-0 top-14 sm:top-16 z-[60] bg-black/25 md:hidden animate-fade-in pointer-events-none"
            />

            {/* Menu panel — glass overlay */}
            <div
              ref={menuRef}
              className="fixed left-0 right-0 top-14 sm:top-16 z-[70] md:hidden ios-hairline-bottom animate-fade-in"
              style={{
                backdropFilter: "blur(20px) saturate(180%)",
                WebkitBackdropFilter: "blur(20px) saturate(180%)",
                backgroundColor: "rgba(15, 23, 42, 0.28)",
              }}
            >
              <div className="px-4 py-3 space-y-1">
                {user && (
                  <div className="flex items-center gap-3 px-3 py-3 mb-2 ios-hairline-top">
                    <div className="flex items-center justify-center w-11 h-11 rounded-full bg-primary text-white font-bold overflow-hidden">
                      {userAvatar ? (
                        <img src={userAvatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        getInitials(user.name, user.email)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-semibold text-white truncate">
                        {user.name || "User"}
                      </p>
                      <p className="text-[13px] text-slate-400 truncate">{user.email}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase rounded-full">
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
                        "block px-3 py-2.5 text-[15px] font-medium rounded-lg transition-colors",
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
                  <div className="pt-2 mt-2 ios-hairline-top space-y-2">
                    <Link
                      href="/signin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2.5 text-[15px] font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2.5 text-[15px] font-semibold text-white bg-primary rounded-full text-center"
                    >
                      Create Account
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </>,
          document.body
        )}
    </header>
  );
}
