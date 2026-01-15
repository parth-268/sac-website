import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/integrations/supabase/types";

type AboutContent = Tables<"about_content">;
type AboutStat = Tables<"about_stats">;

export const useAboutContent = () => {
  return useQuery({
    queryKey: ["about_content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("about_content")
        .select("*")
        .maybeSingle();

      if (error) throw error;
      return data as AboutContent | null;
    },
  });
};

export const useUpsertAboutContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: TablesInsert<"about_content">) => {
      // Check if content exists
      const { data: existing } = await supabase
        .from("about_content")
        .select("id")
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from("about_content")
          .update(content)
          .eq("id", existing.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("about_content")
          .insert(content)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["about_content"] });
    },
  });
};

export const useAboutStats = () => {
  return useQuery({
    queryKey: ["about_stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("about_stats")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as AboutStat[];
    },
  });
};

export const useUpsertAboutStats = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stats: TablesInsert<"about_stats">[]) => {
      // Delete existing and insert new
      await supabase
        .from("about_stats")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (stats.length > 0) {
        const { data, error } = await supabase
          .from("about_stats")
          .insert(stats)
          .select();
        if (error) throw error;
        return data;
      }
      return [];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["about_stats"] });
    },
  });
};
