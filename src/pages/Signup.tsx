import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [verificationSentTo, setVerificationSentTo] = useState<string | null>(null);
  
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  const passwordRequirements = [
    { label: "At least 6 characters", met: password.length >= 6 },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains a letter", met: /[a-zA-Z]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await signup(email.trim(), password, confirmPassword);
    
    if (result.success) {
      if (result.message) {
        setVerificationSentTo(email.trim().toLowerCase());
      }
      toast({
        title: "Account created!",
        description: result.message ?? "Welcome to NYSC Buddy. Let's get you started.",
      });
      if (!result.message) {
        navigate("/");
      }
    } else {
      setError(result.error || "Signup failed");
    }
    
    setIsSubmitting(false);
  };

  if (verificationSentTo) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">N</span>
            </div>
            <span className="font-bold text-foreground">NYSC Buddy</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center px-6 py-12 max-w-md mx-auto w-full text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Confirm your email</h1>
          <p className="text-muted-foreground">
            We sent a confirmation link to <strong>{verificationSentTo}</strong>. Please open the email and confirm your account.
          </p>
          <Button onClick={() => navigate("/login")} size="lg" className="w-full">
            I’ve confirmed my email
          </Button>
          <button
            type="button"
            onClick={() => setVerificationSentTo(null)}
            className="text-sm text-primary hover:underline"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">N</span>
          </div>
          <span className="font-bold text-foreground">NYSC Buddy</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-12 max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Create an account</h1>
          <p className="text-muted-foreground">Start your NYSC journey with us</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting} autoComplete="email" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isSubmitting} autoComplete="new-password" className="pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {password && (
              <div className="space-y-1 mt-2">
                {passwordRequirements.map((req, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    {req.met ? <Check size={12} className="text-success" /> : <X size={12} className="text-muted-foreground" />}
                    <span className={req.met ? "text-success" : "text-muted-foreground"}>{req.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" type="password" placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isSubmitting} autoComplete="new-password" />
            {confirmPassword && password !== confirmPassword && <p className="text-xs text-destructive">Passwords do not match</p>}
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 size={18} className="mr-2 animate-spin" />Creating account...</> : "Create account"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            By signing up, you agree to our{" "}
            <Link to="/terms" className="text-primary hover:underline">Terms</Link> and{" "}
            <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
          </p>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}<Link to="/login" className="text-primary font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
