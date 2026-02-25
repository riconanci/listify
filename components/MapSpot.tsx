// components/MapSpot.tsx - FINAL WORKING VERSION
"use client";

import { useEffect, useRef } from "react";

export default function MapSpot({
  lat,
  lng,
  zoom = 12,
  height = 240,
}: {
  lat?: number | null;
  lng?: number | null;
  zoom?: number;
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (lat == null || lng == null || !isFinite(lat) || !isFinite(lng)) return;

    let cancelled = false;
    (async () => {
      await ensureLeafletLoaded();
      if (cancelled || !containerRef.current) return;
      const L = (window as any).L;

      // Initialize map
      mapRef.current = L.map(containerRef.current, {
        center: [lat, lng],
        zoom,
        attributionControl: false,
        zoomControl: true,
      });

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { 
        maxZoom: 19 
      }).addTo(mapRef.current);

      // Add attribution
      L.control.attribution({ 
        position: "bottomright", 
        prefix: false 
      }).addAttribution("© OpenStreetMap").addTo(mapRef.current);

      // Create custom down arrow icon using SVG
      const arrowIcon = L.divIcon({
        html: `
          <svg width="24" height="30" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C7.58 2 4 5.58 4 10C4 16 12 28 12 28C12 28 20 16 20 10C20 5.58 16.42 2 12 2Z" 
                  fill="#ef4444" stroke="#ffffff" stroke-width="2"/>
            <circle cx="12" cy="10" r="3" fill="#ffffff"/>
          </svg>
        `,
        className: 'custom-arrow-marker',
        iconSize: [24, 30],
        iconAnchor: [12, 30], // Point of the arrow touches the location
        popupAnchor: [0, -30]
      });

      // Use the custom arrow marker
      markerRef.current = L.marker([lat, lng], {
        icon: arrowIcon
      }).addTo(mapRef.current);

      // Optional: Add a popup
      markerRef.current.bindPopup("Job Location");

      // Fix blank tiles after mount
      setTimeout(() => {
        try { mapRef.current?.invalidateSize(); } catch {}
      }, 80);

      const onResize = () => {
        try { mapRef.current?.invalidateSize(); } catch {}
      };
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
      };
    })();

    return () => {
      cancelled = true;
      try { mapRef.current?.remove(); } catch {}
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [lat, lng, zoom]);

  // Keep marker in sync if coords change
  useEffect(() => {
    if (mapRef.current && markerRef.current && lat != null && lng != null) {
      try {
        markerRef.current.setLatLng([lat, lng]);
        mapRef.current.panTo([lat, lng]);
      } catch {}
    }
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-xl border border-slate-800 overflow-hidden bg-slate-900"
      style={{ height }}
      aria-label="Map showing job location"
    />
  );
}

async function ensureLeafletLoaded(): Promise<void> {
  if (typeof window !== "undefined" && (window as any).L) return;

  await new Promise<void>((resolve, reject) => {
    // Load Leaflet CSS
    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    cssLink.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    cssLink.crossOrigin = "";
    document.head.appendChild(cssLink);

    // Load Leaflet JS
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    script.crossOrigin = "";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Leaflet"));
    document.head.appendChild(script);
  });
}