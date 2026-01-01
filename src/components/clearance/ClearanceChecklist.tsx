import { useState } from "react";
import { CheckSquare, Square, Download, Trophy, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
}

const initialChecklist: ChecklistItem[] = [
  {
    id: "1",
    label: "PPA Clearance Letter",
    description: "Get signed clearance from your PPA",
    completed: true,
    priority: "high",
  },
  {
    id: "2",
    label: "LG Inspector Signature",
    description: "Visit Local Government for verification",
    completed: true,
    priority: "high",
  },
  {
    id: "3",
    label: "CDS Attendance Record",
    description: "Ensure 75% attendance minimum",
    completed: true,
    priority: "high",
  },
  {
    id: "4",
    label: "SAED Project Submission",
    description: "Submit your skills acquisition evidence",
    completed: false,
    priority: "medium",
  },
  {
    id: "5",
    label: "State Coordinator Endorsement",
    description: "Final approval from state office",
    completed: false,
    priority: "high",
  },
  {
    id: "6",
    label: "Discharge Certificate",
    description: "Collect your NYSC certificate",
    completed: false,
    priority: "low",
  },
];

export function ClearanceChecklist() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);

  const completedCount = checklist.filter((item) => item.completed).length;
  const progress = (completedCount / checklist.length) * 100;

  const toggleItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-danger/10 text-danger";
      case "medium":
        return "bg-warning/10 text-warning";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="px-4 py-6 pb-24 animate-fade-in">
      <h2 className="text-2xl font-bold text-foreground mb-2">Clearance Checklist</h2>
      <p className="text-muted-foreground mb-6">Track your clearance requirements</p>

      {/* Progress Card */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-6 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center">
              {progress === 100 ? (
                <Trophy size={24} className="text-primary" />
              ) : (
                <CheckSquare size={24} className="text-primary" />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completion</p>
              <p className="text-2xl font-bold text-foreground">{Math.round(progress)}%</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{completedCount}</p>
            <p className="text-xs text-muted-foreground">of {checklist.length} tasks</p>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
        {progress < 100 && (
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
            <AlertCircle size={12} />
            {checklist.length - completedCount} items remaining
          </p>
        )}
      </div>

      {/* Checklist Items */}
      <div className="space-y-3 mb-6">
        {checklist.map((item) => (
          <button
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`w-full p-4 rounded-xl border text-left transition-all duration-200 ${
              item.completed
                ? "bg-success/5 border-success/20"
                : "bg-card border-border hover:border-primary/30"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 ${
                  item.completed ? "text-success" : "text-muted-foreground"
                }`}
              >
                {item.completed ? (
                  <CheckSquare size={22} />
                ) : (
                  <Square size={22} />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p
                    className={`font-medium ${
                      item.completed
                        ? "text-success line-through"
                        : "text-foreground"
                    }`}
                  >
                    {item.label}
                  </p>
                  {!item.completed && (
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getPriorityColor(
                        item.priority
                      )}`}
                    >
                      {item.priority}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Export Button */}
      <Button variant="outline" className="w-full" size="lg">
        <Download size={18} className="mr-2" />
        Export as PDF
      </Button>
    </div>
  );
}
