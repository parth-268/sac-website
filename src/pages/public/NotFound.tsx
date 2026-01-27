import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <div className="relative mb-8">
          <div className="text-[150px] font-heading font-bold text-secondary leading-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="w-16 h-16 text-accent animate-bounce" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-3">Page Not Found</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>

        <Button asChild size="lg" className="gap-2">
          <Link to="/">
            <Home className="w-4 h-4" /> Return Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
