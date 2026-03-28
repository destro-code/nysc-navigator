import { useState } from "react";
import { Wallet, CheckCircle, XCircle, TrendingUp, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MonthData {
  month: string;
  status: "paid" | "pending" | "late";
  amount: number;
}

const ALLOWANCE_AMOUNT = 77000;

const monthsData: MonthData[] = [
  { month: "November", status: "paid", amount: ALLOWANCE_AMOUNT },
  { month: "December", status: "paid", amount: ALLOWANCE_AMOUNT },
  { month: "January", status: "late", amount: ALLOWANCE_AMOUNT },
  { month: "February", status: "pending", amount: ALLOWANCE_AMOUNT },
];

export function AllowanceTracker() {
  const [rant, setRant] = useState("");
  const [thisMonthPaid, setThisMonthPaid] = useState(false);

  const totalPaid = monthsData.filter(m => m.status === "paid").reduce((a, b) => a + b.amount, 0);
  const totalExpected = monthsData.length * ALLOWANCE_AMOUNT;

  return (
    <div className="px-4 py-6 pb-24 animate-fade-in">
      <h2 className="text-2xl font-bold text-foreground mb-2">Allawee Tracker</h2>
      <p className="text-muted-foreground mb-6">Track your monthly allowance</p>

      {/* Summary Card */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-6 shadow-soft">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center">
            <Wallet size={24} className="text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Received</p>
            <p className="text-2xl font-bold text-foreground">
              ₦{totalPaid.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp size={16} className="text-success" />
          <span className="text-muted-foreground">
            {Math.round((totalPaid / totalExpected) * 100)}% of expected allowance
          </span>
        </div>
      </div>

      {/* This Month Status */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          This Month
        </h3>
        <div className="flex gap-3">
          <Button
            variant={thisMonthPaid ? "default" : "outline"}
            className="flex-1"
            size="lg"
            onClick={() => setThisMonthPaid(true)}
          >
            <CheckCircle size={18} className="mr-2" />
            Paid
          </Button>
          <Button
            variant={!thisMonthPaid ? "destructive" : "outline"}
            className="flex-1"
            size="lg"
            onClick={() => setThisMonthPaid(false)}
          >
            <XCircle size={18} className="mr-2" />
            Not Paid
          </Button>
        </div>
      </div>

      {/* Monthly History */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Payment History
        </h3>
        <div className="space-y-3">
          {monthsData.map((month) => (
            <div
              key={month.month}
              className="flex items-center justify-between p-4 bg-card border border-border rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    month.status === "paid"
                      ? "bg-success/10 text-success"
                      : month.status === "late"
                      ? "bg-warning/10 text-warning"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {month.status === "paid" ? (
                    <CheckCircle size={20} />
                  ) : (
                    <XCircle size={20} />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">{month.month}</p>
                  <p className="text-xs text-muted-foreground">
                    ₦{month.amount.toLocaleString()}
                  </p>
                </div>
              </div>
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full ${
                  month.status === "paid"
                    ? "bg-success/10 text-success"
                    : month.status === "late"
                    ? "bg-warning/10 text-warning"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {month.status === "paid" ? "Received" : month.status === "late" ? "Late" : "Pending"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Rant Box */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
          <MessageSquare size={16} />
          Rant Box
        </h3>
        <Textarea
          placeholder="Oga NYSC, where is my money? 😤"
          value={rant}
          onChange={(e) => setRant(e.target.value)}
          className="min-h-[100px] mb-3"
        />
        <Button variant="outline" className="w-full">
          Post Anonymously
        </Button>
      </div>
    </div>
  );
}
