"use client";

import { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon
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

interface MapPickerProps {
  lat?: number;
  lng?: number;
  address?: string;
  onLocationChange: (data: {
    lat: number;
    lng: number;
    city?: string;
    state?: string;
    address?: string;
  }) => void;
}

// Sub-component: click handler
function ClickHandler({
  onClick,
}: {
  onClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Sub-component: fly to position
function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 14, { duration: 0.8 });
  }, [lat, lng, map]);
  return null;
}

export default function MapPicker({
  lat: initialLat,
  lng: initialLng,
  address,
  onLocationChange,
}: MapPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    initialLat && initialLng ? [initialLat, initialLng] : null
  );
  const [geocoding, setGeocoding] = useState(false);

  // San Diego County center
  const defaultCenter: [number, number] = [32.7157, -117.1611];

  const handleMapClick = async (lat: number, lng: number) => {
    setPosition([lat, lng]);

    // Reverse geocode
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
        { headers: { "User-Agent": "Listify/1.0" } }
      );
      const data = await res.json();
      const addr = data.address || {};
      onLocationChange({
        lat,
        lng,
        city:
          addr.city ||
          addr.town ||
          addr.village ||
          addr.suburb ||
          "",
        state: addr.state || "",
        address: data.display_name?.split(",").slice(0, 2).join(",") || "",
      });
    } catch {
      onLocationChange({ lat, lng });
    }
  };

  // Geocode address when Enter is pressed in the parent input
  useEffect(() => {
    if (!address || address.length < 3) return;

    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;

      // Only if the address input is focused
      const active = document.activeElement as HTMLInputElement;
      if (!active?.dataset?.mapAddress) return;

      e.preventDefault();
      setGeocoding(true);

      try {
        const query = encodeURIComponent(`${address}, San Diego County, CA`);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`,
          { headers: { "User-Agent": "Listify/1.0" } }
        );
        const results = await res.json();

        if (results.length > 0) {
          const lat = parseFloat(results[0].lat);
          const lng = parseFloat(results[0].lon);
          setPosition([lat, lng]);

          // Also reverse geocode for city/state
          const revRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
            { headers: { "User-Agent": "Listify/1.0" } }
          );
          const revData = await revRes.json();
          const addr = revData.address || {};

          onLocationChange({
            lat,
            lng,
            city:
              addr.city ||
              addr.town ||
              addr.village ||
              addr.suburb ||
              "",
            state: addr.state || "",
            address,
          });
        }
      } catch {
        // Geocoding failed silently
      } finally {
        setGeocoding(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [address, onLocationChange]);

  return (
    <div className="relative rounded-xl border border-slate-700 overflow-hidden">
      <MapContainer
        center={position || defaultCenter}
        zoom={position ? 14 : 10}
        className="h-48 w-full z-0"
        scrollWheelZoom={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com">CARTO</a>'
        />
        <ClickHandler onClick={handleMapClick} />
        {position && (
          <>
            <Marker position={position} icon={markerIcon} />
            <FlyTo lat={position[0]} lng={position[1]} />
          </>
        )}
      </MapContainer>

      {/* Geocoding indicator */}
      {geocoding && (
        <div className="absolute top-2 right-2 z-[999] bg-bg-base/90 rounded-lg px-3 py-1.5 text-xs text-primary font-medium flex items-center gap-1.5">
          <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Finding...
        </div>
      )}

      {/* Hint */}
      {!position && (
        <div className="absolute bottom-2 left-2 z-[999] bg-bg-base/90 rounded-lg px-3 py-1.5 text-[11px] text-slate-400">
          Click map or press Enter in address field
        </div>
      )}
    </div>
  );
}
