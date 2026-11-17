// One place for the basemap all three maps use (Browse, Post, listing detail).
//
// CARTO basemaps require an API key: without one the tiles are served with an
// "API KEY REQUIRED" watermark. The key is requested at
// https://carto.com/basemaps/apikey and goes in NEXT_PUBLIC_CARTO_KEY.
// It is sent with every tile request, so it is visible in the browser by
// design; keep it out of the repository and restrict it to your sites in the
// CARTO dashboard.

const CARTO_KEY = process.env.NEXT_PUBLIC_CARTO_KEY;

export const TILE_URL =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" +
  (CARTO_KEY ? `?key=${encodeURIComponent(CARTO_KEY)}` : "");

// Required on every map by both OpenStreetMap's licence and CARTO's terms.
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
  '&copy; <a href="https://carto.com/attribution">CARTO</a>';
