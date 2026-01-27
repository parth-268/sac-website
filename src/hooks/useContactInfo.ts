import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";

type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

// ... Removed old contact info hooks ...

export const useContactSubmissions = () => {
  return useQuery({
    queryKey: ["contact_submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ContactSubmission[];
    },
  });
};

export const useSubmitContactForm = () => {
  return useMutation({
    mutationFn: async (submission: TablesInsert<"contact_submissions">) => {
      const { data, error } = await supabase
        .from("contact_submissions")
        .insert(submission)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });
};

export const useMarkSubmissionRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("contact_submissions")
        .update({ is_read: true })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact_submissions"] });
    },
  });
};
