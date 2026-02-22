import React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

/* ---------------- Hooks ---------------- */
import {
  useAcademicYears,
  useActiveAcademicYear,
  useCreateAcademicYear,
} from "@/hooks/useAcademicYears";
import {
  useAdminEvents,
  useCreateEvent,
  useUpdateEvent,
  useArchiveEvent,
  useBulkArchiveEvents,
  useBulkDeleteEvents,
} from "@/hooks/useEvents";
import { useClubs } from "@/hooks/useClubs";
import { useCommittees } from "@/hooks/useCommittees";

/* ---------------- UI ---------------- */
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* ---------------- Icons ---------------- */
import {
  Plus,
  Pencil,
  Trash2,
  Archive,
  ArchiveRestore,
  Calendar,
  Copy,
} from "lucide-react";

/* ---------------- Types ---------------- */
import type { Tables } from "@/integrations/supabase/types";

type EventRow = Tables<"events">;

type ConductedByType = "admin" | "sac" | "club" | "committee" | "ethos";

interface EventForm {
  title: string;
  short_description: string;
  description: string;
  banner_image_url: string;
  conducted_by_type: ConductedByType;
  conducted_by_id: string | null;
  conducted_by_name: string;
  event_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  academic_year: string;
  is_published: boolean;
  is_featured: boolean;
}

/* ============================================================
 * Constants
 * ============================================================ */

const EMPTY_FORM: EventForm = {
  title: "",
  short_description: "",
  description: "",
  banner_image_url: "",
  conducted_by_type: "admin",
  conducted_by_id: null,
  conducted_by_name: "Admin / Institute",
  event_date: "",
  start_time: "",
  end_time: "",
  venue: "",
  academic_year: "",
  is_published: false,
  is_featured: false,
};

/* ============================================================
 * Component
 * ============================================================ */

export default function AdminEvents() {
  /* ================= STATE ================= */

  const todayTs = Date.now();

  const [mode, setMode] = useState<"current" | "past">("current");
  const [showArchivedCurrent, setShowArchivedCurrent] = useState(false);
  const [selectedPastYear, setSelectedPastYear] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>(EMPTY_FORM);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [isDirty, setIsDirty] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);

  const [yearDialogOpen, setYearDialogOpen] = useState(false);
  const [newAcademicYear, setNewAcademicYear] = useState("");

  /* ================= DATA ================= */

  const { data: clubs = [] } = useClubs();
  const { data: committees = [] } = useCommittees();

  const { data: academicYears = [] } = useAcademicYears();
  const { data: activeAcademicYear } = useActiveAcademicYear();

  const visibleYear =
    mode === "current" ? activeAcademicYear?.year : selectedPastYear;

  const { data: events = [], isLoading } = useAdminEvents({
    academicYear: visibleYear ?? undefined,
    includeArchived: mode === "past" || showArchivedCurrent,
  });

  /* ================= MUTATIONS ================= */

  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const archiveEvent = useArchiveEvent();
  const bulkArchive = useBulkArchiveEvents();
  const bulkDelete = useBulkDeleteEvents();
  const createAcademicYear = useCreateAcademicYear();

  /* ================= DERIVED DATA ================= */

  const filteredEvents = useMemo(() => {
    if (!visibleYear) return [];
    return events.filter((e) => e.academic_year === visibleYear);
  }, [events, visibleYear]);

  const publishedUpcoming = useMemo(
    () =>
      filteredEvents.filter(
        (e) =>
          e.is_published &&
          !e.is_archived &&
          new Date(e.event_date).getTime() >= todayTs,
      ),
    [filteredEvents, todayTs],
  );

  const archivedCurrentYear = useMemo(
    () => filteredEvents.filter((e) => e.is_archived),
    [filteredEvents],
  );

  const drafts = useMemo(
    () => filteredEvents.filter((e) => !e.is_published && !e.is_archived),
    [filteredEvents],
  );

  const pastCurrentYear = useMemo(
    () =>
      filteredEvents.filter(
        (e) => !e.is_archived && new Date(e.event_date).getTime() < todayTs,
      ),
    [filteredEvents, todayTs],
  );

  const pastEventsByMonth = useMemo(() => {
    if (mode !== "past" || filteredEvents.length === 0) return [];

    const groups = filteredEvents.reduce<Record<string, EventRow[]>>(
      (acc, event) => {
        const monthKey = format(new Date(event.event_date), "MMMM yyyy");
        if (!acc[monthKey]) acc[monthKey] = [];
        acc[monthKey].push(event);
        return acc;
      },
      {},
    );

    return Object.entries(groups).map(([month, events]) => ({
      month,
      events: events.sort(
        (a, b) =>
          new Date(b.event_date).getTime() - new Date(a.event_date).getTime(),
      ),
    }));
  }, [filteredEvents, mode]);

  /* ================= HELPERS ================= */

  const resetForm = useCallback(() => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      academic_year: activeAcademicYear?.year ?? "",
    });
  }, [activeAcademicYear?.year]);

  const updateForm = useCallback((patch: Partial<EventForm>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setIsDirty(true);
  }, []);

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (form.is_published && !form.banner_image_url) {
        toast.error("Banner image is required to publish an event");
        return;
      }
      try {
        const payload = {
          ...form,
          start_time: form.start_time || null,
          end_time: form.end_time || null,
          venue: form.venue || null,
        };

        if (editingId) {
          await updateEvent.mutateAsync({ id: editingId, ...payload });
          toast.success("Event updated");
        } else {
          await createEvent.mutateAsync(payload);
          toast.success("Event created");
        }

        setDialogOpen(false);
        setIsDirty(false);
        resetForm();
      } catch (err) {
        toast.error("Failed to save event");
      }
    },
    [form, editingId, createEvent, updateEvent, resetForm],
  );

  /* ================= ACTION HANDLERS ================= */

  const onEditEvent = useCallback((e: EventRow) => {
    setEditingId(e.id);
    setForm({
      title: e.title,
      short_description: e.short_description ?? "",
      description: e.description,
      banner_image_url: e.banner_image_url ?? "",
      conducted_by_type: e.conducted_by_type as ConductedByType,
      conducted_by_id: e.conducted_by_id,
      conducted_by_name: e.conducted_by_name ?? "",
      event_date: e.event_date,
      start_time: e.start_time ?? "",
      end_time: e.end_time ?? "",
      venue: e.venue ?? "",
      academic_year: e.academic_year ?? "",
      is_published: e.is_published,
      is_featured: e.is_featured,
    });
    setDialogOpen(true);
  }, []);

  const onCloneEvent = useCallback(
    (e: EventRow) => {
      setEditingId(null);
      setForm({
        ...EMPTY_FORM,
        title: `${e.title} (Copy)`,
        description: e.description,
        short_description: e.short_description ?? "",
        banner_image_url: e.banner_image_url ?? "",
        conducted_by_type: e.conducted_by_type as ConductedByType,
        conducted_by_id: e.conducted_by_id,
        conducted_by_name: e.conducted_by_name ?? "",
        venue: e.venue ?? "",
        academic_year: activeAcademicYear?.year ?? "",
      });
      setIsDirty(true);
      setDialogOpen(true);
    },
    [activeAcademicYear?.year],
  );

  const confirmDelete = useCallback(
    async (ids: string[]) => {
      if (!confirm("This action cannot be undone. Continue?")) return;
      await bulkDelete.mutateAsync({ ids });
      toast.success("Events deleted");
      setSelectedIds(new Set());
    },
    [bulkDelete],
  );

  /* ================= AUTOSAVE EFFECT ================= */

  useEffect(() => {
    if (!editingId || !isDirty || form.is_published) return;

    const t = setTimeout(async () => {
      try {
        setAutoSaving(true);
        await updateEvent.mutateAsync({
          id: editingId,
          ...form,
          start_time: form.start_time || null,
          end_time: form.end_time || null,
          venue: form.venue || null,
        });
        setIsDirty(false);
      } catch {
        /* silent */
      } finally {
        setAutoSaving(false);
      }
    }, 1200);

    return () => clearTimeout(t);
  }, [form, editingId, isDirty, updateEvent]);

  /* ================= SAFETY EFFECTS ================= */

  useEffect(() => {
    setSelectedIds(
      (prev) =>
        new Set([...prev].filter((id) => events.some((e) => e.id === id))),
    );
  }, [events]);

  useEffect(() => {
    resetForm();
  }, [activeAcademicYear?.year, resetForm]);

  /* ================= RENDER ================= */

  return (
    <AdminLayout title="Events Management">
      {/* Header */}
      <div className="flex flex-wrap justify-between gap-4 mb-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant={mode === "current" ? "default" : "outline"}
              onClick={() => setMode("current")}
            >
              Current Academic Year
            </Button>
            <Button
              variant={mode === "past" ? "default" : "outline"}
              onClick={() => setMode("past")}
            >
              Past Academic Years
            </Button>
          </div>
          {mode === "current" && (
            <div className="flex items-center gap-2">
              <Switch
                checked={showArchivedCurrent}
                onCheckedChange={setShowArchivedCurrent}
              />
              <span className="text-sm text-muted-foreground">
                Show archived (current year)
              </span>
            </div>
          )}
          {mode === "past" && (
            <Select
              value={selectedPastYear ?? ""}
              onValueChange={setSelectedPastYear}
            >
              <SelectTrigger className="min-w-[160px]">
                <SelectValue placeholder="Select academic year" />
              </SelectTrigger>
              <SelectContent>
                {academicYears
                  .filter((y) => !y.is_active)
                  .map((y) => (
                    <SelectItem key={y.id} value={y.year}>
                      {y.year}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={mode === "past"}
            onClick={() => setYearDialogOpen(true)}
          >
            Start New Academic Year
          </Button>

          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              if (!open && isDirty) {
                const confirmClose = confirm(
                  "You have unsaved changes. Discard them?",
                );
                if (!confirmClose) return;
              }

              setDialogOpen(open);

              if (!open) {
                resetForm();
                setIsDirty(false);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                variant="gold"
                disabled={mode === "past" || !activeAcademicYear}
                onClick={() => {
                  setEditingId(null);
                  updateForm({
                    ...EMPTY_FORM,
                    academic_year: activeAcademicYear?.year ?? "",
                  });
                  setDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>

            {/* ================= Dialog ================= */}
            <DialogContent
              className="max-w-2xl max-h-[90vh] overflow-hidden"
              aria-describedby="event-form-description"
            >
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Event" : "Create Event"}
                  {editingId && (
                    <span className="ml-3 text-xs text-muted-foreground">
                      {autoSaving
                        ? "Saving…"
                        : isDirty
                          ? "Unsaved changes"
                          : "Saved"}
                    </span>
                  )}
                </DialogTitle>
              </DialogHeader>

              <form
                onSubmit={handleSubmit}
                className="flex flex-col max-h-[80vh] overflow-hidden"
              >
                <div className="flex-1 overflow-y-auto overscroll-contain space-y-8 pr-1">
                  {/* Basic Info */}
                  <Section title="Basic Information">
                    <InputField
                      label="Title"
                      required
                      value={form.title}
                      onChange={(v: string) => updateForm({ title: v })}
                    />
                    <InputField
                      label="Short Description"
                      required
                      value={form.short_description}
                      onChange={(v: string) =>
                        updateForm({ short_description: v })
                      }
                    />
                    <TextareaField
                      label="Description"
                      value={form.description}
                      onChange={(v: string) => updateForm({ description: v })}
                    />
                    <ImageUpload
                      value={form.banner_image_url}
                      onChange={(url) => updateForm({ banner_image_url: url })}
                      folder="events"
                      label="Event Banner"
                    />
                  </Section>

                  {/* Attribution */}
                  <Section title="Attribution">
                    <SelectField
                      label="Conducted By"
                      value={form.conducted_by_type}
                      onChange={(v: string) => {
                        const label =
                          v === "admin"
                            ? "Admin / Institute"
                            : v === "sac"
                              ? "Students’ Affairs Council"
                              : v === "ethos"
                                ? "Ethos Team"
                                : "";

                        updateForm({
                          conducted_by_type: v as ConductedByType,
                          conducted_by_id: null,
                          conducted_by_name: label,
                        });
                      }}
                      options={[
                        ["admin", "Admin / Institute"],
                        ["sac", "Students' Affairs Council"],
                        ["club", "Club/Contingent"],
                        ["committee", "Committee"],
                        ["ethos", "Ethos Team"],
                      ]}
                    />

                    {form.conducted_by_type === "club" && (
                      <SelectField
                        label="Club"
                        value={form.conducted_by_id ?? ""}
                        onChange={(v: string) => {
                          const club = clubs.find((c) => c.id === v);
                          updateForm({
                            conducted_by_id: v,
                            conducted_by_name: club?.name ?? "",
                          });
                        }}
                        options={clubs.map((c) => [c.id, c.name])}
                      />
                    )}

                    {form.conducted_by_type === "committee" && (
                      <SelectField
                        label="Committee"
                        value={form.conducted_by_id ?? ""}
                        onChange={(v: string) => {
                          const committee = committees.find((c) => c.id === v);
                          updateForm({
                            conducted_by_id: v,
                            conducted_by_name: committee?.name ?? "",
                          });
                        }}
                        options={committees.map((c) => [c.id, c.name])}
                      />
                    )}

                    <InputField
                      label="Academic Year"
                      value={form.academic_year}
                      disabled
                      onChange={() => {}}
                    />
                  </Section>

                  {/* Schedule */}
                  <Section title="Schedule">
                    <InputField
                      label="Date"
                      type="date"
                      value={form.event_date}
                      onChange={(v: string) => updateForm({ event_date: v })}
                    />
                    <InputField
                      label="Start Time"
                      type="time"
                      value={form.start_time}
                      onChange={(v: string) => updateForm({ start_time: v })}
                    />
                    <InputField
                      label="End Time"
                      type="time"
                      value={form.end_time}
                      onChange={(v: string) => updateForm({ end_time: v })}
                    />
                    <InputField
                      label="Venue"
                      value={form.venue}
                      onChange={(v: string) => updateForm({ venue: v })}
                    />
                  </Section>

                  {/* Visibility */}
                  <Section title="Visibility">
                    <Toggle
                      label="Published"
                      checked={form.is_published}
                      onChange={(v: boolean) => updateForm({ is_published: v })}
                    />
                    <Toggle
                      label="Featured"
                      checked={form.is_featured}
                      onChange={(v: boolean) => updateForm({ is_featured: v })}
                    />
                  </Section>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (isDirty) {
                          const ok = confirm(
                            "You have unsaved changes. Discard them?",
                          );
                          if (!ok) return;
                        }
                        setDialogOpen(false);
                        resetForm();
                        setIsDirty(false);
                      }}
                    >
                      Cancel
                    </Button>

                    <Button
                      type="submit"
                      disabled={createEvent.isPending || updateEvent.isPending}
                    >
                      {editingId ? "Update Event" : "Create Event"}
                    </Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Start New Academic Year Dialog */}
      <Dialog open={yearDialogOpen} onOpenChange={setYearDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Start New Academic Year</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will archive all events from the current academic year and
              activate a new one.
            </p>
            <Input
              placeholder="e.g. 2026-27"
              value={newAcademicYear}
              onChange={(e) => setNewAcademicYear(e.target.value)}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setYearDialogOpen(false);
                  setNewAcademicYear("");
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={!newAcademicYear || createAcademicYear.isPending}
                onClick={async () => {
                  try {
                    // 1. Archive current year's events
                    const idsToArchive = events
                      .filter(
                        (e) => e.academic_year === activeAcademicYear?.year,
                      )
                      .map((e) => e.id);
                    if (idsToArchive.length) {
                      await bulkArchive.mutateAsync({
                        ids: idsToArchive,
                        archived: true,
                      });
                      setSelectedIds(new Set());
                    }
                    // 2. Create + activate new academic year
                    await createAcademicYear.mutateAsync({
                      year: newAcademicYear,
                    });
                    toast.success(
                      `Academic year ${newAcademicYear} started successfully`,
                    );
                    setYearDialogOpen(false);
                    setNewAcademicYear("");
                    setMode("current");
                  } catch {
                    toast.error("Failed to start new academic year");
                  }
                }}
              >
                Start Year
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Toolbar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-0 z-10 flex items-center justify-between bg-muted/50 backdrop-blur p-3 border-b mb-2 rounded-t-lg">
          <span className="font-medium text-sm">
            {selectedIds.size} selected
          </span>
          <div className="flex gap-2">
            {/* Restore – only for current year archived */}
            {mode === "current" && showArchivedCurrent && (
              <Button
                variant="outline"
                aria-label="Restore selected events"
                disabled={bulkArchive.isPending}
                onClick={() => {
                  bulkArchive.mutate({
                    ids: Array.from(selectedIds),
                    archived: false,
                  });
                  setSelectedIds(new Set());
                }}
              >
                Restore Selected
              </Button>
            )}

            {/* Archive */}
            <Button
              aria-label="Archive selected events"
              disabled={mode === "past" || bulkArchive.isPending}
              onClick={() => {
                bulkArchive.mutate({
                  ids: Array.from(selectedIds),
                  archived: true,
                });
                setSelectedIds(new Set());
              }}
            >
              Archive Selected
            </Button>

            {/* Delete */}
            <Button
              aria-label="Delete selected events"
              variant="destructive"
              disabled={bulkDelete.isPending}
              onClick={() => confirmDelete(Array.from(selectedIds))}
            >
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      {/* Events List */}
      {isLoading ? (
        <Empty icon={Calendar} text="Loading events…" />
      ) : mode === "current" ? (
        publishedUpcoming.length === 0 &&
        drafts.length === 0 &&
        pastCurrentYear.length === 0 &&
        (!showArchivedCurrent || archivedCurrentYear.length === 0) ? (
          <Empty icon={Calendar} text="No events for this academic year" />
        ) : (
          <div className="space-y-8">
            <EventSection
              title="Published & Upcoming"
              count={publishedUpcoming.length}
            >
              <EventsTable
                events={publishedUpcoming}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
                allSelected={
                  publishedUpcoming.length > 0 &&
                  publishedUpcoming.every((e) => selectedIds.has(e.id))
                }
                onEdit={onEditEvent}
                onArchive={(id, archived) =>
                  archiveEvent.mutate({ id, archived })
                }
                onDelete={confirmDelete}
                onClone={onCloneEvent}
              />
            </EventSection>

            <EventSection title="Drafts" count={drafts.length}>
              <EventsTable
                events={drafts}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
                allSelected={
                  drafts.length > 0 &&
                  drafts.every((e) => selectedIds.has(e.id))
                }
                onEdit={onEditEvent}
                onArchive={(id, archived) =>
                  archiveEvent.mutate({ id, archived })
                }
                onDelete={confirmDelete}
                onClone={onCloneEvent}
              />
            </EventSection>

            <EventSection title="Past Events" count={pastCurrentYear.length}>
              <EventsTable
                events={pastCurrentYear}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
                allSelected={
                  pastCurrentYear.length > 0 &&
                  pastCurrentYear.every((e) => selectedIds.has(e.id))
                }
                onEdit={onEditEvent}
                onArchive={(id, archived) =>
                  archiveEvent.mutate({ id, archived })
                }
                onDelete={confirmDelete}
                onClone={onCloneEvent}
              />
            </EventSection>

            {showArchivedCurrent && (
              <EventSection
                title="Archived (Current Year)"
                count={archivedCurrentYear.length}
              >
                <EventsTable
                  events={archivedCurrentYear}
                  selectedIds={selectedIds}
                  setSelectedIds={setSelectedIds}
                  allSelected={
                    archivedCurrentYear.length > 0 &&
                    archivedCurrentYear.every((e) => selectedIds.has(e.id))
                  }
                  onEdit={onEditEvent}
                  onArchive={(id, archived) =>
                    archiveEvent.mutate({ id, archived })
                  }
                  onDelete={confirmDelete}
                  onClone={onCloneEvent}
                />
              </EventSection>
            )}
          </div>
        )
      ) : pastEventsByMonth.length === 0 ? (
        <Empty
          icon={Calendar}
          text="No archived events for this academic year"
        />
      ) : (
        <div className="space-y-10">
          {pastEventsByMonth.map(({ month, events }) => (
            <MonthSection key={`${visibleYear}-${month}`} title={month}>
              <EventsTable
                events={events}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
                allSelected={
                  events.length > 0 &&
                  events.every((e) => selectedIds.has(e.id))
                }
                onEdit={onEditEvent}
                onArchive={(id, archived) =>
                  archiveEvent.mutate({ id, archived })
                }
                onDelete={confirmDelete}
                onClone={onCloneEvent}
              />
            </MonthSection>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

type EventsTableProps = {
  events: EventRow[];
  selectedIds: Set<string>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  allSelected: boolean;
  onEdit: (event: EventRow) => void;
  onArchive: (id: string, archived: boolean) => void;
  onDelete: (ids: string[]) => void;
  onClone: (event: EventRow) => void;
};

const EventsTable = React.memo(function EventsTable({
  events,
  selectedIds,
  setSelectedIds,
  allSelected,
  onEdit,
  onArchive,
  onDelete,
  onClone,
}: EventsTableProps) {
  return (
    <div className="border rounded-lg bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                aria-label="Select all events"
                checked={allSelected}
                onCheckedChange={(checked) =>
                  setSelectedIds(
                    checked === true
                      ? new Set(events.map((e) => e.id))
                      : new Set(),
                  )
                }
              />
            </TableHead>
            <TableHead className="w-[30%]">Title</TableHead>
            <TableHead className="w-[15%]">Date</TableHead>
            <TableHead className="w-[25%]">Conducted By</TableHead>
            <TableHead className="w-[15%]">Status</TableHead>
            <TableHead className="w-[10%]" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {events.map((e) => (
            <TableRow key={e.id} className={e.is_archived ? "opacity-60" : ""}>
              <TableCell>
                <Checkbox
                  aria-label={`Select event ${e.title}`}
                  checked={selectedIds.has(e.id)}
                  onCheckedChange={() =>
                    setSelectedIds((prev) => {
                      const n = new Set(prev);
                      if (n.has(e.id)) {
                        n.delete(e.id);
                      } else {
                        n.add(e.id);
                      }
                      return n;
                    })
                  }
                />
              </TableCell>

              <TableCell className="font-medium">{e.title}</TableCell>

              <TableCell>
                {format(new Date(e.event_date), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                <div className="flex flex-col leading-tight">
                  <span className="font-medium text-sm">
                    {e.conducted_by_name || "—"}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {e.conducted_by_type}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {e.is_archived
                  ? "Archived"
                  : e.is_published
                    ? "Published"
                    : "Draft"}
              </TableCell>

              <TableCell className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onEdit(e)}
                  aria-label="Edit event"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                {/* Archive/Restore button */}
                {e.is_archived ? (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onArchive(e.id, false)}
                    aria-label="Restore event"
                    title="Restore"
                  >
                    <ArchiveRestore className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onArchive(e.id, true)}
                    aria-label="Archive event"
                    title="Archive"
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onClone(e)}
                  aria-label="Clone event"
                  title="Clone event"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onDelete([e.id])}
                  aria-label="Delete event"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});

function EventSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  if (count === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground">
        {title} <span className="text-xs">({count})</span>
      </h3>
      {children}
    </div>
  );
}

function MonthSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground border-b pb-1">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
      <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        className="mt-1"
        type={type}
        value={value}
        required={required}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Textarea
        className="mt-1"
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="mt-1" aria-label={label}>
          <SelectValue placeholder={`Select ${label}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map(([v, l]) => (
            <SelectItem key={v} value={v}>
              {l}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Switch checked={checked} onCheckedChange={onChange} />
      <Label>{label}</Label>
    </div>
  );
}

function Empty({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <div className="py-12 text-center text-muted-foreground">
      <Icon className="h-10 w-10 mx-auto mb-3" />
      {text}
    </div>
  );
}
