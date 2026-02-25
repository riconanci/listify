// lib/service-placeholders.ts
export type ServiceType = "barber" | "cosmetologist" | "tattoo_artist";

// Service-specific placeholder mapping
export const SERVICE_PLACEHOLDERS: Record<ServiceType, string> = {
  barber: "/placeholders/barber-placeholder.png",
  cosmetologist: "/placeholders/cosmetologist-placeholder.png", 
  tattoo_artist: "/placeholders/tattoo-placeholder.png",
};

// Get placeholder image for a service
export function getServicePlaceholder(service?: string | null): string {
  if (!service) return "/placeholder.jpg"; // generic fallback
  
  const serviceKey = service as ServiceType;
  return SERVICE_PLACEHOLDERS[serviceKey] || "/placeholder.jpg";
}