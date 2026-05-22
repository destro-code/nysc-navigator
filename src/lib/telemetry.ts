export type TelemetryEventName =
  | "auth.success"
  | "auth.failure"
  | "posting.save"
  | "allowance.toggle"
  | "clearance_item.toggle"
  | "forum.post"
  | "forum.vote"
  | "forum.report";

export type TelemetryPrimitive = string | number | boolean | null;
export type TelemetryProps = Record<string, TelemetryPrimitive | TelemetryPrimitive[] | undefined>;

export interface ApiErrorMetadata {
  source: "supabase" | "http" | "unknown";
  operation: string;
  code?: string;
  status?: number;
  message?: string;
  details?: string;
  hint?: string;
  retryable?: boolean;
}

interface TelemetryEnvelope {
  event: TelemetryEventName;
  timestamp: string;
  properties?: TelemetryProps;
  error?: ApiErrorMetadata;
}

function sanitizeString(value?: string, max = 180): string | undefined {
  if (!value) return undefined;
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

function isRetryableStatus(status?: number): boolean | undefined {
  if (!status) return undefined;
  return status >= 500 || status === 429;
}

export function captureApiError(error: unknown, operation: string, source: ApiErrorMetadata["source"] = "unknown"): ApiErrorMetadata {
  if (!error || typeof error !== "object") {
    return { source, operation, message: sanitizeString(String(error)) };
  }

  const candidate = error as Record<string, unknown>;
  const status = typeof candidate.status === "number" ? candidate.status : undefined;

  return {
    source,
    operation,
    code: typeof candidate.code === "string" ? sanitizeString(candidate.code, 64) : undefined,
    status,
    message: sanitizeString(typeof candidate.message === "string" ? candidate.message : undefined),
    details: sanitizeString(typeof candidate.details === "string" ? candidate.details : undefined),
    hint: sanitizeString(typeof candidate.hint === "string" ? candidate.hint : undefined),
    retryable: isRetryableStatus(status),
  };
}

export function trackEvent(event: TelemetryEventName, properties?: TelemetryProps, error?: ApiErrorMetadata) {
  const payload: TelemetryEnvelope = {
    event,
    timestamp: new Date().toISOString(),
    properties,
    error,
  };

  if (typeof window !== "undefined") {
    const win = window as Window & { __nyscTelemetry?: TelemetryEnvelope[] };
    win.__nyscTelemetry = [...(win.__nyscTelemetry ?? []), payload];
  }

  console.info("[telemetry]", payload);
}
