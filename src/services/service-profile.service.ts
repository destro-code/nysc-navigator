import { storage } from "@/data/storage";
import { DEFAULT_SERVICE_PROFILE, type ServiceProfile, type ServiceStage } from "@/data/service-profile";
import type { PostingProgress, UserProfile } from "@/types";

const key = (userId: string) => `service-profile.${userId}`;

const inferStage = (profile: UserProfile | null, posting: PostingProgress | null): ServiceStage => {
  if (posting?.pop_date) return "winding-up";
  if (posting?.cds_assigned_date || profile?.ppa) return "secondary-assignment";
  if (posting?.ppa_assigned_date) return "primary-assignment";
  return "orientation";
};

export const serviceProfileService = {
  async get(userId: string, profile?: UserProfile | null, posting?: PostingProgress | null): Promise<ServiceProfile> {
    const saved = storage.get<ServiceProfile | null>(key(userId), null);
    if (saved) return saved;

    const next: ServiceProfile = {
      batch: profile?.batch || DEFAULT_SERVICE_PROFILE.batch,
      stream: profile?.stream || DEFAULT_SERVICE_PROFILE.stream,
      stage: inferStage(profile ?? null, posting ?? null),
      updatedAt: new Date().toISOString(),
    };
    storage.set(key(userId), next);
    return next;
  },

  async setStage(userId: string, stage: ServiceStage) {
    const current = await this.get(userId);
    const next = { ...current, stage, updatedAt: new Date().toISOString() };
    storage.set(key(userId), next);
    return next;
  },
};
