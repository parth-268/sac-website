import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Shield, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion, useReducedMotion } from "framer-motion";
import { SEO } from "@/components/SEO";
import heroCampus from "@/assets/hero_campus.png";
import googleLogo from "@/assets/google.svg";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthRedirecting, setOauthRedirecting] = useState(false);

  const reduceMotion = useReducedMotion();

  const { signIn, signUp, user, isEditor, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const { data: settings } = useSiteSettings();
  const sacLogoUrl = settings?.find(
    (s) => s.setting_key === "sac_logo_url",
  )?.setting_value;

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
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp((p) => !p);
    setPassword("");
    setFullName("");
  };

  return (
    <div
      className="min-h-screen grid lg:grid-cols-2 bg-background"
      aria-busy={oauthRedirecting}
    >
      <SEO title="Login" description="Admin portal access for SAC" />

      {/* Left: Visual Side */}
      <div className="hidden lg:flex relative overflow-hidden bg-primary items-center justify-center p-12">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
          style={{ backgroundImage: `url(${heroCampus})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary to-transparent" />

        <div className="relative z-10 text-white max-w-lg space-y-6">
          {sacLogoUrl ? (
            <div className="mb-10 inline-flex items-center justify-center rounded-3xl bg-white/90 backdrop-blur-sm p-6 shadow-xl">
              <img
                src={sacLogoUrl}
                alt="SAC Logo"
                className="w-32 h-32 object-contain"
              />
            </div>
          ) : (
            <div className="mb-10 w-28 h-28 bg-accent rounded-3xl flex items-center justify-center text-primary font-bold text-5xl shadow-xl">
              S
            </div>
          )}
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
      <div className="flex items-center justify-center px-4 py-6 lg:p-12 relative">
        <Button
          variant="ghost"
          className="absolute top-3 left-3 sm:top-6 sm:left-6 gap-2 bg-background/60 backdrop-blur-md hover:bg-background/80"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Button>

        <motion.div
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            reduceMotion ? { duration: 0 } : { duration: 0.4, ease: "easeOut" }
          }
          className="w-full max-w-md space-y-7"
        >
          {/* Mobile Logo */}
          {!sacLogoUrl ? null : (
            <div className="flex lg:hidden justify-center mb-4">
              <div className="inline-flex items-center justify-center rounded-2xl bg-white/90 backdrop-blur-sm p-2 shadow-md">
                <img
                  src={sacLogoUrl}
                  alt="SAC Logo"
                  className="w-16 h-16 object-contain"
                />
              </div>
            </div>
          )}

          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold">
              {isSignUp ? "Request Access" : "Welcome Back"}
            </h2>
            <p className="text-muted-foreground mt-2">
              {isSignUp
                ? "Enter your details to request access"
                : "Sign in to access your dashboard"}
            </p>
          </div>

          <Button
            size="lg"
            className="w-full gap-3 bg-white text-black hover:bg-gray-100 shadow-sm"
            aria-label="Sign in with Google"
            onClick={async () => {
              try {
                setOauthRedirecting(true);
                await supabase.auth.signInWithOAuth({
                  provider: "google",
                  options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                  },
                });
              } catch {
                setOauthRedirecting(false);
                toast.error("Failed to start Google sign-in");
              }
            }}
            disabled={oauthRedirecting}
          >
            {oauthRedirecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirecting…
              </>
            ) : (
              <>
                <img src={googleLogo} className="w-4 h-4" alt="Google logo" />
                Continue with Google
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Only verified SAC members with college email access can sign in.
          </p>

          <div className="relative my-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1">
                <Label>Full Name</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required={isSignUp}
                  className="bg-secondary/50 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-0"
                />
              </div>
            )}

            <div className="space-y-1">
              <Label>Email Address</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@iimsambalpur.ac.in"
                required
                autoComplete="email"
                className="bg-secondary/50 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-0"
              />
            </div>

            <div className="space-y-1">
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete={isSignUp ? "new-password" : "current-password"}
                className="bg-secondary/50 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-0"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading || authLoading}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : isSignUp ? (
                "Request Access"
              ) : (
                "Sign In"
              )}
            </Button>

            {isSignUp && (
              <p className="text-[11px] text-muted-foreground text-center">
                Accounts require admin approval before access.
              </p>
            )}
          </form>

          {!isSignUp && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-4 h-4" />
              Secure admin access
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
