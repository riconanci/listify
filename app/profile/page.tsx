"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Building2,
  Settings,
  ChevronLeft,
  Camera,
  Shield,
  ImageIcon,
  X,
  Plus,
} from "lucide-react";
import { clsx } from "clsx";
import { useToast } from "@/components/Toast";

const MAX_PORTFOLIO = 6;

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [portfolioPhotos, setPortfolioPhotos] = useState<string[]>([]);
  const [portfolioChanged, setPortfolioChanged] = useState(false);
  const [shopName, setShopName] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setName(data.user.name || "");
          setPhone(data.user.phone || "");
          // Load avatar
          if (data.user.talentProfile?.avatarUrl) {
            setAvatarUrl(data.user.talentProfile.avatarUrl);
          }
          // Load portfolio
          if (data.user.talentProfile?.portfolio) {
            setPortfolioPhotos(
              data.user.talentProfile.portfolio.map((p: any) => p.url)
            );
          }
          if (data.user.employerProfiles?.[0]) {
            setShopName(data.user.employerProfiles[0].shopName || "");
            setShopAddress(data.user.employerProfiles[0].address || "");
            setWebsite(data.user.employerProfiles[0].website || "");
            if (data.user.employerProfiles[0].logoUrl) {
              setAvatarUrl(data.user.employerProfiles[0].logoUrl);
            }
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const isScout = user?.role === "employer";

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 256;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > maxSize) { h = (h * maxSize) / w; w = maxSize; }
        } else {
          if (h > maxSize) { w = (w * maxSize) / h; h = maxSize; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        setAvatarPreview(dataUrl);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handlePortfolioAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = MAX_PORTFOLIO - portfolioPhotos.length;
    const toProcess = files.slice(0, remaining);

    toProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxSize = 512;
          let w = img.width;
          let h = img.height;
          if (w > h) {
            if (w > maxSize) { h = (h * maxSize) / w; w = maxSize; }
          } else {
            if (h > maxSize) { w = (w * maxSize) / h; h = maxSize; }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
          setPortfolioPhotos((prev) => [...prev, dataUrl].slice(0, MAX_PORTFOLIO));
          setPortfolioChanged(true);
        };
        img.src = ev.target?.result as string;
      };
      reader.readAsDataURL(file);
    });

    // Reset input so same file can be selected again
    if (portfolioInputRef.current) portfolioInputRef.current.value = "";
  };

  const removePortfolioPhoto = (index: number) => {
    setPortfolioPhotos((prev) => prev.filter((_, i) => i !== index));
    setPortfolioChanged(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = {
        name,
        phone: phone.replace(/\D/g, ""),
        shopName,
        shopAddress,
        website,
        emailNotifications,
      };

      if (avatarPreview) {
        payload.avatarUrl = avatarPreview;
      }

      if (portfolioChanged) {
        payload.portfolioPhotos = portfolioPhotos;
      }

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        if (avatarPreview) {
          setAvatarUrl(avatarPreview);
          setAvatarPreview(null);
        }
        setPortfolioChanged(false);
        toast("Profile saved!");
        router.refresh();
      }
    } catch {
      // handle error
    } finally {
      setSaving(false);
    }
  };

  const displayAvatar = avatarPreview || avatarUrl;

  const getInitials = () => {
    if (name) {
      return name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return "U";
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100dvh-4rem)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100dvh-4rem)] page-with-nav">
      {/* Header */}
      <div className="border-b border-slate-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-white">Profile Settings</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center text-center border-b border-slate-800 pb-8">
          <div className="relative">
            {/* Avatar circle — tap to change */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="relative w-24 h-24 rounded-full overflow-hidden bg-primary group"
            >
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="flex items-center justify-center w-full h-full text-white text-2xl font-bold">
                  {getInitials()}
                </span>
              )}
              {/* Hover/tap overlay */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </button>
            {/* Camera badge */}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-lg pointer-events-none">
              <Camera className="w-3.5 h-3.5" />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          {avatarPreview && (
            <p className="text-xs text-primary mt-2 font-medium">New photo — save to apply</p>
          )}
          <h2 className="mt-4 text-xl font-bold text-white">
            {name || "User"}
          </h2>
          <p className="text-sm text-slate-400">{user?.email}</p>

          {/* Role Badge */}
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
            <Shield className="w-3 h-3" />
            {isScout ? "Scout" : "Talent"}
          </div>
        </div>

        {/* Basic Info */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <User className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-white">Basic Info</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-bg-input px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="(555) 123-4567"
                className="w-full rounded-lg border border-slate-700 bg-bg-input px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
          </div>
        </section>

        {/* My Work — Talent only */}
        {!isScout && (
          <section>
            <div className="flex items-center gap-2 mb-5">
              <ImageIcon className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold text-white">My Work</h3>
              <span className="text-xs text-slate-500 ml-auto">
                {portfolioPhotos.length}/{MAX_PORTFOLIO}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {portfolioPhotos.map((photo, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-slate-800 group">
                  <img
                    src={photo}
                    alt={`Work ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removePortfolioPhoto(i)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* Add slot */}
              {portfolioPhotos.length < MAX_PORTFOLIO && (
                <button
                  onClick={() => portfolioInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-slate-700 flex flex-col items-center justify-center gap-1.5 text-slate-500 hover:border-primary/30 hover:text-primary transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-[10px] font-semibold">Add</span>
                </button>
              )}
            </div>

            {portfolioChanged && (
              <p className="text-xs text-primary mt-2 font-medium">
                Photos changed — save to apply
              </p>
            )}

            <input
              ref={portfolioInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePortfolioAdd}
              className="hidden"
            />

            <p className="text-xs text-slate-500 mt-3">
              Add photos of your work. Scouts see these when you send an inquiry.
            </p>
          </section>
        )}

        {/* Scout Details */}
        {isScout && (
          <section>
            <div className="flex items-center gap-2 mb-5">
              <Building2 className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold text-white">Shop Details</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Shop Name
                </label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-bg-input px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Shop Address
                </label>
                <input
                  type="text"
                  value={shopAddress}
                  onChange={(e) => setShopAddress(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-bg-input px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="www.yourshop.com"
                  className="w-full rounded-lg border border-slate-700 bg-bg-input px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
            </div>
          </section>
        )}

        {/* Preferences */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <Settings className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-white">Preferences</h3>
          </div>

          <div className="rounded-xl border border-slate-800 bg-bg-surface p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Email Notifications</p>
                <p className="text-xs text-slate-400 mt-0.5">Receive weekly updates</p>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={clsx(
                  "relative w-12 h-7 rounded-full transition-colors",
                  emailNotifications ? "bg-primary" : "bg-slate-700"
                )}
              >
                <span
                  className={clsx(
                    "absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform",
                    emailNotifications ? "left-[22px]" : "left-0.5"
                  )}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-xl bg-primary px-8 py-4 text-base font-bold text-white shadow-xl shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Settings className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>

        {/* Sign Out */}
        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/");
            router.refresh();
          }}
          className="w-full rounded-xl border-2 border-slate-700 px-8 py-4 text-base font-bold text-slate-400 transition-all hover:border-red-500/50 hover:text-red-400 active:scale-[0.98]"
        >
          Sign Out
        </button>
      </div>
    </main>
  );
}
