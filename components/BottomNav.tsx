"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Mail,
  Bookmark,
  User,
  Home,
  PlusCircle,
  Briefcase,
} from "lucide-react";
import { clsx } from "clsx";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; fill?: string }>;
  matchPaths?: string[];
}

const talentNav: NavItem[] = [
  { href: "/jobs", label: "Browse", icon: Search, matchPaths: ["/jobs"] },
  { href: "/inbox", label: "Inbox", icon: Mail, matchPaths: ["/inbox"] },
  { href: "/saved", label: "Saved", icon: Bookmark, matchPaths: ["/saved"] },
  { href: "/profile", label: "Profile", icon: User, matchPaths: ["/profile"] },
];

const scoutNav: NavItem[] = [
  { href: "/jobs", label: "Home", icon: Home, matchPaths: ["/jobs"] },
  { href: "/post", label: "Post", icon: PlusCircle, matchPaths: ["/post"] },
  { href: "/jobs/manage", label: "Manage", icon: Briefcase, matchPaths: ["/jobs/manage"] },
  { href: "/inbox", label: "Inbox", icon: Mail, matchPaths: ["/inbox"] },
  { href: "/profile", label: "Profile", icon: User, matchPaths: ["/profile"] },
];

interface BottomNavProps {
  role?: string;
}

export default function BottomNav({ role = "talent" }: BottomNavProps) {
  const pathname = usePathname();
  const navItems = role === "employer" ? scoutNav : talentNav;

  const isActive = (item: NavItem) => {
    if (item.matchPaths) {
      return item.matchPaths.some((p) => pathname.startsWith(p));
    }
    return pathname === item.href;
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 ios-hairline-top ios-blur-strong pb-safe md:hidden"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-stretch justify-around px-1 pt-1.5 pb-1">
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-col items-center justify-center gap-0.5 flex-1 py-1 ios-press",
                active ? "text-primary" : "text-slate-500"
              )}
            >
              <Icon
                className="w-[26px] h-[26px]"
                strokeWidth={active ? 2.4 : 1.8}
                fill={active ? "currentColor" : "none"}
              />
              <span
                className={clsx(
                  "text-[10px] tracking-tight",
                  active ? "font-semibold" : "font-medium"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
