import { useState, useEffect, useCallback } from "react";
import { Wallet, CheckCircle, XCircle, TrendingUp, MessageSquare, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { allowanceService } from "@/services/allowance.service";
import { forumService } from "@/services/forum.service";
import { useToast } from "@/hooks/use-toast";
import { normalizeApiError } from "@/lib/api-error";
import { NetworkError } from "@/components/ui/network-error";
import type { AllowanceRecord } from "@/types";

const ALLOWANCE_AMOUNT = 77000;

export function AllowanceTracker() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [records, setRecords] = useState<AllowanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rant, setRant] = useState("");
  const [savingKeys, setSavingKeys] = useState<Set<string>>(new Set());
  const [isPostingRant, setIsPostingRant] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newMonth, setNewMonth] = useState("");
  const [newYear, setNewYear] = useState(String(new Date().getFullYear()));

  const fetchRecords = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await allowanceService.list(user.id);
      if (data.length === 0) {
        // Seed a few pending entries for the new user's demo
        const currentYear = new Date().getFullYear();
        const months = ["November", "December", "January", "February"];
        await Promise.all(months.map((m) => allowanceService.add(user.id, m, currentYear, ALLOWANCE_AMOUNT)));
        setRecords(await allowanceService.list(user.id));
      } else {
        setRecords(data);
      }
    } catch (error) {
      setErrorMessage(normalizeApiError(error, "Unable to load allowance records right now."));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const toggleStatus = async (record: AllowanceRecord) => {
    if (!user) return;
    const recordKey = record.id;
    if (savingKeys.has(recordKey)) return;
    const newStatus = record.status === "paid" ? "pending" : "paid";
    const previous = records;
    setRecords((prev) => prev.map((r) => (r.id === record.id ? { ...r, status: newStatus } : r)));
    setSavingKeys((prev) => new Set(prev).add(recordKey));
    try {
      await allowanceService.setStatus(record.id, newStatus);
    } catch (error) {
      setRecords(previous);
      toast({ variant: "destructive", title: "Could not save payment status", description: "We restored the previous value. Please try again." });
    } finally {
      setSavingKeys((prev) => { const next = new Set(prev); next.delete(recordKey); return next; });
    }
  };

  const handleAdd = async () => {
    if (!user || !newMonth.trim()) return;
    const yearNum = parseInt(newYear, 10);
    if (Number.isNaN(yearNum)) return;
    await allowanceService.add(user.id, newMonth.trim(), yearNum, ALLOWANCE_AMOUNT);
    setNewMonth("");
    setAddOpen(false);
    toast({ title: "Entry added", description: `${newMonth.trim()} ${yearNum} allowance tracked.` });
    fetchRecords();
  };

  const totalPaid = records.filter((m) => m.status === "paid").reduce((a, b) => a + b.amount, 0);
  const totalExpected = records.length * ALLOWANCE_AMOUNT;

  if (isLoading) return <div className="px-4 py-6 pb-24 flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  if (errorMessage) return <NetworkError message={errorMessage} onRetry={fetchRecords} />;

  return (
    <div className="px-4 py-6 pb-24 animate-fade-in">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Allawee Tracker</h2>
          <p className="text-muted-foreground">Track your monthly ₦{ALLOWANCE_AMOUNT.toLocaleString()} allowance</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-full mt-1"><Plus size={16} className="mr-1" /> Add</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader><DialogTitle>Add allowance entry</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="month">Month</Label>
                <Input id="month" placeholder="e.g. March" value={newMonth} onChange={(e) => setNewMonth(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input id="year" type="number" value={newYear} onChange={(e) => setNewYear(e.target.value)} />
              </div>
              <Button className="w-full" onClick={handleAdd} disabled={!newMonth.trim()}>Add entry</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 my-6 shadow-soft">
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

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Payment History</h3>
        <div className="space-y-3">
          {records.map((record) => {
            const isSavingRecord = savingKeys.has(record.id);
            return (
              <button key={record.id} onClick={() => toggleStatus(record)} disabled={isSavingRecord}
                className={`w-full flex items-center justify-between p-4 bg-card border border-border rounded-xl transition-all ${record.status === "paid" ? "border-success/30" : ""} ${isSavingRecord ? "opacity-70 cursor-not-allowed" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    record.status === "paid" ? "bg-success/10 text-success" : record.status === "late" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
                  }`}>
                    {record.status === "paid" ? <CheckCircle size={20} /> : <XCircle size={20} />}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">{record.month} {record.year}</p>
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
            await forumService.createPost({ user_id: user.id, content: trimmedRant, flair: "stuck" });
            toast({ title: "Posted!", description: "Your rant has been posted to the forum." });
          } catch {
            setRant(trimmedRant);
            toast({ variant: "destructive", title: "Could not post rant", description: "Your draft was restored. Please try again." });
          } finally {
            setIsPostingRant(false);
          }
        }}>Post to Forum</Button>
      </div>
    </div>
  );
}
