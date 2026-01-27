import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_label: string;
  setting_type: string;
}

// 1. Fetch All Settings
export const useSiteSettings = () => {
  return useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as SiteSetting[];
    },
  });
};

// 2. Update a Setting
export const useUpdateSiteSetting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      setting_value,
    }: {
      id: string;
      setting_value: string;
    }) => {
      const { error } = await supabase
        .from("site_settings")
        .update({ setting_value })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site_settings"] });
    },
  });
};

// 3. Create a Setting (Optional helper)
export const useCreateSiteSetting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newSetting: any) => {
      const { error } = await supabase
        .from("site_settings")
        .insert([newSetting]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site_settings"] });
    },
  });
};
