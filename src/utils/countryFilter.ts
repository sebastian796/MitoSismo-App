
import {
  booleanPointInPolygon,
  buffer,
  point,
} from "@turf/turf";

import type {
  Feature,
  FeatureCollection,
  Polygon,
  MultiPolygon,
} from "geojson";

import countriesData from "../data/countries.min.json";

type CountryName =
  | "Perú"
  | "Chile"
  | "Ecuador"
  | "Colombia"
  | "México";

type CountryProperties = {
  name: string;
  iso: string;
};

type CountryPolygon = Feature<
  Polygon | MultiPolygon,
  CountryProperties
>;

type CountryCollection = FeatureCollection<
  Polygon | MultiPolygon,
  CountryProperties
>;

const countries = countriesData as CountryCollection;

const COUNTRY_ISO: Record<CountryName, string> = {
  Perú: "PER",
  Chile: "CHL",
  Ecuador: "ECU",
  Colombia: "COL",
  México: "MEX",
};

const COASTAL_DISTANCE_KM = 150;

// Guardamos los filtros para no recalcularlos
// por cada terremoto.
const filterCache = new Map<
  CountryName,
  {
    territory: CountryPolygon;
    nearbyArea: Feature<Polygon | MultiPolygon>;
  }
>();

function getCountryFilter(country: CountryName) {
  const cached = filterCache.get(country);

  if (cached) {
    return cached;
  }

  const territory = countries.features.find(
    (feature) =>
      feature.properties.iso === COUNTRY_ISO[country]
  );

  if (!territory) {
    throw new Error(
      `No se encontraron fronteras para ${country}`
    );
  }

  const nearbyArea = buffer(
    territory,
    COASTAL_DISTANCE_KM,
    { units: "kilometers" }
  );

  if (!nearbyArea) {
    throw new Error(
      `No se pudo calcular la zona cercana a ${country}`
    );
  }

  const result = { territory, nearbyArea };

  filterCache.set(country, result);

  return result;
}

export function isQuakeInCountry(
  lng: number,
  lat: number,
  country: CountryName
): boolean {
  const { territory, nearbyArea } =
    getCountryFilter(country);

  const epicenter = point([lng, lat]);

  // 1. Sismo dentro del país.
  if (booleanPointInPolygon(epicenter, territory)) {
    return true;
  }

  // 2. Sismo demasiado lejos del país.
  if (!booleanPointInPolygon(epicenter, nearbyArea)) {
    return false;
  }

  // 3. Descartar territorios extranjeros.
  const insideAnotherCountry = countries.features.some(
    (feature) => {
      if (feature.properties.iso === COUNTRY_ISO[country]) {
        return false;
      }

      return booleanPointInPolygon(epicenter, feature);
    }
  );

  if (insideAnotherCountry) {
    return false;
  }

  // 4. Sismo en la zona cercana, fuera
  // de territorios terrestres extranjeros.
  return true;
}
