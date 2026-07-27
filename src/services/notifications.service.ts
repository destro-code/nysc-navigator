import { delay, ensureSeeded, storage, uid } from "@/data/storage";
import { seedNotifications } from "@/data/seed";
import type { AppNotification, NotificationType } from "@/types";

const KEY = "notifications";

const read = (): AppNotification[] => ensureSeeded(KEY, seedNotifications);
const write = (list: AppNotification[]) => storage.set(KEY, list);

export const notificationsService = {
  async list(userId: string): Promise<AppNotification[]> {
    await delay();
    return read()
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async markRead(id: string): Promise<void> {
    await delay(50);
    write(read().map((n) => (n.id === id ? { ...n, read: true } : n)));
  },

  async markAllRead(userId: string): Promise<void> {
    await delay(60);
    write(read().map((n) => (n.user_id === userId ? { ...n, read: true } : n)));
  },

  async remove(id: string): Promise<void> {
    await delay(50);
    write(read().filter((n) => n.id !== id));
  },

  async push(userId: string, type: NotificationType, title: string, message: string): Promise<AppNotification> {
    const notif: AppNotification = {
      id: uid(),
      user_id: userId,
      type,
      title,
      message,
      created_at: new Date().toISOString(),
      read: false,
    };
    write([notif, ...read()]);
    return notif;
  },
};
