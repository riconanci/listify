import { NextResponse } from "next/server";

// GET /api/geocode?lat=...&lon=... (reverse geocode)
// GET /api/geocode?q=... (forward geocode)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const q = searchParams.get("q");

    let url: string;

    if (lat && lon) {
      // Reverse geocode
      url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
    } else if (q) {
      // Forward geocode
      url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&addressdetails=1`;
    } else {
      return NextResponse.json(
        { error: "Provide lat/lon or q parameter" },
        { status: 400 }
      );
    }

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Listify/1.0 (beauty marketplace)",
        "Accept": "application/json",
      },
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Geocoding failed" },
      { status: 500 }
    );
  }
}
