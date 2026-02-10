import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/integrations/supabase/types";
import { useActiveAcademicYear } from "./useAcademicYears";

/* =======================
   Types
======================= */

export type Event = Tables<"events">;
export type EventInsert = TablesInsert<"events">;
export type EventUpdate = TablesUpdate<"events">;

export type ConductedByType = "admin" | "sac" | "club" | "committee" | "ethos";

export interface BulkEventActionPayload {
  ids: string[];
}

export interface BulkArchivePayload {
  ids: string[];
  archived: boolean;
}

/* =======================
   PUBLIC QUERIES
======================= */

/**
 * PUBLIC EVENTS
 * - Current academic year
 * - Published
 * - Not archived
 */
export const useEvents = (academicYear?: string) => {
  return useQuery({
    queryKey: ["events", "public", academicYear],
    enabled: !!academicYear,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("academic_year", academicYear!)
        .eq("is_published", true)
        .eq("is_archived", false)
        .order("event_date", { ascending: true });

      if (error) throw error;
      return data as Event[];
    },
  });
};

/**
 * UPCOMING EVENTS (Homepage / Highlights)
 * Date-driven + Academic-year safe
 */
// src/hooks/useEvents.ts
export const useUpcomingEvents = () => {
  const { data: activeYear } = useActiveAcademicYear();

  return useQuery({
    queryKey: ["events", "upcoming", activeYear?.year],
    enabled: Boolean(activeYear?.year),
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("academic_year", activeYear!.year)
        .eq("is_published", true)
        .eq("is_archived", false)
        .gte("event_date", today)
        .order("event_date", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
  });
};

/* =======================
   ADMIN QUERIES
======================= */

/**
 * ADMIN EVENTS
 * Supports filtering
 */
export const useAdminEvents = (filters?: {
  academicYear?: string;
  conductedByType?: ConductedByType;
  includeArchived?: boolean;
}) => {
  return useQuery({
    queryKey: [
      "events",
      "admin",
      filters?.academicYear ?? "all",
      filters?.conductedByType ?? "all",
      Boolean(filters?.includeArchived),
    ],
    enabled: Boolean(filters?.academicYear),
    placeholderData: keepPreviousData,
    staleTime: 0,
    queryFn: async () => {
      let query = supabase.from("events").select("*");

      if (filters?.academicYear) {
        query = query.eq("academic_year", filters.academicYear);
      }

      if (filters?.conductedByType) {
        query = query.eq("conducted_by_type", filters.conductedByType);
      }

      if (!filters?.includeArchived) {
        query = query.eq("is_archived", false);
      }

      const { data, error } = await query
        .order("event_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Event[];
    },
  });
};

/**
 * ADMIN – Archived events by academic year
 */
export const useArchivedEventsByYear = (academicYear?: string) => {
  return useQuery({
    queryKey: ["events", "archived", academicYear],
    enabled: !!academicYear,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("academic_year", academicYear!)
        .eq("is_archived", true)
        .order("event_date", { ascending: false });

      if (error) throw error;
      return data as Event[];
    },
  });
};

/* =======================
   MUTATIONS
======================= */

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: EventInsert) => {
      const { data, error } = await supabase
        .from("events")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", "admin"] });
      queryClient.invalidateQueries({ queryKey: ["events", "public"] });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: EventUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("events")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", "admin"] });
      queryClient.invalidateQueries({ queryKey: ["events", "public"] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", "admin"] });
      queryClient.invalidateQueries({ queryKey: ["events", "public"] });
    },
  });
};

/**
 * BULK DELETE EVENTS
 */
export const useBulkDeleteEvents = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids }: BulkEventActionPayload) => {
      const { error } = await supabase.from("events").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", "admin"] });
      queryClient.invalidateQueries({ queryKey: ["events", "public"] });
    },
  });
};

/**
 * BULK UPDATE EVENTS
 */
export const useBulkUpdateEvents = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ids,
      updates,
    }: {
      ids: string[];
      updates: Partial<EventUpdate>;
    }) => {
      const { error } = await supabase
        .from("events")
        .update(updates)
        .in("id", ids);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", "admin"] });
      queryClient.invalidateQueries({ queryKey: ["events", "public"] });
    },
  });
};

/**
 * ARCHIVE / RESTORE EVENT
 */
export const useArchiveEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, archived }: { id: string; archived: boolean }) => {
      const { error } = await supabase
        .from("events")
        .update({
          is_archived: archived,
          is_published: false, // Unpublish when archiving; keep unpublished when restoring
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", "admin"] });
      queryClient.invalidateQueries({ queryKey: ["events", "public"] });
    },
  });
};

/**
 * BULK ARCHIVE / RESTORE EVENTS
 */
export const useBulkArchiveEvents = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, archived }: BulkArchivePayload) => {
      const { error } = await supabase
        .from("events")
        .update({
          is_archived: archived,
          is_published: false, // Unpublish when archiving; keep unpublished when restoring
        })
        .in("id", ids);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", "admin"] });
      queryClient.invalidateQueries({ queryKey: ["events", "public"] });
    },
  });
};
