// app/profile/profile-client.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Mail, Briefcase, MessageSquare, Plus, Eye, Calendar, Settings } from "lucide-react";

type Me = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type ProfileStats = {
  activeListings?: number;
  totalListings?: number;
  totalInquiriesReceived?: number;
  activeInquiries?: number;
  totalInquiriesSent?: number;
  responseRate?: number;
  recentViews?: Array<{
    id: string;
    title: string;
    businessName: string;
    viewedAt: string;
  }>;
};

export default function ProfileClient({ 
  me, 
  stats 
}: { 
  me: Me; 
  stats: ProfileStats;
}) {
  const [name, setName] = useState(me.name ?? "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "employer":
        return "Employer";
      case "talent":
        return "Talent";
      case "admin":
        return "Admin";
      default:
        return "User";
    }
  };

  const roleLabel = getRoleLabel(me.role);
  const isEmployer = me.role === "employer";

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error(await res.text());
      setMsg("Saved!");
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      setMsg(err?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Information Section */}
      <section className="rounded-xl border border-white/10 bg-white/5 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <User className="h-5 w-5" />
            Your Profile
          </h2>
          <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
            <strong>{roleLabel}</strong>
          </span>
        </div>

        <form onSubmit={onSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2 font-medium">Display Name</label>
              <input
                className="input w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={30}
                placeholder="Your name or shop name"
              />
              <div className="mt-1 text-xs text-white/50">{name.length}/30</div>
            </div>

            <div>
              <label className="block text-sm mb-2 font-medium">Email Address</label>
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                <Mail className="h-4 w-4 text-white/40" />
                <span className="text-white/60 truncate">{me.email}</span>
                <span className="ml-auto text-xs text-white/40 flex-shrink-0">Locked</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button type="submit" className="btn" disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
            {msg && (
              <span className={`text-sm ${msg === "Saved!" ? "text-emerald-400" : "text-rose-400"}`}>
                {msg}
              </span>
            )}
          </div>
        </form>
      </section>

      {/* Role-specific Activity Section */}
      {isEmployer ? (
        <EmployerActivity stats={stats} />
      ) : (
        <TalentActivity stats={stats} />
      )}

      {/* Account Settings Section */}
      <section className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Account Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm">Email Notifications</span>
            <button className="text-sm text-blue-400 hover:text-blue-300">Configure</button>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm">Privacy Settings</span>
            <button className="text-sm text-blue-400 hover:text-blue-300">Manage</button>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-white/10 pt-4">
            <span className="text-sm">Sign Out</span>
            <a 
              href="/signout" 
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Sign Out
            </a>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-white/10 pt-4">
            <span className="text-sm text-red-400">Deactivate Account</span>
            <button className="text-sm text-red-400 hover:text-red-300">Deactivate</button>
          </div>
        </div>
      </section>
    </div>
  );
}

function EmployerActivity({ stats }: { stats: ProfileStats }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Briefcase className="h-5 w-5" />
        Your Listings
      </h3>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">
            {stats.activeListings ?? 0}
          </div>
          <div className="text-sm text-white/60">Active Listings</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {stats.totalListings ?? 0}
          </div>
          <div className="text-sm text-white/60">Total Published</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {stats.totalInquiriesReceived ?? 0}
          </div>
          <div className="text-sm text-white/60">Inquiries Received</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link 
          href="/post" 
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Post New Job
        </Link>
        <Link 
          href="/jobs/manage" 
          className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm hover:bg-white/20 transition-colors"
        >
          <Eye className="h-4 w-4" />
          Manage All Listings
        </Link>
        <Link 
          href="/inbox" 
          className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm hover:bg-white/20 transition-colors"
        >
          <MessageSquare className="h-4 w-4" />
          View Inbox
        </Link>
      </div>
    </section>
  );
}

function TalentActivity({ stats }: { stats: ProfileStats }) {
  return (
    <div className="space-y-6">
      {/* Activity Stats */}
      <section className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Your Activity
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">
              {stats.activeInquiries ?? 0}
            </div>
            <div className="text-sm text-white/60">Active Inquiries</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {stats.totalInquiriesSent ?? 0}
            </div>
            <div className="text-sm text-white/60">Total Inquiries Sent</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Link 
            href="/jobs" 
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
          >
            <Briefcase className="h-4 w-4" />
            Browse Jobs
          </Link>
          <Link 
            href="/inbox" 
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm hover:bg-white/20 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            View Inbox
          </Link>
        </div>
      </section>

      {/* Recently Viewed Jobs */}
      {stats.recentViews && stats.recentViews.length > 0 && (
        <section className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recently Viewed
          </h3>
          <div className="space-y-3">
            {stats.recentViews.slice(0, 3).map((job) => (
              <Link 
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block rounded-lg border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition-colors"
              >
                <div className="font-medium text-sm">{job.businessName}</div>
                <div className="text-sm text-white/60">{job.title}</div>
                <div className="text-xs text-white/40 mt-1">
                  Viewed {new Date(job.viewedAt).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}