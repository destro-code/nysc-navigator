export type UserRole = 'corps_member' | 'admin' | 'support_agent';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface SignupRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export type PostStatus = 'published' | 'flagged' | 'removed';

export interface CreatePostRequest {
  title: string;
  body: string;
}

export interface Post {
  id: string;
  authorId: string;
  title: string;
  body: string;
  status: PostStatus;
  createdAt: string;
}

export interface PostListResponse {
  items: Post[];
  page: number;
  pageSize: number;
  total: number;
}

export type NotificationType =
  | 'forum_reply'
  | 'moderation_update'
  | 'support_update'
  | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  items: Notification[];
}

export type ReportResolution =
  | 'dismissed'
  | 'warning_issued'
  | 'content_removed'
  | 'user_suspended';

export interface ResolveReportRequest {
  resolution: ReportResolution;
  note?: string;
}

export interface Report {
  id: string;
  postId: string;
  status: 'open' | 'resolved';
  createdAt: string;
}

export interface CreateTicketRequest {
  subject: string;
  message: string;
}

export interface SupportTicket {
  id: string;
  requesterId: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
}
