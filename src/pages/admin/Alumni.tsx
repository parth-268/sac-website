import { useState, useMemo, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  useAlumniMembers,
  useTeamMutations,
  TeamMember,
} from "@/hooks/useTeamData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/admin/ImageUpload";
import {
  Loader2,
  Search,
  Undo2,
  Trash2,
  Pencil,
  Linkedin,
  Mail,
  Phone,
  Plus,
  GraduationCap,
  AlertTriangle,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

let XLSXModule: typeof import("xlsx") | null = null;

const getXLSX = async () => {
  if (!XLSXModule) {
    XLSXModule = await import("xlsx");
  }
  return XLSXModule;
};

// ✅ FIXED: Using 'phone'
const initialForm = {
  name: "",
  designation: "",
  batch_year: "",
  image_url: "",
  linkedin_url: "",
  email: "",
  phone: "",
};

type ExcelAlumniRow = {
  name?: string;
  designation?: string;
  batch_year?: string | number;
  email?: string;
  phone?: string;
  linkedin_url?: string;
};

const REQUIRED_FIELDS = ["name", "designation", "batch_year"];

const downloadExcelTemplate = async () => {
  const XLSX = await getXLSX();

  const headers = [
    {
      name: "John Doe",
      designation: "President, SAC",
      batch_year: "2022",
      email: "john.doe@example.com",
      phone: "9876543210",
      linkedin_url: "https://linkedin.com/in/johndoe",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(headers);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Alumni Template");
  XLSX.writeFile(workbook, "alumni_upload_template.xlsx");
};

export default function AdminAlumni() {
  const { data: alumni, isLoading } = useAlumniMembers();
  const { restoreToTeam, deleteMember, updateMember, createMember } =
    useTeamMutations();

  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [excelErrors, setExcelErrors] = useState<string[]>([]);
  const [excelPreview, setExcelPreview] = useState<ExcelAlumniRow[]>([]);
  const [isParsingExcel, setIsParsingExcel] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [recentlyDeleted, setRecentlyDeleted] = useState<TeamMember[]>([]);

  useEffect(() => {
    if (recentlyDeleted.length === 0) return;

    const timer = setTimeout(() => {
      setRecentlyDeleted([]);
    }, 6000);

    return () => clearTimeout(timer);
  }, [recentlyDeleted]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const filteredAlumni = useMemo(() => {
    if (!alumni) return [];
    const query = search.trim().toLowerCase();
    if (!query) return alumni;
    return alumni.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        String(m.batch_year ?? "").includes(query) ||
        m.designation?.toLowerCase().includes(query),
    );
  }, [alumni, search]);

  const isAllSelected =
    filteredAlumni.length > 0 &&
    filteredAlumni.every((m) => selectedIds.has(m.id));

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      if (isAllSelected) {
        return new Set();
      }
      const next = new Set(prev);
      filteredAlumni.forEach((m) => {
        next.add(m.id);
      });
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateMember.mutateAsync({ id: editingId, ...form });
    } else {
      await createMember.mutateAsync({
        ...form,
        is_alumni: true,
        is_active: false,
      });
    }
    setIsDialogOpen(false);
    setForm(initialForm);
    setEditingId(null);
  };

  const handleRestore = async (id: string, name: string) => {
    if (confirm(`Restore ${name} to team?`))
      await restoreToTeam.mutateAsync(id);
  };

  const openEdit = (m: TeamMember) => {
    setForm({
      name: m.name,
      designation: m.designation,
      batch_year: m.batch_year || "",
      image_url: m.image_url || "",
      linkedin_url: m.linkedin_url || "",
      email: m.email || "",
      phone: m.phone || "", // ✅ FIXED
    });
    setEditingId(m.id);
    setIsDialogOpen(true);
  };

  const handleExcelUpload = async (file: File) => {
    setExcelErrors([]);
    setExcelPreview([]);
    setIsParsingExcel(true);
    try {
      const XLSX = await getXLSX();
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<ExcelAlumniRow>(sheet);

      const existingKeys = new Set(
        alumni?.map((a) => `${a.name.toLowerCase()}-${a.batch_year}`),
      );

      const errors: string[] = [];
      const validRows: ExcelAlumniRow[] = [];
      const seen = new Set<string>();

      rows.forEach((row, index) => {
        const key = `${String(row.name).toLowerCase()}-${row.batch_year}`;

        if (existingKeys.has(key)) {
          errors.push(`Row ${index + 2}: Duplicate alumni (already exists)`);
          return;
        }

        if (seen.has(key)) {
          errors.push(`Row ${index + 2}: Duplicate alumni (duplicate in file)`);
          return;
        }

        const rowErrors: string[] = [];

        REQUIRED_FIELDS.forEach((field) => {
          if (!row[field as keyof ExcelAlumniRow]) {
            rowErrors.push(`Missing ${field}`);
          }
        });

        if (row.batch_year && !String(row.batch_year).match(/^\d{4}$/)) {
          rowErrors.push("Invalid batch year");
        }

        if (rowErrors.length > 0) {
          rowErrors.forEach((err) => errors.push(`Row ${index + 2}: ${err}`));
          return;
        }

        seen.add(key);
        validRows.push(row);
      });

      setExcelErrors(errors);
      setExcelPreview(validRows);
    } finally {
      setIsParsingExcel(false);
    }
  };

  const handleBulkInsert = async () => {
    const existingKeys = new Set(
      alumni?.map((a) => `${a.name.toLowerCase()}-${a.batch_year}`),
    );
    const rowsToInsert = excelPreview.filter((row) => {
      const key = `${String(row.name).toLowerCase()}-${row.batch_year}`;
      return !existingKeys.has(key);
    });
    const results = await Promise.allSettled(
      rowsToInsert.map((row) =>
        createMember.mutateAsync({
          name: String(row.name),
          designation: String(row.designation),
          batch_year: String(row.batch_year),
          email: row.email || "",
          phone: row.phone || "",
          linkedin_url: row.linkedin_url || "",
          is_alumni: true,
          is_active: false,
        }),
      ),
    );
    setExcelPreview([]);
    toast.success(
      `${results.filter((r) => r.status === "fulfilled").length} alumni imported`,
    );
  };

  if (isLoading)
    return (
      <AdminLayout title="Alumni">
        <Loader2 className="animate-spin mx-auto mt-10" />
      </AdminLayout>
    );

  return (
    <AdminLayout
      title="Alumni Directory"
      description="Past council members."
      actions={
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            className="gap-2"
            onClick={downloadExcelTemplate}
          >
            <GraduationCap className="w-4 h-4" />
            Download Template
          </Button>
          <Button variant="outline" className="gap-2" asChild>
            <label>
              <Upload className="w-4 h-4" />
              Upload Excel
              <input
                type="file"
                accept=".xlsx,.csv"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleExcelUpload(file);
                    e.currentTarget.value = "";
                  }
                }}
              />
            </label>
          </Button>

          <Button
            onClick={() => {
              setForm(initialForm);
              setEditingId(null);
              setIsDialogOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" /> Add Alumni
          </Button>
        </div>
      }
    >
      <div className="mb-6 flex items-center gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search..."
            className="pl-10 bg-white"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              clearSelection();
            }}
          />
        </div>

        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            aria-label="Select all alumni"
            checked={isAllSelected}
            onChange={toggleSelectAll}
            className="accent-blue-600"
          />
          Select all
        </label>
      </div>

      {selectedIds.size > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm">
          <span className="font-medium">{selectedIds.size} selected</span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={deleteMember.isPending}
              onClick={() => {
                if (confirm("Delete selected alumni?")) {
                  const toDelete =
                    alumni?.filter((a) => selectedIds.has(a.id)) ?? [];
                  Promise.all(
                    toDelete.map((m) => deleteMember.mutateAsync(m.id)),
                  ).then(() => {
                    setRecentlyDeleted(toDelete);
                    clearSelection();
                  });
                }
              }}
              className="text-red-600"
            >
              Delete Selected
            </Button>

            <Button size="sm" variant="ghost" onClick={clearSelection}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {isParsingExcel && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Parsing Excel file…
        </div>
      )}

      {excelErrors.length > 0 && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-center gap-2 font-medium mb-2">
            <AlertTriangle className="w-4 h-4" /> Excel Validation Errors
          </div>
          <ul className="list-disc pl-5 space-y-1">
            {excelErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {excelPreview.length > 0 && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="font-medium text-sm">
              {excelPreview.length} valid alumni ready to import
            </p>
            <Button
              size="sm"
              onClick={handleBulkInsert}
              disabled={createMember.isPending}
            >
              Import All
            </Button>
          </div>
          <div className="max-h-48 overflow-y-auto text-sm text-slate-600">
            {excelPreview.map((r, i) => (
              <div key={i} className="flex justify-between py-1">
                <span className="font-medium">{r.name}</span>
                <span className="text-slate-500">
                  {r.designation} • {r.batch_year}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredAlumni.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
          <p className="font-medium">No alumni found</p>
          <p className="text-sm mt-1">
            Add alumni manually or upload an Excel file.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlumni.map((member) => (
            <div
              key={member.id}
              className={`group rounded-xl border p-4 flex flex-col md:flex-row md:items-center gap-4
              ${
                selectedIds.has(member.id)
                  ? "border-blue-400 bg-blue-50/40"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-4 min-w-[30%]">
                <input
                  type="checkbox"
                  aria-label={`Select alumni ${member.name}`}
                  checked={selectedIds.has(member.id)}
                  onChange={() => toggleSelect(member.id)}
                  className="accent-blue-600"
                />
                <Avatar className="h-12 w-12 border border-slate-100">
                  <AvatarImage src={member.image_url || ""} />
                  <AvatarFallback className="bg-slate-100 text-slate-500 font-bold">
                    {member.name?.slice(0, 2) || "NA"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-slate-500">{member.designation}</p>
                </div>
              </div>
              <div className="flex items-center md:w-[15%]">
                <Badge variant="secondary" className="gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" /> Class of{" "}
                  {member.batch_year}
                </Badge>
              </div>
              <div className="flex gap-3 text-slate-400 flex-1">
                {/* Contact Icons Logic */}
                {member.linkedin_url ? (
                  <a
                    href={member.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn profile"
                    className="text-blue-600"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                ) : (
                  <div className="opacity-20 pointer-events-none">
                    <Linkedin className="w-4 h-4" />
                  </div>
                )}
                {member.email ? (
                  <a
                    href={`mailto:${member.email}`}
                    aria-label="Send email"
                    className="text-slate-600"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                ) : (
                  <div className="opacity-20 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </div>
                )}
                {member.phone ? (
                  <a
                    href={`tel:${member.phone}`}
                    aria-label="Call phone number"
                    className="text-slate-600"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                ) : (
                  <div className="opacity-20 pointer-events-none">
                    <Phone className="w-4 h-4" />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end gap-2 md:w-[20%]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEdit(member)}
                  aria-label="Edit alumni"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRestore(member.id, member.name)}
                  className="text-blue-500 hover:bg-blue-50"
                  aria-label="Restore alumni to team"
                >
                  <Undo2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteMember.mutate(member.id)}
                  className="text-red-400 hover:bg-red-50"
                  aria-label="Delete alumni"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg h-[85vh] p-0 flex flex-col">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="text-lg font-semibold">
              {editingId ? "Edit Alumni" : "Add Alumni"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-2">
            <form
              id="alumni-form"
              onSubmit={handleSubmit}
              className="space-y-4 pt-2"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Batch</Label>
                  <Input
                    value={form.batch_year}
                    onChange={(e) =>
                      setForm({ ...form, batch_year: e.target.value })
                    }
                    required
                    inputMode="numeric"
                    pattern="\d{4}"
                    placeholder="YYYY"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Designation</Label>
                <Input
                  value={form.designation}
                  onChange={(e) =>
                    setForm({ ...form, designation: e.target.value })
                  }
                />
              </div>
              <ImageUpload
                value={form.image_url}
                onChange={(url) => setForm({ ...form, image_url: url })}
                folder="team"
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>LinkedIn</Label>
                <Input
                  value={form.linkedin_url}
                  onChange={(e) =>
                    setForm({ ...form, linkedin_url: e.target.value })
                  }
                />
              </div>
            </form>
          </div>
          <div className="shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 w-full rounded-md">
            <div className="flex justify-end gap-3 px-6 py-4">
              <Button
                type="submit"
                form="alumni-form"
                className="w-full"
                disabled={updateMember.isPending || createMember.isPending}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Undo Snackbar for bulk delete */}
      {recentlyDeleted.length > 0 && (
        <div
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg flex items-center gap-4"
          role="status"
          aria-live="polite"
        >
          <span className="text-sm">
            {recentlyDeleted.length} alumni deleted
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={async () => {
              for (const m of recentlyDeleted) {
                await createMember.mutateAsync({
                  name: m.name,
                  designation: m.designation,
                  batch_year: m.batch_year,
                  email: m.email,
                  phone: m.phone,
                  linkedin_url: m.linkedin_url,
                  image_url: m.image_url,
                  is_alumni: true,
                  is_active: false,
                });
              }
              setRecentlyDeleted([]);
            }}
          >
            Undo
          </Button>
        </div>
      )}

      {/*
        Undo snackbar should auto-dismiss after 6s.
      */}
      {/*
        Effect for auto-dismiss snackbar
      */}
      {/* (Effect is added below) */}
    </AdminLayout>
  );
}
