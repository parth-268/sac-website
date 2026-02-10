import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_label: string;
  setting_type: string;
}

export type CreateSiteSettingPayload = Omit<SiteSetting, "id">;

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
      queryClient.invalidateQueries({ queryKey: ["site-setting"] });
    },
  });
};

// 3. Create a Setting (Optional helper)
export const useCreateSiteSetting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newSetting: CreateSiteSettingPayload) => {
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

export const ACTIVE_YEAR_KEY = "active_academic_year";

/* ------------------ Queries ------------------ */

export const useActiveAcademicYear = () => {
  return useQuery({
    queryKey: ["site-setting", ACTIVE_YEAR_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("setting_value")
        .eq("setting_key", ACTIVE_YEAR_KEY)
        .maybeSingle();

      if (error) throw error;
      return data?.setting_value ?? null;
    },
  });
};

/* ------------------ Mutations ------------------ */

export const useUpdateActiveAcademicYear = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (year: string) => {
      const { error } = await supabase
        .from("site_settings")
        .update({ setting_value: year })
        .eq("setting_key", ACTIVE_YEAR_KEY);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site_settings"] });
      queryClient.invalidateQueries({
        queryKey: ["site-setting", ACTIVE_YEAR_KEY],
      });
    },
  });
};
