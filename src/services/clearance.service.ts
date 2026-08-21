import { supabase } from "@/lib/supabase";
import type { ClearanceProgressEntry } from "@/types";

export const clearanceService = {
  async list(userId: string): Promise<ClearanceProgressEntry[]> {
    const { data, error } = await supabase
      .from("clearance_progress")
      .select("*")
      .eq("user_id", userId);
    if (error) throw error;
    return (data ?? []) as ClearanceProgressEntry[];
  },

  async toggle(entry: Omit<ClearanceProgressEntry, "completed_at">): Promise<ClearanceProgressEntry> {
    const next = {
      user_id: entry.user_id,
      item_id: entry.item_id,
      section_id: entry.section_id,
      tab: entry.tab,
      completed: entry.completed,
      completed_at: entry.completed ? new Date().toISOString() : null,
    };

    const { data, error } = await supabase
      .from("clearance_progress")
      .upsert(next, { onConflict: "user_id,item_id" })
      .select("*")
      .single();
    if (error) throw error;
    return data as ClearanceProgressEntry;
  },
};
