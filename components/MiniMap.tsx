"use client";

import { MapContainer, TileLayer, Marker, AttributionControl } from "react-leaflet";
import { useTileUrl, TILE_ATTRIBUTION } from "@/lib/mapTiles";
import L from "leaflet";
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

interface MiniMapProps {
  lat: number;
  lng: number;
  className?: string;
}

export default function MiniMap({ lat, lng, className }: MiniMapProps) {
  const tileUrl = useTileUrl();
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={14}
      className={className || "h-36 w-full"}
      scrollWheelZoom={false}
      dragging={false}
      zoomControl={false}
      attributionControl={false}
      doubleClickZoom={false}
      touchZoom={false}
    >
      <TileLayer url={tileUrl} attribution={TILE_ATTRIBUTION} />
      {/* Credit line required by the map data and tile providers */}
      <AttributionControl position="bottomright" prefix={false} />
      <Marker position={[lat, lng]} icon={markerIcon} />
    </MapContainer>
  );
}
