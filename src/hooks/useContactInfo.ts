import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/integrations/supabase/types";

type ContactSubmission = Tables<"contact_submissions">;

export const useContactSubmissions = () => {
  return useQuery({
    queryKey: ["contact_submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("*")
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ContactSubmission[];
    },
  });
};

export const useSubmitContactForm = () => {
  return useMutation({
    mutationFn: async (submission: TablesInsert<"contact_submissions">) => {
      const { error } = await supabase
        .from("contact_submissions")
        .insert(submission)
        .single();

      if (error) throw error;
    },
  });
};

export const useMarkSubmissionRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: Pick<TablesUpdate<"contact_submissions">, "id">,
    ) => {
      const { error } = await supabase
        .from("contact_submissions")
        .update({ is_read: true })
        .eq("id", payload.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact_submissions"] });
    },
  });
};

export const useDeleteContactSubmissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from("contact_submissions")
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
        })
        .in("id", ids);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact_submissions"] });
    },
  });
};
