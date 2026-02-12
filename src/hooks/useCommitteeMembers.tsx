import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/integrations/supabase/types";

/* ============================
   Types
============================ */

export type CommitteeMemberRole = "senior" | "junior";

export type CommitteeMember = Tables<"committee_members">;
export type CommitteeMemberInsert = TablesInsert<"committee_members">;
export type CommitteeMemberUpdate = TablesUpdate<"committee_members">;

/* ============================
   Queries
============================ */

export const useCommitteeMembers = (
  committeeId?: string,
  role?: CommitteeMemberRole,
) => {
  return useQuery({
    queryKey: ["committee-members", committeeId, role],
    enabled: !!committeeId,
    staleTime: 30_000,
    queryFn: async () => {
      let query = supabase
        .from("committee_members")
        .select("*")
        .eq("committee_id", committeeId!)
        .order("display_order", { ascending: true });

      if (role) {
        query = query.eq("role", role);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data as CommitteeMember[];
    },
  });
};

/* ============================
   Create / Update / Delete
============================ */

export const useCreateCommitteeMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CommitteeMemberInsert) => {
      const { data, error } = await supabase
        .from("committee_members")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["committee-members", variables.committee_id],
      });
    },
  });
};

export const useUpdateCommitteeMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: CommitteeMemberUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("committee_members")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["committee-members", variables.committee_id],
      });
    },
  });
};

export const useDeleteCommitteeMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      committee_id,
    }: {
      id: string;
      committee_id: string;
    }) => {
      const { error } = await supabase
        .from("committee_members")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return committee_id;
    },
    onSuccess: (committee_id) => {
      queryClient.invalidateQueries({
        queryKey: ["committee-members", committee_id],
      });
    },
  });
};

/* ============================
   Bulk Insert / Replace Seniors
============================ */

export const useBulkInsertCommitteeMembers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      committee_id,
      members,
    }: {
      committee_id: string;
      members: Omit<CommitteeMemberInsert, "committee_id">[];
    }) => {
      const { error } = await supabase.from("committee_members").insert(
        members.map((m) => ({
          ...m,
          committee_id,
        })),
      );

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["committee-members", variables.committee_id],
      });
    },
  });
};

export const useReplaceCommitteeSeniorMembers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      committee_id,
      members,
    }: {
      committee_id: string;
      members: Omit<CommitteeMemberInsert, "committee_id" | "role">[];
    }) => {
      const { error: delError } = await supabase
        .from("committee_members")
        .delete()
        .eq("committee_id", committee_id)
        .eq("role", "senior");

      if (delError) throw delError;

      if (!members.length) return;

      const { error: insError } = await supabase
        .from("committee_members")
        .insert(
          members.map((m, index) => ({
            ...m,
            committee_id,
            role: "senior",
            display_order: index,
          })),
        );

      if (insError) throw insError;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["committee-members", variables.committee_id, "senior"],
      });
    },
  });
};

/* ============================
   Reorder (DnD)
============================ */

export const useUpdateCommitteeMemberOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    onMutate: async () => {
      await queryClient.cancelQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) && q.queryKey[0] === "committee-members",
      });
    },
    mutationFn: async (updates: { id: string; display_order: number }[]) => {
      await Promise.all(
        updates.map(({ id, display_order }) =>
          supabase
            .from("committee_members")
            .update({ display_order })
            .eq("id", id),
        ),
      );
      return updates;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) && q.queryKey[0] === "committee-members",
      });
    },
  });
};

export const useReplaceCommitteeMembers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      committee_id,
      members,
    }: {
      committee_id: string;
      members: {
        name: string;
        designation: string;
        phone: string | null;
        role: "senior" | "junior";
        display_order: number;
      }[];
    }) => {
      const { error: deleteError } = await supabase
        .from("committee_members")
        .delete()
        .eq("committee_id", committee_id);

      if (deleteError) throw deleteError;

      if (members.length === 0) return;

      const { error: insertError } = await supabase
        .from("committee_members")
        .insert(
          members.map((m) => ({
            committee_id,
            ...m,
          })),
        );

      if (insertError) throw insertError;
    },
    onSuccess: (_, { committee_id }) => {
      queryClient.invalidateQueries({
        queryKey: ["committee-members", committee_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["committees"],
      });
    },
  });
};
