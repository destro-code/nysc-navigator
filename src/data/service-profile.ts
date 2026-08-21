export type ServiceStage =
  | "orientation"
  | "primary-assignment"
  | "secondary-assignment"
  | "winding-up";

export interface ServiceProfile {
  batch: string;
  stream?: string;
  stage: ServiceStage;
  updatedAt: string;
}

export const DEFAULT_SERVICE_PROFILE: ServiceProfile = {
  batch: "2026 Batch B",
  stream: "Stream II",
  stage: "orientation",
  updatedAt: new Date().toISOString(),
};
