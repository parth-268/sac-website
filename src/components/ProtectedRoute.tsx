import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEditor?: boolean;
}

export const ProtectedRoute = ({
  children,
  requireEditor = false,
}: ProtectedRouteProps) => {
  const { user, isEditor, loading } = useAuth(); // Ensure your AuthContext provides 'loading'
  const location = useLocation();

  // 1. SHOW LOADER WHILE CHECKING AUTH (Prevents glitchy redirects)
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  // 2. IF NOT LOGGED IN -> LOGIN PAGE
  if (!user) {
    // Save where they were trying to go so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. IF LOGGED IN BUT NOT EDITOR (and editor is required) -> HOME
  if (requireEditor && !isEditor) {
    return <Navigate to="/" replace />;
  }

  // 4. RENDER PAGE
  return <>{children}</>;
};
