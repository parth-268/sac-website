import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

/* ================= Types ================= */

export type AcademicYear = Tables<"academic_years">;

/* ================= Queries ================= */

/**
 * Fetch all academic years (active + past)
 */
export const useAcademicYears = () => {
  return useQuery({
    queryKey: ["academic-years"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academic_years")
        .select("*")
        .order("year", { ascending: false });

      if (error) throw error;
      return data as AcademicYear[];
    },
  });
};

/**
 * Fetch the currently active academic year
 */
export const useActiveAcademicYear = () => {
  return useQuery({
    queryKey: ["academic-years", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academic_years")
        .select("*")
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      return data as AcademicYear | null;
    },
  });
};

/* ================= Mutations ================= */

/**
 * Start a new academic year
 * - Deactivates current active year
 * - Activates (or creates) the new year
 */
export const useStartAcademicYear = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (year: string) => {
      // 1. Deactivate existing active year
      const { error: deactivateError } = await supabase
        .from("academic_years")
        .update({ is_active: false })
        .eq("is_active", true);

      if (deactivateError) throw deactivateError;

      // 2. Activate or insert new year
      const { error: upsertError } = await supabase
        .from("academic_years")
        .upsert({ year, is_active: true }, { onConflict: "year" });

      if (upsertError) throw upsertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-years"] });
      queryClient.invalidateQueries({ queryKey: ["academic-years", "active"] });
    },
  });
};

export const useCreateAcademicYear = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ year }: { year: string }) => {
      // 1. Deactivate existing active year
      const { error: deactivateError } = await supabase
        .from("academic_years")
        .update({ is_active: false })
        .eq("is_active", true);

      if (deactivateError) throw deactivateError;

      // 2. Insert new active year
      const { data, error } = await supabase
        .from("academic_years")
        .insert({
          year,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    onSuccess: () => {
      // Refresh all academic-year dependent data
      queryClient.invalidateQueries({ queryKey: ["academic-years"] });
      queryClient.invalidateQueries({ queryKey: ["active-academic-year"] });
    },
  });
};
