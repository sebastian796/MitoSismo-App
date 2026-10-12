/**
 * Genera src/constants/countryPolygons.json con las fronteras simplificadas de
 * 20 países latinoamericanos (mismos valores que el enum `Pais` del backend).
 *
 * Fuente: Natural Earth (dominio público) vía el paquete `world-atlas` (50m).
 *
 * Uso (no modifica package.json):
 *   npm install --no-save world-atlas topojson-client
 *   node scripts/generate-country-polygons.js
 */
const fs = require("fs");
const path = require("path");
const topojson = require("topojson-client");
const world = require("world-atlas/countries-50m.json");

// Código numérico ISO 3166 -> valor del enum Pais del backend
const ISO_TO_PAIS = {
  "032": "ARGENTINA",
  "068": "BOLIVIA",
  "076": "BRASIL",
  152: "CHILE",
  170: "COLOMBIA",
  188: "COSTA_RICA",
  192: "CUBA",
  214: "REPUBLICA_DOMINICANA",
  218: "ECUADOR",
  222: "EL_SALVADOR",
  320: "GUATEMALA",
  340: "HONDURAS",
  484: "MEXICO",
  558: "NICARAGUA",
  591: "PANAMA",
  600: "PARAGUAY",
  604: "PERU",
  630: "PUERTO_RICO",
  858: "URUGUAY",
  862: "VENEZUELA",
};

const TOLERANCE = 0.02; // grados (~2 km): quita vértices que casi no cambian la forma
const MIN_AREA = 0.0005; // grados²: descarta islotes diminutos
const DECIMALS = 2; // ~1 km de precisión

// Douglas-Peucker sobre un anillo [[lng,lat], ...]
function simplify(points, tol) {
  if (points.length <= 4) return points;
  const keep = new Array(points.length).fill(false);
  keep[0] = keep[points.length - 1] = true;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    let maxD = 0;
    let idx = -1;
    for (let i = a + 1; i < b; i++) {
      const d = distToSegment(points[i], points[a], points[b]);
      if (d > maxD) {
        maxD = d;
        idx = i;
      }
    }
    if (maxD > tol && idx !== -1) {
      keep[idx] = true;
      stack.push([a, idx], [idx, b]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

function distToSegment(p, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

function ringArea(ring) {
  let s = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    s += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return Math.abs(s / 2);
}

const round = (n) => Number(n.toFixed(DECIMALS));

const features = topojson.feature(world, world.objects.countries).features;
const countries = {};
let totalPoints = 0;

for (const f of features) {
  const key = ISO_TO_PAIS[String(f.id).padStart(3, "0")];
  if (!key) continue;

  const polys =
    f.geometry.type === "Polygon"
      ? [f.geometry.coordinates]
      : f.geometry.coordinates;
  const out = [];
  let minLng = 180,
    minLat = 90,
    maxLng = -180,
    maxLat = -90;

  for (const poly of polys) {
    if (ringArea(poly[0]) < MIN_AREA) continue; // islote muy pequeño
    const rings = [];
    poly.forEach((ring, i) => {
      if (i > 0 && ringArea(ring) < MIN_AREA) return; // lago o hueco muy pequeño
      const simple = simplify(ring, TOLERANCE);
      if (simple.length < 4) return;
      const flat = [];
      for (const [lng, lat] of simple) {
        flat.push(round(lng), round(lat));
        if (i === 0) {
          minLng = Math.min(minLng, lng);
          maxLng = Math.max(maxLng, lng);
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
        }
      }
      totalPoints += simple.length;
      rings.push(flat);
    });
    if (rings.length) out.push(rings);
  }

  countries[key] = {
    bbox: [round(minLng), round(minLat), round(maxLng), round(maxLat)],
    polygons: out,
  };
}

const target = path.join(
  __dirname,
  "..",
  "src",
  "constants",
  "countryPolygons.json",
);
fs.writeFileSync(
  target,
  JSON.stringify({ source: "Natural Earth 50m (world-atlas)", countries }),
);
console.log(
  `OK: ${Object.keys(countries).length} países, ${totalPoints} vértices, ${(fs.statSync(target).size / 1024).toFixed(0)} KB -> ${target}`,
);
