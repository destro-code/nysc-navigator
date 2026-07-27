import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { batchService } from "@/services/batch.service";
import { clearanceService } from "@/services/clearance.service";

interface DashboardStats {
  daysRemaining: number | null;
  clearancePercentage: number | null;
  isLoading: boolean;
}

export function useDashboardStats(): DashboardStats {
  const { user } = useAuth();
  const [state, setState] = useState<DashboardStats>({ daysRemaining: null, clearancePercentage: null, isLoading: true });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) {
        if (!cancelled) setState({ daysRemaining: null, clearancePercentage: null, isLoading: false });
        return;
      }
      const [batch, clearance] = await Promise.all([
        batchService.getActive(),
        clearanceService.list(user.id),
      ]);
      const end = new Date(batch.end_date);
      const daysRemaining = Number.isNaN(end.getTime()) ? null : Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86_400_000));
      // Rough percentage: assume 30-item nominal checklist total for the demo dashboard summary.
      const NOMINAL_TOTAL = 30;
      const completed = clearance.filter((e) => e.completed).length;
      const clearancePercentage = Math.min(100, Math.round((completed / NOMINAL_TOTAL) * 100));
      if (!cancelled) setState({ daysRemaining, clearancePercentage, isLoading: false });
    })();
    return () => { cancelled = true; };
  }, [user]);

  return state;
}
