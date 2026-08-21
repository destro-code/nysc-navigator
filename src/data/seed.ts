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
    batch: "2026 Batch B",
    stream: "Stream II",
    state: "Lagos",
    lga: "Ikeja",
    ppa: "Pending PPA assignment",
    status: "in-camp",
    bio: "Corper trying to survive service year. Loves jollof and side gigs.",
    avatar_url: "",
    reg_number: "NYSC/2026/456123",
    follower_count: 0,
    following_count: 0,
  },
  {
    id: "profile-2",
    user_id: "user-2",
    username: "Chinedu Balogun",
    batch: "2026 Batch B",
    stream: "Stream II",
    state: "Abuja",
    lga: "Bwari",
    ppa: "Pending PPA assignment",
    status: "in-camp",
    bio: "Software dev serving in Abuja.",
    avatar_url: "",
    reg_number: "NYSC/2026/456124",
    follower_count: 0,
    following_count: 0,
  },
  {
    id: "profile-3",
    user_id: "user-3",
    username: "Fatima Ibrahim",
    batch: "2026 Batch A",
    stream: "Stream II",
    state: "Kano",
    lga: "Nasarawa",
    ppa: "Kano State Hospital",
    status: "serving",
    bio: "Doctor. Serving and counting down to POP.",
    avatar_url: "",
    reg_number: "NYSC/2026/456125",
    follower_count: 0,
    following_count: 0,
  },
  {
    id: "profile-4",
    user_id: "user-4",
    username: "Tunde Adeyemi",
    batch: "2026 Batch B",
    stream: "Stream II",
    state: "Rivers",
    lga: "Port Harcourt",
    ppa: "Pending PPA assignment",
    status: "in-camp",
    bio: "Fresh corper. Camp is a movie.",
    avatar_url: "",
    reg_number: "NYSC/2026/456126",
    follower_count: 0,
    following_count: 0,
  },
  {
    id: "profile-5",
    user_id: "user-5",
    username: "Aisha Mohammed",
    batch: "2026 Batch B",
    stream: "Stream II",
    state: "Enugu",
    lga: "Enugu North",
    ppa: "Pending PPA assignment",
    status: "in-camp",
    bio: "Teaching aspirant. Ready for the service year.",
    avatar_url: "",
    reg_number: "NYSC/2026/456127",
    follower_count: 0,
    following_count: 0,
  },
];

export const seedPosts = (): ForumPost[] => [
  {
    id: "post-1",
    user_id: "user-3",
    author_username: "Fatima Ibrahim",
    author_status: "serving",
    content: "Batch B Stream II is in camp now. How is everyone settling in? 🎉",
    flair: "info",
    created_at: minutesAgo(30),
    upvotes: 42,
    downvotes: 1,
    comments_count: 12,
  },
  {
    id: "post-2",
    user_id: "user-2",
    author_username: "Chinedu Balogun",
    author_status: "in-camp",
    content: "Anyone in Abuja preparing for PPA after camp? What should we expect?",
    flair: "question",
    created_at: minutesAgo(120),
    upvotes: 28,
    downvotes: 0,
    comments_count: 18,
  },
  {
    id: "post-3",
    user_id: "user-5",
    author_username: "Aisha Mohammed",
    author_status: "in-camp",
    content: "Quick tip: keep your important NYSC documents together and follow the instructions on your Call-up Letter.",
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
    content: "Has anyone heard the latest update for corps members affected by camp schedule changes in Sokoto or Niger?",
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
    author_status: "in-camp",
    content: "What are you planning to learn or build during your service year?",
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
    author_status: "in-camp",
    content: "Safe travels to everyone heading to camp. Please follow the safety guidance on your official NYSC communications.",
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
    title: "2026 Batch B Stream II",
    message: "The nationwide orientation course runs from August 5 to August 25, 2026.",
    created_at: minutesAgo(15),
    read: false,
  },
  {
    id: "notif-2",
    user_id: DEMO_USER_ID,
    type: "announcement",
    title: "Sokoto & Niger camp update",
    message: "NYSC announced a revised orientation schedule for affected corps members in Sokoto and Niger due to camp rehabilitation.",
    created_at: daysAgo(1),
    read: false,
  },
  {
    id: "notif-3",
    user_id: DEMO_USER_ID,
    type: "clearance",
    title: "Clearance reminder",
    message: "Keep your monthly clearance records and attendance documents organised.",
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
    notes: "Demo data — allowance amount and payment status are not live NYSC records.",
  }));
};

export const seedPosting = (): PostingProgress => ({
  user_id: DEMO_USER_ID,
  reg_number: "NYSC/2026/456123",
  stream: "stream-2",
  state: "lagos",
  registration_date: daysAgo(120),
  camp_start_date: new Date("2026-08-05T00:00:00.000Z").toISOString(),
  ppa_assigned_date: null,
  cds_assigned_date: null,
  pop_date: null,
});

export const seedClearance = (): ClearanceProgressEntry[] => [
  { user_id: DEMO_USER_ID, item_id: "doc-1", section_id: "documents", tab: "incamp", completed: true, completed_at: daysAgo(12) },
  { user_id: DEMO_USER_ID, item_id: "doc-2", section_id: "documents", tab: "incamp", completed: true, completed_at: daysAgo(12) },
  { user_id: DEMO_USER_ID, item_id: "doc-3", section_id: "documents", tab: "incamp", completed: true, completed_at: daysAgo(12) },
  { user_id: DEMO_USER_ID, item_id: "reg-1", section_id: "registration", tab: "incamp", completed: true, completed_at: daysAgo(10) },
  { user_id: DEMO_USER_ID, item_id: "dep-1", section_id: "deployment", tab: "outcamp", completed: false, completed_at: null },
];

export const seedAnnouncements = (): Announcement[] => [
  {
    id: "ann-1",
    title: "2026 Batch B Stream II orientation",
    content: "NYSC announced that the Batch B Stream II orientation course runs from August 5 to August 25, 2026 nationwide. Dates can change for specific states, so members should follow official NYSC communications and their Call-up Letters.",
    created_by: DEMO_USER_ID,
    created_at: daysAgo(1),
    is_active: true,
  },
  {
    id: "ann-2",
    title: "Use official NYSC channels for urgent updates",
    content: "For current mobilization and service information, verify updates through the official NYSC website, portal and communications before acting on social-media claims.",
    created_by: DEMO_USER_ID,
    created_at: daysAgo(2),
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

export const seedBatch = (): Batch => ({
  id: "batch-2026-b-stream-2",
  year: 2026,
  batch: "B",
  stream: "Stream II",
  start_date: "2026-08-05T00:00:00.000Z",
  end_date: "2026-08-25T23:59:59.999Z",
  is_active: true,
});
