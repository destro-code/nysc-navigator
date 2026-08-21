import { supabase } from "@/lib/supabase";
import type { AppNotification, NotificationType } from "@/types";

export const notificationService = {
  async list(userId: string): Promise<AppNotification[]> {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as AppNotification[];
  },

  async unreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("read", false);
    if (error) throw error;
    return count ?? 0;
  },

  async markRead(userId: string, notificationId: string): Promise<void> {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId)
      .eq("user_id", userId);
    if (error) throw error;
  },

  async markAllRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false);
    if (error) throw error;
  },

  async create(userId: string, type: NotificationType, title: string, message: string): Promise<AppNotification> {
    const { data, error } = await supabase
      .from("notifications")
      .insert({ user_id: userId, type, title, message })
      .select("*")
      .single();
    if (error) throw error;
    return data as AppNotification;
  },
};
