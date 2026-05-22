import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EditPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  initialContent: string;
  onSaved?: () => void;
}

const MAX_POST_LENGTH = 500;

export function EditPostDialog({ open, onOpenChange, postId, initialContent, onSaved }: EditPostDialogProps) {
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setContent(initialContent);
    }
  }, [initialContent, open]);

  const trimmedContent = content.trim();

  const handleSave = async () => {
    if (!trimmedContent || trimmedContent.length > MAX_POST_LENGTH) return;

    setIsSubmitting(true);
    const { error } = await supabase
      .from("forum_posts")
      .update({ content: trimmedContent })
      .eq("id", postId);

    if (error) {
      toast({ title: "Error", description: "Failed to save post changes.", variant: "destructive" });
    } else {
      toast({ title: "Post updated", description: "Your changes have been saved." });
      onOpenChange(false);
      onSaved?.();
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Edit Post</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Update your post</Label>
              <span className={`text-xs ${content.length > MAX_POST_LENGTH ? "text-danger" : "text-muted-foreground"}`}>
                {content.length}/{MAX_POST_LENGTH}
              </span>
            </div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none"
              disabled={isSubmitting}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSave} disabled={!trimmedContent || trimmedContent.length > MAX_POST_LENGTH || isSubmitting}>
            {isSubmitting ? <><Loader2 size={16} className="mr-2 animate-spin" />Saving...</> : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
