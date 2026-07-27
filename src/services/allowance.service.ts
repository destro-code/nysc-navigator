import { delay, ensureSeeded, storage, uid } from "@/data/storage";
import { seedAllowance } from "@/data/seed";
import type { AllowanceRecord, AllowanceStatus } from "@/types";

const KEY = "allowance";

const read = (): AllowanceRecord[] => ensureSeeded(KEY, seedAllowance);
const write = (list: AllowanceRecord[]) => storage.set(KEY, list);

export const allowanceService = {
  async list(userId: string): Promise<AllowanceRecord[]> {
    await delay();
    return read()
      .filter((r) => r.user_id === userId)
      .sort((a, b) => a.year - b.year);
  },

  async upsert(record: Omit<AllowanceRecord, "id"> & { id?: string }): Promise<AllowanceRecord> {
    await delay(80);
    const list = read();
    const idx = list.findIndex(
      (r) => r.user_id === record.user_id && r.month === record.month && r.year === record.year,
    );
    const next: AllowanceRecord = { id: record.id ?? uid(), ...record };
    if (idx >= 0) list[idx] = { ...list[idx], ...next };
    else list.push(next);
    write(list);
    return next;
  },

  async setStatus(id: string, status: AllowanceStatus): Promise<void> {
    await delay(60);
    write(read().map((r) => (r.id === id ? { ...r, status } : r)));
  },

  async add(userId: string, month: string, year: number, amount: number): Promise<AllowanceRecord> {
    return allowanceService.upsert({ user_id: userId, month, year, amount, status: "pending", notes: "" });
  },
};
