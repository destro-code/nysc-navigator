import { storage, uid } from "@/data/storage";
import { seedPosts, seedReports, seedVotes } from "@/data/seed";
import { profileService } from "./profile.service";
import type { ForumPost, PostFlair, PostReport, PostVote, VoteType } from "@/types";

const POSTS = "forum.posts";
const VOTES = "forum.votes";
const REPORTS = "forum.reports";

const posts = () => storage.get<ForumPost[]>(POSTS, seedPosts());
const votes = () => storage.get<PostVote[]>(VOTES, seedVotes());
const reports = () => storage.get<PostReport[]>(REPORTS, seedReports());

const countsFor = (postId: string) => {
  const seeded = posts().find((post) => post.id === postId);
  const storedVotes = votes().filter((vote) => vote.post_id === postId);
  return {
    upvotes: (seeded?.upvotes ?? 0) + storedVotes.filter((vote) => vote.value === 1).length,
    downvotes: (seeded?.downvotes ?? 0) + storedVotes.filter((vote) => vote.value === -1).length,
  };
};

const withCounts = (post: ForumPost): ForumPost => ({ ...post, ...countsFor(post.id) });

export const forumService = {
  async listPosts() {
    return posts().sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)).map(withCounts);
  },
  async getUserVotes(userId: string) {
    return Object.fromEntries(votes().filter((vote) => vote.user_id === userId).map((vote) => [vote.post_id, vote.value === 1 ? "up" : "down"]));
  },
  async createPost(input: { user_id: string; content: string; flair: PostFlair }) {
    const content = input.content.trim();
    if (!content) throw new Error("Post cannot be empty.");
    const profile = await profileService.getProfile(input.user_id);
    const post: ForumPost = { id: uid(), user_id: input.user_id, author_username: profile?.username ?? "Corper", author_status: profile?.status ?? "serving", content, flair: input.flair, created_at: new Date().toISOString(), upvotes: 0, downvotes: 0, comments_count: 0 };
    storage.set(POSTS, [post, ...posts()]);
    return post;
  },
  async deletePost(userId: string, postId: string) {
    const currentPosts = posts();
    const post = currentPosts.find((item) => item.id === postId);
    if (!post) throw new Error("Post not found.");
    if (post.user_id !== userId) throw new Error("You can only delete your own posts.");
    storage.set(POSTS, currentPosts.filter((item) => item.id !== postId));
    storage.set(VOTES, votes().filter((vote) => vote.post_id !== postId));
  },
  async vote(userId: string, postId: string, type: VoteType) {
    const value = type === "up" ? 1 : -1;
    const current = votes();
    const existing = current.find((vote) => vote.post_id === postId && vote.user_id === userId);
    const next = existing?.value === value
      ? current.filter((vote) => vote.id !== existing.id)
      : [...current.filter((vote) => !(vote.post_id === postId && vote.user_id === userId)), { id: uid(), post_id: postId, user_id: userId, value }];
    storage.set(VOTES, next);
    const counts = countsFor(postId);
    return { ...counts, user_vote: existing?.value === value ? null : type };
  },
  async reportPost(input: { user_id: string; post_id: string; reason: string }) {
    if (reports().some((report) => report.user_id === input.user_id && report.post_id === input.post_id && report.status === "pending")) throw new Error("You've already reported this post.");
    const report: PostReport = { id: uid(), ...input, status: "pending", created_at: new Date().toISOString() };
    storage.set(REPORTS, [...reports(), report]);
    return report;
  },
  async listReports() {
    return reports().filter((report) => report.status === "pending").map((report) => ({ ...report, post_content: posts().find((post) => post.id === report.post_id)?.content }));
  },
  async resolveReport(reportId: string, action: "dismissed" | "reviewed", opts?: { removePostId?: string }) {
    storage.set(REPORTS, reports().map((report) => report.id === reportId ? { ...report, status: action } : report));
    if (opts?.removePostId) {
      const post = posts().find((item) => item.id === opts.removePostId);
      if (post) {
        storage.set(POSTS, posts().filter((item) => item.id !== opts.removePostId));
        storage.set(VOTES, votes().filter((vote) => vote.post_id !== opts.removePostId));
      }
    }
  },
  async listUserPosts(userId: string) { return (await this.listPosts()).filter((post) => post.user_id === userId); },
  async listLikedPosts(userId: string) {
    const ids = new Set(votes().filter((vote) => vote.user_id === userId && vote.value === 1).map((vote) => vote.post_id));
    return (await this.listPosts()).filter((post) => ids.has(post.id));
  },
};
