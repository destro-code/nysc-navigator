export const CURRENT_BATCH_LATEST = {
  batch: "2026 Batch B",
  stream: "Stream II",
  status: "orientation-ongoing",
  generalOrientation: { start: "2026-08-05", end: "2026-08-25" },
  stateExceptions: {
    Sokoto: { start: "2026-08-12", swearingIn: "2026-08-14", end: "2026-09-01" },
    Niger: { start: "2026-08-12", swearingIn: "2026-08-14", end: "2026-09-01" },
  },
  currentGuidance: [
    "Avoid night travel when travelling to orientation camp.",
    "Call-up numbers were uploaded to prospective corps members' dashboards for this stream.",
  ],
  updatedAt: "2026-08-21",
} as const;
