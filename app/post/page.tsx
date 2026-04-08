"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ChevronLeft, Camera, Check } from "lucide-react";
import {
  StraightRazorIcon,
  ShearsIcon,
  TattooMachineIcon,
  PiercingNeedleIcon,
} from "@/components/icons/TradeIcons";
import { clsx } from "clsx";
import { useToast } from "@/components/Toast";

const MapPicker = dynamic(() => import("@/components/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-slate-700 overflow-hidden h-48 bg-slate-800 flex items-center justify-center text-slate-500 text-sm">
      Loading map...
    </div>
  ),
});

const SPECIALTY_OPTIONS: Record<string, { value: string; label: string; icon: any }[]> = {
  hair: [
    { value: "barber", label: "Barbers", icon: StraightRazorIcon },
    { value: "cosmetologist", label: "Cosmetologists", icon: ShearsIcon },
  ],
  tattoo: [
    { value: "tattoo_artist", label: "Tattoo Artists", icon: TattooMachineIcon },
    { value: "piercer", label: "Piercers", icon: PiercingNeedleIcon },
  ],
};

const SCHEDULE_OPTIONS = [
  { value: "", label: "Any" },
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
];

const EMPLOYMENT_OPTIONS = [
  { value: "", label: "—" },
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

export default function PostListingPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Form state
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
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-detect industry from employer profile
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(async (data) => {
        if (data.user) {
          // Fetch employer profile to get industry
          const profileRes = await fetch(`/api/shops/${data.user.id}/profile`);
          if (profileRes.ok) {
            const profile = await profileRes.json();
            if (profile.industry) {
              setIndustry(profile.industry);
            }
            if (profile.shopName) {
              setBusinessName(profile.shopName);
            }
          }
        }
      })
      .catch(() => {});
  }, []);

  // Update pay unit when comp model changes
  useEffect(() => {
    const units = UNIT_MAP[compModel];
    if (units && units.length > 0) {
      setPayUnit(units[0].value);
    }
  }, [compModel]);

  // Reset specialties when industry changes
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

  return (
    <main className="min-h-[calc(100dvh-4rem)] page-with-nav">
      {/* Sub-header */}
      <div className="border-b border-slate-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold text-white">Listify</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-black text-white mb-2">Post a Listing</h1>
        <p className="text-xs text-slate-500 mb-8">
          Fields marked with <span className="text-red-400">*</span> are required
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <section className="space-y-4">
            <h2 className="text-base font-bold text-white">Basic Information</h2>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Business <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your shop name"
                required
                className="w-full rounded-lg border border-slate-700 bg-bg-input px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Short Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 60))}
                placeholder="e.g. Senior Barber — Chair Available"
                required
                maxLength={60}
                className="w-full rounded-lg border border-slate-700 bg-bg-input px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <p className="text-xs text-slate-500 mt-1">Max 60 chars</p>
            </div>
          </section>

          {/* Who Are You Looking For */}
          <section className="space-y-4">
            <h2 className="text-base font-bold text-white">
              Who Are You Looking For? <span className="text-red-400">*</span>
            </h2>

            {/* Industry selector (if not auto-detected) */}
            {!industry && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIndustry("hair")}
                  className="flex items-center gap-3 rounded-lg border-2 border-slate-700 p-4 hover:border-slate-600 transition-all"
                >
                  <ShearsIcon size={20} className="text-slate-400" />
                  <span className="text-sm font-bold text-white">Hair</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIndustry("tattoo")}
                  className="flex items-center gap-3 rounded-lg border-2 border-slate-700 p-4 hover:border-slate-600 transition-all"
                >
                  <TattooMachineIcon size={20} className="text-slate-400" />
                  <span className="text-sm font-bold text-white">Tattoo</span>
                </button>
              </div>
            )}

            {/* Specialty multi-select */}
            {industry && (
              <div>
                <p className="text-xs text-slate-500 mb-3">
                  Select all that apply — this controls who sees your listing
                </p>
                <div className="flex flex-wrap gap-3">
                  {currentSpecOptions.map(({ value, label, icon: Icon }) => {
                    const selected = specialties.includes(value);
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => toggleSpecialty(value)}
                        className={clsx(
                          "flex items-center gap-2 rounded-lg border-2 px-4 py-3 transition-all",
                          selected
                            ? "border-primary bg-primary/10 text-white"
                            : "border-slate-700 text-slate-300 hover:border-slate-600"
                        )}
                      >
                        <div className={clsx(
                          "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0",
                          selected ? "bg-primary border-primary" : "border-slate-600"
                        )}>
                          {selected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <Icon size={16} className={clsx(selected ? "text-primary" : "text-slate-400")} />
                        <span className="text-sm font-semibold">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* Job Details */}
          <section className="space-y-4">
            <h2 className="text-base font-bold text-white">Job Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Schedule</label>
                <select
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-bg-input px-4 py-3 text-sm text-white appearance-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  {SCHEDULE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Employment</label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-bg-input px-4 py-3 text-sm text-white appearance-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  {EMPLOYMENT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Compensation */}
          <section className="rounded-xl border border-slate-700 bg-bg-surface p-5 space-y-4">
            <h2 className="text-base font-bold text-white">Compensation</h2>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Type</label>
              <select
                value={compModel}
                onChange={(e) => setCompModel(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-bg-input px-4 py-3 text-sm text-white appearance-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
              >
                {COMP_MODEL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {compModel === "hybrid" ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Base Wage</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">$</span>
                    <input type="text" value={hybridWage} onChange={(e) => setHybridWage(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="e.g. 15" className="w-full rounded-lg border border-slate-700 bg-bg-input px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary" />
                    <span className="text-sm font-semibold text-slate-400 shrink-0">/hr</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Take Home</label>
                  <div className="flex items-center gap-2">
                    <input type="text" value={hybridCommission} onChange={(e) => setHybridCommission(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="e.g. 60" className="w-full rounded-lg border border-slate-700 bg-bg-input px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary" />
                    <span className="text-sm font-semibold text-slate-400">%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    {compModel === "hourly" ? "Base Wage" : compModel === "commission" ? "Take Home" : "Rent"}
                  </label>
                  <input type="text" value={payValue} onChange={(e) => setPayValue(e.target.value)} placeholder={compModel === "commission" ? "e.g. 65 or 60-70" : compModel === "booth_rent" ? "e.g. 200 or 150-250" : "e.g. 25 or 20-30"} className="w-full rounded-lg border border-slate-700 bg-bg-input px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Unit</label>
                  <select value={payUnit} onChange={(e) => setPayUnit(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-bg-input px-4 py-3 text-sm text-white appearance-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer">
                    {(UNIT_MAP[compModel] || []).map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer">
              <button type="button" onClick={() => setPayVisible(!payVisible)} className={clsx("w-5 h-5 rounded border-2 flex items-center justify-center transition-colors", payVisible ? "bg-primary border-primary" : "border-slate-600 bg-transparent")}>
                {payVisible && <Check className="w-3 h-3 text-white" />}
              </button>
              <span className="text-sm text-slate-300">Show compensation publicly</span>
            </label>
          </section>

          {/* Description */}
          <section className="space-y-4">
            <h2 className="text-base font-bold text-white">Description & Requirements</h2>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-slate-300">Experience</label>
                <span className="text-xs text-slate-500">Optional</span>
              </div>
              <input type="text" value={experienceText} onChange={(e) => setExperienceText(e.target.value.slice(0, 20))} placeholder="e.g. 2+ years" maxLength={20} className="w-full rounded-lg border border-slate-700 bg-bg-input px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-slate-300">Short Description</label>
                <span className="text-xs text-slate-500">Optional</span>
              </div>
              <textarea value={description} onChange={(e) => setDescription(e.target.value.slice(0, 200))} placeholder="Tell talent what makes your shop great. Max 200 chars" rows={3} maxLength={200} className="w-full rounded-lg border border-slate-700 bg-bg-input px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary resize-none" />
              <p className="text-xs text-slate-500 mt-1 text-right">{description.length}/200</p>
            </div>
          </section>

          {/* Location */}
          <section className="space-y-4">
            <h2 className="text-base font-bold text-white">Location</h2>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-slate-300">Address</label>
                <span className="text-xs text-slate-500">Optional</span>
              </div>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Start typing address..." data-map-address="true" className="w-full rounded-lg border border-slate-700 bg-bg-input px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary" />
              <p className="text-xs text-slate-500 mt-1">Type address and press Enter to find on map, or click the map</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">City</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Encinitas" className="w-full rounded-lg border border-slate-700 bg-bg-input px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <MapPicker lat={lat} lng={lng} address={address} onLocationChange={(data) => { setLat(data.lat); setLng(data.lng); if (data.city) setCity(data.city); if (data.address) setAddress(data.address); }} />
          </section>

          {/* Media */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Media</h2>
              <span className="text-xs text-slate-500">Optional</span>
            </div>
            <label className="block cursor-pointer">
              <div className={clsx("rounded-xl border-2 border-dashed p-8 flex flex-col items-center gap-3 transition-colors", photoPreview ? "border-primary/30 bg-primary/5" : "border-slate-700 hover:border-slate-600")}>
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full max-h-48 object-cover rounded-lg" />
                ) : (
                  <>
                    <Camera className="w-8 h-8 text-slate-500" />
                    <span className="text-sm text-slate-400">Add a Photo</span>
                  </>
                )}
              </div>
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </label>
          </section>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !businessName || !title || !industry || specialties.length === 0}
            className="w-full rounded-xl bg-primary px-8 py-4 text-base font-bold text-white shadow-xl shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Posting...
              </span>
            ) : (
              "Post Listing"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
