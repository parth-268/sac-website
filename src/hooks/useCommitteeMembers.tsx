import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/* ============================
   Types
============================ */

export interface CommitteeMember {
  id: string;
  committee_id: string;
  name: string;
  designation: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
  display_order: number;
}

/* ============================
   Fetch Members
============================ */

export const useCommitteeMembers = (committeeId?: string) => {
  return useQuery({
    queryKey: ["committee-members", committeeId],
    queryFn: async () => {
      if (!committeeId) return [];

      const { data, error } = await supabase
        .from("committee_members")
        .select("*")
        .eq("committee_id", committeeId)
        .order("display_order", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data as CommitteeMember[];
    },
    enabled: !!committeeId, // important: prevents useless queries
    staleTime: 30_000,
  });
};

/* ============================
   Update Member Order (DnD)
============================ */

interface UpdateOrderPayload {
  draggedId: string;
  targetIndex: number;
  members: CommitteeMember[];
}

export const useUpdateCommitteeMemberOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    onMutate: async () => {
      await queryClient.cancelQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          query.queryKey[0] === "committee-members",
      });
    },

    mutationFn: async ({
      draggedId,
      targetIndex,
      members,
    }: UpdateOrderPayload) => {
      // Create a shallow copy to avoid mutating cache data
      const reordered = [...members];

      const draggedIndex = reordered.findIndex((m) => m.id === draggedId);
      if (draggedIndex === -1) {
        throw new Error("Dragged member not found");
      }

      // Remove dragged item and insert at target position
      const [moved] = reordered.splice(draggedIndex, 1);
      reordered.splice(targetIndex, 0, moved);

      // Reassign display_order sequentially
      const updates = reordered.map((member, index) => ({
        id: member.id,
        committee_id: member.committee_id,
        display_order: index,
      }));

      // Persist order using UPDATE (no INSERT path, avoids NULL committee_id issues)
      for (const row of updates) {
        const { error } = await supabase
          .from("committee_members")
          .update({ display_order: row.display_order })
          .eq("id", row.id);

        if (error) {
          throw new Error(error.message);
        }
      }

      return reordered[0]?.committee_id;
    },

    onSuccess: (committeeId) => {
      if (!committeeId) return;

      queryClient.invalidateQueries({
        queryKey: ["committee-members", committeeId],
      });
    },
  });
};

/* ============================
   Bulk Insert (Excel Upload)
============================ */

interface BulkInsertPayload {
  committee_id: string;
  name: string;
  designation: string;
  phone?: string | null;
}

export const useBulkInsertCommitteeMembers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: BulkInsertPayload[]) => {
      if (!payload.length) {
        throw new Error("No members to insert");
      }

      const { error } = await supabase
        .from("committee_members")
        .insert(payload);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: (_, payload) => {
      const committeeId = payload?.[0]?.committee_id;
      if (committeeId) {
        queryClient.invalidateQueries({
          queryKey: ["committee-members", committeeId],
        });
      }
    },
  });
};

/* ============================
   Delete Member
============================ */

export const useDeleteCommitteeMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from("committee_members")
        .delete()
        .eq("id", memberId);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          query.queryKey[0] === "committee-members",
      });
    },
  });
};
