import { delay, ensureSeeded, storage } from "@/data/storage";
import { DEMO_USER_ID, seedPosting } from "@/data/seed";
import type { PostingProgress } from "@/types";

const KEY = "posting";

const readAll = (): PostingProgress[] => ensureSeeded(KEY, () => [seedPosting()]);
const writeAll = (list: PostingProgress[]) => storage.set(KEY, list);

const empty = (userId: string): PostingProgress => ({
  user_id: userId,
  reg_number: "",
  stream: "",
  state: "",
  registration_date: null,
  camp_start_date: null,
  ppa_assigned_date: null,
  cds_assigned_date: null,
  pop_date: null,
});

export const postingService = {
  async get(userId: string): Promise<PostingProgress> {
    await delay();
    const list = readAll();
    return list.find((p) => p.user_id === userId) ?? (userId === DEMO_USER_ID ? seedPosting() : empty(userId));
  },

  async save(userId: string, updates: Partial<PostingProgress>): Promise<PostingProgress> {
    await delay();
    const list = readAll();
    const idx = list.findIndex((p) => p.user_id === userId);
    const base = idx >= 0 ? list[idx] : empty(userId);
    const next = { ...base, ...updates, user_id: userId };
    if (idx >= 0) list[idx] = next; else list.push(next);
    writeAll(list);
    return next;
  },
};
