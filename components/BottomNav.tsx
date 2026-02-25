"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Mail,
  Briefcase,
  User,
  Home,
  PlusCircle,
} from "lucide-react";
import { clsx } from "clsx";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  matchPaths?: string[];
}

const talentNav: NavItem[] = [
  { href: "/jobs", label: "Browse", icon: Search, matchPaths: ["/jobs"] },
  { href: "/inbox", label: "Inbox", icon: Mail, matchPaths: ["/inbox"] },
  {
    href: "/saved",
    label: "Saved",
    icon: Briefcase,
    matchPaths: ["/saved"],
  },
  {
    href: "/profile",
    label: "Profile",
    icon: User,
    matchPaths: ["/profile"],
  },
];

const scoutNav: NavItem[] = [
  { href: "/jobs", label: "Home", icon: Home, matchPaths: ["/jobs"] },
  {
    href: "/post",
    label: "Post",
    icon: PlusCircle,
    matchPaths: ["/post"],
  },
  {
    href: "/jobs/manage",
    label: "Manage",
    icon: Briefcase,
    matchPaths: ["/jobs/manage"],
  },
  { href: "/inbox", label: "Inbox", icon: Mail, matchPaths: ["/inbox"] },
  {
    href: "/profile",
    label: "Profile",
    icon: User,
    matchPaths: ["/profile"],
  },
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
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-950/95 glass-header pb-safe md:hidden"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors min-w-[60px]",
                active
                  ? "text-primary"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              <Icon
                className={clsx("w-5 h-5", active && "text-primary")}
              />
              <span
                className={clsx(
                  "text-[10px] font-semibold uppercase tracking-wider",
                  active ? "text-primary" : "text-slate-500"
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
