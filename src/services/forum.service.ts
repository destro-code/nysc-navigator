import { delay, ensureSeeded, storage, uid } from "@/data/storage";
import { seedPosts, seedReports, seedVotes } from "@/data/seed";
import type { ForumPost, PostFlair, PostReport, PostVote, VoteType } from "@/types";
import { profileService } from "./profile.service";

const POSTS_KEY = "posts";
const VOTES_KEY = "votes";
const REPORTS_KEY = "reports";

const readPosts = (): ForumPost[] => ensureSeeded(POSTS_KEY, seedPosts);
const writePosts = (list: ForumPost[]) => storage.set(POSTS_KEY, list);
const readVotes = (): PostVote[] => ensureSeeded(VOTES_KEY, seedVotes);
const writeVotes = (list: PostVote[]) => storage.set(VOTES_KEY, list);
const readReports = (): PostReport[] => ensureSeeded(REPORTS_KEY, seedReports);
const writeReports = (list: PostReport[]) => storage.set(REPORTS_KEY, list);

export const forumService = {
  async listPosts(): Promise<ForumPost[]> {
    await delay();
    return readPosts()
      .filter((p) => !p.is_deleted)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getUserVotes(userId: string): Promise<Record<string, VoteType>> {
    await delay(60);
    const map: Record<string, VoteType> = {};
    readVotes().filter((v) => v.user_id === userId).forEach((v) => { map[v.post_id] = v.vote_type; });
    return map;
  },

  async createPost(input: { user_id: string; content: string; flair: PostFlair }): Promise<ForumPost> {
    await delay();
    const profile = await profileService.getProfile(input.user_id);
    const post: ForumPost = {
      id: uid(),
      user_id: input.user_id,
      author_username: profile?.username || "Corper",
      author_status: profile?.status || "serving",
      content: input.content.trim(),
      flair: input.flair,
      created_at: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      comments_count: 0,
    };
    writePosts([post, ...readPosts()]);
    return post;
  },

  async deletePost(postId: string): Promise<void> {
    await delay();
    const posts = readPosts().map((p) => (p.id === postId ? { ...p, is_deleted: true } : p));
    writePosts(posts);
  },

  async vote(userId: string, postId: string, type: VoteType): Promise<{ upvotes: number; downvotes: number; user_vote: VoteType | null }> {
    await delay(80);
    const votes = readVotes();
    const existingIdx = votes.findIndex((v) => v.user_id === userId && v.post_id === postId);

    let userVote: VoteType | null = type;
    if (existingIdx >= 0) {
      if (votes[existingIdx].vote_type === type) {
        // toggle off
        votes.splice(existingIdx, 1);
        userVote = null;
      } else {
        votes[existingIdx] = { ...votes[existingIdx], vote_type: type };
      }
    } else {
      votes.push({ user_id: userId, post_id: postId, vote_type: type });
    }
    writeVotes(votes);

    // Recompute counts
    const posts = readPosts();
    const pIdx = posts.findIndex((p) => p.id === postId);
    if (pIdx < 0) throw new Error("Post not found");
    const upvotes = votes.filter((v) => v.post_id === postId && v.vote_type === "up").length;
    const downvotes = votes.filter((v) => v.post_id === postId && v.vote_type === "down").length;
    // Preserve seeded baseline counts by using max between recomputed and existing baseline for organic seed feel.
    const baseUp = posts[pIdx].upvotes ?? 0;
    const baseDown = posts[pIdx].downvotes ?? 0;
    // If seed didn't have this user, keep seed counts + adjust delta
    posts[pIdx] = {
      ...posts[pIdx],
      upvotes: Math.max(upvotes, baseUp) - (userVote === null && type === "up" ? 1 : 0) + (userVote === "up" ? 1 : 0) - (baseUp && userVote === "up" ? 0 : 0),
      downvotes: Math.max(downvotes, baseDown),
    };
    // Simpler: just recompute cleanly using stored votes only.
    posts[pIdx] = { ...posts[pIdx], upvotes, downvotes };
    writePosts(posts);
    return { upvotes, downvotes, user_vote: userVote };
  },

  async reportPost(input: { user_id: string; post_id: string; reason: string }): Promise<PostReport> {
    await delay();
    const reports = readReports();
    if (reports.some((r) => r.user_id === input.user_id && r.post_id === input.post_id && r.status === "pending")) {
      throw new Error("You've already reported this post.");
    }
    const report: PostReport = {
      id: uid(),
      post_id: input.post_id,
      user_id: input.user_id,
      reason: input.reason,
      status: "pending",
      created_at: new Date().toISOString(),
    };
    writeReports([report, ...reports]);
    return report;
  },

  async listReports(): Promise<Array<PostReport & { post_content?: string }>> {
    await delay();
    const reports = readReports().filter((r) => r.status === "pending");
    const posts = readPosts();
    return reports.map((r) => ({ ...r, post_content: posts.find((p) => p.id === r.post_id)?.content }));
  },

  async resolveReport(reportId: string, action: "dismissed" | "reviewed", opts?: { removePostId?: string }): Promise<void> {
    await delay();
    const reports = readReports().map((r) => (r.id === reportId ? { ...r, status: action } : r));
    writeReports(reports);
    if (opts?.removePostId) {
      await forumService.deletePost(opts.removePostId);
    }
  },

  async listUserPosts(userId: string): Promise<ForumPost[]> {
    await delay();
    return readPosts().filter((p) => p.user_id === userId && !p.is_deleted);
  },

  async listLikedPosts(userId: string): Promise<ForumPost[]> {
    await delay();
    const likedIds = readVotes().filter((v) => v.user_id === userId && v.vote_type === "up").map((v) => v.post_id);
    return readPosts().filter((p) => likedIds.includes(p.id) && !p.is_deleted);
  },
};
