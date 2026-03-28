import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type BatchRecord = Tables<"batches">;

interface UseActiveBatchResult {
  activeBatch: BatchRecord | null;
  activeBatchLabel: string;
  isLoading: boolean;
}

export function formatBatchLabel(batch: Pick<BatchRecord, "year" | "batch"> | null): string {
  if (!batch) return "Current batch unavailable";
  return `${batch.year} Batch ${batch.batch}`;
}

export function useActiveBatch(): UseActiveBatchResult {
  const [activeBatch, setActiveBatch] = useState<BatchRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchActiveBatch = async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from("batches")
        .select("*")
        .eq("is_active", true)
        .maybeSingle();

      if (isMounted) {
        setActiveBatch(data ?? null);
        setIsLoading(false);
      }
    };

    fetchActiveBatch();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeBatchLabel = useMemo(() => formatBatchLabel(activeBatch), [activeBatch]);

  return { activeBatch, activeBatchLabel, isLoading };
}
