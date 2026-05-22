import { useState, useEffect } from "react";
import { Wallet, CheckCircle, XCircle, TrendingUp, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { normalizeApiError } from "@/lib/api-error";
import { NetworkError } from "@/components/ui/network-error";

const ALLOWANCE_AMOUNT = 77000;

const SERVICE_MONTHS = [
  "November", "December", "January", "February", "March",
  "April", "May", "June", "July", "August", "September", "October"
];

interface AllowanceRecord {
  id?: string;
  month: string;
  year: number;
  status: "paid" | "pending" | "late";
  amount: number;
  notes: string;
}

export function AllowanceTracker() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [records, setRecords] = useState<AllowanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rant, setRant] = useState("");
  const [savingKeys, setSavingKeys] = useState<Set<string>>(new Set());
  const [isPostingRant, setIsPostingRant] = useState(false);

  const fetchRecords = async () => {
    if (!user) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { data, error } = await supabase
        .from("allowance_records")
        .select("*")
        .eq("user_id", user.id)
        .order("year", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setRecords(data.map((r) => ({
          id: r.id,
          month: r.month,
          year: r.year,
          status: r.status as AllowanceRecord["status"],
          amount: r.amount,
          notes: r.notes || "",
        })));
      } else {
        // Initialize default records
        const currentYear = new Date().getFullYear();
        const defaults = SERVICE_MONTHS.slice(0, 4).map((month) => ({
          month,
          year: currentYear,
          status: "pending" as const,
          amount: ALLOWANCE_AMOUNT,
          notes: "",
        }));
        setRecords(defaults);
      }
    } catch (error) {
      setErrorMessage(normalizeApiError(error, "Unable to load allowance records right now."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, [user]);

  const toggleStatus = async (index: number) => {
    if (!user) return;

    const record = records[index];
    const recordKey = `${record.month}-${record.year}`;

    if (savingKeys.has(recordKey)) return;

    const newStatus = record.status === "paid" ? "pending" : "paid";
    const previous = [...records];
    const updated = [...records];
    updated[index] = { ...record, status: newStatus };
    setRecords(updated);
    setSavingKeys((prev) => new Set(prev).add(recordKey));

    try {
      const { error } = await supabase.from("allowance_records").upsert({
        user_id: user.id,
        month: record.month,
        year: record.year,
        amount: record.amount,
        status: newStatus,
        notes: record.notes,
      }, { onConflict: "user_id,month,year" });

      if (error) {
        throw error;
      }
    } catch (error) {
      setRecords(previous);
      console.error("Failed to toggle allowance status", {
        error,
        userId: user.id,
        month: record.month,
        year: record.year,
      });
      toast({
        variant: "destructive",
        title: "Could not save payment status",
        description: "We restored the previous value. Please try again.",
      });
    } finally {
      setSavingKeys((prev) => {
        const next = new Set(prev);
        next.delete(recordKey);
        return next;
      });
    }
  };

  const totalPaid = records.filter((m) => m.status === "paid").reduce((a, b) => a + b.amount, 0);
  const totalExpected = records.length * ALLOWANCE_AMOUNT;

  if (isLoading) {
    return (
      <div className="px-4 py-6 pb-24 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }
  if (errorMessage) {
    return <NetworkError message={errorMessage} onRetry={fetchRecords} />;
  }

  return (
    <div className="px-4 py-6 pb-24 animate-fade-in">
      <h2 className="text-2xl font-bold text-foreground mb-2">Allawee Tracker</h2>
      <p className="text-muted-foreground mb-6">Track your monthly ₦{ALLOWANCE_AMOUNT.toLocaleString()} allowance</p>

      {/* Summary Card */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-6 shadow-soft">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center">
            <Wallet size={24} className="text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Received</p>
            <p className="text-2xl font-bold text-foreground">₦{totalPaid.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp size={16} className="text-success" />
          <span className="text-muted-foreground">
            {totalExpected > 0 ? Math.round((totalPaid / totalExpected) * 100) : 0}% of expected allowance
          </span>
        </div>
      </div>

      {/* Monthly History */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Payment History</h3>
        <div className="space-y-3">
          {records.map((record, index) => {
            const recordKey = `${record.month}-${record.year}`;
            const isSavingRecord = savingKeys.has(recordKey);

            return (
              <button
                key={recordKey}
                onClick={() => toggleStatus(index)}
                disabled={isSavingRecord}
                className={`w-full flex items-center justify-between p-4 bg-card border border-border rounded-xl transition-all ${record.status === "paid" ? "border-success/30" : ""} ${isSavingRecord ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    record.status === "paid" ? "bg-success/10 text-success" : record.status === "late" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
                  }`}>
                    {record.status === "paid" ? <CheckCircle size={20} /> : <XCircle size={20} />}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">{record.month}</p>
                    <p className="text-xs text-muted-foreground">₦{record.amount.toLocaleString()}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                  record.status === "paid" ? "bg-success/10 text-success" : record.status === "late" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
                }`}>
                  {record.status === "paid" ? "Received" : record.status === "late" ? "Late" : "Pending"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rant Box */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
          <MessageSquare size={16} /> Rant Box
        </h3>
        <Textarea placeholder="Oga NYSC, where is my money? 😤" value={rant} onChange={(e) => setRant(e.target.value)} className="min-h-[100px] mb-3" />
        <Button variant="outline" className="w-full" disabled={isPostingRant} onClick={async () => {
          if (!rant.trim() || !user) return;

          const trimmedRant = rant.trim();
          setRant("");
          setIsPostingRant(true);

          try {
            const { error } = await supabase.from("forum_posts").insert({ user_id: user.id, content: trimmedRant, flair: "stuck" });
            if (error) {
              throw error;
            }

            toast({ title: "Posted!", description: "Your rant has been posted to the forum." });
          } catch (error) {
            setRant(trimmedRant);
            console.error("Failed to post rant", {
              error,
              userId: user.id,
              month: new Date().toLocaleString("default", { month: "long" }),
              year: new Date().getFullYear(),
            });
            toast({
              variant: "destructive",
              title: "Could not post rant",
              description: "Your draft was restored. Please try again.",
            });
          } finally {
            setIsPostingRant(false);
          }
        }}>Post Anonymously</Button>
      </div>
    </div>
  );
}
