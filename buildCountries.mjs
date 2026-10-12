
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { simplify } from "@turf/turf";

const input = "src/data/countries.json";
const output = "src/data/countries.min.json";

const countries = JSON.parse(readFileSync(input, "utf8"));

const simplified = {
  type: "FeatureCollection",
  features: countries.features.map((country) => {
    const result = simplify(country, {
      tolerance: 0.02,
      highQuality: false,
      mutate: false,
    });

    return {
      type: "Feature",
      properties: {
        name: country.properties.name,
        iso: country.properties["ISO3166-1-Alpha-3"],
      },
      geometry: result.geometry,
    };
  }),
};

writeFileSync(output, JSON.stringify(simplified));

console.log("Países procesados:", simplified.features.length);
console.log(
  "Tamaño original:",
  (statSync(input).size / 1024 / 1024).toFixed(2),
  "MB"
);
console.log(
  "Tamaño simplificado:",
  (statSync(output).size / 1024 / 1024).toFixed(2),
  "MB"
);
