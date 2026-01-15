import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/integrations/supabase/types";

type SacReport = Tables<"sac_reports">;
type SacReportInsert = TablesInsert<"sac_reports">;
type SacReportUpdate = TablesUpdate<"sac_reports">;

export const useSacReports = () => {
  return useQuery({
    queryKey: ["sac_reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sac_reports")
        .select("*")
        .order("academic_year", { ascending: false });

      if (error) throw error;
      return data as SacReport[];
    },
  });
};

export const useCreateSacReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (report: SacReportInsert) => {
      const { data, error } = await supabase
        .from("sac_reports")
        .insert(report)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sac_reports"] });
    },
  });
};

export const useUpdateSacReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: SacReportUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("sac_reports")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sac_reports"] });
    },
  });
};

export const useDeleteSacReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("sac_reports")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sac_reports"] });
    },
  });
};
