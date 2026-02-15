import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/integrations/supabase/types";

type ContactSubmission = Tables<"contact_submissions">;

export type ContactFilter = "all" | "read" | "unread" | "deleted";

export const useContactSubmissions = (filter: ContactFilter = "all") => {
  return useQuery({
    queryKey: ["contact_submissions", filter],
    queryFn: async () => {
      let query = supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter === "read") {
        query = query.eq("is_read", true).eq("is_deleted", false);
      } else if (filter === "unread") {
        query = query.eq("is_read", false).eq("is_deleted", false);
      } else if (filter === "deleted") {
        query = query.eq("is_deleted", true);
      } else {
        // default "all" → only non-deleted
        query = query.eq("is_deleted", false);
      }

      const { data, error } = await query;
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
