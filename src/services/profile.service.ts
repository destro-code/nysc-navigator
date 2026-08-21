import { storage } from "@/data/storage";
import { seedFollows, seedUsers } from "@/data/seed";
import type { Follow, UserProfile } from "@/types";

const USERS = "users";
const FOLLOWS = "follows";
const users = () => storage.get<UserProfile[]>(USERS, seedUsers());
const follows = () => storage.get<Follow[]>(FOLLOWS, seedFollows());

export const profileService = {
  async getProfile(userId: string) {
    return users().find((u) => u.user_id === userId) || null;
  },
  async ensureProfile(userId: string, username: string) {
    const found = await this.getProfile(userId);
    if (found) return found;
    const profile: UserProfile = {
      id: `profile-${userId}`,
      user_id: userId,
      username,
      batch: "",
      stream: "",
      state: "",
      lga: "",
      ppa: "",
      status: "serving",
      bio: "",
      avatar_url: "",
      reg_number: "",
      follower_count: 0,
      following_count: 0,
    };
    storage.set(USERS, [...users(), profile]);
    return profile;
  },
  async updateProfile(userId: string, updates: Partial<UserProfile>) {
    const current = await this.getProfile(userId);
    if (!current) throw new Error("Profile not found.");
    const next = users().map((u) =>
      u.user_id === userId ? { ...u, ...updates, id: u.id, user_id: u.user_id } : u,
    );
    storage.set(USERS, next);
    return next.find((u) => u.user_id === userId)!;
  },
  async listUsers() {
    return users().sort((a, b) => a.username.localeCompare(b.username));
  },
  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) throw new Error("You cannot follow yourself.");
    const f = follows();
    if (!f.some((x) => x.follower_id === followerId && x.following_id === followingId)) {
      storage.set(FOLLOWS, [...f, { follower_id: followerId, following_id: followingId }]);
    }
  },
  async unfollow(followerId: string, followingId: string) {
    storage.set(FOLLOWS, follows().filter((x) => !(x.follower_id === followerId && x.following_id === followingId)));
  },
  async getFollowingIds(userId: string) {
    return follows().filter((x) => x.follower_id === userId).map((x) => x.following_id);
  },
};

export type { Follow };
