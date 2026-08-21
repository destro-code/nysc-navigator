type ApiErrorInput = Error | string | { message?: string } | null | undefined;

const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

export function normalizeApiError(error: ApiErrorInput, fallbackMessage = FALLBACK_MESSAGE): string {
  if (!error) return fallbackMessage;
  if (typeof error === "string") return error;
  if (typeof error === "object" && "message" in error && error.message) return error.message;
  return fallbackMessage;
}
