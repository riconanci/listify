/**
 * City centroids for San Diego County.
 *
 * Used when a listing's `addressVisible` is false — instead of dropping the pin
 * at the exact lat/lng, we plot it at the city centroid. The listing detail
 * page then shows only "City, State" and a note that the exact address will
 * be shared after an inquiry.
 *
 * Lookup is case-insensitive and tolerant of variations like "San Diego, CA"
 * or extra whitespace. Returns null if the city is not in the map.
 */

const CITY_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  // Coastal North County
  oceanside: { lat: 33.1959, lng: -117.3795 },
  carlsbad: { lat: 33.1581, lng: -117.3506 },
  encinitas: { lat: 33.037, lng: -117.292 },
  "solana beach": { lat: 32.9912, lng: -117.2713 },
  "del mar": { lat: 32.9595, lng: -117.2653 },
  "la jolla": { lat: 32.8328, lng: -117.2713 },

  // Inland North County
  vista: { lat: 33.2, lng: -117.2425 },
  "san marcos": { lat: 33.1434, lng: -117.1661 },
  escondido: { lat: 33.1192, lng: -117.0864 },
  poway: { lat: 32.9628, lng: -117.0359 },

  // Central / East
  "san diego": { lat: 32.7157, lng: -117.1611 },
  "la mesa": { lat: 32.7678, lng: -117.0231 },
  "el cajon": { lat: 32.7948, lng: -116.9625 },
  santee: { lat: 32.8384, lng: -116.9739 },
  coronado: { lat: 32.6859, lng: -117.1831 },

  // South Bay
  "chula vista": { lat: 32.6401, lng: -117.0842 },
  "national city": { lat: 32.6781, lng: -117.0992 },
  "imperial beach": { lat: 32.5839, lng: -117.1131 },
};

/**
 * Look up a city centroid by name.
 * @param city - City name (case-insensitive, trimmed). Strips trailing ", CA"
 *               or state suffixes for tolerance.
 * @returns {lat, lng} or null if not found.
 */
export function getCityCentroid(
  city?: string | null
): { lat: number; lng: number } | null {
  if (!city) return null;
  const normalized = city
    .toLowerCase()
    .replace(/,\s*ca(\s|$|lifornia)?.*/i, "")
    .trim();
  return CITY_CENTROIDS[normalized] || null;
}

/**
 * Resolve the lat/lng to display for a job marker, respecting addressVisible.
 *
 * - If addressVisible is true: returns exact coords as-is
 * - If false and city is mappable: returns city centroid
 * - If false and city is not mappable: returns null (caller should skip rendering)
 */
export function resolveDisplayCoords(opts: {
  lat?: number | null;
  lng?: number | null;
  city?: string | null;
  addressVisible?: boolean;
}): { lat: number; lng: number; isApproximate: boolean } | null {
  const { lat, lng, city, addressVisible } = opts;
  // Default to visible if undefined (older records before the field existed)
  const visible = addressVisible !== false;

  if (visible) {
    if (lat == null || lng == null) return null;
    return { lat, lng, isApproximate: false };
  }

  // Hidden address → use city centroid
  const centroid = getCityCentroid(city);
  if (!centroid) return null;
  return { ...centroid, isApproximate: true };
}
