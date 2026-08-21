import { delay, ensureSeeded } from "@/data/storage";
import { seedBatch } from "@/data/seed";
import type { Batch } from "@/types";

const KEY = "batch.active";

export const batchService = {
  async getActive(): Promise<Batch> {
    await delay(50);
    return ensureSeeded(KEY, seedBatch);
  },
};

export function formatBatchLabel(batch: Pick<Batch, "year" | "batch"> | null): string {
  if (!batch) return "Current batch unavailable";
  return `${batch.year} Batch ${batch.batch}`;
}
