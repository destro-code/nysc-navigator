import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { normalizeApiError } from "@/lib/api-error";

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
  const { user, isAuthenticated } = useAuth();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

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
      setError(null);
      try {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();
        if (profileError) throw profileError;

        if (profile) {
          const [{ count: followerCount, error: followerCountError }, { count: followingCount, error: followingCountError }] = await Promise.all([
            supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", user.id),
            supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", user.id),
          ]);
          if (followerCountError) throw followerCountError;
          if (followingCountError) throw followingCountError;

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

        const { data: follows, error: followsError } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", user.id);
        if (followsError) throw followsError;

        setFollowingIds(follows?.map((f) => f.following_id) || []);
      } catch (err) {
        setError(normalizeApiError(err, "Unable to load profile data right now."));
      } finally {
        setIsLoading(false);
      }
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
