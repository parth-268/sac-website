import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/integrations/supabase/types";

export type ClubMemberRole = "senior" | "junior";

type ClubMember = Tables<"club_members">;
type ClubMemberInsert = TablesInsert<"club_members">;
type ClubMemberUpdate = TablesUpdate<"club_members">;

/* ----------------- Queries ----------------- */

export const useClubMembers = (clubId?: string, role?: ClubMemberRole) => {
  return useQuery({
    queryKey: ["club-members", clubId, role],
    enabled: !!clubId,
    queryFn: async () => {
      let query = supabase
        .from("club_members")
        .select("*")
        .eq("club_id", clubId!)
        .order("display_order", { ascending: true });

      if (role) {
        query = query.eq("role", role);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data as ClubMember[];
    },
  });
};

/* ----------------- Mutations ----------------- */

export const useCreateClubMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ClubMemberInsert) => {
      const { data, error } = await supabase
        .from("club_members")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["club-members", variables.club_id],
      });
    },
  });
};

export const useUpdateClubMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: ClubMemberUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("club_members")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["club-members", variables.club_id],
      });
    },
  });
};

export const useDeleteClubMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, club_id }: { id: string; club_id: string }) => {
      const { error } = await supabase
        .from("club_members")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return club_id;
    },
    onSuccess: (club_id) => {
      queryClient.invalidateQueries({
        queryKey: ["club-members", club_id],
      });
    },
  });
};

export const useBulkInsertClubMembers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      club_id,
      members,
    }: {
      club_id: string;
      members: Omit<ClubMemberInsert, "club_id">[];
    }) => {
      const { error } = await supabase.from("club_members").insert(
        members.map((m) => ({
          ...m,
          club_id,
        })),
      );

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["club-members", variables.club_id],
      });
    },
  });
};

export const useUpdateClubMemberOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { id: string; display_order: number }[]) => {
      const { error } = await supabase
        .from("club_members")
        .upsert(updates, { onConflict: "id" });

      if (error) throw error;
      return updates;
    },
    onSuccess: (_, updates) => {
      if (!updates?.length) return;

      queryClient.invalidateQueries({
        queryKey: ["club-members"],
      });
    },
  });
};

export const useDeleteClubSeniorMembers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (club_id: string) => {
      const { error } = await supabase
        .from("club_members")
        .delete()
        .eq("club_id", club_id)
        .eq("role", "senior");

      if (error) throw error;
    },
    onSuccess: (_, club_id) => {
      queryClient.invalidateQueries({
        queryKey: ["club-members", club_id, "senior"],
      });
    },
  });
};

export const useDeleteClubJuniorMembers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (club_id: string) => {
      const { error } = await supabase
        .from("club_members")
        .delete()
        .eq("club_id", club_id)
        .eq("role", "junior");

      if (error) throw error;
    },
    onSuccess: (_, club_id) => {
      queryClient.invalidateQueries({
        queryKey: ["club-members", club_id, "junior"],
      });
    },
  });
};
