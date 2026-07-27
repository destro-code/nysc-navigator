// Fake auth service backed by localStorage. Every function mirrors an eventual
// backend endpoint; a future developer replaces the bodies with real API calls.

import { delay, storage, uid } from "@/data/storage";
import { DEMO_ADMIN_EMAIL, DEMO_USER_ID } from "@/data/seed";
import type { Session } from "@/types";

const SESSION_KEY = "session";
const CREDENTIALS_KEY = "credentials";

interface StoredCredential {
  id: string;
  email: string;
  username: string;
  password: string; // demo only — never do this in real backend
}

const readCredentials = (): StoredCredential[] => storage.get<StoredCredential[]>(CREDENTIALS_KEY, []);
const writeCredentials = (list: StoredCredential[]) => storage.set(CREDENTIALS_KEY, list);

const buildSession = (cred: StoredCredential): Session => ({
  id: cred.id,
  email: cred.email,
  username: cred.username,
  isAdmin: cred.email.toLowerCase() === DEMO_ADMIN_EMAIL,
  createdAt: new Date().toISOString(),
});

export const authService = {
  getSession(): Session | null {
    return storage.get<Session | null>(SESSION_KEY, null);
  },

  async login(email: string, password: string): Promise<{ success: true; session: Session } | { success: false; error: string }> {
    await delay();
    const normalized = email.trim().toLowerCase();
    if (!normalized || !password) return { success: false, error: "Please enter both email and password" };

    const creds = readCredentials();
    let cred = creds.find((c) => c.email.toLowerCase() === normalized);

    // Convenience: allow logging into the seeded demo account without prior signup.
    if (!cred && normalized === "demo@demo.nysc") {
      cred = { id: DEMO_USER_ID, email: normalized, username: "Ada Okonkwo", password };
      writeCredentials([...creds, cred]);
    }
    if (!cred && normalized === DEMO_ADMIN_EMAIL) {
      cred = { id: uid(), email: normalized, username: "Admin", password };
      writeCredentials([...creds, cred]);
    }

    if (!cred) return { success: false, error: "No account found with that email. Try signing up." };
    if (cred.password !== password) return { success: false, error: "Incorrect password." };

    const session = buildSession(cred);
    storage.set(SESSION_KEY, session);
    return { success: true, session };
  },

  async signup(email: string, password: string): Promise<{ success: true; session: Session } | { success: false; error: string }> {
    await delay();
    const normalized = email.trim().toLowerCase();
    const creds = readCredentials();
    if (creds.some((c) => c.email.toLowerCase() === normalized)) {
      return { success: false, error: "An account with that email already exists." };
    }
    const cred: StoredCredential = {
      id: uid(),
      email: normalized,
      username: normalized.split("@")[0] || "corper",
      password,
    };
    writeCredentials([...creds, cred]);
    const session = buildSession(cred);
    storage.set(SESSION_KEY, session);
    return { success: true, session };
  },

  async logout(): Promise<void> {
    await delay(80);
    storage.remove(SESSION_KEY);
  },

  async forgotPassword(email: string): Promise<{ success: true } | { success: false; error: string }> {
    await delay();
    if (!email.trim()) return { success: false, error: "Please enter your email" };
    // Prototype: pretend we sent an email.
    return { success: true };
  },

  async resetPassword(newPassword: string): Promise<{ success: true } | { success: false; error: string }> {
    await delay();
    const session = authService.getSession();
    if (!session) {
      // Prototype flow: accept and pretend success even without an active session.
      return { success: true };
    }
    const creds = readCredentials();
    const idx = creds.findIndex((c) => c.id === session.id);
    if (idx >= 0) {
      creds[idx] = { ...creds[idx], password: newPassword };
      writeCredentials(creds);
    }
    return { success: true };
  },
};
