import * as XLSX from "xlsx";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  useClubMembers,
  useBulkInsertClubMembers,
} from "@/hooks/useClubMembers";
import { useDeleteClubSeniorMembers } from "@/hooks/useClubMembers";
import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useClubs, useCreateClub, useUpdateClub } from "@/hooks/useClubs";
import { useFileUpload } from "@/hooks/useFileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Pencil,
  Upload,
  Loader2,
  Image as ImageIcon,
  Users,
  X,
  Mail,
  Linkedin,
  Instagram,
} from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

const normalizeUrl = (value: string) => {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `https://${value}`;
};

const SortableSeniorRow = ({
  member,
  index,
  onChange,
  onRemove,
}: {
  member: {
    uid: string;
    name: string;
    designation: string;
    phone: string | null;
  };
  index: number;
  onChange: (idx: number, key: string, value: string) => void;
  onRemove: (idx: number) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: member.uid });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="rounded-md border bg-background/60 p-3"
    >
      <div className="grid grid-cols-[18px_1fr_1fr_1fr_28px] gap-2 items-center">
        <div
          {...attributes}
          {...listeners}
          title="Drag to reorder"
          className="cursor-grab text-muted-foreground text-xs select-none opacity-50 hover:opacity-100 transition-opacity"
          aria-label="Drag to reorder"
        >
          ⋮⋮
        </div>

        <Input
          placeholder="Name"
          value={member.name}
          onChange={(e) => onChange(index, "name", e.target.value)}
        />
        <Input
          placeholder="Designation"
          value={member.designation}
          onChange={(e) => onChange(index, "designation", e.target.value)}
        />
        <Input
          placeholder="Phone"
          value={member.phone ?? ""}
          onChange={(e) => onChange(index, "phone", e.target.value)}
        />

        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-muted-foreground hover:text-destructive transition-colors"
          aria-label="Remove member"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const AdminClubs = () => {
  const [segment, setSegment] = useState<"club" | "contingent">("club");
  const { data: clubs, isLoading } = useClubs({ type: segment });
  const createClub = useCreateClub();
  const updateClub = useUpdateClub();
  const { uploadFile, uploading } = useFileUpload();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "club" as "club" | "contingent",
    email: "",
    linkedin_url: "",
    instagram_url: "",
    logo_url: "",
    image_url: "",
    is_active: true,
  });

  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [activeClubForMembers, setActiveClubForMembers] = useState<any | null>(
    null,
  );

  const [seniorMembers, setSeniorMembers] = useState<
    {
      id?: string; // DB id (if exists)
      uid: string; // stable client id (always present)
      name: string;
      designation: string;
      phone: string | null;
    }[]
  >([]);

  const [membersDirty, setMembersDirty] = useState(false);

  // UID generator for stable drag-and-drop identity
  const createUID = () => crypto.randomUUID();

  // DnD sensors for senior members
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const { data: seniorMembersData } = useClubMembers(
    activeClubForMembers?.id,
    "senior",
  );

  const bulkInsertMembers = useBulkInsertClubMembers();

  const deleteSeniorMembers = useDeleteClubSeniorMembers();

  // Sync query data to local state

  useEffect(() => {
    if (!seniorMembersData) return;

    setSeniorMembers(
      seniorMembersData.map((m) => ({
        id: m.id,
        uid: createUID(),
        name: m.name,
        designation: m.designation,
        phone: m.phone,
      })),
    );
    setMembersDirty(false);
  }, [seniorMembersData]);

  const handleSeniorExcelImport = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer);
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<any>(sheet);
      if (!activeClubForMembers) {
        toast.error("No club selected");
        return;
      }
      const valid = rows
        .filter((r) => r.name && r.designation)
        .map((r) => ({
          name: String(r.name),
          designation: String(r.designation),
          phone: r.phone ? String(r.phone) : null,
          role: "senior",
        }));

      if (!valid.length) {
        toast.error("No valid rows found");
        return;
      }
      await deleteSeniorMembers.mutateAsync(activeClubForMembers.id);

      await bulkInsertMembers.mutateAsync({
        club_id: activeClubForMembers.id,
        members: valid.map((m) => ({
          name: m.name,
          designation: m.designation,
          phone: m.phone,
          role: "senior",
        })),
      });

      setMembersDirty(true);
      setSeniorMembers(
        valid.map((m) => ({
          uid: createUID(),
          name: m.name,
          designation: m.designation,
          phone: m.phone,
        })),
      );
      toast.success("Senior members imported");
    } catch (err) {
      toast.error("Excel import failed");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "club",
      email: "",
      linkedin_url: "",
      instagram_url: "",
      logo_url: "",
      image_url: "",
      is_active: true,
    });
    setEditingClub(null);
  };

  const openEditDialog = (club: any) => {
    setEditingClub(club);
    setFormData({
      name: club.name,
      description: club.description,
      type: club.type,
      email: club.email || "",
      linkedin_url: club.linkedin_url || "",
      instagram_url: club.instagram_url || "",
      logo_url: club.logo_url || "",
      image_url: club.image_url || "",
      is_active: club.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await uploadFile(file, "clubs");
    if (result) {
      setFormData((prev) => ({ ...prev, image_url: result.url }));
      toast.success("Image uploaded");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingClub) {
        await updateClub.mutateAsync({
          id: editingClub.id,
          ...formData,
          email: formData.email,
          linkedin_url: normalizeUrl(formData.linkedin_url),
          instagram_url: normalizeUrl(formData.instagram_url),
        });
        toast.success("Club updated");
      } else {
        await createClub.mutateAsync({
          ...formData,
          email: formData.email,
          linkedin_url: normalizeUrl(formData.linkedin_url),
          instagram_url: normalizeUrl(formData.instagram_url),
        });
        toast.success("Club created");
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      toast.error("Failed to save club");
    }
  };

  return (
    <AdminLayout title="Clubs & Contingents">
      <Tabs
        value={segment}
        onValueChange={(v) => setSegment(v as "club" | "contingent")}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="club">Clubs</TabsTrigger>
          <TabsTrigger value="contingent">Contingents</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Manage {segment === "club" ? "Clubs" : "Contingents"}
          </CardTitle>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button
                className="gap-2"
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Add {segment === "club" ? "Club" : "Contingent"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl h-[90vh] p-0 flex flex-col">
              <DialogHeader className="px-6 pt-6">
                <DialogTitle className="text-lg font-semibold">
                  {editingClub ? "Edit Club" : "Add New Club"}
                </DialogTitle>
              </DialogHeader>
              <form
                id="club-form"
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto px-6 space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Club Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <select
                      className="w-full rounded-md border px-3 py-2"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value as any,
                        })
                      }
                    >
                      <option value="club">Club</option>
                      <option value="contingent">Contingent</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>LinkedIn URL</Label>
                    <Input
                      placeholder="https://linkedin.com/..."
                      value={formData.linkedin_url}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          linkedin_url: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Instagram URL</Label>
                    <Input
                      placeholder="https://instagram.com/..."
                      value={formData.instagram_url}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          instagram_url: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Club Logo</Label>
                  <div className="flex items-center gap-4">
                    {formData.logo_url && (
                      <img
                        src={formData.logo_url}
                        alt={`${formData.name} logo`}
                        className="h-16 w-16 rounded-md object-cover"
                      />
                    )}
                    <label className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted">
                        {uploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ImageIcon className="h-4 w-4" />
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
                          const res = await uploadFile(file, "club-logos");
                          if (res) {
                            setFormData((p) => ({ ...p, logo_url: res.url }));
                            toast.success("Logo uploaded");
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Cover Image</Label>
                  <div className="flex items-center gap-4">
                    {formData.image_url && (
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="h-20 w-20 object-cover rounded"
                      />
                    )}
                    <label className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted">
                        {uploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        Upload Image
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="active-switch"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData((p) => ({ ...p, is_active: checked }))
                    }
                  />
                  <Label htmlFor="active-switch">Active</Label>
                </div>
              </form>
              <div className="shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 rounded-b-md">
                <div className="flex justify-end gap-3 px-6 py-4">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    form="club-form"
                    disabled={createClub.isPending || updateClub.isPending}
                  >
                    {(createClub.isPending || updateClub.isPending) && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {editingClub ? "Update" : "Create"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent aria-busy={isLoading ? "true" : "false"}>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-40 rounded-md bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : clubs && clubs.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No {segment === "club" ? "clubs" : "contingents"} added yet.
              <br />
              Click “Add” to create your first one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clubs?.map((club) => (
                <Card key={club.id}>
                  <CardHeader className="flex flex-row items-center gap-3">
                    {club.logo_url ? (
                      <img
                        src={club.logo_url}
                        alt={`${club.name} logo`}
                        className="h-10 w-10 rounded-md object-cover"
                      />
                    ) : (
                      <Users className="h-6 w-6 text-muted-foreground" />
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-base">{club.name}</CardTitle>
                      <p className="text-xs text-muted-foreground capitalize">
                        {club.type}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm line-clamp-2">{club.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <div title={club.email ? club.email : "Not provided"}>
                          <Mail
                            className={`h-4 w-4 ${club.email ? "text-primary" : "opacity-40"}`}
                          />
                        </div>
                        <div
                          title={
                            club.linkedin_url
                              ? club.linkedin_url
                              : "Not provided"
                          }
                        >
                          <Linkedin
                            className={`h-4 w-4 ${
                              club.linkedin_url ? "text-primary" : "opacity-40"
                            }`}
                          />
                        </div>
                        <div
                          title={
                            club.instagram_url
                              ? club.instagram_url
                              : "Not provided"
                          }
                        >
                          <Instagram
                            className={`h-4 w-4 ${
                              club.instagram_url ? "text-primary" : "opacity-40"
                            }`}
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 text-xs text-muted-foreground">
                        <span>Senior: {club.senior_count}</span>
                        <span>Junior: {club.junior_count}</span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        aria-label="Edit club"
                        onClick={() => openEditDialog(club)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label="Manage members"
                        onClick={() => {
                          setActiveClubForMembers(club);
                          setMembersDialogOpen(true);
                        }}
                      >
                        Members
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={membersDialogOpen}
        onOpenChange={(open) => {
          if (!open && membersDirty) {
            const confirmClose = window.confirm(
              "Discard unsaved member changes?",
            );
            if (!confirmClose) return;
          }

          setMembersDialogOpen(open);
          if (!open) {
            setMembersDirty(false);
            setActiveClubForMembers(null);
            setSeniorMembers([]);
          }
        }}
      >
        <DialogContent className="max-w-2xl h-[90vh] p-0 flex flex-col">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="text-lg font-semibold">
              Manage Members – {activeClubForMembers?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 space-y-6">
            {/* SENIOR MEMBERS */}
            <div className="space-y-4 pb-6 border-b">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-sm font-semibold">Senior Members</h3>
                <p className="text-xs text-muted-foreground">
                  Add senior leadership details (displayed publicly)
                </p>
                {/* Excel actions */}
                <div className="flex items-center gap-2 ml-auto">
                  {/* Download template – secondary accent */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-dashed text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      const ws = XLSX.utils.json_to_sheet([
                        { name: "", designation: "", phone: "" },
                      ]);
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, "Senior Members");
                      XLSX.writeFile(wb, "club_senior_members_template.xlsx");
                    }}
                  >
                    Download Template
                  </Button>
                  {/* Import – primary action */}
                  <label className="inline-block">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border bg-muted/40 hover:bg-muted transition-colors cursor-pointer text-sm">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                      <span>Import from Excel</span>
                    </div>
                    <input
                      type="file"
                      accept=".xls,.xlsx"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleSeniorExcelImport(file);
                      }}
                    />
                  </label>
                </div>
              </div>

              {seniorMembers.length === 0 && (
                <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  No senior members added yet.
                </div>
              )}

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={({ active, over }) => {
                  if (!over || active.id === over.id) return;

                  setMembersDirty(true);
                  setSeniorMembers((items) => {
                    const oldIndex = items.findIndex(
                      (m) => m.uid === active.id,
                    );
                    const newIndex = items.findIndex((m) => m.uid === over.id);

                    if (oldIndex === -1 || newIndex === -1) return items;

                    const updated = [...items];
                    const [moved] = updated.splice(oldIndex, 1);
                    updated.splice(newIndex, 0, moved);
                    return updated;
                  });
                  // No persistence to DB needed, UI only
                }}
              >
                <SortableContext
                  items={seniorMembers.map((m) => m.uid)}
                  strategy={verticalListSortingStrategy}
                >
                  {seniorMembers.map((member, idx) => (
                    <SortableSeniorRow
                      key={member.uid}
                      member={member}
                      index={idx}
                      onChange={(i, key, value) => {
                        setMembersDirty(true);
                        setSeniorMembers((prev) => {
                          const copy = [...prev];
                          (copy[i] as any)[key] = value;
                          return copy;
                        });
                      }}
                      onRemove={(i) => {
                        setMembersDirty(true);
                        setSeniorMembers((prev) =>
                          prev.filter((_, idx) => idx !== i),
                        );
                      }}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setMembersDirty(true);
                  setSeniorMembers((p) => [
                    ...p,
                    {
                      uid: createUID(),
                      name: "",
                      designation: "",
                      phone: null,
                    },
                  ]);
                }}
              >
                + Add Senior Member
              </Button>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Junior Members</h3>
              <p className="text-xs text-muted-foreground">
                Only total count is required for junior members.
              </p>

              <Input
                type="number"
                min={0}
                value={activeClubForMembers?.junior_count ?? 0}
                onChange={(e) =>
                  setActiveClubForMembers((p: any | null) =>
                    p
                      ? { ...p, junior_count: parseInt(e.target.value) || 0 }
                      : p,
                  )
                }
              />
            </div>
          </div>
          <div className="shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 rounded-b-md">
            <div className="flex justify-end gap-3 px-6 py-4">
              <Button
                variant="outline"
                onClick={() => setMembersDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (!activeClubForMembers) return;

                  try {
                    // Always replace senior members to avoid duplicate unique constraint
                    await deleteSeniorMembers.mutateAsync(
                      activeClubForMembers.id,
                    );

                    await bulkInsertMembers.mutateAsync({
                      club_id: activeClubForMembers.id,
                      members: seniorMembers
                        .filter((m) => m.name && m.designation)
                        .map((m) => ({
                          name: m.name,
                          designation: m.designation,
                          phone: m.phone,
                          role: "senior",
                        })),
                    });

                    await updateClub.mutateAsync({
                      id: activeClubForMembers.id,
                      junior_count: activeClubForMembers.junior_count,
                    });

                    toast.success("Members updated");
                    setMembersDialogOpen(false);
                  } catch {
                    toast.error("Failed to save members");
                  }
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminClubs;
