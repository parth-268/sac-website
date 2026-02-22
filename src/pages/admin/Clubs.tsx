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
  useDeleteClubJuniorMembers,
} from "@/hooks/useClubMembers";
import { useDeleteClubSeniorMembers } from "@/hooks/useClubMembers";
import { useState, useEffect, useMemo } from "react";
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
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

type EditableMember = {
  uid: string;
  name: string;
  designation: string;
  phone: string | null;
};

const normalizeUrl = (value: string) => {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `https://${value}`;
};

const getStoragePathFromUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/uploads/");
    return parts[1] ?? null;
  } catch {
    return null;
  }
};

const SortableSeniorRow = ({
  member,
  index,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
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
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: member.uid });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="rounded-md border bg-background/60 px-3 py-2"
    >
      <div className="grid grid-cols-[16px_1fr_1fr_1fr_20px_20px] gap-1.5 items-center">
        <div
          {...attributes}
          {...listeners}
          title="Drag to reorder"
          className="cursor-grab active:cursor-grabbing text-muted-foreground text-xs select-none opacity-50 hover:opacity-100 transition-opacity"
          aria-label="Drag to reorder"
        >
          ⋮⋮
        </div>
        <Input
          placeholder="Name"
          className="h-8 text-sm"
          value={member.name}
          onChange={(e) => onChange(index, "name", e.target.value)}
        />
        <Input
          placeholder="Designation"
          className="h-8 text-sm"
          value={member.designation}
          onChange={(e) => onChange(index, "designation", e.target.value)}
        />
        <Input
          placeholder="Phone"
          className="h-8 text-sm"
          value={member.phone ?? ""}
          onChange={(e) => onChange(index, "phone", e.target.value)}
        />
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-muted-foreground hover:text-destructive transition-colors"
          aria-label="Remove member"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        {/* Inline move buttons */}
        {onMoveDown ? (
          <button
            type="button"
            onClick={onMoveDown}
            className="text-muted-foreground hover:text-primary transition-colors h-6 w-6 flex items-center justify-center"
            aria-label="Move to Junior"
            title="Move to Junior"
            tabIndex={0}
            style={{ background: "none", border: "none" }}
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        ) : onMoveUp ? (
          <button
            type="button"
            onClick={onMoveUp}
            className="text-muted-foreground hover:text-primary transition-colors h-6 w-6 flex items-center justify-center"
            aria-label="Move to Senior"
            title="Move to Senior"
            tabIndex={0}
            style={{ background: "none", border: "none" }}
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
};

const AdminClubs = () => {
  const [segment, setSegment] = useState<"club" | "contingent">("club");
  const { data: clubs, isLoading } = useClubs({ type: segment });
  const createClub = useCreateClub();
  const updateClub = useUpdateClub();
  const { uploadFile, deleteFile, uploading } = useFileUpload();

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
            <DialogContent className="max-w-2xl h-[85vh] p-0 flex flex-col rounded-lg">
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
                        setFormData({
                          ...formData,
                          name: e.target.value.toUpperCase(),
                        })
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
                      <div className="relative">
                        <img
                          src={formData.logo_url}
                          alt={`${formData.name} logo`}
                          className="h-16 w-16 rounded-md object-cover"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            const path = getStoragePathFromUrl(
                              formData.logo_url,
                            );
                            if (path) {
                              await deleteFile(path);
                            }
                            setFormData((p) => ({ ...p, logo_url: "" }));
                            toast.success("Logo removed");
                          }}
                          className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 hover:opacity-90 transition"
                          aria-label="Remove logo"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
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
                          // Delete the old logo before uploading new one
                          if (formData.logo_url) {
                            const oldPath = getStoragePathFromUrl(
                              formData.logo_url,
                            );
                            if (oldPath) {
                              await deleteFile(oldPath);
                            }
                          }
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
                    <p className="text-sm whitespace-pre-line break-words line-clamp-2">
                      {club.description}
                    </p>

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
          // The close logic (confirm unsaved) is handled in ClubMembersSection
          if (!open) {
            setMembersDialogOpen(false);
            setActiveClubForMembers(null);
          } else {
            setMembersDialogOpen(true);
          }
        }}
      >
        <DialogContent className="max-w-2xl h-[85vh] p-0 flex flex-col rounded-lg">
          {activeClubForMembers && (
            <ClubMembersSection
              club={activeClubForMembers}
              onClose={() => {
                setMembersDialogOpen(false);
                setActiveClubForMembers(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminClubs;

// ClubMembersSection: extracted from Club dialog, structurally matches Committees
function ClubMembersSection({
  club,
  onClose,
}: {
  club: any;
  onClose: () => void;
}) {
  // UID generator for stable drag-and-drop identity
  const createUID = () => crypto.randomUUID();

  const [seniorMembers, setSeniorMembers] = useState<EditableMember[]>([]);
  const [juniorMembers, setJuniorMembers] = useState<EditableMember[]>([]);
  const [membersDirty, setMembersDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const { data: seniorMembersData } = useClubMembers(club?.id, "senior");
  const { data: juniorMembersData } = useClubMembers(club?.id, "junior");
  const bulkInsertMembers = useBulkInsertClubMembers();
  const deleteSeniorMembers = useDeleteClubSeniorMembers();
  const deleteJuniorMembers = useDeleteClubJuniorMembers();
  const updateClub = useUpdateClub();

  useEffect(() => {
    if (!seniorMembersData) return;
    setSeniorMembers(
      seniorMembersData.map((m: any) => ({
        uid: createUID(),
        name: m.name,
        designation: m.designation,
        phone: m.phone,
      })),
    );
    setMembersDirty(false);
  }, [seniorMembersData]);

  useEffect(() => {
    if (!juniorMembersData) return;
    setJuniorMembers(
      juniorMembersData.map((m: any) => ({
        uid: createUID(),
        name: m.name,
        designation: m.designation,
        phone: m.phone,
      })),
    );
  }, [juniorMembersData]);

  // Excel import handler for both senior and junior members using single import button and role column
  const handleExcelImport = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer);
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<any>(sheet);

      if (!rows.length) {
        toast.error("Excel file is empty");
        return;
      }

      if (!club) {
        toast.error("No club selected");
        return;
      }
      // Normalize and validate rows
      const seniorRows: any[] = [];
      const juniorRows: any[] = [];
      for (const r of rows) {
        if (!r.name || !r.designation || !r.role) continue;
        const roleVal = String(r.role).toLowerCase().trim();
        if (roleVal === "senior") {
          seniorRows.push({
            name: String(r.name),
            designation: String(r.designation),
            phone: r.phone ? String(r.phone) : null,
            role: "senior",
          });
        } else if (roleVal === "junior") {
          juniorRows.push({
            name: String(r.name),
            designation: String(r.designation),
            phone: r.phone ? String(r.phone) : null,
            role: "junior",
          });
        }
      }
      if (!seniorRows.length && !juniorRows.length) {
        toast.error(
          "No valid rows found (must have name, designation, and role of 'senior' or 'junior')",
        );
        return;
      }
      // Delete both senior and junior members first
      await deleteSeniorMembers.mutateAsync(club.id);
      await deleteJuniorMembers.mutateAsync(club.id);
      // Bulk insert seniors
      if (seniorRows.length) {
        await bulkInsertMembers.mutateAsync({
          club_id: club.id,
          members: seniorRows,
        });
      }
      // Bulk insert juniors
      if (juniorRows.length) {
        await bulkInsertMembers.mutateAsync({
          club_id: club.id,
          members: juniorRows,
        });
      }
      setSeniorMembers(
        seniorRows.map((m) => ({
          uid: createUID(),
          name: m.name,
          designation: m.designation,
          phone: m.phone,
        })),
      );
      setJuniorMembers(
        juniorRows.map((m) => ({
          uid: createUID(),
          name: m.name,
          designation: m.designation,
          phone: m.phone,
        })),
      );
      setMembersDirty(true);
      toast.success("Members imported from Excel");
    } catch {
      toast.error("Excel import failed");
    }
  };

  // Confirm unsaved changes on close
  const handleClose = () => {
    if (membersDirty) {
      if (!window.confirm("Discard unsaved member changes?")) return;
    }
    onClose();
  };

  // Save handler: replace-all logic
  const handleSave = async () => {
    if (!club || saving) return;

    try {
      setSaving(true);

      await deleteSeniorMembers.mutateAsync(club.id);
      await deleteJuniorMembers.mutateAsync(club.id);

      await bulkInsertMembers.mutateAsync({
        club_id: club.id,
        members: seniorMembers
          .filter((m) => m.name && m.designation)
          .map((m) => ({
            name: m.name,
            designation: m.designation,
            phone: m.phone,
            role: "senior",
          })),
      });

      await bulkInsertMembers.mutateAsync({
        club_id: club.id,
        members: juniorMembers
          .filter((m) => m.name && m.designation)
          .map((m) => ({
            name: m.name,
            designation: m.designation,
            phone: m.phone,
            role: "junior",
          })),
      });

      await updateClub.mutateAsync({
        id: club.id,
        senior_count: seniorMembers.length,
        junior_count: juniorMembers.length,
      });

      toast.success("Members updated");
      setMembersDirty(false);
      onClose();
    } catch {
      toast.error("Failed to save members");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <DialogHeader className="px-6 pt-6">
        <DialogTitle className="text-lg font-semibold">
          Manage Members – {club?.name}
        </DialogTitle>
      </DialogHeader>
      <div className="flex-1 overflow-y-auto px-6 space-y-6">
        {/* Header actions: single Excel import and template download */}
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-dashed text-muted-foreground hover:text-foreground"
            onClick={() => {
              const ws = XLSX.utils.json_to_sheet([
                { name: "", designation: "", phone: "", role: "senior" },
                { name: "", designation: "", phone: "", role: "junior" },
              ]);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, "Members");
              XLSX.writeFile(wb, "club_members_template.xlsx");
            }}
          >
            Download Template
          </Button>
          <label className="inline-block">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border bg-muted/40 hover:bg-muted transition-colors cursor-pointer text-sm">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span>Import Members (Excel)</span>
            </div>
            <input
              type="file"
              accept=".xls,.xlsx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleExcelImport(file);
              }}
            />
          </label>
        </div>
        {/* SENIOR MEMBERS */}
        <div className="space-y-2 pb-4 border-b">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-sm font-semibold">Senior Members</h3>
            <p className="text-xs text-muted-foreground">
              Add senior leadership details (displayed publicly)
            </p>
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
                const oldIndex = items.findIndex((m) => m.uid === active.id);
                const newIndex = items.findIndex((m) => m.uid === over.id);
                if (oldIndex === -1 || newIndex === -1) return items;
                const updated = [...items];
                const [moved] = updated.splice(oldIndex, 1);
                updated.splice(newIndex, 0, moved);
                return updated;
              });
            }}
          >
            <SortableContext
              items={seniorMembers.map((m) => m.uid)}
              strategy={verticalListSortingStrategy}
            >
              {seniorMembers.map((member, idx) => (
                <div key={member.uid} className="space-y-1">
                  <SortableSeniorRow
                    member={member}
                    index={idx}
                    onChange={(i, key, value) => {
                      setMembersDirty(true);
                      setSeniorMembers((prev) => {
                        const copy = [...prev];
                        copy[i] = { ...copy[i], [key]: value };
                        return copy;
                      });
                    }}
                    onRemove={(i) => {
                      setMembersDirty(true);
                      setSeniorMembers((prev) =>
                        prev.filter((_, idx2) => idx2 !== i),
                      );
                    }}
                    onMoveDown={() => {
                      setMembersDirty(true);
                      setSeniorMembers((prev) =>
                        prev.filter((m) => m.uid !== member.uid),
                      );
                      setJuniorMembers((prev) => [...prev, member]);
                    }}
                  />
                </div>
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
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-sm font-semibold">Junior Members</h3>
              <p className="text-xs text-muted-foreground">
                Add junior member details.
              </p>
            </div>
            {juniorMembers.length === 0 && (
              <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                No junior members added yet.
              </div>
            )}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={({ active, over }) => {
                if (!over || active.id === over.id) return;
                setMembersDirty(true);
                setJuniorMembers((items) => {
                  const oldIndex = items.findIndex((m) => m.uid === active.id);
                  const newIndex = items.findIndex((m) => m.uid === over.id);
                  if (oldIndex === -1 || newIndex === -1) return items;
                  const updated = [...items];
                  const [moved] = updated.splice(oldIndex, 1);
                  updated.splice(newIndex, 0, moved);
                  return updated;
                });
              }}
            >
              <SortableContext
                items={juniorMembers.map((m) => m.uid)}
                strategy={verticalListSortingStrategy}
              >
                {juniorMembers.map((member, idx) => (
                  <div key={member.uid} className="space-y-1">
                    <SortableSeniorRow
                      member={member}
                      index={idx}
                      onChange={(i, key, value) => {
                        setMembersDirty(true);
                        setJuniorMembers((prev) => {
                          const copy = [...prev];
                          copy[i] = { ...copy[i], [key]: value };
                          return copy;
                        });
                      }}
                      onRemove={(i) => {
                        setMembersDirty(true);
                        setJuniorMembers((prev) =>
                          prev.filter((_, index) => index !== i),
                        );
                      }}
                      onMoveUp={() => {
                        setMembersDirty(true);
                        setJuniorMembers((prev) =>
                          prev.filter((m) => m.uid !== member.uid),
                        );
                        setSeniorMembers((prev) => [...prev, member]);
                      }}
                    />
                  </div>
                ))}
              </SortableContext>
            </DndContext>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setMembersDirty(true);
                setJuniorMembers((p) => [
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
              + Add Junior Member
            </Button>
          </div>
        </div>
      </div>
      <div className="shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 rounded-b-md">
        <div className="flex justify-end gap-3 px-6 py-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save
          </Button>
        </div>
      </div>
    </>
  );
}
