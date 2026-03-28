import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];
const batches = ["2023 Batch A", "2023 Batch B", "2023 Batch C", "2024 Batch A", "2024 Batch B", "2024 Batch C"];
const streams = ["Stream I", "Stream II"];

export function ProfileEditDialog({ open, onOpenChange }: ProfileEditDialogProps) {
  const { currentUser, updateProfile } = useUser();
  const [formData, setFormData] = useState({
    username: "", bio: "", batch: "", stream: "", state: "", lga: "", ppa: "", reg_number: "",
    status: "serving" as "in-camp" | "serving" | "cleared",
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username,
        bio: currentUser.bio,
        batch: currentUser.batch,
        stream: currentUser.stream,
        state: currentUser.state,
        lga: currentUser.lga,
        ppa: currentUser.ppa,
        reg_number: currentUser.reg_number,
        status: currentUser.status,
      });
    }
  }, [currentUser, open]);

  const handleSave = async () => {
    await updateProfile(formData);
    toast.success("Profile updated successfully!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update your NYSC profile information</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} placeholder="Your display name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="Tell us about yourself..." className="resize-none" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg_number">Registration Number</Label>
            <Input id="reg_number" value={formData.reg_number} onChange={(e) => setFormData({ ...formData, reg_number: e.target.value })} placeholder="e.g. NYSC/2024/123456" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Batch</Label>
              <Select value={formData.batch} onValueChange={(v) => setFormData({ ...formData, batch: v })}>
                <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
                <SelectContent>{batches.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Stream</Label>
              <Select value={formData.stream} onValueChange={(v) => setFormData({ ...formData, stream: v })}>
                <SelectTrigger><SelectValue placeholder="Select stream" /></SelectTrigger>
                <SelectContent>{streams.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>State of Deployment</Label>
            <Select value={formData.state} onValueChange={(v) => setFormData({ ...formData, state: v })}>
              <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
              <SelectContent>{nigerianStates.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lga">LGA</Label>
              <Input id="lga" value={formData.lga} onChange={(e) => setFormData({ ...formData, lga: e.target.value })} placeholder="e.g. Ikeja" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ppa">PPA</Label>
              <Input id="ppa" value={formData.ppa} onChange={(e) => setFormData({ ...formData, ppa: e.target.value })} placeholder="e.g. Ministry of Health" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as typeof formData.status })}>
              <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="in-camp">In Camp</SelectItem>
                <SelectItem value="serving">Serving</SelectItem>
                <SelectItem value="cleared">Cleared</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} className="flex-1">Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
