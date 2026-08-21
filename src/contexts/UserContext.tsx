import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { profileService } from "@/services/profile.service";
import { normalizeApiError } from "@/lib/api-error";
import type { UserProfile } from "@/types";

export type { UserProfile };

interface UserContextType {
  currentUser: UserProfile | null;
  isLoading: boolean;
  missingRequiredFields: Array<"batch" | "stream" | "state" | "status">;
  isProfileComplete: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  isFollowing: (userId: string) => boolean;
  followingIds: string[];
  getProfileByUserId: (userId: string) => Promise<UserProfile | null>;
  error: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setCurrentUser(null);
      setFollowingIds([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const profile = await profileService.ensureProfile(user.id, user.username);
      const [fresh, ids] = await Promise.all([
        profileService.getProfile(user.id),
        profileService.getFollowingIds(user.id),
      ]);
      setCurrentUser(fresh ?? profile);
      setFollowingIds(ids);
    } catch (err) {
      setError(normalizeApiError(err, "Unable to load profile data right now."));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const next = await profileService.updateProfile(user.id, updates);
    setCurrentUser(next);
  };

  const followUser = async (userId: string) => {
    if (!user) return;
    await profileService.follow(user.id, userId);
    setFollowingIds((prev) => [...prev, userId]);
  };

  const unfollowUser = async (userId: string) => {
    if (!user) return;
    await profileService.unfollow(user.id, userId);
    setFollowingIds((prev) => prev.filter((id) => id !== userId));
  };

  const isFollowing = (userId: string) => followingIds.includes(userId);

  const getProfileByUserId = (userId: string) => profileService.getProfile(userId);

  return (
    <UserContext.Provider
      value={{ currentUser, isLoading, updateProfile, followUser, unfollowUser, isFollowing, followingIds, getProfileByUserId, error }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
}
