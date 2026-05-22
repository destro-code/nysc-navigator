import { useState } from "react";
import { MapPin, CheckCircle, Circle, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TimelineStep {
  id: string;
  label: string;
  status: "completed" | "current" | "pending";
  date?: string;
}

const initialTimeline: TimelineStep[] = [
  { id: "1", label: "Online Registration", status: "completed", date: "Oct 15" },
  { id: "2", label: "Camp Allocation", status: "completed", date: "Nov 1" },
  { id: "3", label: "Orientation Camp", status: "current", date: "Nov 8-28" },
  { id: "4", label: "PPA Posting", status: "pending" },
  { id: "5", label: "CDS Assignment", status: "pending" },
  { id: "6", label: "POP Ceremony", status: "pending" },
];

const states = [
  "Lagos", "Abuja", "Kano", "Rivers", "Oyo", "Kaduna", "Enugu", "Delta", "Anambra", "Ogun"
];

export function PostingTracker() {
  const { isProfileComplete, missingRequiredFields } = useUser();
  const [timeline] = useState<TimelineStep[]>(initialTimeline);
  const [isTracking, setIsTracking] = useState(true);
  const [regNumber, setRegNumber] = useState("");
  const [stream, setStream] = useState("");
  const [state, setState] = useState("");

  if (!isTracking) {
    return (
      <div className="px-4 py-6 pb-24 animate-fade-in">
        <h2 className="text-2xl font-bold text-foreground mb-2">Posting Tracker</h2>
        <p className="text-muted-foreground mb-6">
          Enter your details to track your NYSC journey
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Registration Number
            </label>
            <Input
              placeholder="e.g. NYSC/2024/123456"
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Stream
            </label>
            <Select value={stream} onValueChange={setStream}>
              <SelectTrigger>
                <SelectValue placeholder="Select stream" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stream-1">Stream I</SelectItem>
                <SelectItem value="stream-2">Stream II</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              State of Deployment
            </label>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {states.map((s) => (
                  <SelectItem key={s} value={s.toLowerCase()}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            className="w-full mt-4" 
            size="lg"
            onClick={() => setIsTracking(true)}
          >
            <MapPin size={18} className="mr-2" />
            Start Tracking
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 pb-24 animate-fade-in">
      {!isProfileComplete && (
        <Alert className="mb-5 border-warning/40 bg-warning/10">
          <MapPin className="h-4 w-4" />
          <AlertTitle>Profile required for accurate posting timeline</AlertTitle>
          <AlertDescription>
            Add your {missingRequiredFields.join(", ")} in Profile before using posting timeline calculations.
          </AlertDescription>
        </Alert>
      )}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Your Journey</h2>
          <p className="text-muted-foreground text-sm">Lagos State • Stream I</p>
        </div>
        <button 
          onClick={() => setIsTracking(false)}
          className="text-sm text-primary font-medium"
        >
          Edit
        </button>
      </div>

      {!isProfileComplete ? (
        <div className="bg-card border border-dashed border-warning/40 rounded-2xl p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Posting timeline is temporarily locked until your required profile fields are complete.
          </p>
        </div>
      ) : (
      <>
      {/* Current Status Card */}
      <div className="bg-primary rounded-2xl p-5 mb-8 shadow-card">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-primary-foreground/20 rounded-xl flex items-center justify-center">
            <Clock size={20} className="text-primary-foreground" />
          </div>
          <div>
            <p className="text-primary-foreground/70 text-xs">Current Stage</p>
            <p className="text-primary-foreground font-semibold">Orientation Camp</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-primary-foreground/80 text-sm">Day 12 of 21</p>
          <div className="bg-primary-foreground/20 px-3 py-1 rounded-full">
            <span className="text-primary-foreground text-xs font-medium">In Progress</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {timeline.map((step, index) => (
          <div key={step.id} className="flex gap-4">
            {/* Timeline Line */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.status === "completed"
                    ? "bg-success text-success-foreground"
                    : step.status === "current"
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step.status === "completed" ? (
                  <CheckCircle size={18} />
                ) : step.status === "current" ? (
                  <Clock size={18} />
                ) : (
                  <Circle size={18} />
                )}
              </div>
              {index < timeline.length - 1 && (
                <div
                  className={`w-0.5 h-12 ${
                    step.status === "completed" ? "bg-success" : "bg-border"
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-8">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`font-medium ${
                      step.status === "pending"
                        ? "text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.date && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {step.date}
                    </p>
                  )}
                </div>
                {step.status === "current" && (
                  <ChevronRight size={18} className="text-primary" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      </>
      )}
    </div>
  );
}
