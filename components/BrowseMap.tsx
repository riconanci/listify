"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
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

export default function BrowseMap({ jobs, userLat, userLng }: BrowseMapProps) {
  // Center on user location or San Diego
  const center: [number, number] = userLat && userLng
    ? [userLat, userLng]
    : [32.7157, -117.1611];

  const zoom = userLat ? 11 : 10;

  return (
    <div className="rounded-xl border border-slate-800 overflow-hidden">
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-[500px] md:h-[600px] w-full z-0"
        scrollWheelZoom={true}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com">CARTO</a>'
        />

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
