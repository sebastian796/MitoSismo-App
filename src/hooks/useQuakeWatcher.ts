import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { fetchRecentEarthquakes } from "../services/earthquakeService";
import { sendQuakeNotification } from "../services/notificationService";
import type { Quake } from "../types/earthquake";
import {
    NOTIFICATION_COUNTRIES,
    type NotificationSettings,
} from "../types/notifications";

const SEEN_KEY = "mitosismo:notifiedQuakeIds";
const POLL_MS = 2 * 60 * 1000;

export function useQuakeWatcher(
  settings: NotificationSettings,
  hydrated: boolean,
) {
  const settingsRef = useRef(settings);
  const busy = useRef(false);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    if (!hydrated) return;

    const check = async () => {
      const s = settingsRef.current;
      if (busy.current || !s.enabled || !s.quakes) return;
      busy.current = true;
      try {
        const raw = await AsyncStorage.getItem(SEEN_KEY);
        const seen: string[] = raw ? JSON.parse(raw) : [];
        const firstRun = raw === null; // la 1ª vez solo "memoriza", no notifica

        const targets = s.countries.length
          ? s.countries
          : NOTIFICATION_COUNTRIES;
        const lists = await Promise.all(
          targets.map((c) => fetchRecentEarthquakes(20, c)),
        );

        const byId = new Map<string, Quake>();
        lists.flat().forEach((q) => byId.set(q.id, q));
        const fresh = [...byId.values()].filter((q) => !seen.includes(q.id));
        if (fresh.length === 0) return;

        if (!firstRun) {
          const matching = fresh
            .filter((q) => q.mag >= s.minMagnitude)
            .sort((a, b) => b.mag - a.mag)
            .slice(0, 3);
          for (const q of matching) {
            await sendQuakeNotification(q, s.sound);
          }
        }

        const updated = [...fresh.map((q) => q.id), ...seen].slice(0, 200);
        await AsyncStorage.setItem(SEEN_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn("Watcher de sismos falló:", e);
      } finally {
        busy.current = false;
      }
    };

    check();
    const timer = setInterval(check, POLL_MS);
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") check();
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [hydrated]);
}
