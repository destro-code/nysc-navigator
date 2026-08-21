import { storage, uid } from "@/data/storage";
import { seedNotifications } from "@/data/seed";
import type { AppNotification, NotificationType } from "@/types";

const KEY = "notifications";
const read = () => storage.get<AppNotification[]>(KEY, seedNotifications());
const write = (list: AppNotification[]) => storage.set(KEY, list);

export const notificationService = {
  async list(userId: string) {
    return read().filter((n) => n.user_id === userId).sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  },
  async unreadCount(userId: string) { return (await this.list(userId)).filter((n) => !n.read).length; },
  async markRead(userId: string, id: string) {
    write(read().map((n) => n.user_id === userId && n.id === id ? { ...n, read: true } : n));
  },
  async markAllRead(userId: string) { write(read().map((n) => n.user_id === userId ? { ...n, read: true } : n)); },
  async remove(userId: string, id: string) { write(read().filter((n) => !(n.user_id === userId && n.id === id))); },
  async create(userId: string, type: NotificationType, title: string, message: string) {
    const notification: AppNotification = { id: uid(), user_id: userId, type, title, message, created_at: new Date().toISOString(), read: false };
    write([notification, ...read()]);
    return notification;
  },
};
