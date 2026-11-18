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
  type LucideIcon,
} from "lucide-react";
import { clsx } from "clsx";
import { activeNavHref } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const talentNav: NavItem[] = [
  { href: "/jobs", label: "Browse", icon: Search },
  { href: "/inbox", label: "Inbox", icon: Mail },
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/profile", label: "Profile", icon: User },
];

const scoutNav: NavItem[] = [
  { href: "/jobs", label: "Home", icon: Home },
  { href: "/post", label: "Post", icon: PlusCircle },
  { href: "/jobs/manage", label: "Manage", icon: Briefcase },
  { href: "/inbox", label: "Inbox", icon: Mail },
  { href: "/profile", label: "Profile", icon: User },
];

interface BottomNavProps {
  role?: string;
}

export default function BottomNav({ role = "talent" }: BottomNavProps) {
  const pathname = usePathname();
  const navItems = role === "employer" ? scoutNav : talentNav;

  // One tab is active at a time ("/jobs/manage" is Manage, not Home as well).
  const activeHref = activeNavHref(pathname, navItems.map((item) => item.href));

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 ios-hairline-top ios-blur-strong pb-safe md:hidden"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-stretch justify-around px-1 pt-1.5 pb-1">
        {navItems.map((item) => {
          const active = item.href === activeHref;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "flex flex-col items-center justify-center gap-0.5 flex-1 py-1 ios-press",
                active ? "text-primary" : "text-fg-muted"
              )}
            >
              {/* Active: a heavier line and a light tint inside. A solid fill
                  hides the detail of line icons (the plus, the envelope flap). */}
              <Icon
                className="w-[26px] h-[26px]"
                strokeWidth={active ? 2.2 : 1.8}
                fill={active ? "currentColor" : "none"}
                fillOpacity={active ? 0.18 : undefined}
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
