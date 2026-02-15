import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/integrations/supabase/types";

type Committee = Tables<"committees">;
type CommitteeInsert = TablesInsert<"committees">;
type CommitteeUpdate = TablesUpdate<"committees">;

type UseCommitteesOptions = {
  onlyActive?: boolean;
};

export const useCommittees = (options: UseCommitteesOptions = {}) => {
  return useQuery({
    queryKey: ["committees", options.onlyActive ?? false],
    queryFn: async () => {
      let query = supabase
        .from("committees")
        .select("*")
        .order("name", { ascending: true });

      if (options.onlyActive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (error) throw error;
      return data as Committee[];
    },
  });
};

export const useCreateCommittee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (committee: CommitteeInsert) => {
      const { data, error } = await supabase
        .from("committees")
        .insert(committee)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["committees"] });
    },
  });
};

export const useUpdateCommittee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: CommitteeUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("committees")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["committees"] });
    },
  });
};

export const useDeleteCommittee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("committees").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["committees"] });
    },
  });
};
