import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesUpdate } from "@/integrations/supabase/types";

type TeamMember = Tables<"team_members">;
type TeamMemberUpdate = TablesUpdate<"team_members">;

// Hook to fetch only alumni (is_alumni = true)
export const useAlumni = () => {
  return useQuery({
    queryKey: ["alumni"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("is_alumni", true)
        .eq("is_active", true)
        .order("batch_year", { ascending: false })
        .order("name", { ascending: true });

      if (error) throw error;
      return data as TeamMember[];
    },
  });
};

// Hook to fetch current team members (is_alumni = false)
export const useCurrentTeamMembers = () => {
  return useQuery({
    queryKey: ["current_team_members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("is_alumni", false)
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as TeamMember[];
    },
  });
};

// Hook to archive a team member as alumni
export const useArchiveAsAlumni = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      batch_year,
    }: {
      id: string;
      batch_year: string;
    }) => {
      const { data, error } = await supabase
        .from("team_members")
        .update({ is_alumni: true, batch_year })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumni"] });
      queryClient.invalidateQueries({ queryKey: ["current_team_members"] });
      queryClient.invalidateQueries({ queryKey: ["team_members"] });
    },
  });
};

// Hook to restore alumni back to current team
export const useRestoreFromAlumni = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("team_members")
        .update({ is_alumni: false, batch_year: null })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alumni"] });
      queryClient.invalidateQueries({ queryKey: ["current_team_members"] });
      queryClient.invalidateQueries({ queryKey: ["team_members"] });
    },
  });
};
