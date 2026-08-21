import { storage, uid } from "@/data/storage";
import { DEMO_ADMIN_EMAIL, DEMO_USER_ID } from "@/data/seed";
import type { Session } from "@/types";

interface LocalAccount { id: string; email: string; password: string; username: string; createdAt: string; isAdmin: boolean; }
interface LocalProfile { id: string; user_id: string; username: string; batch: string; stream: string; state: string; lga: string; ppa: string; status: "serving" | "completed" | "pending"; bio: string; reg_number: string; follower_count: number; following_count: number; }
const ACCOUNTS = "accounts";
const SESSION = "session";
const PROFILE_PREFIX = "users.";
const ensureAccounts = (): LocalAccount[] => storage.get(ACCOUNTS, [
  { id: DEMO_USER_ID, email: "demo@nysc.test", password: "Demo1234", username: "Ada Okonkwo", createdAt: new Date().toISOString(), isAdmin: false },
  { id: "admin-user", email: DEMO_ADMIN_EMAIL, password: "Admin1234", username: "Admin", createdAt: new Date().toISOString(), isAdmin: true },
]);
const saveAccounts = (v: LocalAccount[]) => storage.set(ACCOUNTS, v);
const toSession = (a: LocalAccount): Session => ({ id: a.id, email: a.email, username: a.username, isAdmin: a.isAdmin, createdAt: a.createdAt });

export const authService = {
  async getSession(): Promise<Session | null> { return storage.get<Session | null>(SESSION, null); },
  async login(email: string, password: string) {
    const account = ensureAccounts().find(a => a.email === email.trim().toLowerCase() && a.password === password);
    if (!account) return { success: false as const, error: "Invalid email or password" };
    const session = toSession(account); storage.set(SESSION, session); return { success: true as const, session };
  },
  async signup(email: string, password: string) {
    const normalized = email.trim().toLowerCase();
    if (!normalized || !password) return { success: false as const, error: "Please enter both email and password" };
    if (password.length < 8) return { success: false as const, error: "Password must be at least 8 characters." };
    const accounts = ensureAccounts();
    if (accounts.some(a => a.email === normalized)) return { success: false as const, error: "An account with this email already exists." };
    const username = normalized.split("@")[0] || "corper";
    const accountId = uid();
    const account: LocalAccount = { id: accountId, email: normalized, password, username, createdAt: new Date().toISOString(), isAdmin: false };
    saveAccounts([...accounts, account]);
    const profile: LocalProfile = { id: uid(), user_id: accountId, username, batch: "", stream: "", state: "", lga: "", ppa: "", status: "serving", bio: "", reg_number: "", follower_count: 0, following_count: 0 };
    storage.set(`${PROFILE_PREFIX}${accountId}`, [profile]);
    const session = toSession(account); storage.set(SESSION, session); return { success: true as const, session };
  },
  async logout() { storage.remove(SESSION); },
  async forgotPassword(email: string) { return ensureAccounts().some(a => a.email === email.trim().toLowerCase()) ? { success: true as const } : { success: false as const, error: "No account found with that email" }; },
  async resetPassword(newPassword: string) { if (newPassword.length < 8) return { success: false as const, error: "Password must be at least 8 characters." }; const session = storage.get<Session | null>(SESSION, null); if (!session) return { success: false as const, error: "Please sign in before resetting your password." }; const accounts = ensureAccounts().map(a => a.id === session.id ? { ...a, password: newPassword } : a); saveAccounts(accounts); return { success: true as const }; },
};
