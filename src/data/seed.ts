// Seeded mock data for the frontend-only prototype. A future backend replaces
// these entities with real database rows.

import type {
  AllowanceRecord,
  Announcement,
  AppNotification,
  Batch,
  ClearanceProgressEntry,
  Follow,
  ForumPost,
  PostReport,
  PostVote,
  PostingProgress,
  UserProfile,
} from "@/types";

export const DEMO_USER_ID = "demo-user-1";
export const DEMO_ADMIN_EMAIL = "admin@demo.nysc";

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
const minutesAgo = (n: number) => new Date(Date.now() - n * 60_000).toISOString();

export const seedUsers = (): UserProfile[] => [
  {
    id: "profile-demo",
    user_id: DEMO_USER_ID,
    username: "Ada Okonkwo",
    batch: "2025 Batch B",
    stream: "Stream I",
    state: "Lagos",
    lga: "Ikeja",
    ppa: "Ministry of Health",
    status: "serving",
    bio: "Corper trying to survive service year. Loves jollof and side gigs.",
    avatar_url: "",
    reg_number: "NYSC/2025/456123",
    follower_count: 0,
    following_count: 0,
  },
  {
    id: "profile-2",
    user_id: "user-2",
    username: "Chinedu Balogun",
    batch: "2025 Batch B",
    stream: "Stream I",
    state: "Abuja",
    lga: "Bwari",
    ppa: "Federal Ministry of Education",
    status: "serving",
    bio: "Software dev serving in Abuja.",
    avatar_url: "",
    reg_number: "NYSC/2025/456124",
    follower_count: 0,
    following_count: 0,
  },
  {
    id: "profile-3",
    user_id: "user-3",
    username: "Fatima Ibrahim",
    batch: "2025 Batch A",
    stream: "Stream II",
    state: "Kano",
    lga: "Nasarawa",
    ppa: "Kano State Hospital",
    status: "cleared",
    bio: "Doctor. Just cleared. Feels good.",
    avatar_url: "",
    reg_number: "NYSC/2025/456125",
    follower_count: 0,
    following_count: 0,
  },
  {
    id: "profile-4",
    user_id: "user-4",
    username: "Tunde Adeyemi",
    batch: "2025 Batch B",
    stream: "Stream I",
    state: "Rivers",
    lga: "Port Harcourt",
    ppa: "Shell HQ",
    status: "in-camp",
    bio: "Fresh corper. Camp is a movie.",
    avatar_url: "",
    reg_number: "NYSC/2025/456126",
    follower_count: 0,
    following_count: 0,
  },
  {
    id: "profile-5",
    user_id: "user-5",
    username: "Aisha Mohammed",
    batch: "2025 Batch B",
    stream: "Stream I",
    state: "Enugu",
    lga: "Enugu North",
    ppa: "UNN",
    status: "serving",
    bio: "Teaching at a rural school. Growing every day.",
    avatar_url: "",
    reg_number: "NYSC/2025/456127",
    follower_count: 0,
    following_count: 0,
  },
];

export const seedPosts = (): ForumPost[] => [
  {
    id: "post-1",
    user_id: "user-3",
    author_username: "Fatima Ibrahim",
    author_status: "cleared",
    content: "Just collected my CNS today! 🎉 To every serving corper reading this — the finish line is real. Hold on.",
    flair: "cleared",
    created_at: minutesAgo(30),
    upvotes: 42,
    downvotes: 1,
    comments_count: 12,
  },
  {
    id: "post-2",
    user_id: "user-2",
    author_username: "Chinedu Balogun",
    author_status: "serving",
    content: "Allawee delayed again this month. Anyone else in Abuja still waiting?",
    flair: "stuck",
    created_at: minutesAgo(120),
    upvotes: 28,
    downvotes: 0,
    comments_count: 18,
  },
  {
    id: "post-3",
    user_id: "user-5",
    author_username: "Aisha Mohammed",
    author_status: "serving",
    content: "Quick tip: when doing monthly clearance, always keep 3 copies of your signed slip. Trust me.",
    flair: "info",
    created_at: daysAgo(1),
    upvotes: 55,
    downvotes: 2,
    comments_count: 9,
  },
  {
    id: "post-4",
    user_id: "user-4",
    author_username: "Tunde Adeyemi",
    author_status: "in-camp",
    content: "How long does PPA rejection letter take to process? Been waiting 2 weeks.",
    flair: "question",
    created_at: daysAgo(2),
    upvotes: 14,
    downvotes: 0,
    comments_count: 22,
  },
  {
    id: "post-5",
    user_id: "user-2",
    author_username: "Chinedu Balogun",
    author_status: "serving",
    content: "Anyone knows a good side hustle that pairs well with 9-5 CDS days? Trying to boost income.",
    flair: "question",
    created_at: daysAgo(3),
    upvotes: 31,
    downvotes: 0,
    comments_count: 27,
  },
  {
    id: "post-6",
    user_id: "user-5",
    author_username: "Aisha Mohammed",
    author_status: "serving",
    content: "Camp cleared, now serving proper. It gets better — that camp stress is temporary.",
    flair: "info",
    created_at: daysAgo(5),
    upvotes: 19,
    downvotes: 0,
    comments_count: 4,
  },
];

export const seedNotifications = (): AppNotification[] => [
  {
    id: "notif-1",
    user_id: DEMO_USER_ID,
    type: "announcement",
    title: "New batch announcement",
    message: "2025 Batch B Stream II mobilization opens next week.",
    created_at: minutesAgo(15),
    read: false,
  },
  {
    id: "notif-2",
    user_id: DEMO_USER_ID,
    type: "allowance",
    title: "Allowance credited",
    message: "Your March allowance of ₦77,000 has been marked as paid.",
    created_at: daysAgo(1),
    read: false,
  },
  {
    id: "notif-3",
    user_id: DEMO_USER_ID,
    type: "clearance",
    title: "Clearance reminder",
    message: "Don't forget to complete your monthly CDS attendance.",
    created_at: daysAgo(2),
    read: true,
  },
  {
    id: "notif-4",
    user_id: DEMO_USER_ID,
    type: "general",
    title: "Chinedu replied to your post",
    message: "Someone commented on your forum post.",
    created_at: daysAgo(3),
    read: true,
  },
];

export const seedAllowance = (): AllowanceRecord[] => {
  const year = new Date().getFullYear();
  const months = ["November", "December", "January", "February"];
  return months.map((month, idx) => ({
    id: `all-${idx}`,
    user_id: DEMO_USER_ID,
    month,
    year,
    amount: 77000,
    status: idx < 2 ? "paid" : idx === 2 ? "late" : "pending",
    notes: "",
  }));
};

export const seedPosting = (): PostingProgress => ({
  user_id: DEMO_USER_ID,
  reg_number: "NYSC/2025/456123",
  stream: "stream-1",
  state: "lagos",
  registration_date: daysAgo(90),
  camp_start_date: daysAgo(75),
  ppa_assigned_date: daysAgo(60),
  cds_assigned_date: null,
  pop_date: null,
});

export const seedClearance = (): ClearanceProgressEntry[] => [
  { user_id: DEMO_USER_ID, item_id: "doc-1", section_id: "documents", tab: "incamp", completed: true, completed_at: daysAgo(85) },
  { user_id: DEMO_USER_ID, item_id: "doc-2", section_id: "documents", tab: "incamp", completed: true, completed_at: daysAgo(85) },
  { user_id: DEMO_USER_ID, item_id: "doc-3", section_id: "documents", tab: "incamp", completed: true, completed_at: daysAgo(85) },
  { user_id: DEMO_USER_ID, item_id: "reg-1", section_id: "registration", tab: "incamp", completed: true, completed_at: daysAgo(80) },
  { user_id: DEMO_USER_ID, item_id: "dep-1", section_id: "deployment", tab: "outcamp", completed: true, completed_at: daysAgo(60) },
];

export const seedAnnouncements = (): Announcement[] => [
  {
    id: "ann-1",
    title: "Welcome to NYSC Buddy",
    content: "This is a prototype build. Announcements published here are visible to all corps members.",
    created_by: DEMO_USER_ID,
    created_at: daysAgo(10),
    is_active: true,
  },
];

export const seedReports = (): PostReport[] => [
  {
    id: "rep-1",
    post_id: "post-2",
    user_id: "user-4",
    reason: "misinformation",
    status: "pending",
    created_at: daysAgo(1),
  },
];

export const seedVotes = (): PostVote[] => [];
export const seedFollows = (): Follow[] => [
  { follower_id: DEMO_USER_ID, following_id: "user-3" },
];

export const seedBatch = (): Batch => {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - 90);
  const end = new Date(start);
  end.setDate(end.getDate() + 365);
  return {
    id: "batch-active",
    year: now.getFullYear(),
    batch: "B",
    stream: "Stream I",
    start_date: start.toISOString(),
    end_date: end.toISOString(),
    is_active: true,
  };
};
