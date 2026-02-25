"use client";

import dynamic from "next/dynamic";

const MiniMap = dynamic(() => import("@/components/MiniMap"), {
  ssr: false,
  loading: () => (
    <div className="h-36 bg-slate-800 flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

interface LocationMapProps {
  lat: number;
  lng: number;
  className?: string;
}

export default function LocationMap({ lat, lng, className }: LocationMapProps) {
  return <MiniMap lat={lat} lng={lng} className={className} />;
}
