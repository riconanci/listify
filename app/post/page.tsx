"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Camera, Check } from "lucide-react";
import { TRADE_IMAGES } from "@/components/icons/TradeIcons";
import { clsx } from "clsx";
import { useToast } from "@/components/Toast";
import LargeTitle from "@/components/LargeTitle";
import SelectRow from "@/components/SelectRow";
import ChipSelect from "@/components/ChipSelect";

const MapPicker = dynamic(() => import("@/components/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl overflow-hidden h-48 bg-surface flex items-center justify-center text-fg-muted ios-subheadline">
      Loading map…
    </div>
  ),
});

const SPECIALTY_OPTIONS: Record<string, { value: string; label: string; image: string }[]> = {
  hair: [
    { value: "barber", label: "Barbers", image: TRADE_IMAGES.barber },
    { value: "cosmetologist", label: "Cosmetologists", image: TRADE_IMAGES.cosmetologist },
  ],
  tattoo: [
    { value: "tattoo_artist", label: "Tattoo Artists", image: TRADE_IMAGES.tattoo_artist },
    { value: "piercer", label: "Piercers", image: TRADE_IMAGES.piercer },
  ],
};

const SCHEDULE_OPTIONS = [
  { value: "", label: "Any" },
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
];

const EMPLOYMENT_OPTIONS = [
  { value: "w2", label: "W-2" },
  { value: "c1099", label: "1099" },
];

const COMP_MODEL_OPTIONS = [
  { value: "hourly", label: "Hourly" },
  { value: "commission", label: "Commission" },
  { value: "booth_rent", label: "Booth Rent" },
  { value: "hybrid", label: "Hybrid" },
];

const UNIT_MAP: Record<string, { value: string; label: string }[]> = {
  hourly: [{ value: "$/hr", label: "$/hr" }],
  commission: [{ value: "%", label: "%" }],
  booth_rent: [
    { value: "$/wk", label: "$/week" },
    { value: "$/d", label: "$/day" },
    { value: "$/m", label: "$/month" },
  ],
  hybrid: [
    { value: "$/hr", label: "$/hr" },
    { value: "%", label: "%" },
  ],
};

// Helper: label-on-top input row, full width — used for fields with long content
function StackedInputRow({
  label,
  required,
  optional,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between">
        <label className="ios-footnote text-fg-secondary">
          {label}
          {required && <span className="text-red-400"> *</span>}
        </label>
        {optional && (
          <span className="ios-caption text-fg-muted">Optional</span>
        )}
      </div>
      <div className="mt-1">{children}</div>
      {hint && <p className="ios-caption text-fg-muted mt-1">{hint}</p>}
    </div>
  );
}

export default function PostListingPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [businessName, setBusinessName] = useState("");
  const [title, setTitle] = useState("");
  const [industry, setIndustry] = useState<string>("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [schedule, setSchedule] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [compModel, setCompModel] = useState("commission");
  const [payValue, setPayValue] = useState("");
  const [payUnit, setPayUnit] = useState("%");
  const [hybridWage, setHybridWage] = useState("");
  const [hybridCommission, setHybridCommission] = useState("");
  const [payVisible, setPayVisible] = useState(true);
  const [experienceText, setExperienceText] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [lat, setLat] = useState<number | undefined>();
  const [lng, setLng] = useState<number | undefined>();
  const [addressVisible, setAddressVisible] = useState(true);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasActiveListing, setHasActiveListing] = useState(false);
  const [checkingLimit, setCheckingLimit] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        if (meData.user) {
          const profileRes = await fetch(`/api/shops/${meData.user.id}/profile`);
          if (profileRes.ok) {
            const profile = await profileRes.json();
            if (profile.industry) setIndustry(profile.industry);
            if (profile.shopName) setBusinessName(profile.shopName);
          }

          const jobsRes = await fetch("/api/jobs?manage=true");
          const jobs = await jobsRes.json();
          if (Array.isArray(jobs)) {
            const now = new Date();
            const active = jobs.filter((j: any) =>
              j.status === "active" && (!j.expiresAt || new Date(j.expiresAt) > now)
            );
            setHasActiveListing(active.length >= 1);
          }
        }
      } catch {}
      setCheckingLimit(false);
    };
    init();
  }, []);

  useEffect(() => {
    const units = UNIT_MAP[compModel];
    if (units && units.length > 0) {
      setPayUnit(units[0].value);
    }
  }, [compModel]);

  useEffect(() => {
    setSpecialties([]);
  }, [industry]);

  const toggleSpecialty = (val: string) => {
    setSpecialties((prev) =>
      prev.includes(val) ? prev.filter((s) => s !== val) : [...prev, val]
    );
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    let payMin: number | null = null;
    let payMax: number | null = null;
    let submitPayUnit = payUnit;

    if (compModel === "hybrid") {
      payMin = hybridWage ? parseFloat(hybridWage) : null;
      payMax = hybridCommission ? parseFloat(hybridCommission) : null;
      submitPayUnit = "hybrid";
    } else if (payValue) {
      if (payValue.includes("-")) {
        const [min, max] = payValue.split("-").map((v) => parseFloat(v.trim()));
        payMin = min;
        payMax = max;
      } else {
        payMin = parseFloat(payValue);
        payMax = payMin;
      }
    }

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          title,
          industry,
          specialties,
          schedule: schedule || null,
          employmentType: employmentType || null,
          compModel,
          payMin,
          payMax,
          payUnit: submitPayUnit,
          payVisible,
          experienceText: experienceText || null,
          description: description || null,
          address: address || null,
          city: city || null,
          lat: lat ?? null,
          lng: lng ?? null,
          addressVisible,
          photo: photoPreview || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to post listing");
        return;
      }

      toast("Listing posted successfully!");
      router.push("/jobs/manage");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentSpecOptions = industry ? SPECIALTY_OPTIONS[industry] || [] : [];

  // Pay placeholder per comp model
  const payPlaceholder =
    compModel === "commission"
      ? "%"
      : compModel === "booth_rent"
      ? "200 or 150-250"
      : "25 or 20-30";

  return (
    <main className="min-h-[calc(100dvh-3.5rem)] page-with-nav">
      <LargeTitle title="Post a Listing" back />

      <div className="max-w-2xl mx-auto pb-8">
        {/* Loading check */}
        {checkingLimit && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Limit reached */}
        {!checkingLimit && hasActiveListing && (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-20 h-20 rounded-3xl bg-primary/15 flex items-center justify-center mb-5">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </div>
            <h2 className="ios-title-2 text-fg-strong">
              You already have an active listing
            </h2>
            <p className="mt-2 ios-subheadline text-fg-secondary max-w-sm">
              Free accounts are limited to 1 active listing at a time. Delete or let your current listing expire to post a new one.
            </p>
            <Link
              href="/jobs/manage"
              className="mt-7 flex items-center justify-center w-full max-w-xs rounded-full bg-primary px-6 h-12 text-[17px] font-semibold text-white ios-press active:bg-primary-dark transition-colors"
            >
              Manage My Listing
            </Link>
          </div>
        )}

        {/* Normal form */}
        {!checkingLimit && !hasActiveListing && (
          <form onSubmit={handleSubmit} className="space-y-1">
            {error && (
              <div className="mx-4 rounded-2xl bg-red-500/12 border border-red-500/15 px-4 py-3 mb-4">
                <p className="ios-subheadline text-red-400">{error}</p>
              </div>
            )}

            <p className="px-5 ios-footnote text-fg-muted mb-2">
              Fields marked with <span className="text-red-400">*</span> are required
            </p>

            {/* ─── BASICS ─── stacked because both fields can be long */}
            <h3 className="ios-section-header">Basics</h3>
            <div className="ios-card mx-4 mb-6">
              <StackedInputRow label="Business" required>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Your shop name"
                  required
                  className="w-full bg-transparent border-0 outline-none ios-body text-fg-strong placeholder-fg-muted"
                />
              </StackedInputRow>
              <div className="ios-hairline-top" />
              <StackedInputRow label="Title" required hint="Max 60 characters">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, 60))}
                  placeholder="e.g. Senior Barber — Chair Available"
                  required
                  maxLength={60}
                  className="w-full bg-transparent border-0 outline-none ios-body text-fg-strong placeholder-fg-muted"
                />
              </StackedInputRow>
            </div>

            {/* ─── WHO ARE YOU LOOKING FOR ─── */}
            <h3 className="ios-section-header">
              Who Are You Looking For <span className="text-red-400">*</span>
            </h3>

            {!industry && (
              <div className="grid grid-cols-2 gap-3 mx-4 mb-6">
                <button
                  type="button"
                  onClick={() => setIndustry("hair")}
                  className="flex flex-col items-center gap-2 rounded-2xl bg-surface p-5 ios-press active:bg-elevated transition-colors"
                >
                  <img src={TRADE_IMAGES.cosmetologist} alt="Hair" className="w-9 h-9 object-contain" />
                  <span className="ios-headline text-fg-strong">Hair</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIndustry("tattoo")}
                  className="flex flex-col items-center gap-2 rounded-2xl bg-surface p-5 ios-press active:bg-elevated transition-colors"
                >
                  <img src={TRADE_IMAGES.tattoo_artist} alt="Tattoo" className="w-9 h-9 object-contain" />
                  <span className="ios-headline text-fg-strong">Tattoo</span>
                </button>
              </div>
            )}

            {industry && (
              <div className="ios-card mx-4 mb-6">
                {currentSpecOptions.map(({ value, label, image }, idx) => {
                  const selected = specialties.includes(value);
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleSpecialty(value)}
                      className="ios-row gap-3 w-full active:bg-surface/60 transition-colors"
                    >
                      <div
                        className={clsx(
                          "w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors",
                          selected ? "bg-primary" : "bg-elevated/60"
                        )}
                      >
                        {selected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                      </div>
                      <img src={image} alt={label} className="w-6 h-6 object-contain" />
                      <span className="ios-body text-fg-strong">{label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ─── JOB DETAILS ─── inline chips: few options, one tap */}
            <h3 className="ios-section-header">Job Details</h3>
            <div className="ios-card mx-4 mb-6">
              <ChipSelect
                label="Schedule"
                value={schedule}
                options={SCHEDULE_OPTIONS}
                onChange={setSchedule}
              />
              <div className="ios-hairline-top" />
              {/* Optional: tap the selected chip again to clear it */}
              <ChipSelect
                label="Employment"
                value={employmentType}
                options={EMPLOYMENT_OPTIONS}
                onChange={setEmploymentType}
                clearable
              />
            </div>

            {/* ─── COMPENSATION ─── */}
            <h3 className="ios-section-header">Compensation</h3>
            <div className="ios-card mx-4 mb-2">
              <ChipSelect
                label="Type"
                value={compModel}
                options={COMP_MODEL_OPTIONS}
                onChange={setCompModel}
              />
              <div className="ios-hairline-top" />

              {compModel === "hybrid" ? (
                <>
                  <div className="ios-row gap-3">
                    <label className="ios-body text-fg-secondary w-24 shrink-0">Base Wage</label>
                    <span className="ios-body text-fg-muted">$</span>
                    <input
                      type="text"
                      value={hybridWage}
                      onChange={(e) => setHybridWage(e.target.value.replace(/[^0-9.]/g, ""))}
                      placeholder="15"
                      inputMode="decimal"
                      className="flex-1 min-w-0 bg-transparent border-0 outline-none ios-body text-fg-strong placeholder-fg-muted"
                    />
                    <span className="ios-body text-fg-secondary shrink-0">/hr</span>
                  </div>
                  <div className="ios-hairline-top" />
                  <div className="ios-row gap-3">
                    <label className="ios-body text-fg-secondary w-24 shrink-0">Take Home</label>
                    <input
                      type="text"
                      value={hybridCommission}
                      onChange={(e) => setHybridCommission(e.target.value.replace(/[^0-9.]/g, ""))}
                      placeholder="%"
                      inputMode="decimal"
                      className="flex-1 min-w-0 bg-transparent border-0 outline-none ios-body text-fg-strong placeholder-fg-muted"
                    />
                    <span className="ios-body text-fg-secondary shrink-0">%</span>
                  </div>
                  <div className="ios-hairline-top" />
                </>
              ) : (
                <>
                  <div className="ios-row gap-3">
                    <label className="ios-body text-fg-secondary w-24 shrink-0">
                      {compModel === "hourly" ? "Base Wage" : compModel === "commission" ? "Take Home" : "Rent"}
                    </label>
                    <input
                      type="text"
                      value={payValue}
                      onChange={(e) => setPayValue(e.target.value)}
                      placeholder={payPlaceholder}
                      inputMode="decimal"
                      className="flex-1 min-w-0 bg-transparent border-0 outline-none ios-body text-fg-strong placeholder-fg-muted"
                    />
                  </div>
                  <div className="ios-hairline-top" />
                  {/* Unit: static for Hourly/Commission (single option), picker for Booth Rent */}
                  {compModel === "booth_rent" ? (
                    <ChipSelect
                      label="Unit"
                      value={payUnit}
                      options={UNIT_MAP[compModel] || []}
                      onChange={setPayUnit}
                    />
                  ) : (
                    <SelectRow
                      label="Unit"
                      value={payUnit}
                      options={UNIT_MAP[compModel] || []}
                      onChange={setPayUnit}
                      staticMode
                    />
                  )}
                  <div className="ios-hairline-top" />
                </>
              )}

              {/* Public toggle */}
              <div className="ios-row gap-3 justify-between">
                <span className="ios-body text-fg-strong">Show compensation publicly</span>
                <button
                  type="button"
                  onClick={() => setPayVisible(!payVisible)}
                  className={clsx(
                    "relative w-[51px] h-[31px] rounded-full transition-colors shrink-0",
                    payVisible ? "bg-green-500" : "bg-elevated"
                  )}
                  role="switch"
                  aria-checked={payVisible}
                >
                  <span
                    className={clsx(
                      "absolute top-[2px] w-[27px] h-[27px] rounded-full bg-white shadow-md transition-transform",
                      payVisible ? "translate-x-[22px] left-[2px]" : "left-[2px]"
                    )}
                  />
                </button>
              </div>
            </div>
            <div className="mb-6" />

            {/* ─── DESCRIPTION ─── stacked */}
            <h3 className="ios-section-header">Description &amp; Requirements</h3>
            <div className="ios-card mx-4 mb-6">
              <StackedInputRow label="Experience" optional>
                <input
                  type="text"
                  value={experienceText}
                  onChange={(e) => setExperienceText(e.target.value.slice(0, 20))}
                  placeholder="e.g. 2+ years"
                  maxLength={20}
                  className="w-full bg-transparent border-0 outline-none ios-body text-fg-strong placeholder-fg-muted"
                />
              </StackedInputRow>
              <div className="ios-hairline-top" />
              <StackedInputRow label="Short Description" optional>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 200))}
                  placeholder="Tell talent what makes your shop great."
                  rows={3}
                  maxLength={200}
                  className="w-full bg-transparent border-0 outline-none ios-body text-fg-strong placeholder-fg-muted resize-none"
                />
                <p className="ios-caption text-fg-muted text-right">
                  {description.length}/200
                </p>
              </StackedInputRow>
            </div>

            {/* ─── LOCATION ─── stacked for address */}
            <h3 className="ios-section-header">Location</h3>
            <div className="ios-card mx-4 mb-3">
              <StackedInputRow label="Address" hint="Type address and press Enter to find on map, or click the map">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Start typing…"
                  data-map-address="true"
                  className="w-full bg-transparent border-0 outline-none ios-body text-fg-strong placeholder-fg-muted"
                />
              </StackedInputRow>
              <div className="ios-hairline-top" />
              <StackedInputRow label="City">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Encinitas"
                  className="w-full bg-transparent border-0 outline-none ios-body text-fg-strong placeholder-fg-muted"
                />
              </StackedInputRow>
              <div className="ios-hairline-top" />
              {/* Address visibility toggle */}
              <div className="px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="ios-body text-fg-strong">Show exact address</span>
                  <button
                    type="button"
                    onClick={() => setAddressVisible(!addressVisible)}
                    className={clsx(
                      "relative w-[51px] h-[31px] rounded-full transition-colors shrink-0",
                      addressVisible ? "bg-green-500" : "bg-elevated"
                    )}
                    role="switch"
                    aria-checked={addressVisible}
                  >
                    <span
                      className={clsx(
                        "absolute top-[2px] w-[27px] h-[27px] rounded-full bg-white shadow-md transition-transform",
                        addressVisible ? "translate-x-[22px] left-[2px]" : "left-[2px]"
                      )}
                    />
                  </button>
                </div>
                <p className="ios-caption text-fg-muted mt-1.5">
                  When off, your listing shows just the city.
                </p>
              </div>
            </div>
            <div className="mx-4 mb-6 rounded-2xl overflow-hidden">
              <MapPicker
                lat={lat}
                lng={lng}
                address={address}
                onLocationChange={(data) => {
                  setLat(data.lat);
                  setLng(data.lng);
                  if (data.city) setCity(data.city);
                  if (data.address) setAddress(data.address);
                }}
              />
            </div>

            {/* ─── MEDIA ─── */}
            <h3 className="ios-section-header">Photo (Optional)</h3>
            <label className="block cursor-pointer mx-4 mb-7">
              <div
                className={clsx(
                  "rounded-2xl overflow-hidden flex flex-col items-center gap-3 transition-colors p-8",
                  photoPreview ? "bg-primary/10" : "bg-surface"
                )}
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full max-h-48 object-cover rounded-xl" />
                ) : (
                  <>
                    <Camera className="w-9 h-9 text-fg-muted" strokeWidth={1.8} />
                    <span className="ios-subheadline text-fg-secondary">Tap to add a photo</span>
                  </>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>

            {/* Submit */}
            <div className="px-4">
              <button
                type="submit"
                disabled={loading || !businessName || !title || !industry || specialties.length === 0}
                className="w-full rounded-full bg-primary px-6 h-12 text-[17px] font-semibold text-white ios-press active:bg-primary-dark disabled:opacity-50 disabled:active:transform-none flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Posting…
                  </>
                ) : (
                  "Post Listing"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
