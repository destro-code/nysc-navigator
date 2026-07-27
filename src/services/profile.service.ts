import { delay, ensureSeeded, storage } from "@/data/storage";
import { DEMO_USER_ID, seedFollows, seedUsers } from "@/data/seed";
import type { Follow, UserProfile } from "@/types";

const USERS_KEY = "users";
const FOLLOWS_KEY = "follows";

const readUsers = (): UserProfile[] => ensureSeeded(USERS_KEY, seedUsers);
const writeUsers = (list: UserProfile[]) => storage.set(USERS_KEY, list);
const readFollows = (): Follow[] => ensureSeeded(FOLLOWS_KEY, seedFollows);
const writeFollows = (list: Follow[]) => storage.set(FOLLOWS_KEY, list);

const withCounts = (user: UserProfile, follows: Follow[]): UserProfile => ({
  ...user,
  follower_count: follows.filter((f) => f.following_id === user.user_id).length,
  following_count: follows.filter((f) => f.follower_id === user.user_id).length,
});

export const profileService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    await delay();
    const users = readUsers();
    const follows = readFollows();
    const user = users.find((u) => u.user_id === userId);
    return user ? withCounts(user, follows) : null;
  },

  async ensureProfile(userId: string, username: string): Promise<UserProfile> {
    const users = readUsers();
    const follows = readFollows();
    const existing = users.find((u) => u.user_id === userId);
    if (existing) return withCounts(existing, follows);

    const created: UserProfile = {
      id: `profile-${userId}`,
      user_id: userId,
      username,
      batch: "2025 Batch B",
      stream: "Stream I",
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
    writeUsers([...users, created]);
    return created;
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    await delay();
    const users = readUsers();
    const idx = users.findIndex((u) => u.user_id === userId);
    if (idx < 0) throw new Error("Profile not found");
    users[idx] = { ...users[idx], ...updates };
    writeUsers(users);
    return withCounts(users[idx], readFollows());
  },

  async listUsers(): Promise<UserProfile[]> {
    await delay();
    const follows = readFollows();
    return readUsers().map((u) => withCounts(u, follows));
  },

  async follow(followerId: string, followingId: string): Promise<void> {
    await delay(80);
    const follows = readFollows();
    if (follows.some((f) => f.follower_id === followerId && f.following_id === followingId)) return;
    writeFollows([...follows, { follower_id: followerId, following_id: followingId }]);
  },

  async unfollow(followerId: string, followingId: string): Promise<void> {
    await delay(80);
    const follows = readFollows().filter((f) => !(f.follower_id === followerId && f.following_id === followingId));
    writeFollows(follows);
  },

  async getFollowingIds(userId: string): Promise<string[]> {
    await delay(50);
    return readFollows().filter((f) => f.follower_id === userId).map((f) => f.following_id);
  },
};

export { DEMO_USER_ID };
