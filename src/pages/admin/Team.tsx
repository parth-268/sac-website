import { useState, useRef, useMemo } from "react";
import * as XLSX from "xlsx";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  useTeamMembers,
  useTeamMutations,
  TeamMember,
} from "@/hooks/useTeamData";
import { useAdminManagement } from "@/hooks/useAdminManagement";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Linkedin,
  Mail,
  Phone,
  ShieldCheck,
  GraduationCap,
  UserCog,
  FileSpreadsheet,
  Download,
  CheckSquare,
  XSquare,
} from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

// --- Configuration ---

// Configurable Role Hierarchy (Lower number = Higher Priority)
const ROLE_HIERARCHY: Record<string, number> = {
  president: 1,
  "vice president": 2,
  treasurer: 3,
  "general secretary": 4,
  coordinator: 99, // Default for others
};

// Roles restricted to the Senior-most batch
const RESTRICTED_ROLES = [
  "president",
  "vice president",
  "treasurer",
  "general secretary",
];

// --- Types ---

interface ExcelRow {
  Name: string;
  Designation?: string;
  Email?: string;
  Phone?: string;
  "LinkedIn URL"?: string;
  "Academic Batch"?: string | number;
}

const initialForm = {
  name: "",
  designation: "",
  image_url: "",
  linkedin_url: "",
  email: "",
  phone: "",
  academic_batch: "",
  display_order: 0,
  is_active: true,
};

// Helper for initials
const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

export default function AdminTeam() {
  // --- Hooks ---
  const { data: members, isLoading } = useTeamMembers();
  const { createMember, updateMember, deleteMember, moveToAlumni } =
    useTeamMutations();
  const { registerAdmin, resetUserPassword, revokeAdmin } =
    useAdminManagement();

  // --- State ---
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAccessOpen, setIsAccessOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState(initialForm);

  const [adminPassword, setAdminPassword] = useState("");
  const [adminTab, setAdminTab] = useState("grant");
  const [archiveBatch, setArchiveBatch] = useState(
    new Date().getFullYear().toString(),
  );

  // --- Bulk Selection State ---
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // --- Excel Import Refs ---
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Derived State (Sorting) ---

  const sortedMembers = useMemo(() => {
    if (!members) return [];

    return [...members].sort((a, b) => {
      // 1. Sort by Academic Batch (Ascending: Seniors/Older Batches First)
      // Assuming batch format is Year (e.g., 2023). 2023 < 2024.
      // If batch is missing, treat as highest number (Junior-most).
      const batchA = a.academic_batch
        ? parseInt(String(a.academic_batch))
        : 9999;
      const batchB = b.academic_batch
        ? parseInt(String(b.academic_batch))
        : 9999;

      if (batchA !== batchB) {
        return batchA - batchB;
      }

      // 2. Sort by Role Hierarchy
      const roleA =
        ROLE_HIERARCHY[a.designation.toLowerCase()] ||
        ROLE_HIERARCHY.coordinator;
      const roleB =
        ROLE_HIERARCHY[b.designation.toLowerCase()] ||
        ROLE_HIERARCHY.coordinator;

      return roleA - roleB;
    });
  }, [members]);

  // --- Helpers ---

  // Check for duplicates (Name + Email)
  const isDuplicate = (name: string, email: string, excludeId?: string) => {
    return members?.some(
      (m) =>
        m.id !== excludeId &&
        m.name.toLowerCase() === name.trim().toLowerCase() &&
        (m.email || "").toLowerCase() === (email || "").trim().toLowerCase(),
    );
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    if (members) {
      setSelectedIds(new Set(members.map((m) => m.id)));
    }
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  // --- Excel Handlers ---
  const handleDownloadTemplate = () => {
    const headers = [
      [
        "Name",
        "Designation",
        "Email",
        "Phone",
        "LinkedIn URL",
        "Academic Batch",
      ],
    ];
    const ws = XLSX.utils.aoa_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Team_Import_Template.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];

        const data = XLSX.utils.sheet_to_json<ExcelRow>(ws);

        if (data.length === 0) {
          toast.error("File is empty");
          return;
        }

        // --- Duplicate Filtering Logic ---
        const validRows: ExcelRow[] = [];
        let duplicatesCount = 0;
        const processedKeys = new Set<string>();

        for (const row of data) {
          if (!row.Name) continue;

          const name = String(row.Name).trim();
          const email = row.Email ? String(row.Email).trim() : "";
          const uniqueKey = `${name.toLowerCase()}|${email.toLowerCase()}`;

          if (isDuplicate(name, email) || processedKeys.has(uniqueKey)) {
            duplicatesCount++;
            continue;
          }

          processedKeys.add(uniqueKey);
          validRows.push(row);
        }

        if (validRows.length === 0) {
          if (duplicatesCount > 0) {
            toast.warning(
              `All ${duplicatesCount} entries were duplicates and skipped.`,
            );
          } else {
            toast.error("No valid entries found.");
          }
          return;
        }

        if (
          !confirm(
            `Found ${validRows.length} valid members.${duplicatesCount > 0 ? ` Skipped ${duplicatesCount} duplicates.` : ""} Import now?`,
          )
        )
          return;

        const promises = validRows.map((row) => {
          return createMember.mutateAsync({
            name: String(row.Name).trim(),
            designation: row.Designation
              ? String(row.Designation).trim()
              : "Member",
            email: row.Email ? String(row.Email).trim() : "",
            phone: row.Phone ? String(row.Phone).trim() : "",
            linkedin_url: row["LinkedIn URL"]
              ? String(row["LinkedIn URL"]).trim()
              : "",
            academic_batch: row["Academic Batch"]
              ? String(row["Academic Batch"]).trim()
              : "",
            image_url: "",
            is_active: true,
            display_order: 99,
          });
        });

        await Promise.all(promises);

        toast.success(`Successfully imported ${validRows.length} members!`);
      } catch (err) {
        console.error("Excel Import Error:", err);
        toast.error("Failed to parse Excel file. Please check the format.");
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  // --- CRUD Handlers ---

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Check Duplicates
    if (isDuplicate(formData.name, formData.email, editingId || undefined)) {
      toast.error(
        "A member with this Name and Email already exists. Please verify.",
      );
      return;
    }

    // 2. Validate Role Constraints (Junior Batch Restriction)
    if (members && formData.is_active) {
      const activeBatches = members
        .filter(
          (m) =>
            m.is_active &&
            m.id !== editingId &&
            m.academic_batch &&
            !isNaN(parseInt(String(m.academic_batch))),
        )
        .map((m) => parseInt(String(m.academic_batch)));

      if (activeBatches.length > 0) {
        const seniorMostBatch = Math.min(...activeBatches);
        const currentBatch = parseInt(formData.academic_batch);

        // If trying to add a batch Junior to the senior-most existing batch
        if (
          !isNaN(currentBatch) &&
          currentBatch > seniorMostBatch &&
          RESTRICTED_ROLES.includes(formData.designation.toLowerCase())
        ) {
          toast.error(
            `Batch ${currentBatch} members cannot be '${formData.designation}' while Senior Batch (${seniorMostBatch}) is active. They should be Coordinators.`,
          );
          return;
        }
      }
    }

    if (editingId) {
      await updateMember.mutateAsync({ id: editingId, ...formData });
    } else {
      await createMember.mutateAsync(formData);
    }
    setIsFormOpen(false);
  };

  // Core logic extracted for reuse in Bulk Delete
  const performDelete = async (member: TeamMember) => {
    if (member.email) await revokeAdmin.mutateAsync(member.email);
    await deleteMember.mutateAsync(member.id);
  };

  const handleDelete = async (member: TeamMember) => {
    if (!confirm("Delete member? This revokes admin access immediately."))
      return;
    await performDelete(member);
  };

  const handleBulkDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete ${selectedIds.size} selected members?`,
      )
    )
      return;

    let count = 0;
    const ids = Array.from(selectedIds);

    await Promise.all(
      ids.map(async (id) => {
        const member = members?.find((m) => m.id === id);
        if (member) {
          await performDelete(member);
          count++;
        }
      }),
    );

    toast.success(`Deleted ${count} members.`);
    setSelectedIds(new Set());
  };

  // Unified Archive Handler (Single & Bulk)
  const handleArchive = async () => {
    if (!archiveBatch) return toast.error("Please enter a Batch Year");

    // Determine targets: Single Selected or Bulk Set
    const targets = selectedMember
      ? [selectedMember]
      : members?.filter((m) => selectedIds.has(m.id)) || [];

    if (targets.length === 0) return;

    if (
      !confirm(
        `Move ${targets.length} member(s) to Alumni (Batch ${archiveBatch})? Access will be revoked.`,
      )
    )
      return;

    let successCount = 0;

    await Promise.all(
      targets.map(async (member) => {
        try {
          if (member.email) await revokeAdmin.mutateAsync(member.email);
          await moveToAlumni.mutateAsync({
            id: member.id,
            batch_year: archiveBatch,
          });
          successCount++;
        } catch (error) {
          console.error(`Failed to archive ${member.name}`, error);
        }
      }),
    );

    setIsArchiveOpen(false);
    setSelectedMember(null);
    setSelectedIds(new Set()); // Clear bulk selection
    toast.success(`Moved ${successCount} members to Alumni.`);
  };

  const handleBulkArchiveClick = () => {
    setSelectedMember(null); // Ensure no single member is selected
    setIsArchiveOpen(true);
  };

  // Unified Admin Action Handler
  const handleAdminAction = async () => {
    if (!adminPassword) return toast.error("Enter password");

    // BULK MODE
    if (selectedIds.size > 0 && !selectedMember) {
      const ids = Array.from(selectedIds);
      let successCount = 0;
      let skippedCount = 0;

      await Promise.all(
        ids.map(async (id) => {
          const member = members?.find((m) => m.id === id);
          if (!member || !member.email) {
            skippedCount++;
            return;
          }

          try {
            if (member.user_id) {
              await resetUserPassword.mutateAsync({
                email: member.email,
                password: adminPassword,
              });
            } else {
              await registerAdmin.mutateAsync({
                email: member.email,
                password: adminPassword,
                name: member.name,
                memberId: member.id,
              });
            }
            successCount++;
          } catch (e) {
            console.error(e);
            skippedCount++;
          }
        }),
      );

      toast.success(
        `Processed ${successCount} users.${skippedCount > 0 ? ` Skipped ${skippedCount} (no email/error).` : ""}`,
      );
      setSelectedIds(new Set());
    }
    // SINGLE MODE
    else if (selectedMember) {
      if (adminTab === "create") {
        await registerAdmin.mutateAsync({
          email: selectedMember.email,
          password: adminPassword,
          name: selectedMember.name,
          memberId: selectedMember.id,
        });
      } else {
        await resetUserPassword.mutateAsync({
          email: selectedMember.email,
          password: adminPassword,
        });
      }
    }

    setAdminPassword("");
    setIsAccessOpen(false);
    setSelectedMember(null);
  };

  // --- UI Openers ---
  const openNew = () => {
    setFormData(initialForm);
    setEditingId(null);
    setIsFormOpen(true);
  };

  const openEdit = (m: TeamMember) => {
    setFormData({
      name: m.name,
      designation: m.designation,
      image_url: m.image_url || "",
      linkedin_url: m.linkedin_url || "",
      email: m.email || "",
      phone: m.phone || "",
      academic_batch: m.academic_batch ? String(m.academic_batch) : "",
      display_order: m.display_order,
      is_active: m.is_active,
    });
    setEditingId(m.id);
    setIsFormOpen(true);
  };

  const openAccess = (m: TeamMember) => {
    if (!m.email) return toast.error("Member needs an email first");
    setSelectedMember(m);
    setAdminPassword("");
    setAdminTab(m.user_id ? "reset" : "create");
    setIsAccessOpen(true);
  };

  const openBulkAccess = () => {
    setSelectedMember(null); // Ensure we are in bulk mode
    setAdminPassword("");
    setAdminTab("create"); // Default view text
    setIsAccessOpen(true);
  };

  if (isLoading)
    return (
      <AdminLayout title="Team">
        <Loader2 className="animate-spin mx-auto mt-10" />
      </AdminLayout>
    );

  return (
    <AdminLayout
      title="Team Management"
      description="Manage active members, roles, and dashboard access."
      actions={
        <div className="flex gap-2 items-center">
          {/* BULK ACTIONS TOOLBAR */}
          {selectedIds.size > 0 ? (
            <div className="flex items-center gap-2 bg-purple-50 px-2 py-1 rounded-md border border-purple-100 animate-in fade-in slide-in-from-right-4">
              <span className="text-sm font-medium text-purple-700 px-2">
                {selectedIds.size} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={openBulkAccess}
                className="text-purple-700 hover:bg-purple-100 h-8"
              >
                <UserCog className="w-4 h-4 mr-2" /> Grant Access
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBulkArchiveClick}
                className="text-orange-600 hover:bg-orange-100 h-8"
              >
                <GraduationCap className="w-4 h-4 mr-2" /> Move to Alumni
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBulkDelete}
                className="text-red-600 hover:bg-red-100 h-8"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
              <Separator orientation="vertical" className="h-4 bg-purple-200" />
              <Button
                variant="ghost"
                size="icon"
                onClick={deselectAll}
                className="h-8 w-8 text-slate-500 hover:text-slate-700"
                title="Cancel Selection"
              >
                <XSquare className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              {/* NORMAL ACTIONS */}
              {members && members.length > 0 && (
                <Button
                  variant="outline"
                  onClick={selectAll}
                  className="gap-2 bg-white hidden md:flex"
                  title="Select All Members"
                >
                  <CheckSquare className="w-4 h-4 text-slate-500" />
                </Button>
              )}

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
              />

              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2 bg-white"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Import
              </Button>

              <Button onClick={openNew} className="gap-2 shadow-sm">
                <Plus className="w-4 h-4" /> Add Member
              </Button>
            </>
          )}
        </div>
      }
    >
      <div className="flex justify-end mb-4">
        <button
          onClick={handleDownloadTemplate}
          className="text-xs text-slate-500 hover:text-purple-600 flex items-center gap-1 underline transition-colors"
        >
          <Download className="w-3 h-3" /> Download Excel Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedMembers.map((member) => (
          <Card
            key={member.id}
            className={`group relative overflow-hidden transition-all duration-200 border-slate-200 ${
              !member.is_active ? "bg-slate-50/50" : "bg-white"
            } ${selectedIds.has(member.id) ? "ring-2 ring-purple-500 border-transparent shadow-md" : "hover:shadow-md"}`}
          >
            {/* Selection Checkbox Overlay */}
            <div className="absolute top-3 left-3 z-10">
              <input
                type="checkbox"
                checked={selectedIds.has(member.id)}
                onChange={() => toggleSelection(member.id)}
                className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer accent-purple-600"
              />
            </div>

            <CardContent className="p-5 pl-10">
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14 border-2 border-white shadow-sm ring-1 ring-slate-100">
                  <AvatarImage
                    src={member.image_url || ""}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-slate-100 text-slate-500 font-semibold">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <div className="pr-2 min-w-0">
                      <h3
                        className="font-semibold text-slate-900 truncate leading-tight"
                        title={member.name}
                      >
                        {member.name}
                      </h3>
                      <p
                        className="text-sm text-slate-500 font-medium truncate"
                        title={member.designation}
                      >
                        {member.designation}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <Badge
                        variant={member.is_active ? "default" : "secondary"}
                        className="h-5 px-2 text-[10px] font-semibold uppercase tracking-wide"
                      >
                        {member.is_active ? "Active" : "Inactive"}
                      </Badge>

                      {member.user_id && (
                        <Badge
                          variant="outline"
                          className="h-5 px-2 text-[10px] font-medium border-purple-200 bg-purple-50 text-purple-700 gap-1 shadow-sm"
                        >
                          <ShieldCheck className="w-3 h-3" /> Admin
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 border border-slate-100 transition-colors ${member.email ? "text-slate-600 hover:border-slate-300 hover:bg-white" : "text-slate-300 cursor-not-allowed"}`}
                      title={member.email || "No Email"}
                    >
                      <Mail className="w-4 h-4" />
                    </div>
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 border border-slate-100 transition-colors ${member.phone ? "text-slate-600 hover:border-slate-300 hover:bg-white" : "text-slate-300 cursor-not-allowed"}`}
                      title={member.phone || "No Phone"}
                    >
                      <Phone className="w-4 h-4" />
                    </div>
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 border border-slate-100 transition-colors ${member.linkedin_url ? "text-blue-600 hover:border-blue-300 hover:bg-blue-50" : "text-slate-300 cursor-not-allowed"}`}
                      title={member.linkedin_url || "No LinkedIn"}
                    >
                      <Linkedin className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>

            <div className="bg-slate-50/50 border-t border-slate-100 px-4 py-2.5 flex justify-between items-center">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2.5 text-slate-600 font-medium hover:text-slate-900 hover:bg-white hover:shadow-sm transition-all"
                  onClick={() => openEdit(member)}
                >
                  <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2.5 text-purple-700 font-medium hover:text-purple-900 hover:bg-purple-50 transition-all"
                  onClick={() => openAccess(member)}
                >
                  <UserCog className="w-3.5 h-3.5 mr-1.5" /> Access
                </Button>
              </div>

              <div className="flex gap-1 items-center">
                <Separator
                  orientation="vertical"
                  className="h-4 mx-1 bg-slate-200"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-orange-500 hover:text-orange-700 hover:bg-orange-50 rounded-full"
                  onClick={() => {
                    setSelectedMember(member);
                    setIsArchiveOpen(true);
                  }}
                  title="Archive to Alumni"
                >
                  <GraduationCap className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                  onClick={() => handleDelete(member)}
                  title="Delete Member"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* --- DIALOGS --- */}

      {/* 1. Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Team Member" : "Add Team Member"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="e.g. Advith"
                />
              </div>
              <div className="space-y-2">
                <Label>Designation</Label>
                <Input
                  value={formData.designation}
                  onChange={(e) =>
                    setFormData({ ...formData, designation: e.target.value })
                  }
                  required
                  placeholder="e.g. Coordinator"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Academic Batch</Label>
                <Input
                  value={formData.academic_batch}
                  onChange={(e) =>
                    setFormData({ ...formData, academic_batch: e.target.value })
                  }
                  placeholder="e.g. 2024"
                />
              </div>
              <div className="flex items-center gap-2 pt-8">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(c) =>
                    setFormData({ ...formData, is_active: c })
                  }
                />
                <Label>Active Member</Label>
              </div>
            </div>

            <ImageUpload
              value={formData.image_url || ""}
              onChange={(url) => setFormData({ ...formData, image_url: url })}
              folder="team"
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={formData.phone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+91..."
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>LinkedIn</Label>
              <Input
                value={formData.linkedin_url || ""}
                onChange={(e) =>
                  setFormData({ ...formData, linkedin_url: e.target.value })
                }
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. Access Dialog (Supports Single & Bulk) */}
      <Dialog open={isAccessOpen} onOpenChange={setIsAccessOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {selectedMember
                ? `Admin Access: ${selectedMember.name}`
                : "Bulk Admin Access"}
            </DialogTitle>
            <DialogDescription>
              {selectedMember
                ? "Manage login credentials."
                : `Set a common password for ${selectedIds.size} selected users.`}
            </DialogDescription>
          </DialogHeader>

          {/* If Single Member, Show Tabs. If Bulk, only show 'Set Password' view implicitly. */}
          {selectedMember ? (
            <Tabs value={adminTab} onValueChange={setAdminTab}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="create">Grant</TabsTrigger>
                <TabsTrigger value="reset">Reset</TabsTrigger>
              </TabsList>
              <div className="space-y-4">
                <Label>
                  {adminTab === "create" ? "Create Password" : "New Password"}
                </Label>
                <Input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                />
                <Button
                  onClick={handleAdminAction}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Confirm
                </Button>
              </div>
            </Tabs>
          ) : (
            // BULK VIEW
            <div className="space-y-4 pt-2">
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3 rounded-md">
                This will grant access to new users and reset passwords for
                existing admins among the selected.
              </div>
              <div className="space-y-2">
                <Label>Common Password</Label>
                <Input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter secure password"
                />
              </div>
              <Button
                onClick={handleAdminAction}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Apply to All Selected
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 3. Archive Dialog */}
      <Dialog open={isArchiveOpen} onOpenChange={setIsArchiveOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              Move{" "}
              {selectedMember
                ? selectedMember.name
                : `${selectedIds.size} members`}{" "}
              to Alumni
            </DialogTitle>
            <DialogDescription>
              They will be hidden from the active team list.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Label>Batch Year (Class of...)</Label>
            <Input
              value={archiveBatch}
              onChange={(e) => setArchiveBatch(e.target.value)}
              placeholder="e.g. 2024"
            />
            <Button onClick={handleArchive} className="w-full bg-orange-600">
              Confirm Move
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
