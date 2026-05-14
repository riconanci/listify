"use client";

import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = L.divIcon({
  className: "",
  html: `<div style="
    width: 16px; height: 16px;
    background: #3b82f6;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 0 8px rgba(59,130,246,0.5);
  "></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

interface MapJob {
  id: string;
  businessName: string;
  title: string;
  specialties: string[];
  compModel: string;
  payMin: number | null;
  payMax: number | null;
  payUnit: string | null;
  lat: number;
  lng: number;
  city?: string | null;
}

interface BrowseMapProps {
  jobs: MapJob[];
  userLat?: number;
  userLng?: number;
  radiusMiles?: number;
}

function formatRole(role: string): string {
  return role
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatComp(
  compModel: string,
  payMin?: number | null,
  payMax?: number | null,
  payUnit?: string | null
): string {
  const unit = payUnit?.replace(/^\$/, "") || "";

  if (compModel === "commission") {
    if (payMin) return `${payMin}%`;
    return "Commission";
  }
  if (compModel === "booth_rent") {
    if (payMin) return `$${payMin}${unit || "/wk"}`;
    return "Booth Rent";
  }
  if (compModel === "hybrid") {
    const wage = payMin ? `$${payMin}/hr` : "";
    const comm = payMax ? `${payMax}%` : "";
    if (wage && comm) return `${wage} + ${comm}`;
    return "Hourly + Comm";
  }
  if (payMin && payMax && payMin !== payMax) return `$${payMin}-$${payMax}/hr`;
  if (payMin) return `$${payMin}/hr`;
  return "Hourly";
}

// Controls map center/zoom imperatively — reacts to all prop changes
function MapController({
  userLat,
  userLng,
  radiusMeters,
  hasUserLocation,
}: {
  userLat?: number;
  userLng?: number;
  radiusMeters: number;
  hasUserLocation: boolean;
}) {
  const map = useMap();
  const prevKey = useRef("");
  const mounted = useRef(false);

  // Initial fit after map is fully ready
  useEffect(() => {
    const handleReady = () => {
      mounted.current = true;
      // Fix for map rendering in previously hidden container
      map.invalidateSize();
    };
    map.whenReady(handleReady);
    return () => { mounted.current = false; };
  }, [map]);

  useEffect(() => {
    const key = `${userLat}-${userLng}-${radiusMeters}`;
    if (key === prevKey.current) return;
    prevKey.current = key;

    if (!hasUserLocation || !userLat || !userLng) return;

    const fitMap = () => {
      try {
        const center = L.latLng(userLat, userLng);
        const bounds = center.toBounds(radiusMeters * 2);
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
      } catch {
        // Map not ready — retry once more
        setTimeout(() => {
          try {
            const center = L.latLng(userLat, userLng);
            const bounds = center.toBounds(radiusMeters * 2);
            map.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
          } catch {}
        }, 300);
      }
    };

    // Wait for map to be fully initialized
    if (mounted.current) {
      setTimeout(fitMap, 50);
    } else {
      map.whenReady(() => setTimeout(fitMap, 50));
    }
  }, [map, userLat, userLng, radiusMeters, hasUserLocation]);

  return null;
}

export default function BrowseMap({ jobs, userLat, userLng, radiusMiles = 15 }: BrowseMapProps) {
  const radiusMeters = radiusMiles * 1609.34;
  const hasUserLocation = userLat !== undefined && userLng !== undefined;

  // Default center — will be overridden by MapController
  const defaultCenter: [number, number] = [32.85, -117.15];

  return (
    <div className="rounded-xl border border-slate-800 overflow-hidden">
      <MapContainer
        center={defaultCenter}
        zoom={10}
        className="h-[500px] md:h-[600px] w-full z-0"
        scrollWheelZoom={true}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com">CARTO</a>'
        />

        {/* Map controller — always present, handles centering + radius fitting */}
        <MapController
          userLat={userLat}
          userLng={userLng}
          radiusMeters={radiusMeters}
          hasUserLocation={hasUserLocation}
        />

        {/* User location dot + radius circle */}
        {hasUserLocation && (
          <>
            <Circle
              key={`circle-${radiusMiles}`}
              center={[userLat!, userLng!]}
              radius={radiusMeters}
              pathOptions={{
                color: "#3b82f6",
                weight: 1.5,
                opacity: 0.4,
                fillColor: "#3b82f6",
                fillOpacity: 0.08,
              }}
            />
            <Marker position={[userLat!, userLng!]} icon={userIcon}>
              <Popup>
                <div className="text-center p-1">
                  <p className="text-sm font-bold text-slate-900">Your Location</p>
                  <p className="text-xs text-slate-500">{radiusMiles} mile radius</p>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Listing markers */}
        {jobs.map((job) => (
          <Marker key={job.id} position={[job.lat, job.lng]} icon={markerIcon}>
            <Popup>
              <div className="min-w-[200px] p-1">
                <Link
                  href={`/jobs/${job.id}`}
                  className="block hover:opacity-80 transition-opacity"
                >
                  <p className="text-sm font-bold text-slate-900 leading-tight">
                    {job.businessName}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">{job.title}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">
                      {job.specialties.map(formatRole).join(" · ")}
                    </span>
                    <span className="font-semibold text-slate-800">
                      {formatComp(job.compModel, job.payMin, job.payMax, job.payUnit)}
                    </span>
                  </div>
                  {job.city && (
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      {job.city}
                    </p>
                  )}
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
