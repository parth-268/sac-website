import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

// 1. DEFINITIVE TYPE
// We explicitly add user_id so the UI knows who is an Admin
export type TeamMember = {
  id: string;
  name: string;
  designation: string;
  image_url: string | null;
  linkedin_url: string | null;
  email: string | null;
  phone: string | null; // Standardized to 'phone'
  display_order: number;
  is_active: boolean;
  is_alumni: boolean;
  batch_year: string | null;
  user_id: string | null; // <--- The Critical Missing Piece
};

// 2. Fetch Current Team
export const useTeamMembers = () => {
  return useQuery({
    queryKey: ["team_members", "current"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("is_alumni", false)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as TeamMember[];
    },
  });
};

// 3. Fetch Alumni
export const useAlumniMembers = () => {
  return useQuery({
    queryKey: ["team_members", "alumni"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("is_alumni", true)
        .order("batch_year", { ascending: false });
      if (error) throw error;
      return data as TeamMember[];
    },
  });
};

// 4. Mutations
export const useTeamMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["team_members"] });
  };

  const createMember = useMutation({
    mutationFn: async (data: TablesInsert<"team_members">) => {
      const { error } = await supabase.from("team_members").insert(data);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const updateMember = useMutation({
    mutationFn: async ({
      id,
      ...data
    }: TablesUpdate<"team_members"> & { id: string }) => {
      const { error } = await supabase
        .from("team_members")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const deleteMember = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const moveToAlumni = useMutation({
    mutationFn: async ({
      id,
      batch_year,
    }: {
      id: string;
      batch_year: string;
    }) => {
      const { error } = await supabase
        .from("team_members")
        .update({ is_alumni: true, is_active: false, batch_year })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const restoreToTeam = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("team_members")
        .update({ is_alumni: false, is_active: true, batch_year: null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return {
    createMember,
    updateMember,
    deleteMember,
    moveToAlumni,
    restoreToTeam,
  };
};
