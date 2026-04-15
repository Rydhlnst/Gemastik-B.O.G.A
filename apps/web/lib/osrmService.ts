/**
 * OSRM Routing Service for B.O.G.A Logistics
 * Ensures real-road following paths instead of straight lines.
 * Includes demo-safe hardcoded fallbacks to prevent Rate Limiting issues.
 */

const OSRM_BASE_URL = "http://router.project-osrm.org/route/v1/driving";

// Hardcoded fallbacks for the Primary Demo IDs (Vendor 1 to School 1, etc.)
// These ensure the demo always works even without OSRM API connectivity.
const DEMO_FALLBACKS: Record<string, [number, number][]> = {
  "1-1": [
      [-6.1780, 106.8450], [-6.1785, 106.8445], [-6.1795, 106.8430], 
      [-6.1810, 106.8410], [-6.1825, 106.8390], [-6.1840, 106.8360], 
      [-6.1850, 106.8340], [-6.1854, 106.8321]
  ],
  "3-3": [
      [-6.1920, 106.8280], [-6.1925, 106.8290], [-6.1930, 106.8305], 
      [-6.1935, 106.8325], [-6.1940, 106.8335], [-6.1943, 106.8341]
  ],
  "5-2": [
      [-6.1860, 106.8310], [-6.1865, 106.8320], [-6.1875, 106.8340], 
      [-6.1882, 106.8355], [-6.1887, 106.8365]
  ]
};

const routeCache = new Map<string, [number, number][]>();

export async function getRoute(start: [number, number], end: [number, number], key?: string): Promise<[number, number][]> {
  const cacheKey = key || `${start.join(",")}-${end.join(",")}`;
  
  // 1. Check Memory Cache
  if (routeCache.has(cacheKey)) return routeCache.get(cacheKey)!;

  // 2. Check Demo Fallbacks
  if (key && DEMO_FALLBACKS[key]) return DEMO_FALLBACKS[key];

  // 3. Fetch from OSRM API
  try {
    // OSRM expects Longitude, Latitude
    const url = `${OSRM_BASE_URL}/${start[1]},${start[0]};${end[1]},${end[0]}?geometries=geojson&overview=full`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.code === "Ok" && data.routes?.[0]?.geometry?.coordinates) {
      // Convert OSRM [lng, lat] back to Leaflet [lat, lng]
      const path: [number, number][] = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
      routeCache.set(cacheKey, path);
      return path;
    }
  } catch (error) {
    console.error("OSRM Routing Error:", error);
  }

  // Final Fallback: Simple straight line if all else fails
  return [start, end];
}
