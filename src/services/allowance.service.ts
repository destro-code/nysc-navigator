import { storage, uid } from "@/data/storage";
import { seedAllowance } from "@/data/seed";
import type { AllowanceRecord, AllowanceStatus } from "@/types";

const key = (id: string) => `allowance.${id}`;

export const allowanceService = {
  async list(userId: string) {
    return storage.get<AllowanceRecord[]>(key(userId), userId === "demo-user-1" ? seedAllowance() : []);
  },
  async upsert(record: Omit<AllowanceRecord, "id"> & { id?: string }) {
    const records = await this.list(record.user_id);
    const id = record.id ?? uid();
    const next = { ...record, id };
    const result = [...records.filter((r) => !(r.month === record.month && r.year === record.year)), next];
    storage.set(key(record.user_id), result);
    return next;
  },
  async setStatus(userId: string, id: string, status: AllowanceStatus) {
    const records = await this.list(userId);
    const next = records.map((record) => record.id === id ? { ...record, status } : record);
    storage.set(key(userId), next);
    return next.find((record) => record.id === id) ?? null;
  },
  async add(userId: string, month: string, year: number, amount: number) {
    return this.upsert({ user_id: userId, month, year, amount, status: "pending", notes: "" });
  },
};
