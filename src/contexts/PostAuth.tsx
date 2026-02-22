import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function PostAuth() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        await supabase.auth.signOut();
        return navigate("/login");
      }

      const { data, error } = await supabase
        .from("team_members")
        .select("id")
        .eq("email", user.email)
        .eq("is_active", true)
        .single();

      if (error || !data) {
        toast.error("Access denied. Contact admin.");
        await supabase.auth.signOut();
        return navigate("/login");
      }

      navigate("/admin", { replace: true });
    };

    checkAccess();
  }, [navigate]);

  return null;
}
