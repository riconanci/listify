// components/SafeImage.tsx
"use client";

import { useState } from "react";
import clsx from "clsx";
import { getServicePlaceholder } from "@/lib/service-placeholders";

type Props = {
  src?: string | null;
  alt?: string;
  className?: string;
  service?: string | null; // for service-specific placeholders
  fallbackSrc?: string;
};

export default function SafeImage({
  src,
  alt = "",
  className,
  service,
  fallbackSrc,
}: Props) {
  const [err, setErr] = useState(false);
  
  // Determine final src with service-aware fallback
  const finalSrc = !src || err 
    ? fallbackSrc || getServicePlaceholder(service)
    : src;

  return (
    <img
      src={finalSrc}
      alt={alt}
      className={clsx("object-cover", className)}
      onError={() => setErr(true)}
      loading="lazy"
      decoding="async"
    />
  );
}