import { supabase } from "@/lib/supabase";
import type { Follow, UserProfile } from "@/types";

const mapProfile = (row: UserProfile): UserProfile => row;

export const profileService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
    if (error) throw error;
    return data ? mapProfile(data as UserProfile) : null;
  },

  async ensureProfile(userId: string, username: string): Promise<UserProfile> {
    const existing = await this.getProfile(userId);
    if (existing) return existing;

    const { data, error } = await supabase
      .from("profiles")
      .insert({ user_id: userId, username })
      .select("*")
      .single();

    if (error) throw error;
    return mapProfile(data as UserProfile);
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const safeUpdates = { ...updates };
    delete safeUpdates.id;
    delete safeUpdates.user_id;
    delete safeUpdates.follower_count;
    delete safeUpdates.following_count;

    const { data, error } = await supabase
      .from("profiles")
      .update(safeUpdates)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) throw error;
    return mapProfile(data as UserProfile);
  },

  async listUsers(): Promise<UserProfile[]> {
    const { data, error } = await supabase.from("profiles").select("*").order("username");
    if (error) throw error;
    return (data ?? []) as UserProfile[];
  },

  async follow(followerId: string, followingId: string): Promise<void> {
    if (followerId === followingId) throw new Error("You cannot follow yourself.");
    const { error } = await supabase.from("follows").insert({ follower_id: followerId, following_id: followingId });
    if (error && error.code !== "23505") throw error;
  },

  async unfollow(followerId: string, followingId: string): Promise<void> {
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", followerId)
      .eq("following_id", followingId);
    if (error) throw error;
  },

  async getFollowingIds(userId: string): Promise<string[]> {
    const { data, error } = await supabase.from("follows").select("following_id").eq("follower_id", userId);
    if (error) throw error;
    return (data ?? []).map((row) => row.following_id);
  },
};

export type { Follow };
