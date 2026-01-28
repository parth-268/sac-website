import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useUserRole = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["userRole", user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Fetch role from the 'user_roles' table
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle(); // Use maybeSingle to handle cases with no role gracefully

      if (error) {
        console.error("Error fetching role:", error);
        return null;
      }

      return data?.role; // Returns 'admin', 'editor', etc.
    },
    enabled: !!user, // Only run if user is logged in
    staleTime: 1000 * 60 * 5, // Cache role for 5 minutes
  });
};
