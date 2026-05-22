import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

type BatchRecord = Tables<"batches">;

interface DashboardStats {
  daysRemaining: number | null;
  clearancePercentage: number | null;
}

interface UseDashboardStatsResult extends DashboardStats {
  isLoading: boolean;
}

const TOTAL_SERVICE_DAYS = 365;

const getDaysRemainingFromDate = (endDate: string | null): number | null => {
  if (!endDate) return null;

  const end = new Date(endDate);
  if (Number.isNaN(end.getTime())) return null;

  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const getDaysRemainingFromWindow = (startDate: string | null): number | null => {
  if (!startDate) return null;

  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) return null;

  const end = new Date(start);
  end.setDate(end.getDate() + TOTAL_SERVICE_DAYS);
  return getDaysRemainingFromDate(end.toISOString());
};

const parseBatchLabel = (batchLabel: string | null): { year: number; batch: string } | null => {
  if (!batchLabel) return null;

  const matched = batchLabel.match(/(\d{4})\s*Batch\s*([A-Za-z])/i);
  if (!matched) return null;

  return {
    year: Number(matched[1]),
    batch: matched[2].toUpperCase(),
  };
};

export function useDashboardStats(): UseDashboardStatsResult {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    daysRemaining: null,
    clearancePercentage: null,
  });

  useEffect(() => {
    let isMounted = true;

    const loadDashboardStats = async () => {
      if (!user) {
        if (isMounted) {
          setStats({ daysRemaining: null, clearancePercentage: null });
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);

      const [profileRes, activeBatchRes, clearanceRes] = await Promise.all([
        supabase.from("profiles").select("batch").eq("user_id", user.id).maybeSingle(),
        supabase.from("batches").select("*").eq("is_active", true).maybeSingle(),
        supabase.from("clearance_progress").select("completed").eq("user_id", user.id),
      ]);

      const parsedProfileBatch = parseBatchLabel(profileRes.data?.batch ?? null);

      let batchRecord: BatchRecord | null = activeBatchRes.data ?? null;

      if (parsedProfileBatch) {
        const { data: profileBatchRecord } = await supabase
          .from("batches")
          .select("*")
          .eq("year", parsedProfileBatch.year)
          .eq("batch", parsedProfileBatch.batch)
          .maybeSingle();

        if (profileBatchRecord) {
          batchRecord = profileBatchRecord;
        }
      }

      const daysFromEndDate = getDaysRemainingFromDate(batchRecord?.end_date ?? null);
      const daysRemaining = daysFromEndDate ?? getDaysRemainingFromWindow(batchRecord?.start_date ?? null);

      const records = clearanceRes.data ?? [];
      const completed = records.filter((record) => record.completed).length;
      const clearancePercentage = records.length > 0 ? Math.round((completed / records.length) * 100) : null;

      if (isMounted) {
        setStats({ daysRemaining, clearancePercentage });
        setIsLoading(false);
      }
    };

    loadDashboardStats();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return useMemo(
    () => ({
      ...stats,
      isLoading,
    }),
    [stats, isLoading]
  );
}
