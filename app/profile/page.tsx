"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Building2,
  Settings,
  Camera,
  Shield,
  ImageIcon,
  X,
  Plus,
  LogOut,
} from "lucide-react";
import { useToast } from "@/components/Toast";
import LargeTitle from "@/components/LargeTitle";

const MAX_PORTFOLIO = 6;

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [portfolioPhotos, setPortfolioPhotos] = useState<string[]>([]);
  const [portfolioChanged, setPortfolioChanged] = useState(false);
  const [shopName, setShopName] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [website, setWebsite] = useState("");

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setName(data.user.name || "");
          setPhone(data.user.phone || "");
          if (data.user.talentProfile?.avatarUrl) {
            setAvatarUrl(data.user.talentProfile.avatarUrl);
          }
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
      };
      if (avatarPreview) payload.avatarUrl = avatarPreview;
      if (portfolioChanged) payload.portfolioPhotos = portfolioPhotos;

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
      // handle
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
      <div className="min-h-[calc(100dvh-3.5rem)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100dvh-3.5rem)] page-with-nav">
      <LargeTitle title="Profile" />

      <div className="max-w-2xl mx-auto px-0 pb-8">
        {/* Avatar Section — centered hero */}
        <div className="flex flex-col items-center text-center px-4 pb-7">
          <div className="relative">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="relative w-24 h-24 rounded-full overflow-hidden bg-primary ios-press"
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
            </button>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-lg pointer-events-none border-2 border-canvas">
              <Camera className="w-3.5 h-3.5" strokeWidth={2.2} />
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
            <p className="ios-footnote text-primary mt-2 font-semibold">
              New photo — save to apply
            </p>
          )}
          <h2 className="mt-4 ios-title-2 text-fg-strong">{name || "User"}</h2>
          <p className="ios-subheadline text-fg-secondary">{user?.email}</p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 ios-footnote font-semibold text-primary">
            <Shield className="w-3 h-3" strokeWidth={2.5} />
            {isScout ? "Scout" : "Talent"}
          </div>
        </div>

        {/* Basic Info */}
        <h3 className="ios-section-header">Basic Info</h3>
        <div className="ios-card mx-4 mb-6">
          <div className="ios-row gap-3">
            <label className="ios-body text-fg-secondary w-24 shrink-0">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 min-w-0 bg-transparent border-0 outline-none ios-body text-fg-strong placeholder-fg-muted"
              placeholder="Your name"
            />
          </div>
          <div className="ios-row gap-3">
            <label className="ios-body text-fg-secondary w-24 shrink-0">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="(555) 123-4567"
              inputMode="tel"
              className="flex-1 min-w-0 bg-transparent border-0 outline-none ios-body text-fg-strong placeholder-fg-muted"
            />
          </div>
        </div>

        {/* My Work — Talent only */}
        {!isScout && (
          <>
            <div className="flex items-center justify-between px-4 mb-1.5">
              <h3 className="ios-section-header !pb-0 !px-0">My Work</h3>
              <span className="ios-footnote text-fg-muted">
                {portfolioPhotos.length}/{MAX_PORTFOLIO}
              </span>
            </div>
            <div className="ios-card mx-4 mb-2 p-3">
              <div className="grid grid-cols-3 gap-2">
                {portfolioPhotos.map((photo, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-xl overflow-hidden bg-surface group"
                  >
                    <img
                      src={photo}
                      alt={`Work ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removePortfolioPhoto(i)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center text-white ios-press"
                    >
                      <X className="w-3 h-3" strokeWidth={2.5} />
                    </button>
                  </div>
                ))}

                {portfolioPhotos.length < MAX_PORTFOLIO && (
                  <button
                    onClick={() => portfolioInputRef.current?.click()}
                    className="aspect-square rounded-xl bg-elevated/40 flex flex-col items-center justify-center gap-1 text-fg-secondary active:bg-elevated/60 ios-press transition-colors"
                  >
                    <Plus className="w-5 h-5" strokeWidth={2} />
                    <span className="text-[10px] font-semibold">Add</span>
                  </button>
                )}
              </div>
            </div>
            <p className="px-5 ios-footnote text-fg-muted mb-1">
              Add photos of your work. Scouts see these when you send an inquiry.
            </p>
            {portfolioChanged && (
              <p className="px-5 ios-footnote text-primary font-semibold mb-6">
                Photos changed — save to apply
              </p>
            )}
            {!portfolioChanged && <div className="mb-6" />}

            <input
              ref={portfolioInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePortfolioAdd}
              className="hidden"
            />
          </>
        )}

        {/* Scout Details */}
        {isScout && (
          <>
            <h3 className="ios-section-header">Shop Details</h3>
            <div className="ios-card mx-4 mb-6">
              <div className="px-4 py-3">
                <label className="ios-footnote text-fg-secondary">Name</label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="Shop name"
                  className="w-full mt-1 bg-transparent border-0 outline-none ios-body text-fg-strong placeholder-fg-muted"
                />
              </div>
              <div className="ios-hairline-top" />
              <div className="px-4 py-3">
                <label className="ios-footnote text-fg-secondary">Address</label>
                <input
                  type="text"
                  value={shopAddress}
                  onChange={(e) => setShopAddress(e.target.value)}
                  placeholder="Shop address"
                  className="w-full mt-1 bg-transparent border-0 outline-none ios-body text-fg-strong placeholder-fg-muted"
                />
              </div>
              <div className="ios-hairline-top" />
              <div className="px-4 py-3">
                <label className="ios-footnote text-fg-secondary">Website</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="www.yourshop.com"
                  inputMode="url"
                  className="w-full mt-1 bg-transparent border-0 outline-none ios-body text-fg-strong placeholder-fg-muted"
                />
              </div>
            </div>
          </>
        )}

        {/* Save Button */}
        <div className="px-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-full bg-primary px-6 h-12 text-[17px] font-semibold text-white ios-press active:bg-primary-dark disabled:opacity-50 disabled:active:transform-none flex items-center justify-center gap-2 transition-colors"
          >
            {saving ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Save Changes"
            )}
          </button>
        </div>

        {/* Sign Out */}
        <div className="px-4 mt-3">
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/");
              router.refresh();
            }}
            className="w-full rounded-full bg-elevated/60 px-6 h-12 text-[17px] font-semibold text-red-400 ios-press active:bg-elevated flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-[18px] h-[18px]" strokeWidth={2} />
            Sign Out
          </button>
        </div>
      </div>
    </main>
  );
}
