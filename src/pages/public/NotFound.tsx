import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background p-4 overflow-hidden">
      <img
        src="/sac_logo.jpeg"
        alt="SAC Logo watermark"
        className="absolute inset-0 m-auto w-[420px] sm:w-[560px] lg:w-[680px] opacity-[0.06] pointer-events-none select-none"
      />
      <div className="relative text-center max-w-md space-y-8">
        <div className="mb-8 flex flex-col items-center gap-6">
          <Clock className="w-20 h-20 text-accent/80" />
          <div className="text-5xl sm:text-6xl font-heading font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent leading-tight">
            Something Exciting
            <br />
            Is Coming Soon
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold leading-snug">
          We’re building something great here.
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-sm mx-auto leading-relaxed">
          This section is currently under development. Stay tuned — it will be
          available very soon.
        </p>

        <Button asChild size="lg" className="gap-2 rounded-full px-6 shadow-md">
          <Link to="/">
            <Clock className="w-4 h-4" /> Return Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
