import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/integrations/supabase/types";

type HeroBanner = Tables<"hero_banners">;
type HeroBannerInsert = TablesInsert<"hero_banners">;
type HeroBannerUpdate = TablesUpdate<"hero_banners">;

export const useHeroBanners = () => {
  return useQuery({
    queryKey: ["hero_banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_banners")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as HeroBanner[];
    },
  });
};

export const useCreateHeroBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (banner: HeroBannerInsert) => {
      const { data, error } = await supabase
        .from("hero_banners")
        .insert(banner)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero_banners"] });
    },
  });
};

export const useUpdateHeroBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: HeroBannerUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("hero_banners")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero_banners"] });
    },
  });
};

export const useDeleteHeroBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("hero_banners")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero_banners"] });
    },
  });
};
