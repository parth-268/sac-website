import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/integrations/supabase/types";

export type ClubType = "club" | "contingent";

type Club = Tables<"clubs">;
type ClubInsert = TablesInsert<"clubs">;
type ClubUpdate = TablesUpdate<"clubs">;

interface UseClubsOptions {
  type?: ClubType;
  onlyActive?: boolean;
}

export const useClubs = (options?: UseClubsOptions) => {
  const { type, onlyActive = false } = options ?? {};

  return useQuery({
    queryKey: ["clubs", { type, onlyActive }],
    queryFn: async () => {
      let query = supabase
        .from("clubs")
        .select("*")
        .order("name", { ascending: true });

      if (type) {
        query = query.eq("type", type);
      }

      if (onlyActive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data ?? [];
    },
  });
};

/* ----------------- Mutations ----------------- */

export const useCreateClub = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (club: ClubInsert) => {
      const { data, error } = await supabase
        .from("clubs")
        .insert(club)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
    },
  });
};

export const useUpdateClub = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ClubUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("clubs")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
    },
  });
};

export const useDeleteClub = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clubs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
    },
  });
};
