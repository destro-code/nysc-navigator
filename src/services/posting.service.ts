import { supabase } from "@/lib/supabase";
import type { PostingProgress } from "@/types";

const empty = (userId: string): PostingProgress => ({
  user_id: userId,
  reg_number: "",
  stream: "",
  state: "",
  registration_date: null,
  camp_start_date: null,
  ppa_assigned_date: null,
  cds_assigned_date: null,
  pop_date: null,
});

export const postingService = {
  async get(userId: string): Promise<PostingProgress> {
    const { data, error } = await supabase.from("posting_progress").select("*").eq("user_id", userId).maybeSingle();
    if (error) throw error;
    return (data as PostingProgress | null) ?? empty(userId);
  },

  async save(userId: string, updates: Partial<PostingProgress>): Promise<PostingProgress> {
    const payload = { ...updates, user_id: userId };
    const { data, error } = await supabase
      .from("posting_progress")
      .upsert(payload, { onConflict: "user_id" })
      .select("*")
      .single();

    if (error) throw error;
    return data as PostingProgress;
  },
};
