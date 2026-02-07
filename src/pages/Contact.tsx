import { useState } from "react";
import { ArrowLeft, Mail, MessageSquare, Send, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    toast({
      title: "Message sent!",
      description: "We'll get back to you as soon as possible.",
    });
    
    setName("");
    setEmail("");
    setMessage("");
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-4 px-4 py-3 max-w-3xl mx-auto">
          <Link to="/" className="p-2 -ml-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-foreground" />
          </Link>
          <h1 className="font-bold text-foreground text-lg">Contact & Support</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Get in Touch</h2>
          <p className="text-muted-foreground">
            Have questions, feedback, or need help? We're here for you.
          </p>
        </div>

        {/* Contact options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="p-6 bg-card border border-border rounded-2xl">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <Mail size={24} className="text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Email Support</h3>
            <p className="text-sm text-muted-foreground mb-3">
              For general inquiries and support
            </p>
            <a 
              href="mailto:support@nyscbuddy.app" 
              className="text-primary text-sm hover:underline"
            >
              support@nyscbuddy.app
            </a>
          </div>

          <div className="p-6 bg-card border border-border rounded-2xl">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <MessageSquare size={24} className="text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Community Forum</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Connect with other corps members
            </p>
            <Link to="/" className="text-primary text-sm hover:underline">
              Visit Forum →
            </Link>
          </div>
        </div>

        {/* Contact form */}
        <div className="p-6 bg-card border border-border rounded-2xl">
          <h3 className="font-semibold text-foreground mb-4">Send us a message</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="How can we help you?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSubmitting}
                required
                className="min-h-[120px]"
              />
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={18} className="mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </form>
        </div>

        {/* FAQ section */}
        <div className="mt-8 p-6 bg-muted/50 rounded-2xl">
          <h3 className="font-semibold text-foreground mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div>
              <p className="font-medium text-foreground text-sm">Is this app affiliated with NYSC?</p>
              <p className="text-sm text-muted-foreground mt-1">
                No, NYSC Buddy is an independent app created by corps members to help fellow corps members. Always verify official information through NYSC channels.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">Is my data secure?</p>
              <p className="text-sm text-muted-foreground mt-1">
                Yes, we take data security seriously. Your data is stored securely and we never sell your information to third parties.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">How do I delete my account?</p>
              <p className="text-sm text-muted-foreground mt-1">
                You can delete your account from the Profile settings. All your data will be permanently removed.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
