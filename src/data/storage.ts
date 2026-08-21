// Centralized browser persistence. UI and services do not access localStorage directly.
const NAMESPACE = "nysc.v1";
const key = (name: string) => `${NAMESPACE}.${name}`;

export class StorageError extends Error {
  constructor(message: string) { super(message); this.name = "StorageError"; }
}

export const storage = {
  get<T>(name: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = window.localStorage.getItem(key(name));
      return raw === null ? fallback : JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },
  set<T>(name: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key(name), JSON.stringify(value));
    } catch (error) {
      throw new StorageError(error instanceof Error ? error.message : "Unable to save data in this browser.");
    }
  },
  remove(name: string): void {
    if (typeof window === "undefined") return;
    try { window.localStorage.removeItem(key(name)); }
    catch (error) { throw new StorageError(error instanceof Error ? error.message : "Unable to remove stored data."); }
  },
  clear(): void {
    if (typeof window === "undefined") return;
    try {
      Object.keys(window.localStorage).filter((k) => k.startsWith(`${NAMESPACE}.`)).forEach((k) => window.localStorage.removeItem(k));
    } catch (error) {
      throw new StorageError(error instanceof Error ? error.message : "Unable to clear stored data.");
    }
  },
};

export function ensureSeeded<T>(name: string, seed: () => T): T {
  const existing = storage.get<T | null>(name, null);
  if (existing !== null) return existing;
  const value = seed();
  storage.set(name, value);
  return value;
}

export const uid = () => typeof crypto !== "undefined" && "randomUUID" in crypto
  ? crypto.randomUUID()
  : `id_${Math.random().toString(36).slice(2)}_${Date.now()}`;
