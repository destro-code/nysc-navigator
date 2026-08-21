import { ensureSeeded, storage, uid } from "@/data/storage";
import { seedAnnouncements } from "@/data/seed";
import type { Announcement } from "@/types";
import { profileService } from "./profile.service";
import { forumService } from "./forum.service";

const ANNOUNCEMENTS_KEY = "admin.announcements";

const readAnnouncements = (): Announcement[] => ensureSeeded(ANNOUNCEMENTS_KEY, seedAnnouncements);
const writeAnnouncements = (list: Announcement[]) => storage.set(ANNOUNCEMENTS_KEY, list);

export const adminService = {
  async getStats(): Promise<{ totalUsers: number; totalPosts: number; reportedPosts: number; announcements: number }> {
    const [users, posts, reports, announcements] = await Promise.all([
      profileService.listUsers(),
      forumService.listPosts(),
      forumService.listReports(),
      Promise.resolve(readAnnouncements()),
    ]);
    return {
      totalUsers: users.length,
      totalPosts: posts.length,
      reportedPosts: reports.length,
      announcements: announcements.filter((a) => a.is_active).length,
    };
  },

  async listAnnouncements(): Promise<Announcement[]> {
    return readAnnouncements().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async createAnnouncement(input: { title: string; content: string; created_by: string }): Promise<Announcement> {
    const ann: Announcement = {
      id: uid(),
      title: input.title.trim(),
      content: input.content.trim(),
      created_by: input.created_by,
      created_at: new Date().toISOString(),
      is_active: true,
    };
    writeAnnouncements([ann, ...readAnnouncements()]);
    return ann;
  },
};
