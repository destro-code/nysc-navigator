import { delay, ensureSeeded, storage } from "@/data/storage";
import { seedClearance } from "@/data/seed";
import type { ClearanceProgressEntry } from "@/types";

const KEY = "clearance";

const read = (): ClearanceProgressEntry[] => ensureSeeded(KEY, seedClearance);
const write = (list: ClearanceProgressEntry[]) => storage.set(KEY, list);

export const clearanceService = {
  async list(userId: string): Promise<ClearanceProgressEntry[]> {
    await delay();
    return read().filter((e) => e.user_id === userId);
  },

  async toggle(entry: Omit<ClearanceProgressEntry, "completed_at">): Promise<ClearanceProgressEntry> {
    await delay(80);
    const list = read();
    const idx = list.findIndex((e) => e.user_id === entry.user_id && e.item_id === entry.item_id);
    const next: ClearanceProgressEntry = {
      ...entry,
      completed_at: entry.completed ? new Date().toISOString() : null,
    };
    if (idx >= 0) list[idx] = next; else list.push(next);
    write(list);
    return next;
  },
};
