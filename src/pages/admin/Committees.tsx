import { useState, useEffect, useCallback } from "react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  useCommittees,
  useCreateCommittee,
  useUpdateCommittee,
} from "@/hooks/useCommittees";
import {
  useCommitteeMembers,
  useBulkInsertCommitteeMembers,
  useReplaceCommitteeMembers,
} from "@/hooks/useCommitteeMembers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  Loader2,
  Upload,
  Pencil,
  GripVertical,
  Users,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import type { Tables } from "@/integrations/supabase/types";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Committee = Tables<"committees">;

// CommitteeCard: clickable card for a committee (with counts, hover, etc)
function CommitteeCard({
  committee,
  onEdit,
  onMembers,
}: {
  committee: Committee;
  onEdit: () => void;
  onMembers: () => void;
}) {
  return (
    <div
      className="group relative rounded-2xl border border-border bg-background p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-accent"
      tabIndex={0}
      onClick={onEdit}
      role="button"
      aria-label={`Edit committee ${committee.name}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {committee.logo_url ? (
          <img
            src={committee.logo_url}
            alt={committee.name}
            className="w-12 h-12 rounded-lg object-cover border"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center border">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{committee.name}</h3>
            {committee.is_active ? (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                Active
              </span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                Inactive
              </span>
            )}
          </div>
          {committee.email && (
            <a
              href={`mailto:${committee.email}`}
              className="text-xs text-accent hover:underline block truncate mt-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              {committee.email}
            </a>
          )}
          <div className="text-xs text-muted-foreground mt-0.5">
            Senior: {committee.senior_count} &bull; Junior:{" "}
            {committee.junior_count}
          </div>
        </div>
      </div>
      {/* Description */}
      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
        {committee.description}
      </p>
      {/* Actions */}
      <div className="flex justify-end gap-2 pt-3 border-t">
        <Button
          size="sm"
          variant="ghost"
          tabIndex={-1}
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <Pencil className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button
          size="sm"
          variant="outline"
          tabIndex={-1}
          onClick={(e) => {
            e.stopPropagation();
            onMembers();
          }}
        >
          <Users className="h-4 w-4 mr-1" />
          Members
        </Button>
      </div>
    </div>
  );
}

export default function AdminCommittees() {
  const { data: committees } = useCommittees();
  const createCommittee = useCreateCommittee();
  const updateCommittee = useUpdateCommittee();

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [editingCommittee, setEditingCommittee] = useState<Committee | null>(
    null,
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [email, setEmail] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const { uploadFile, uploading, deleteFile } = useFileUpload();

  const resetForm = () => {
    setEditingCommittee(null);
    setName("");
    setDescription("");
    setIsActive(true);
    setEmail("");
    setLogoUrl("");
    setLogoPath(null);
  };

  return (
    <AdminLayout title="Committees">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <p className="text-muted-foreground">Manage committees and members</p>
        <Button
          variant="gold"
          onClick={() => {
            resetForm();
            setDetailsOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Committee
        </Button>
      </div>

      {/* Committees Table */}
      {!committees ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      ) : committees.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-12 text-center text-muted-foreground">
          No committees found. Click <strong>Add Committee</strong> to get
          started.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...committees]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((committee) => (
              <CommitteeCard
                key={committee.id}
                committee={committee}
                onEdit={() => {
                  setEditingCommittee(committee);
                  setName(committee.name);
                  setDescription(committee.description);
                  setIsActive(committee.is_active);
                  setEmail(committee.email || "");
                  setLogoUrl(committee.logo_url || "");
                  setDetailsOpen(true);
                }}
                onMembers={() => {
                  setEditingCommittee(committee);
                  setMembersOpen(true);
                }}
              />
            ))}
        </div>
      )}

      <Dialog
        open={detailsOpen}
        onOpenChange={(value) => {
          setDetailsOpen(value);
          if (!value) {
            resetForm();
          }
        }}
      >
        <DialogContent
          className="w-full max-w-2xl h-[90vh] max-h-[90vh] p-0 flex flex-col rounded-2xl"
          aria-modal="true"
        >
          <DialogHeader className="flex items-center justify-between px-4 py-3 border-b">
            <DialogTitle className="text-lg font-semibold">
              {editingCommittee ? "Edit Committee" : "Add Committee"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
            {/* Committee Info */}
            <div className="space-y-4">
              <Input
                placeholder="Committee Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Textarea
                placeholder="Committee Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
              <Input
                placeholder="Committee Email (public contact)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="space-y-2">
                <label className="text-sm font-medium">Committee Logo</label>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-4">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={`${name} logo`}
                        className="h-16 w-16 rounded-md object-cover border"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center border">
                        <Users className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <label className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted text-sm">
                        {uploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        Upload Logo
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          // If there was a previous uploaded logo, delete it before uploading new
                          if (logoPath) {
                            try {
                              await deleteFile(logoPath);
                            } catch (err) {
                              // ignore error
                            }
                          }
                          const res = await uploadFile(file, "committee-logos");
                          if (res) {
                            setLogoUrl(res.url);
                            setLogoPath(res.path);
                            toast.success("Logo uploaded");
                          }
                        }}
                      />
                    </label>
                  </div>
                  <Input
                    placeholder="Or paste image URL"
                    value={logoUrl}
                    onChange={(e) => {
                      setLogoUrl(e.target.value);
                      setLogoPath(null);
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-sm text-muted-foreground">
                  Committee is active (visible publicly)
                </span>
              </div>
            </div>
          </div>
          <div className="border-t bg-background">
            <div className="flex justify-end gap-3 px-4 py-3">
              <Button
                className="min-w-[160px]"
                onClick={async () => {
                  try {
                    if (editingCommittee) {
                      await updateCommittee.mutateAsync({
                        id: editingCommittee.id,
                        name,
                        description,
                        email,
                        logo_url: logoUrl,
                        is_active: isActive,
                      });
                    } else {
                      await createCommittee.mutateAsync({
                        name,
                        description,
                        email,
                        logo_url: logoUrl,
                        is_active: isActive,
                      });
                    }
                    toast.success("Committee saved");
                    resetForm();
                    setDetailsOpen(false);
                  } catch {
                    toast.error("Failed to save committee");
                  }
                }}
                disabled={
                  !name.trim() ||
                  !description.trim() ||
                  createCommittee.isPending ||
                  updateCommittee.isPending
                }
              >
                {createCommittee.isPending || updateCommittee.isPending ? (
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                ) : null}
                Save Committee
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={membersOpen}
        onOpenChange={(value) => setMembersOpen(value)}
      >
        <DialogContent className="max-w-2xl h-[90vh] p-0 flex flex-col">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="text-lg font-semibold">
              Manage Members – {editingCommittee?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 space-y-6">
            {editingCommittee?.id && (
              <MembersSection committeeId={editingCommittee.id} />
            )}
          </div>

          <div className="shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 rounded-b-md">
            <div className="flex justify-end gap-3 px-6 py-4">
              <Button variant="outline" onClick={() => setMembersOpen(false)}>
                Cancel
              </Button>
              <Button form="committee-members-form" type="submit">
                Save Members
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

function MembersSection({ committeeId }: { committeeId: string }) {
  const { data: members, isLoading } = useCommitteeMembers(committeeId);
  const bulkInsert = useBulkInsertCommitteeMembers();

  // Editable local state for members
  type EditableMember = {
    uid: string;
    name: string;
    designation: string;
    phone: string | null;
  };

  const [seniorMembers, setSeniorMembers] = useState<EditableMember[]>([]);
  const [juniorMembers, setJuniorMembers] = useState<EditableMember[]>([]);
  const [membersDirty, setMembersDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sensors for dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );

  // On load, map DB members to local editable state
  useEffect(() => {
    if (!members) return;

    setSeniorMembers(
      members
        .filter((m) => m.role === "senior")
        .sort((a, b) => a.display_order - b.display_order)
        .map((m) => ({
          uid: m.id,
          name: m.name,
          designation: m.designation,
          phone: m.phone,
        })),
    );

    setJuniorMembers(
      members
        .filter((m) => m.role === "junior")
        .sort((a, b) => a.display_order - b.display_order)
        .map((m) => ({
          uid: m.id,
          name: m.name,
          designation: m.designation,
          phone: m.phone,
        })),
    );

    setMembersDirty(false);
  }, [members]);

  // Add member state
  const [addMember, setAddMember] = useState<{
    name: string;
    designation: string;
    phone: string;
    role: "senior" | "junior";
  }>({
    name: "",
    designation: "",
    phone: "",
    role: "junior",
  });

  // Excel upload logic (unchanged)
  const uploadExcel = useCallback(
    async (file: File) => {
      if (!committeeId) {
        toast.error("Save the committee before uploading members.");
        return;
      }

      type ExcelRow = {
        name?: string;
        designation?: string;
        phone?: string;
        role?: string;
      };
      const wb = XLSX.read(await file.arrayBuffer());
      const rows = XLSX.utils.sheet_to_json<ExcelRow>(
        wb.Sheets[wb.SheetNames[0]],
      );

      const valid: Omit<
        Tables<"committee_members">,
        "id" | "committee_id" | "created_at" | "updated_at" | "display_order"
      >[] = [];
      const errors: string[] = [];

      rows.forEach((r, i) => {
        const name = typeof r.name === "string" ? r.name.trim() : "";
        const designation =
          typeof r.designation === "string" ? r.designation.trim() : "";
        const phone =
          typeof r.phone === "string" ? r.phone.trim() : r.phone || null;
        if (!name || !designation) {
          errors.push(`Row ${i + 2}: name and designation are required`);
          return;
        }
        valid.push({
          name,
          designation,
          phone: phone || null,
          role: r.role === "senior" ? "senior" : "junior",
        });
      });

      if (errors.length) {
        toast.error(
          <div className="max-h-40 overflow-auto">
            <strong>{errors.length} Excel error(s):</strong>
            <ul className="list-disc ml-4 mt-2">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>,
        );
      }

      if (valid.length) {
        await bulkInsert.mutateAsync({
          committee_id: committeeId,
          members: valid,
        });
        toast.success(`${valid.length} members imported`);
      }
    },
    [bulkInsert, committeeId],
  );

  const downloadTemplate = useCallback(() => {
    const ws = XLSX.utils.json_to_sheet([
      {
        name: "John Doe",
        designation: "Secretary",
        phone: "9876543210",
        role: "junior",
      },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Members");
    XLSX.writeFile(wb, "committee_members_template.xlsx");
  }, []);

  // Add member locally
  const handleAddMember = () => {
    const { name, designation, phone, role } = addMember;
    if (!name.trim() || !designation.trim()) return;
    const newMember: EditableMember = {
      uid: crypto.randomUUID(),
      name: name.trim(),
      designation: designation.trim(),
      phone: phone ? phone : null,
    };
    if (role === "senior") {
      setSeniorMembers((prev) => [...prev, newMember]);
    } else {
      setJuniorMembers((prev) => [...prev, newMember]);
    }
    setAddMember({
      name: "",
      designation: "",
      phone: "",
      role,
    });
    setMembersDirty(true);
  };

  // Remove member locally
  const handleRemoveMember = (role: "senior" | "junior", uid: string) => {
    if (role === "senior") {
      setSeniorMembers((prev) => prev.filter((m) => m.uid !== uid));
    } else {
      setJuniorMembers((prev) => prev.filter((m) => m.uid !== uid));
    }
    setMembersDirty(true);
  };

  // Edit member locally
  const handleEditMember = (
    role: "senior" | "junior",
    uid: string,
    field: keyof EditableMember,
    value: string,
  ) => {
    if (role === "senior") {
      setSeniorMembers((prev) =>
        prev.map((m) => (m.uid === uid ? { ...m, [field]: value } : m)),
      );
    } else {
      setJuniorMembers((prev) =>
        prev.map((m) => (m.uid === uid ? { ...m, [field]: value } : m)),
      );
    }
    setMembersDirty(true);
  };

  // Move member between roles
  const moveMember = (
    uid: string,
    fromRole: "senior" | "junior",
    toRole: "senior" | "junior",
  ) => {
    if (fromRole === toRole) return;
    let memberToMove: EditableMember | undefined;
    if (fromRole === "senior") {
      setSeniorMembers((prev) => {
        const idx = prev.findIndex((m) => m.uid === uid);
        if (idx === -1) return prev;
        memberToMove = prev[idx];
        return prev.filter((m) => m.uid !== uid);
      });
      if (memberToMove) {
        setJuniorMembers((prev) => [...prev, memberToMove!]);
      }
    } else {
      setJuniorMembers((prev) => {
        const idx = prev.findIndex((m) => m.uid === uid);
        if (idx === -1) return prev;
        memberToMove = prev[idx];
        return prev.filter((m) => m.uid !== uid);
      });
      if (memberToMove) {
        setSeniorMembers((prev) => [...prev, memberToMove!]);
      }
    }
    setMembersDirty(true);
  };

  // Drag & drop reorder for senior
  const onSeniorDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = seniorMembers.findIndex((m) => m.uid === active.id);
    const newIndex = seniorMembers.findIndex((m) => m.uid === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    setSeniorMembers(arrayMove(seniorMembers, oldIndex, newIndex));
    setMembersDirty(true);
  };

  // Drag & drop reorder for junior
  const onJuniorDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = juniorMembers.findIndex((m) => m.uid === active.id);
    const newIndex = juniorMembers.findIndex((m) => m.uid === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    setJuniorMembers(arrayMove(juniorMembers, oldIndex, newIndex));
    setMembersDirty(true);
  };

  const replaceMembers = useReplaceCommitteeMembers();

  const saveMembers = async () => {
    if (!committeeId || saving || !membersDirty) return;

    setSaving(true);
    try {
      const payload = [
        ...seniorMembers.map((m, i) => ({
          name: m.name.trim(),
          designation: m.designation.trim(),
          phone: m.phone,
          role: "senior" as const,
          display_order: i,
        })),
        ...juniorMembers.map((m, i) => ({
          name: m.name.trim(),
          designation: m.designation.trim(),
          phone: m.phone,
          role: "junior" as const,
          display_order: i,
        })),
      ];

      await replaceMembers.mutateAsync({
        committee_id: committeeId,
        members: payload,
      });

      toast.success("Members saved");
      setMembersDirty(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to save members");
    } finally {
      setSaving(false);
    }
  };
  // Editable row component
  function SortableEditableRow({
    member,
    index,
    role,
    onEdit,
    onRemove,
    onMove,
    moveLabel,
  }: {
    member: EditableMember;
    index: number;
    role: "senior" | "junior";
    onEdit: (uid: string, field: keyof EditableMember, value: string) => void;
    onRemove: (uid: string) => void;
    onMove?: (uid: string) => void;
    moveLabel?: string;
  }) {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: member.uid });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="grid grid-cols-[auto_1fr_1fr_1fr_auto_auto] gap-2 items-center px-3 py-3 border-t bg-background"
      >
        <span
          {...attributes}
          {...listeners}
          className="text-muted-foreground p-3 rounded-md cursor-grab active:scale-95 touch-none"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </span>
        <Input
          className="w-full min-w-0"
          value={member.name}
          placeholder="Name"
          onChange={(e) => onEdit(member.uid, "name", e.target.value)}
        />
        <Input
          className="w-full min-w-0"
          value={member.designation}
          placeholder="Designation"
          onChange={(e) => onEdit(member.uid, "designation", e.target.value)}
        />
        <Input
          className="w-full min-w-0"
          value={member.phone ?? ""}
          placeholder="Phone"
          onChange={(e) => onEdit(member.uid, "phone", e.target.value)}
        />
        {/* Move button */}
        {onMove && (
          <Button
            size="icon"
            variant="ghost"
            className="opacity-60 hover:opacity-100"
            type="button"
            aria-label={moveLabel}
            title={moveLabel}
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onMove(member.uid);
            }}
          >
            {role === "senior" ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </Button>
        )}
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onRemove(member.uid)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    );
  }

  return (
    <form
      id="committee-members-form"
      className="min-h-0"
      onSubmit={(e) => {
        e.preventDefault();
        saveMembers();
      }}
    >
      {/* Senior Members section */}
      <div className="space-y-4 pb-6 border-b">
        <div>
          <h3 className="font-semibold text-lg mb-1">Committee Members</h3>
          <p className="text-muted-foreground text-sm mb-3">
            Add, reorder, or import committee members
          </p>
        </div>

        {/* Manual Add */}
        <div className="border rounded-lg p-4 bg-background mb-2">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
            <Input
              placeholder="Name"
              value={addMember.name}
              onChange={(e) =>
                setAddMember((m) => ({ ...m, name: e.target.value }))
              }
            />
            <Input
              placeholder="Designation"
              value={addMember.designation}
              onChange={(e) =>
                setAddMember((m) => ({ ...m, designation: e.target.value }))
              }
            />
            <Input
              placeholder="Phone"
              value={addMember.phone}
              onChange={(e) =>
                setAddMember((m) => ({ ...m, phone: e.target.value }))
              }
            />
            <select
              value={addMember.role}
              onChange={(e) =>
                setAddMember((m) => ({
                  ...m,
                  role: e.target.value as "senior" | "junior",
                }))
              }
              className="border border-border rounded-md px-3 py-2 text-sm bg-background"
            >
              <option value="junior">Junior</option>
              <option value="senior">Senior</option>
            </select>
            <Button
              size="default"
              className="w-full md:w-auto mt-2 md:mt-0"
              disabled={!addMember.name.trim() || !addMember.designation.trim()}
              onClick={handleAddMember}
              type="button"
            >
              Add Member
            </Button>
          </div>
        </div>

        {/* Excel Upload & Template Download */}
        <div className="flex w-full">
          <div className="ml-auto flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-accent">
              <Upload className="h-4 w-4" />
              Upload Excel
              <input
                type="file"
                hidden
                accept=".xlsx,.csv"
                onChange={(e) =>
                  e.target.files && uploadExcel(e.target.files[0])
                }
              />
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadTemplate}
              className="text-xs"
            >
              Download Excel Template
            </Button>
          </div>
        </div>
        <span className="text-xs text-muted-foreground block">
          You can import multiple members at once via Excel.
        </span>

        {/* Members List */}
        {isLoading && (
          <div className="text-sm text-muted-foreground p-4">
            Loading members...
          </div>
        )}
        {!isLoading && seniorMembers.length + juniorMembers.length === 0 && (
          <div className="text-sm text-muted-foreground border border-dashed rounded-md p-4 text-center">
            No members yet. Add manually or import via Excel.
          </div>
        )}

        {/* Senior Members */}
        <div className="border rounded-md text-sm mt-2">
          <div className="px-4 py-2 bg-muted/60 backdrop-blur supports-[backdrop-filter]:bg-muted/50 font-semibold text-sm flex items-center justify-between">
            <span>Senior Members</span>
          </div>
          {isLoading ? (
            <div className="flex flex-col gap-2 px-4 py-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-7 rounded bg-muted/50 animate-pulse w-full"
                />
              ))}
            </div>
          ) : seniorMembers.length === 0 ? (
            <div className="flex items-center justify-center p-8 text-sm">
              <div className="w-full bg-muted/30 border-2 border-dashed border-border rounded-md py-6 text-center text-muted-foreground">
                No senior members added yet.
              </div>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onSeniorDragEnd}
            >
              <SortableContext
                items={seniorMembers.map((m) => m.uid)}
                strategy={verticalListSortingStrategy}
              >
                {seniorMembers.map((m, idx) => (
                  <SortableEditableRow
                    key={m.uid}
                    member={m}
                    index={idx}
                    role="senior"
                    onEdit={(uid, field, value) =>
                      handleEditMember("senior", uid, field, value)
                    }
                    onRemove={(uid) => handleRemoveMember("senior", uid)}
                    onMove={(uid) => moveMember(uid, "senior", "junior")}
                    moveLabel="Move to Junior"
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      {/* Junior Members section */}
      <div className="space-y-3 mt-6">
        <h3 className="text-sm font-semibold">Junior Members</h3>
        <p className="text-xs text-muted-foreground">
          Only total count is required for junior members.
        </p>
        {/* Junior Members */}
        <div className="border rounded-md text-sm">
          <div className="px-4 py-2 bg-muted/60 backdrop-blur supports-[backdrop-filter]:bg-muted/50 font-semibold text-sm flex items-center justify-between">
            <span>Junior Members</span>
          </div>
          {isLoading ? (
            <div className="flex flex-col gap-2 px-4 py-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-7 rounded bg-muted/50 animate-pulse w-full"
                />
              ))}
            </div>
          ) : juniorMembers.length === 0 ? (
            <div className="flex items-center justify-center p-8 text-sm">
              <div className="w-full bg-muted/30 border-2 border-dashed border-border rounded-md py-6 text-center text-muted-foreground">
                No junior members added yet.
              </div>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onJuniorDragEnd}
            >
              <SortableContext
                items={juniorMembers.map((m) => m.uid)}
                strategy={verticalListSortingStrategy}
              >
                {juniorMembers.map((m, idx) => (
                  <SortableEditableRow
                    key={m.uid}
                    member={m}
                    index={idx}
                    role="junior"
                    onEdit={(uid, field, value) =>
                      handleEditMember("junior", uid, field, value)
                    }
                    onRemove={(uid) => handleRemoveMember("junior", uid)}
                    onMove={(uid) => moveMember(uid, "junior", "senior")}
                    moveLabel="Promote to Senior"
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </form>
  );
}
