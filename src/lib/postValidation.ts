export const POST_MAX_LENGTH = 500;

export const validatePostContent = (rawContent: string): string | null => {
  const content = rawContent.trim();
  if (!content) return "Post content cannot be empty.";
  if (content.length > POST_MAX_LENGTH) return `Post content is too long. Maximum is ${POST_MAX_LENGTH} characters.`;
  if (/^(.{1,40})\1{2,}$/i.test(content)) return "Post content looks repetitive/spammy.";
  return null;
};

export const formatCooldown = (seconds: number): string => {
  if (seconds <= 0) return "";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
};
