import { useEffect, useMemo, useState } from "react";
import { MapPin, CheckCircle, Circle, Clock, ChevronRight, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";
import { postingService } from "@/services/posting.service";
import type { PostingProgress } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TimelineStep { id: string; label: string; status: "completed" | "current" | "pending"; date?: string; }
const states = ["Lagos", "Abuja", "Kano", "Rivers", "Oyo", "Kaduna", "Enugu", "Delta", "Anambra", "Ogun"];
const milestoneFields: { key: keyof Pick<PostingProgress, "registration_date" | "camp_start_date" | "ppa_assigned_date" | "cds_assigned_date" | "pop_date">; label: string }[] = [
  { key: "registration_date", label: "Online Registration" },
  { key: "camp_start_date", label: "Orientation Camp" },
  { key: "ppa_assigned_date", label: "PPA Posting" },
  { key: "cds_assigned_date", label: "CDS Assignment" },
  { key: "pop_date", label: "POP Ceremony" },
];

export function PostingTracker() {
  const { user } = useAuth();
  const { isProfileComplete, missingRequiredFields } = useUser();
  const [isTracking, setIsTracking] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [regNumber, setRegNumber] = useState("");
  const [stream, setStream] = useState("");
  const [state, setState] = useState("");
  const [milestones, setMilestones] = useState<Pick<PostingProgress, "registration_date" | "camp_start_date" | "ppa_assigned_date" | "cds_assigned_date" | "pop_date">>({ registration_date: null, camp_start_date: null, ppa_assigned_date: null, cds_assigned_date: null, pop_date: null });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) { setIsLoading(false); return; }
    void (async () => {
      setIsLoading(true);
      try {
        const data = await postingService.get(user.id);
        setRegNumber(data.reg_number); setStream(data.stream); setState(data.state);
        setMilestones({ registration_date: data.registration_date, camp_start_date: data.camp_start_date, ppa_assigned_date: data.ppa_assigned_date, cds_assigned_date: data.cds_assigned_date, pop_date: data.pop_date });
        setIsTracking(Boolean(data.reg_number || data.stream || data.state));
      } finally { setIsLoading(false); }
    })();
  }, [user]);

  const formatDate = (value: string | null) => {
    if (!value) return undefined;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };
  const timeline = useMemo<TimelineStep[]>(() => {
    const steps = milestoneFields.map((field) => ({ id: field.key, label: field.label, rawDate: milestones[field.key] }));
    const nextPendingIndex = steps.findIndex((s) => !s.rawDate);
    return steps.map((step, index) => { const status: TimelineStep["status"] = step.rawDate ? "completed" : nextPendingIndex === index ? "current" : "pending"; return { id: step.id, label: step.label, status, date: formatDate(step.rawDate) ?? (status !== "completed" ? "Awaiting update" : undefined) }; });
  }, [milestones]);
  const currentStage = timeline.find((s) => s.status === "current")?.label ?? "All milestones completed";

  const save = async () => {
    if (!user) return;
    setIsSaving(true);
    try { await postingService.save(user.id, { reg_number: regNumber.trim(), stream, state, ...milestones }); setIsTracking(true); setIsEditing(false); }
    finally { setIsSaving(false); }
  };
  const handleStartTracking = () => void save();

  if (isLoading) return <div className="px-4 py-6 pb-24 flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  if (!isTracking || isEditing) return (
    <div className="px-4 py-6 pb-24 animate-fade-in">
      <div className="flex items-center justify-between mb-6"><div><h2 className="text-2xl font-bold text-foreground">Posting Tracker</h2><p className="text-muted-foreground mb-1">Keep your NYSC journey up to date</p></div>{isTracking && <button onClick={() => setIsEditing(false)} className="text-sm text-primary font-medium">Cancel</button>}</div>
      <div className="space-y-4">
        <div><label className="text-sm font-medium text-foreground mb-2 block">Registration Number</label><Input placeholder="e.g. NYSC/2024/123456" value={regNumber} onChange={(e) => setRegNumber(e.target.value)} /></div>
        <div><label className="text-sm font-medium text-foreground mb-2 block">Stream</label><Select value={stream} onValueChange={setStream}><SelectTrigger><SelectValue placeholder="Select stream" /></SelectTrigger><SelectContent><SelectItem value="stream-1">Stream I</SelectItem><SelectItem value="stream-2">Stream II</SelectItem></SelectContent></Select></div>
        <div><label className="text-sm font-medium text-foreground mb-2 block">State of Deployment</label><Select value={state} onValueChange={setState}><SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger><SelectContent>{states.map((s) => <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>)}</SelectContent></Select></div>
        <div className="pt-2"><p className="text-sm font-semibold mb-3">Milestone dates</p><div className="space-y-3">{milestoneFields.map((field) => <div key={field.key}><label className="text-sm text-muted-foreground mb-1 block">{field.label}</label><Input type="date" value={milestones[field.key] ?? ""} onChange={(e) => setMilestones((current) => ({ ...current, [field.key]: e.target.value || null }))} /></div>)}</div></div>
        <Button className="w-full mt-4" size="lg" onClick={handleStartTracking} disabled={isSaving}>{isSaving ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Save size={18} className="mr-2" />}{isSaving ? "Saving..." : isTracking ? "Save changes" : "Start Tracking"}</Button>
      </div>
    </div>
  );

  return (
    <div className="px-4 py-6 pb-24 animate-fade-in">
      {!isProfileComplete && <Alert className="mb-5 border-warning/40 bg-warning/10"><MapPin className="h-4 w-4" /><AlertTitle>Profile required for accurate posting timeline</AlertTitle><AlertDescription>Add your {missingRequiredFields.join(", ")} in Profile before using posting timeline calculations.</AlertDescription></Alert>}
      <div className="flex items-center justify-between mb-6"><div><h2 className="text-2xl font-bold text-foreground">Your Journey</h2><p className="text-muted-foreground text-sm">{state || "State not selected"} • {stream || "Stream not selected"}</p></div><button onClick={() => setIsEditing(true)} className="text-sm text-primary font-medium">Edit</button></div>
      <div className="bg-primary rounded-2xl p-5 mb-8 shadow-card"><div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 bg-primary-foreground/20 rounded-xl flex items-center justify-center"><Clock size={20} className="text-primary-foreground" /></div><div><p className="text-primary-foreground/70 text-xs">Current Stage</p><p className="text-primary-foreground font-semibold">{currentStage}</p></div></div><div className="flex items-center justify-between"><p className="text-primary-foreground/80 text-sm">Milestones update as you save dates</p><div className="bg-primary-foreground/20 px-3 py-1 rounded-full"><span className="text-primary-foreground text-xs font-medium">In Progress</span></div></div></div>
      <div className="space-y-0">{timeline.map((step, index) => <div key={step.id} className="flex gap-4"><div className="flex flex-col items-center"><div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.status === "completed" ? "bg-success text-success-foreground" : step.status === "current" ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : "bg-muted text-muted-foreground"}`}>{step.status === "completed" ? <CheckCircle size={18} /> : step.status === "current" ? <Clock size={18} /> : <Circle size={18} />}</div>{index < timeline.length - 1 && <div className={`w-0.5 h-12 ${step.status === "completed" ? "bg-success" : "bg-border"}`} />}</div><div className="flex-1 pb-8"><div className="flex items-center justify-between"><div><p className={`font-medium ${step.status === "pending" ? "text-muted-foreground" : "text-foreground"}`}>{step.label}</p>{step.date && <p className="text-xs text-muted-foreground mt-0.5">{step.date}</p>}</div>{step.status === "current" && <ChevronRight size={18} className="text-primary" />}</div></div></div>)}</div>
    </div>
  );
}
