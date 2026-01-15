import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type ContactInfo = Tables<"contact_info">;
type ContactSubmission = Tables<"contact_submissions">;

export const useContactInfo = () => {
  return useQuery({
    queryKey: ["contact_info"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_info")
        .select("*")
        .maybeSingle();

      if (error) throw error;
      return data as ContactInfo | null;
    },
  });
};

export const useUpsertContactInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (info: TablesInsert<"contact_info">) => {
      const { data: existing } = await supabase
        .from("contact_info")
        .select("id")
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from("contact_info")
          .update(info)
          .eq("id", existing.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("contact_info")
          .insert(info)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact_info"] });
    },
  });
};

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
