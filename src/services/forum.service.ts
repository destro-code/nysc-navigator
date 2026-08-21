import { supabase } from "@/lib/supabase";
import type { ForumPost, PostFlair, PostReport, PostVote, VoteType } from "@/types";
import { profileService } from "./profile.service";

const toVoteType = (value: number): VoteType => (value === 1 ? "up" : "down");

export const forumService = {
  async listPosts(): Promise<ForumPost[]> {
    const { data, error } = await supabase
      .from("forum_posts")
      .select("id, content, user_id, flair, created_at, updated_at, profiles!forum_posts_user_id_fkey(username, status), post_votes(value)")
      .order("created_at", { ascending: false });
    if (error) throw error;

    return (data ?? []).map((row: any) => {
      const votes = row.post_votes ?? [];
      const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      return {
        id: row.id,
        content: row.content,
        user_id: row.user_id,
        author_username: profile?.username ?? "Corper",
        author_status: profile?.status ?? "serving",
        created_at: row.created_at,
        upvotes: votes.filter((v: { value: number }) => v.value === 1).length,
        downvotes: votes.filter((v: { value: number }) => v.value === -1).length,
        comments_count: 0,
        flair: row.flair,
      } satisfies ForumPost;
    });
  },

  async getUserVotes(userId: string): Promise<Record<string, VoteType>> {
    const { data, error } = await supabase.from("post_votes").select("post_id, value").eq("user_id", userId);
    if (error) throw error;
    return Object.fromEntries((data ?? []).map((vote) => [vote.post_id, toVoteType(vote.value)]));
  },

  async createPost(input: { user_id: string; content: string; flair: PostFlair }): Promise<ForumPost> {
    const content = input.content.trim();
    if (!content) throw new Error("Post cannot be empty.");
    if (content.length > 5000) throw new Error("Post cannot exceed 5000 characters.");

    const { data, error } = await supabase
      .from("forum_posts")
      .insert({ user_id: input.user_id, content, flair: input.flair })
      .select("id, content, user_id, flair, created_at")
      .single();
    if (error) throw error;

    const profile = await profileService.getProfile(input.user_id);
    return {
      id: data.id,
      user_id: data.user_id,
      author_username: profile?.username ?? "Corper",
      author_status: profile?.status ?? "serving",
      content: data.content,
      flair: data.flair,
      created_at: data.created_at,
      upvotes: 0,
      downvotes: 0,
      comments_count: 0,
    };
  },

  async deletePost(postId: string): Promise<void> {
    const { error } = await supabase.from("forum_posts").delete().eq("id", postId);
    if (error) throw error;
  },

  async vote(userId: string, postId: string, type: VoteType): Promise<{ upvotes: number; downvotes: number; user_vote: VoteType | null }> {
    const value = type === "up" ? 1 : -1;
    const { data: existing, error: existingError } = await supabase
      .from("post_votes")
      .select("value")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .maybeSingle();
    if (existingError) throw existingError;

    if (existing?.value === value) {
      const { error } = await supabase.from("post_votes").delete().eq("post_id", postId).eq("user_id", userId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("post_votes")
        .upsert({ post_id: postId, user_id: userId, value }, { onConflict: "post_id,user_id" });
      if (error) throw error;
    }

    const { data: votes, error } = await supabase.from("post_votes").select("value").eq("post_id", postId);
    if (error) throw error;
    return {
      upvotes: (votes ?? []).filter((v) => v.value === 1).length,
      downvotes: (votes ?? []).filter((v) => v.value === -1).length,
      user_vote: existing?.value === value ? null : type,
    };
  },

  async reportPost(input: { user_id: string; post_id: string; reason: string }): Promise<PostReport> {
    const { data: existing, error: existingError } = await supabase
      .from("post_reports")
      .select("id")
      .eq("user_id", input.user_id)
      .eq("post_id", input.post_id)
      .eq("status", "pending")
      .maybeSingle();
    if (existingError) throw existingError;
    if (existing) throw new Error("You've already reported this post.");

    const { data, error } = await supabase
      .from("post_reports")
      .insert({ user_id: input.user_id, post_id: input.post_id, reason: input.reason })
      .select("*")
      .single();
    if (error) throw error;
    return data as PostReport;
  },

  async listReports(): Promise<Array<PostReport & { post_content?: string }>> {
    const { data, error } = await supabase
      .from("post_reports")
      .select("*, forum_posts(content)")
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((row: any) => ({ ...row, post_content: row.forum_posts?.content }));
  },

  async resolveReport(reportId: string, action: "dismissed" | "reviewed", opts?: { removePostId?: string }): Promise<void> {
    const { error } = await supabase.from("post_reports").update({ status: action }).eq("id", reportId);
    if (error) throw error;
    if (opts?.removePostId) await this.deletePost(opts.removePostId);
  },

  async listUserPosts(userId: string): Promise<ForumPost[]> {
    const posts = await this.listPosts();
    return posts.filter((post) => post.user_id === userId);
  },

  async listLikedPosts(userId: string): Promise<ForumPost[]> {
    const { data, error } = await supabase.from("post_votes").select("post_id").eq("user_id", userId).eq("value", 1);
    if (error) throw error;
    const ids = new Set((data ?? []).map((vote) => vote.post_id));
    const posts = await this.listPosts();
    return posts.filter((post) => ids.has(post.id));
  },
};
