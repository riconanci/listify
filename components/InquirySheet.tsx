// components/InquirySheet.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

type Props = {
  jobId: string;
  open: boolean;
  onClose: () => void;
};

export default function InquirySheet({ jobId, open, onClose }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [instagram, setInstagram] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // Auto-fill user data
  useEffect(() => {
    if (!open) return;
    
    let alive = true;
    (async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) return;
        
        const { user } = await response.json();
        if (!alive) return;
        
        if (user?.email) setEmail(user.email);
        if (user?.name && !name) setName(user.name);
      } catch (error) {
        console.warn("Failed to fetch user data:", error);
      }
    })();
    
    return () => { alive = false; };
  }, [open, name]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setError(null);
      setOk(null);
    }
  }, [open]);

  // Phone formatting
  function formatPhone(raw: string): string {
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    const areaCode = digits.slice(0, 3);
    const exchange = digits.slice(3, 6);
    const number = digits.slice(6, 10);
    
    if (digits.length <= 3) return areaCode;
    if (digits.length <= 6) return `(${areaCode}) ${exchange}`;
    return `(${areaCode}) ${exchange}-${number}`;
  }

  // Instagram cleaning
  function cleanInstagramHandle(input: string): string {
    if (!input) return '';
    
    let cleaned = input.trim();
    cleaned = cleaned.replace(/^https?:\/\/(www\.)?instagram\.com\//, '');
    cleaned = cleaned.replace(/^@/, '');
    cleaned = cleaned.replace(/\/$/, '');
    cleaned = cleaned.replace(/[^a-zA-Z0-9._]/g, '');
    
    return cleaned;
  }

  // Form validation
  const canSubmit = useMemo(() => {
    return name.trim().length > 0 && !busy;
  }, [name, busy]);

  // Submit handler
  async function handleSubmit() {
    if (!canSubmit) return;
    
    setBusy(true);
    setError(null);
    setOk(null);
    
    try {
      const phoneDigits = phone.replace(/\D/g, "");
      const validPhone = phoneDigits.length === 10 ? phone : null;
      const cleanedInstagram = cleanInstagramHandle(instagram);
      
      const payload = {
        jobId,
        name: name.trim(),
        note: note.trim() || null,
        ...(validPhone && { phone: validPhone }),
        ...(cleanedInstagram && { instagram: cleanedInstagram }),
      };

      const response = await fetch("/api/inbox/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        window.location.href = `/signin?next=/jobs/${jobId}`;
        return;
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(errorText || `Request failed with status ${response.status}`);
      }

      setOk("Inquiry sent successfully!");
      
      setTimeout(() => {
        onClose();
        setName("");
        setPhone("");
        setNote("");
        setInstagram("");
      }, 1200);
      
    } catch (err: any) {
      console.error("Inquiry submission error:", err);
      setError(err?.message || "Failed to send inquiry. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  // Common styles for everything left-aligned
  const containerStyle = {
    width: '100%',
    textAlign: 'left' as const,
    display: 'block',
  };

  const labelStyle = {
    display: 'block',
    width: '100%',
    textAlign: 'left' as const,
    marginBottom: '6px',
    fontSize: '12px',
    fontWeight: '500',
    color: 'rgb(203 213 225)',
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    backgroundColor: 'rgb(24 24 27)',
    border: '1px solid rgb(51 65 85)',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    outline: 'none',
    textAlign: 'left' as const,
  };

  const helperStyle = {
    fontSize: '11px',
    color: 'rgb(100 116 139)',
    marginTop: '4px',
    textAlign: 'left' as const,
    display: 'block',
    width: '100%',
  };

  return (
    <div 
      className="fixed inset-0 z-[80] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm"
      style={{ textAlign: 'left' }}
    >
      <div 
        className="w-full md:max-w-lg bg-zinc-950 border border-slate-800 rounded-xl shadow-xl"
        style={{ textAlign: 'left' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div style={{ textAlign: 'left' }}>
            <h3 className="text-base font-semibold text-white" style={{ textAlign: 'left' }}>Send an Inquiry</h3>
            <p className="text-xs text-slate-400 mt-0.5" style={{ textAlign: 'left' }}>
              Your contact details will be shared with the employer
            </p>
          </div>
          <button
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={onClose}
            aria-label="Close modal"
            disabled={busy}
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4" style={{ textAlign: 'left' }}>
          {/* Name */}
          <div style={containerStyle}>
            <label style={labelStyle}>
              Name <span style={{ color: 'rgb(248 113 113)' }}>*</span>
            </label>
            <input
              type="text"
              style={inputStyle}
              maxLength={25}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoFocus
              disabled={busy}
            />
            <div style={helperStyle}>
              {name.length}/25 characters
            </div>
          </div>

          {/* Email */}
          <div style={containerStyle}>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              style={{ ...inputStyle, backgroundColor: 'rgb(51 65 85)', cursor: 'not-allowed' }}
              value={email}
              readOnly
              disabled
              placeholder="(automatically filled from your account)"
            />
            <div style={helperStyle}>
              Auto-filled from your account
            </div>
          </div>

          {/* Phone */}
          <div style={containerStyle}>
            <label style={labelStyle}>
              Phone Number <span style={{ fontSize: '11px', color: 'rgb(100 116 139)' }}>(optional)</span>
            </label>
            <input
              type="tel"
              style={inputStyle}
              inputMode="numeric"
              maxLength={14}
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="(555) 123-4567"
              disabled={busy}
            />
            <div style={helperStyle}>
              Optional but helps employers contact you faster
            </div>
          </div>

          {/* Instagram */}
          <div style={containerStyle}>
            <label style={labelStyle}>
              Instagram <span style={{ fontSize: '11px', color: 'rgb(100 116 139)' }}>(optional)</span>
            </label>
            <div style={{ position: 'relative', width: '100%', textAlign: 'left' }}>
              <span style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgb(148 163 184)',
                pointerEvents: 'none',
              }}>
                @
              </span>
              <input
                type="text"
                style={{ ...inputStyle, paddingLeft: '28px' }}
                maxLength={100}
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="yourhandle"
                disabled={busy}
              />
            </div>
            <div style={helperStyle}>
              Share your portfolio and work samples • {instagram.length}/100 characters
            </div>
          </div>

          {/* Message */}
          <div style={containerStyle}>
            <label style={labelStyle}>
              Message <span style={{ fontSize: '11px', color: 'rgb(100 116 139)' }}>(optional)</span>
            </label>
            <textarea
              style={{ ...inputStyle, height: '96px', resize: 'none' }}
              maxLength={200}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tell them about your experience, availability, or ask questions..."
              disabled={busy}
            />
            <div style={helperStyle}>
              {note.length}/200 characters
            </div>
          </div>

          {/* Error/Success */}
          {error && (
            <div style={{
              padding: '12px',
              backgroundColor: 'rgb(239 68 68 / 0.1)',
              border: '1px solid rgb(239 68 68 / 0.2)',
              borderRadius: '8px',
              color: 'rgb(248 113 113)',
              fontSize: '14px',
              textAlign: 'left',
            }}>
              {error}
            </div>
          )}
          
          {ok && (
            <div style={{
              padding: '12px',
              backgroundColor: 'rgb(34 197 94 / 0.1)',
              border: '1px solid rgb(34 197 94 / 0.2)',
              borderRadius: '8px',
              color: 'rgb(74 222 128)',
              fontSize: '14px',
              textAlign: 'left',
            }}>
              {ok}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-slate-800">
          <button 
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-transparent border border-slate-600 rounded-lg hover:bg-slate-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
            onClick={onClose} 
            disabled={busy}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-sm font-semibold text-black bg-emerald-500 rounded-lg hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {busy ? "Sending..." : "Send Inquiry"}
          </button>
        </div>

        {/* Hint */}
        <div className="px-4 pb-2" style={{ textAlign: 'center' }}>
          <p className="text-xs text-slate-600">
            Press Esc to close • Cmd+Enter to send
          </p>
        </div>
      </div>
    </div>
  );
}