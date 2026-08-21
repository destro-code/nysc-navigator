// Tiny typed localStorage wrapper. All app persistence flows through here so
// a future backend developer can swap this for real API calls without touching UI.

const NAMESPACE = "nysc.v1";

const key = (name: string) => `${NAMESPACE}.${name}`;

export const storage = {
  get<T>(name: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = window.localStorage.getItem(key(name));
      if (raw === null) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },

  set<T>(name: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key(name), JSON.stringify(value));
    } catch {
      // quota exceeded or serialization failure — surface silently in the demo
    }
  },

  remove(name: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key(name));
  },

  clear(): void {
    if (typeof window === "undefined") return;
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith(`${NAMESPACE}.`))
      .forEach((k) => window.localStorage.removeItem(k));
  },
};

/** Ensure a store exists in localStorage; seed if missing. */
export function ensureSeeded<T>(name: string, seed: () => T): T {
  const existing = storage.get<T | null>(name, null as unknown as T | null);
  if (existing !== null) return existing;
  const value = seed();
  storage.set(name, value);
  return value;
}

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id_${Math.random().toString(36).slice(2)}_${Date.now()}`;

/** Simulate network latency so skeleton loaders and pending states are visible. */
export const delay = (ms = 180) => new Promise<void>((resolve) => setTimeout(resolve, ms));
