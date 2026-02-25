"use client";

import { useState } from "react";
import Link from "next/link";
import { Send, X, Instagram, Phone, FileText, LogIn } from "lucide-react";

interface InquiryFormProps {
  jobId: string;
  userRole?: string | null;
  isOwner?: boolean;
}

export default function InquiryForm({ jobId, userRole, isOwner }: InquiryFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [instagram, setInstagram] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  // Not logged in
  if (!userRole) {
    return (
      <Link
        href={`/signin?redirect=/jobs/${jobId}`}
        className="w-full rounded-xl bg-primary px-8 py-4 text-base font-bold text-white shadow-xl shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <LogIn className="w-4 h-4" />
        Sign in to Send Inquiry
      </Link>
    );
  }

  // Employer or listing owner — don't show inquiry form
  if (userRole === "employer" || isOwner) {
    return (
      <div className="text-center py-2">
        <p className="text-sm text-slate-500">
          {isOwner ? "This is your listing" : "Switch to Talent to send inquiries"}
        </p>
      </div>
    );
  }

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/inbox/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          phone: phone.replace(/\D/g, ""),
          note,
          instagram: instagram.replace("@", ""),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send inquiry");
        return;
      }

      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex items-center justify-center gap-2 py-3 text-green-400">
        <Send className="w-4 h-4" />
        <span className="text-sm font-semibold">Inquiry sent successfully!</span>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full rounded-xl bg-primary px-8 py-4 text-base font-bold text-white shadow-xl shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98] flex items-center justify-center gap-2"
      >
        Send Inquiry
        <Send className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-white">Send Inquiry</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 rounded text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="Phone number"
            className="w-full rounded-lg border border-slate-700 bg-bg-input pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="relative">
          <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="@instagram (optional)"
            className="w-full rounded-lg border border-slate-700 bg-bg-input pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="relative">
        <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Tell them about yourself... (optional)"
          rows={3}
          maxLength={500}
          className="w-full rounded-lg border border-slate-700 bg-bg-input pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary resize-none"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || !phone}
        className="w-full rounded-xl bg-primary px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            Send Inquiry
            <Send className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}
