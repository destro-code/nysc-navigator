import { useEffect, useMemo, useState } from "react";
import { batchService, formatBatchLabel } from "@/services/batch.service";
import type { Batch } from "@/types";

export { formatBatchLabel };

export function useActiveBatch() {
  const [activeBatch, setActiveBatch] = useState<Batch | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    batchService.getActive().then((b) => {
      if (!cancelled) {
        setActiveBatch(b);
        setIsLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const activeBatchLabel = useMemo(() => formatBatchLabel(activeBatch), [activeBatch]);
  return { activeBatch, activeBatchLabel, isLoading };
}
