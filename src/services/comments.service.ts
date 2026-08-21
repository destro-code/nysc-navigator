import { supabase } from "@/lib/supabase";

export interface ForumComment {
  id: string;
  post_id: string;
  user_id: string;
  author_username: string;
  content: string;
  created_at: string;
  updated_at: string;
}

const mapComment = (row: any): ForumComment => {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  return {
    id: row.id,
    post_id: row.post_id,
    user_id: row.user_id,
    author_username: profile?.username ?? "Corper",
    content: row.content,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
};

export const commentsService = {
  async list(postId: string): Promise<ForumComment[]> {
    const { data, error } = await supabase
      .from("forum_comments")
      .select("id, post_id, user_id, content, created_at, updated_at, profiles!forum_comments_user_id_fkey(username)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapComment);
  },

  async create(userId: string, postId: string, content: string): Promise<ForumComment> {
    const trimmed = content.trim();
    if (!trimmed) throw new Error("Comment cannot be empty.");
    if (trimmed.length > 2000) throw new Error("Comment cannot exceed 2000 characters.");

    const { data, error } = await supabase
      .from("forum_comments")
      .insert({ user_id: userId, post_id: postId, content: trimmed })
      .select("id, post_id, user_id, content, created_at, updated_at, profiles!forum_comments_user_id_fkey(username)")
      .single();
    if (error) throw error;
    return mapComment(data);
  },

  async update(userId: string, commentId: string, content: string): Promise<ForumComment> {
    const trimmed = content.trim();
    if (!trimmed) throw new Error("Comment cannot be empty.");

    const { data, error } = await supabase
      .from("forum_comments")
      .update({ content: trimmed })
      .eq("id", commentId)
      .eq("user_id", userId)
      .select("id, post_id, user_id, content, created_at, updated_at, profiles!forum_comments_user_id_fkey(username)")
      .single();
    if (error) throw error;
    return mapComment(data);
  },

  async remove(userId: string, commentId: string): Promise<void> {
    const { error } = await supabase.from("forum_comments").delete().eq("id", commentId).eq("user_id", userId);
    if (error) throw error;
  },
};
