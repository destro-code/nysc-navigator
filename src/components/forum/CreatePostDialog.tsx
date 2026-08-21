import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { forumService } from "@/services/forum.service";
import type { PostFlair } from "@/types";

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostCreated?: () => void;
}

const flairOptions = [
  { value: "question", label: "Question", description: "Ask the community" },
  { value: "info", label: "Info", description: "Share useful information" },
  { value: "cleared", label: "Cleared", description: "Share success stories" },
  { value: "stuck", label: "Stuck", description: "Need help with something" },
];

export function CreatePostDialog({ open, onOpenChange, onPostCreated }: CreatePostDialogProps) {
  const [content, setContent] = useState("");
  const [flair, setFlair] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { isProfileComplete, missingRequiredFields } = useUser();
  const maxLength = 500;

  const handleSubmit = async () => {
    if (!content.trim() || !flair || !user) return;
    if (!isProfileComplete) {
      toast({
        title: "Complete profile first",
        description: `Please add your ${missingRequiredFields.join(", ")} before creating a post.`,
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await forumService.createPost({ user_id: user.id, content: content.trim(), flair: flair as PostFlair });
      toast({ title: "Post created!", description: "Your post has been published to the forum." });
      setContent("");
      setFlair("");
      onOpenChange(false);
      onPostCreated?.();
    } catch {
      toast({ title: "Error", description: "Failed to create post.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Create a Post</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Flair</Label>
            <Select value={flair} onValueChange={setFlair} disabled={isSubmitting}>
              <SelectTrigger><SelectValue placeholder="Select a flair" /></SelectTrigger>
              <SelectContent>
                {flairOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className="font-medium">{option.label}</span>
                    <span className="text-muted-foreground ml-2 text-xs">- {option.description}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>What's on your mind?</Label>
              <span className={`text-xs ${content.length > maxLength ? "text-danger" : "text-muted-foreground"}`}>{content.length}/{maxLength}</span>
            </div>
            <Textarea placeholder="Share your experience, ask a question, or rant about allawee..." value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[120px] resize-none" disabled={isSubmitting} />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!isProfileComplete || !content.trim() || !flair || content.length > maxLength || isSubmitting}>
            {isSubmitting ? <><Loader2 size={16} className="mr-2 animate-spin" />Posting...</> : "Post"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
