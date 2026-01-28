import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole"; // ensure this import exists
import { Loader2 } from "lucide-react";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { data: role, isLoading: roleLoading } = useUserRole();
  const location = useLocation();

  // Wait for Auth AND Role to load
  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  // Not Logged In
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged In but NOT Admin
  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
