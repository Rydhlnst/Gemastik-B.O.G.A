const fs = require('fs');
const http = require('http');

const routes = [
  { id: '1-1', start: [106.8450, -6.1780], end: [106.8321, -6.1854] },
  { id: '2-2', start: [106.8520, -6.2050], end: [106.8365, -6.1887] },
  { id: '3-3', start: [106.8280, -6.1920], end: [106.8341, -6.1943] }
];

async function fetchRoute(start, end) {
  return new Promise((resolve, reject) => {
    const url = `http://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&overview=full`;
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.code === 'Ok') {
             // OSRM [lng, lat] -> Leaflet [lat, lng]
             const coords = json.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
             resolve(coords);
          } else {
             reject(json.code);
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  const results = {};
  for (const r of routes) {
    try {
      console.log(`Fetching route ${r.id}...`);
      results[r.id] = await fetchRoute(r.start, r.end);
    } catch (e) {
      console.error(`Failed ${r.id}:`, e);
    }
  }
  
  const content = `export const PRE_CACHED_ROUTES: Record<string, [number, number][]> = ${JSON.stringify(results, null, 2)};`;
  fs.writeFileSync('c:/projek/Gemastik-B.O.G.A/apps/web/lib/routeData.ts', content);
  console.log('Saved to lib/routeData.ts');
}

run();
