import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Shield, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import heroCampus from "@/assets/hero_campus.png"; // Ensure you have this asset or similar

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, user, isEditor, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user && isEditor) {
      navigate("/admin", { replace: true });
    }
  }, [user, isEditor, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        toast.success("Account created!", {
          description: "Please ask an admin to approve your access.",
        });
        setIsSignUp(false);
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success("Welcome back!");
        navigate("/admin", { replace: true });
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <SEO title="Login" description="Admin portal access for SAC" />

      {/* Left: Visual Side */}
      <div className="hidden lg:flex relative overflow-hidden bg-primary items-center justify-center p-12">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
          style={{ backgroundImage: `url(${heroCampus})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary to-transparent" />

        <div className="relative z-10 text-white max-w-lg space-y-6">
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center text-primary font-bold text-3xl mb-8">
            S
          </div>
          <h1 className="font-heading text-5xl font-bold leading-tight">
            Manage the <br />
            Student Voice.
          </h1>
          <p className="text-lg text-white/70 leading-relaxed">
            Welcome to the Student Affairs Council digital command center.
            Manage events, update content, and connect with the campus.
          </p>
        </div>
      </div>

      {/* Right: Form Side */}
      <div className="flex items-center justify-center p-6 lg:p-12 relative">
        <Button
          variant="ghost"
          className="absolute top-6 left-6 gap-2"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-muted-foreground mt-2">
              {isSignUp
                ? "Enter your details to request access"
                : "Sign in to access your dashboard"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required={isSignUp}
                  className="bg-secondary/50"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@iimsambalpur.ac.in"
                required
                className="bg-secondary/50"
              />
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-secondary/50"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : isSignUp ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm font-medium text-accent hover:underline"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "New here? Create an account"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
