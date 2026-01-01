import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface UserProfile {
  id: string;
  username: string;
  batch: string;
  stream: string;
  state: string;
  status: "in-camp" | "serving" | "cleared";
  bio: string;
  posts: number;
  followers: string[];
  following: string[];
  likedPosts: string[];
  createdAt: string;
}

interface UserContextType {
  currentUser: UserProfile | null;
  allUsers: UserProfile[];
  setCurrentUser: (user: UserProfile) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  followUser: (userId: string) => void;
  unfollowUser: (userId: string) => void;
  isFollowing: (userId: string) => boolean;
  getUserById: (userId: string) => UserProfile | undefined;
  likePost: (postId: string) => void;
  unlikePost: (postId: string) => void;
  hasLikedPost: (postId: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const CURRENT_USER_KEY = "nysc_current_user";
const ALL_USERS_KEY = "nysc_all_users";

// Mock users for demo
const mockUsers: UserProfile[] = [
  {
    id: "user_1",
    username: "Lagos Corper",
    batch: "2024 Batch A",
    stream: "Stream I",
    state: "Lagos",
    status: "serving",
    bio: "Just trying to survive service year 💪",
    posts: 5,
    followers: ["user_3"],
    following: ["user_2"],
    likedPosts: [],
    createdAt: "2024-01-15",
  },
  {
    id: "user_2",
    username: "Helpful Senior",
    batch: "2023 Batch C",
    stream: "Stream II",
    state: "Abuja",
    status: "cleared",
    bio: "POP certified! Ask me anything 🎓",
    posts: 12,
    followers: ["user_1", "user_3"],
    following: [],
    likedPosts: [],
    createdAt: "2023-08-20",
  },
  {
    id: "user_3",
    username: "Frustrated Corper",
    batch: "2024 Batch A",
    stream: "Stream I",
    state: "Kano",
    status: "serving",
    bio: "Where's my allawee?! 😤",
    posts: 8,
    followers: [],
    following: ["user_1", "user_2"],
    likedPosts: [],
    createdAt: "2024-01-20",
  },
];

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem(CURRENT_USER_KEY);
    const savedAllUsers = localStorage.getItem(ALL_USERS_KEY);

    if (savedAllUsers) {
      setAllUsers(JSON.parse(savedAllUsers));
    } else {
      setAllUsers(mockUsers);
      localStorage.setItem(ALL_USERS_KEY, JSON.stringify(mockUsers));
    }

    if (savedUser) {
      setCurrentUserState(JSON.parse(savedUser));
    } else {
      // Auto-create a default user for demo
      const defaultUser: UserProfile = {
        id: "current_user",
        username: "You",
        batch: "2024 Batch A",
        stream: "Stream I",
        state: "Lagos",
        status: "serving",
        bio: "My NYSC journey starts here!",
        posts: 0,
        followers: [],
        following: [],
        likedPosts: [],
        createdAt: new Date().toISOString().split("T")[0],
      };
      setCurrentUserState(defaultUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(defaultUser));
    }
  }, []);

  const setCurrentUser = (user: UserProfile) => {
    setCurrentUserState(user);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
  };

  const followUser = (userId: string) => {
    if (!currentUser || userId === currentUser.id) return;

    // Update current user's following
    const updatedCurrentUser = {
      ...currentUser,
      following: [...currentUser.following, userId],
    };
    setCurrentUser(updatedCurrentUser);

    // Update target user's followers
    setAllUsers((prev) => {
      const updated = prev.map((u) =>
        u.id === userId ? { ...u, followers: [...u.followers, currentUser.id] } : u
      );
      localStorage.setItem(ALL_USERS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const unfollowUser = (userId: string) => {
    if (!currentUser) return;

    // Update current user's following
    const updatedCurrentUser = {
      ...currentUser,
      following: currentUser.following.filter((id) => id !== userId),
    };
    setCurrentUser(updatedCurrentUser);

    // Update target user's followers
    setAllUsers((prev) => {
      const updated = prev.map((u) =>
        u.id === userId ? { ...u, followers: u.followers.filter((id) => id !== currentUser.id) } : u
      );
      localStorage.setItem(ALL_USERS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const isFollowing = (userId: string) => {
    return currentUser?.following.includes(userId) ?? false;
  };

  const getUserById = (userId: string) => {
    if (currentUser?.id === userId) return currentUser;
    return allUsers.find((u) => u.id === userId);
  };

  const likePost = (postId: string) => {
    if (!currentUser) return;
    if (!currentUser.likedPosts.includes(postId)) {
      updateUser({ likedPosts: [...currentUser.likedPosts, postId] });
    }
  };

  const unlikePost = (postId: string) => {
    if (!currentUser) return;
    updateUser({ likedPosts: currentUser.likedPosts.filter((id) => id !== postId) });
  };

  const hasLikedPost = (postId: string) => {
    return currentUser?.likedPosts.includes(postId) ?? false;
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        allUsers,
        setCurrentUser,
        updateUser,
        followUser,
        unfollowUser,
        isFollowing,
        getUserById,
        likePost,
        unlikePost,
        hasLikedPost,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
