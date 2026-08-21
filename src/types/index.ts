// Shared types for the NYSC Buddy frontend prototype.
// These contracts are the seam a future backend developer will implement.

export type UserStatus = "in-camp" | "serving" | "cleared";

export interface Session {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  batch: string;
  stream: string;
  state: string;
  lga: string;
  ppa: string;
  status: UserStatus;
  bio: string;
  avatar_url: string;
  reg_number: string;
  follower_count: number;
  following_count: number;
}

export type PostFlair = "cleared" | "stuck" | "question" | "info";

export interface ForumPost {
  id: string;
  content: string;
  user_id: string;
  author_username: string;
  author_status: UserStatus;
  created_at: string;
  upvotes: number;
  downvotes: number;
  comments_count: number;
  flair: PostFlair;
  is_deleted?: boolean;
}

export type VoteType = "up" | "down";

export interface PostVote {
  post_id: string;
  user_id: string;
  vote_type: VoteType;
}

export interface PostReport {
  id: string;
  post_id: string;
  user_id: string;
  reason: string;
  status: "pending" | "reviewed" | "dismissed";
  created_at: string;
}

export type NotificationType = "clearance" | "allowance" | "announcement" | "general";

export interface AppNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

export interface PostingMilestones {
  registration_date: string | null;
  camp_start_date: string | null;
  ppa_assigned_date: string | null;
  cds_assigned_date: string | null;
  pop_date: string | null;
}

export interface PostingProgress extends PostingMilestones {
  user_id: string;
  reg_number: string;
  stream: string;
  state: string;
}

export interface ClearanceProgressEntry {
  user_id: string;
  item_id: string;
  section_id: string;
  tab: "incamp" | "outcamp";
  completed: boolean;
  completed_at: string | null;
}

export type AllowanceStatus = "paid" | "pending" | "late";

export interface AllowanceRecord {
  id: string;
  user_id: string;
  month: string;
  year: number;
  amount: number;
  status: AllowanceStatus;
  notes: string;
}

export interface Batch {
  id: string;
  year: number;
  batch: string;
  stream: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
  is_active: boolean;
}

export interface Follow {
  follower_id: string;
  following_id: string;
}
