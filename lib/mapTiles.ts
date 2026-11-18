// One place for the basemap all three maps use (Browse, Post, listing detail).
//
// CARTO basemaps require an API key: without one the tiles are served with an
// "API KEY REQUIRED" watermark. The key is requested at
// https://carto.com/basemaps/apikey and goes in NEXT_PUBLIC_CARTO_KEY.
// It is sent with every tile request, so it is visible in the browser by
// design; keep it out of the repository and restrict it to your sites in the
// CARTO dashboard.

import { useSyncExternalStore } from "react";

const CARTO_KEY = process.env.NEXT_PUBLIC_CARTO_KEY;

// CARTO's two matching styles: "dark_all" (Dark Matter) and "light_all" (Positron).
function tileUrl(style: "dark_all" | "light_all"): string {
  return (
    `https://{s}.basemaps.cartocdn.com/${style}/{z}/{x}/{y}{r}.png` +
    (CARTO_KEY ? `?key=${encodeURIComponent(CARTO_KEY)}` : "")
  );
}

const TILE_URL_DARK = tileUrl("dark_all");
const TILE_URL_LIGHT = tileUrl("light_all");

const LIGHT_QUERY = "(prefers-color-scheme: light)";

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(LIGHT_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * The basemap that matches the app's current appearance. The app follows the
 * device's light/dark setting, so the map does too, and it switches live if
 * the setting changes while a map is on screen.
 */
export function useTileUrl(): string {
  const light = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(LIGHT_QUERY).matches,
    () => false
  );
  return light ? TILE_URL_LIGHT : TILE_URL_DARK;
}

// Required on every map by both OpenStreetMap's licence and CARTO's terms.
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
  '&copy; <a href="https://carto.com/attribution">CARTO</a>';
