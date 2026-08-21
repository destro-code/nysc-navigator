import { supabase } from "@/lib/supabase";
import type { AllowanceRecord, AllowanceStatus } from "@/types";

export const allowanceService = {
  async list(userId: string): Promise<AllowanceRecord[]> {
    const { data, error } = await supabase
      .from("allowance_records")
      .select("*")
      .eq("user_id", userId)
      .order("year", { ascending: true })
      .order("month", { ascending: true });
    if (error) throw error;
    return (data ?? []) as AllowanceRecord[];
  },

  async upsert(record: Omit<AllowanceRecord, "id"> & { id?: string }): Promise<AllowanceRecord> {
    const payload = { ...record };
    delete payload.id;

    const { data, error } = await supabase
      .from("allowance_records")
      .upsert(payload, { onConflict: "user_id,month,year" })
      .select("*")
      .single();
    if (error) throw error;
    return data as AllowanceRecord;
  },

  async setStatus(id: string, status: AllowanceStatus): Promise<void> {
    const { error } = await supabase.from("allowance_records").update({ status }).eq("id", id);
    if (error) throw error;
  },

  async add(userId: string, month: string, year: number, amount: number): Promise<AllowanceRecord> {
    return this.upsert({ user_id: userId, month, year, amount, status: "pending", notes: "" });
  },
};
