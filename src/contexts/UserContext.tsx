import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  batch: string;
  stream: string;
  state: string;
  lga: string;
  ppa: string;
  status: "in-camp" | "serving" | "cleared";
  bio: string;
  avatar_url: string;
  reg_number: string;
  follower_count: number;
  following_count: number;
}

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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<string[]>([]);

  const requiredFields: Array<"batch" | "stream" | "state" | "status"> = ["batch", "stream", "state", "status"];
  const missingRequiredFields = requiredFields.filter((field) => {
    const value = currentUser?.[field];
    return !value || (typeof value === "string" && value.trim().length === 0);
  });
  const isProfileComplete = missingRequiredFields.length === 0;

  // Fetch profile
  useEffect(() => {
    if (!user) {
      setCurrentUser(null);
      setFollowingIds([]);
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        // Get follower/following counts
        const [{ count: followerCount }, { count: followingCount }] = await Promise.all([
          supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", user.id),
          supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", user.id),
        ]);

        setCurrentUser({
          ...profile,
          status: profile.status as UserProfile["status"],
          lga: profile.lga || "",
          ppa: profile.ppa || "",
          bio: profile.bio || "",
          avatar_url: profile.avatar_url || "",
          reg_number: profile.reg_number || "",
          batch: profile.batch || "",
          stream: profile.stream || "",
          state: profile.state || "",
          follower_count: followerCount || 0,
          following_count: followingCount || 0,
        });
      }

      // Fetch following ids
      const { data: follows } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id);

      setFollowingIds(follows?.map((f) => f.following_id) || []);
      setIsLoading(false);
    };

    fetchProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", user.id);

    if (!error && currentUser) {
      setCurrentUser({ ...currentUser, ...updates });
    }
  };

  const followUser = async (userId: string) => {
    if (!user) return;
    const { error } = await supabase.from("follows").insert({ follower_id: user.id, following_id: userId });
    if (!error) {
      setFollowingIds((prev) => [...prev, userId]);
    }
  };

  const unfollowUser = async (userId: string) => {
    if (!user) return;
    const { error } = await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", userId);
    if (!error) {
      setFollowingIds((prev) => prev.filter((id) => id !== userId));
    }
  };

  const isFollowing = (userId: string) => followingIds.includes(userId);

  const getProfileByUserId = async (userId: string): Promise<UserProfile | null> => {
    const { data } = await supabase.from("profiles").select("*").eq("user_id", userId).single();
    if (!data) return null;
    
    const [{ count: followerCount }, { count: followingCount }] = await Promise.all([
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", userId),
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", userId),
    ]);

    return {
      ...data,
      status: data.status as UserProfile["status"],
      lga: data.lga || "",
      ppa: data.ppa || "",
      bio: data.bio || "",
      avatar_url: data.avatar_url || "",
      reg_number: data.reg_number || "",
      batch: data.batch || "",
      stream: data.stream || "",
      state: data.state || "",
      follower_count: followerCount || 0,
      following_count: followingCount || 0,
    };
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        isLoading,
        missingRequiredFields,
        isProfileComplete,
        updateProfile,
        followUser,
        unfollowUser,
        isFollowing,
        followingIds,
        getProfileByUserId,
      }}
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
