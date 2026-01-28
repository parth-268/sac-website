import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type DirectoryUser = {
  user_id: string;
  email: string;
  full_name: string;
  role: "admin" | "editor" | "viewer";
  is_team_member: boolean;
  team_member_id: string | null;
  last_sign_in_at: string | null;
  created_at: string;
};

export const useUserDirectory = () => {
  return useQuery({
    queryKey: ["user_directory"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_full_user_directory");
      if (error) throw error;
      return data as DirectoryUser[];
    },
  });
};
