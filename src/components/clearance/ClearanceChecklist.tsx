import { useState, useEffect, useCallback } from "react";
import { CheckSquare, Square, Download, Trophy, AlertCircle, FileText, Briefcase, Calendar, GraduationCap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { clearanceService } from "@/services/clearance.service";
import { normalizeApiError } from "@/lib/api-error";
import { NetworkError } from "@/components/ui/network-error";

interface ChecklistItem { id: string; label: string; description: string; completed: boolean; priority: "high" | "medium" | "low"; }
interface ChecklistSection { id: string; title: string; icon: React.ReactNode; items: ChecklistItem[]; }

const initialInCampData: ChecklistSection[] = [
  { id: "documents", title: "📄 Mandatory Documents", icon: <FileText size={18} />, items: [
    { id: "doc-1", label: "Call-Up Letter", description: "Original + photocopies", completed: false, priority: "high" }, { id: "doc-2", label: "Green Card Slip", description: "Original + copies", completed: false, priority: "high" }, { id: "doc-3", label: "Statement of Result / Degree Certificate", description: "Original + copies", completed: false, priority: "high" }, { id: "doc-4", label: "School ID Card", description: "Original + copies", completed: false, priority: "high" }, { id: "doc-5", label: "Passport Photographs", description: "Many copies, white background", completed: false, priority: "high" }, { id: "doc-6", label: "Medical Fitness Certificate", description: "Often compulsory for camp", completed: false, priority: "high" }, { id: "doc-7", label: "NIN Print-Out or Valid ID", description: "National ID or NIN slip", completed: false, priority: "high" }, { id: "doc-8", label: "Clear Bag/Folder", description: "To keep documents safe", completed: false, priority: "medium" },
  ] },
  { id: "essentials", title: "👕 Essential Items for Camp", icon: <Briefcase size={18} />, items: [
    { id: "ess-1", label: "Extra White T-shirts & Shorts", description: "NYSC gives some but bring extra", completed: false, priority: "medium" }, { id: "ess-2", label: "White Sneakers & Socks", description: "For parades & drills", completed: false, priority: "high" }, { id: "ess-3", label: "Waist Pouch", description: "For keeping cash & documents secure", completed: false, priority: "medium" }, { id: "ess-4", label: "Power Bank", description: "For phones during long camp days", completed: false, priority: "medium" }, { id: "ess-5", label: "Padlocks and Keys", description: "For securing your items", completed: false, priority: "medium" }, { id: "ess-6", label: "Cutlery/Food Flask/Cup/Spoon", description: "For meals and queues", completed: false, priority: "low" }, { id: "ess-7", label: "Water Bottle & Basic Drugs", description: "For personal essentials", completed: false, priority: "high" },
  ] },
  { id: "registration", title: "🧑‍💼 Arrival & Registration", icon: <Calendar size={18} />, items: [
    { id: "reg-1", label: "Gate Check", description: "Present documents at gate check", completed: false, priority: "high" }, { id: "reg-2", label: "Accommodation Assignment", description: "Assigned room & mattress", completed: false, priority: "high" }, { id: "reg-3", label: "Document Verification", description: "Verification of academic & ID documents", completed: false, priority: "high" }, { id: "reg-4", label: "Biometric Capture", description: "Thumbprint biometric capture", completed: false, priority: "high" }, { id: "reg-5", label: "Platoon & Meal Ticket", description: "Platoon assignment & meal ticket issued", completed: false, priority: "high" }, { id: "reg-6", label: "NYSC Kit Collection", description: "Pick up uniforms", completed: false, priority: "high" },
  ] },
];
const initialOutCampData: ChecklistSection[] = [
  { id: "deployment", title: "🧑‍💻 Deployment & Reporting", icon: <Briefcase size={18} />, items: [
    { id: "dep-1", label: "Report to LG Secretariat", description: "Report with your posting letter", completed: false, priority: "high" }, { id: "dep-2", label: "Submit Posting Letter", description: "Get PPA deployment details", completed: false, priority: "high" }, { id: "dep-3", label: "Report to PPA", description: "Report physically at your PPA", completed: false, priority: "high" },
  ] },
  { id: "monthly", title: "🪪 Monthly Clearance", icon: <Calendar size={18} />, items: [
    { id: "mon-1", label: "Monthly Clearance Slip", description: "Signed by PPA supervisor", completed: false, priority: "high" }, { id: "mon-2", label: "CDS Participation", description: "Attendance signed by CDS leader", completed: false, priority: "high" }, { id: "mon-3", label: "NYSC ID Card", description: "Presented to LG clearance officers", completed: false, priority: "high" }, { id: "mon-4", label: "Biometric Sign-in", description: "Attendance recorded by LG Inspector", completed: false, priority: "high" },
  ] },
  { id: "pop", title: "🏁 End of Service (POP)", icon: <GraduationCap size={18} />, items: [
    { id: "pop-1", label: "Monthly Clearance Slips", description: "All slips completed and verified", completed: false, priority: "high" }, { id: "pop-2", label: "Final CDS Attendance", description: "Final confirmation", completed: false, priority: "high" }, { id: "pop-3", label: "Final PPA Clearance Letter", description: "Clearance letter from your PPA", completed: false, priority: "high" }, { id: "pop-4", label: "Certificate of National Service", description: "Collect your CNS", completed: false, priority: "high" },
  ] },
];
const applyCompleted = (sections: ChecklistSection[], completedMap: Map<string, boolean>) => sections.map((section) => ({ ...section, items: section.items.map((item) => ({ ...item, completed: completedMap.get(item.id) ?? item.completed })) }));

export function ClearanceChecklist() {
  const { user } = useAuth();
  const [inCampData, setInCampData] = useState(initialInCampData);
  const [outCampData, setOutCampData] = useState(initialOutCampData);
  const [activeTab, setActiveTab] = useState("incamp");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const loadProgress = useCallback(async () => {
    if (!user) return;
    setIsLoading(true); setErrorMessage(null);
    try { const data = await clearanceService.list(user.id); const completedMap = new Map(data.map((d) => [d.item_id, d.completed])); setInCampData((prev) => applyCompleted(prev, completedMap)); setOutCampData((prev) => applyCompleted(prev, completedMap)); }
    catch (error) { setErrorMessage(normalizeApiError(error, "Unable to load checklist progress right now.")); }
    finally { setIsLoading(false); }
  }, [user]);
  useEffect(() => { void loadProgress(); }, [loadProgress]);

  const toggleItem = async (sectionId: string, itemId: string, isInCamp: boolean) => {
    if (!user) return;
    const currentSections = isInCamp ? inCampData : outCampData;
    const currentItem = currentSections.flatMap((section) => section.items).find((item) => item.id === itemId);
    if (!currentItem) return;
    const newCompleted = !currentItem.completed;
    const setter = isInCamp ? setInCampData : setOutCampData;
    setter((prev) => prev.map((section) => section.id === sectionId ? { ...section, items: section.items.map((item) => item.id === itemId ? { ...item, completed: newCompleted } : item) } : section));
    try { await clearanceService.toggle({ user_id: user.id, item_id: itemId, section_id: sectionId, tab: isInCamp ? "incamp" : "outcamp", completed: newCompleted }); }
    catch (error) { setter((prev) => prev.map((section) => section.id === sectionId ? { ...section, items: section.items.map((item) => item.id === itemId ? { ...item, completed: !newCompleted } : item) } : section)); setErrorMessage(normalizeApiError(error, "Unable to save checklist progress.")); }
  };

  const calculateProgress = (sections: ChecklistSection[]) => { const allItems = sections.flatMap((s) => s.items); const completed = allItems.filter((item) => item.completed).length; return { completed, total: allItems.length, percentage: allItems.length ? (completed / allItems.length) * 100 : 0 }; };
  const currentProgress = activeTab === "incamp" ? calculateProgress(inCampData) : calculateProgress(outCampData);
  const getPriorityColor = (priority: string) => priority === "high" ? "bg-danger/10 text-danger" : priority === "medium" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground";
  const exportChecklist = () => window.print();
  if (isLoading) return <div className="px-4 py-6 pb-24 flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  if (errorMessage) return <NetworkError message={errorMessage} onRetry={() => void loadProgress()} />;

  const renderSection = (section: ChecklistSection, isInCamp: boolean) => <div key={section.id} className="mb-6"><div className="flex items-center gap-2 mb-3"><span className="text-primary">{section.icon}</span><h3 className="font-semibold text-foreground">{section.title}</h3></div><div className="space-y-2">{section.items.map((item) => <button key={item.id} onClick={() => void toggleItem(section.id, item.id, isInCamp)} className={`w-full p-3 rounded-xl border text-left transition-all duration-200 ${item.completed ? "bg-success/5 border-success/20" : "bg-card border-border hover:border-primary/30"}`}><div className="flex items-start gap-3"><div className={`mt-0.5 ${item.completed ? "text-success" : "text-muted-foreground"}`}>{item.completed ? <CheckSquare size={20} /> : <Square size={20} />}</div><div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-0.5 flex-wrap"><p className={`font-medium text-sm ${item.completed ? "text-success line-through" : "text-foreground"}`}>{item.label}</p>{!item.completed && <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getPriorityColor(item.priority)}`}>{item.priority}</span>}</div><p className="text-xs text-muted-foreground">{item.description}</p></div></div></button>)}</div></div>;
  return <div className="px-4 py-6 pb-24 animate-fade-in"><h2 className="text-2xl font-bold text-foreground mb-2">Clearance Checklist</h2><p className="text-muted-foreground mb-6">Track your NYSC clearance requirements</p><div className="bg-card border border-border rounded-2xl p-5 mb-6 shadow-soft"><div className="flex items-center justify-between mb-4"><div className="flex items-center gap-3"><div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center">{currentProgress.percentage === 100 ? <Trophy size={24} className="text-primary" /> : <CheckSquare size={24} className="text-primary" />}</div><div><p className="text-sm text-muted-foreground">{activeTab === "incamp" ? "In-Camp" : "Out-Camp"} Progress</p><p className="text-2xl font-bold text-foreground">{Math.round(currentProgress.percentage)}%</p></div></div><div className="text-right"><p className="text-2xl font-bold text-primary">{currentProgress.completed}</p><p className="text-xs text-muted-foreground">of {currentProgress.total} items</p></div></div><Progress value={currentProgress.percentage} className="h-2" />{currentProgress.percentage < 100 && <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1"><AlertCircle size={12} /> {currentProgress.total - currentProgress.completed} items remaining</p>}</div><Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6"><TabsList className="grid w-full grid-cols-2 mb-4"><TabsTrigger value="incamp" className="text-sm">✅ In-Camp</TabsTrigger><TabsTrigger value="outcamp" className="text-sm">📌 Out-Camp</TabsTrigger></TabsList><TabsContent value="incamp" className="mt-0">{inCampData.map((s) => renderSection(s, true))}</TabsContent><TabsContent value="outcamp" className="mt-0">{outCampData.map((s) => renderSection(s, false))}</TabsContent></Tabs><Button variant="outline" className="w-full" size="lg" onClick={exportChecklist}><Download size={18} className="mr-2" /> Export / Print Checklist</Button></div>;
}
