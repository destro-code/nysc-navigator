import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatCooldown, POST_MAX_LENGTH, validatePostContent } from "@/lib/postValidation";

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
  const maxLength = POST_MAX_LENGTH;
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const fetchCooldown = async () => {
    if (!user) return;
    const { data } = await supabase.rpc("get_forum_post_cooldown_seconds", { p_user_id: user.id });
    setCooldownSeconds(Math.max(0, data || 0));
  };

  const handleSubmit = async () => {
    const contentError = validatePostContent(content);
    if (contentError || !flair || !user || cooldownSeconds > 0) {
      if (contentError) toast({ title: "Invalid post", description: contentError, variant: "destructive" });
      return;
    };
    setIsSubmitting(true);

    const { error } = await supabase.from("forum_posts").insert({
      user_id: user.id,
      content: content.trim(),
      flair: flair as "cleared" | "stuck" | "question" | "info",
    });

    if (error) {
      toast({ title: "Error", description: error.message || "Failed to create post.", variant: "destructive" });
      await fetchCooldown();
    } else {
      toast({ title: "Post created!", description: "Your post has been published to the forum." });
      setContent("");
      setFlair("");
      onOpenChange(false);
      onPostCreated?.();
      await fetchCooldown();
    }
    setIsSubmitting(false);
  };

  useEffect(() => {
    if (!open) return;
    fetchCooldown();
    const timer = setInterval(() => setCooldownSeconds((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [open, user]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Create a Post</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Flair</Label>
            <Select value={flair} onValueChange={setFlair}>
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
            <Textarea placeholder="Share your experience, ask a question, or rant about allawee..." value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[120px] resize-none" disabled={isSubmitting || cooldownSeconds > 0} />
            {cooldownSeconds > 0 ? <p className="text-xs text-muted-foreground">You can post again in {formatCooldown(cooldownSeconds)}.</p> : null}
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!content.trim() || !flair || content.length > maxLength || isSubmitting || cooldownSeconds > 0}>
            {isSubmitting ? <><Loader2 size={16} className="mr-2 animate-spin" />Posting...</> : "Post"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
