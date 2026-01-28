import { useState, useMemo } from "react";
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
} from "lucide-react";

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

export default function AdminAlumni() {
  const { data: alumni, isLoading } = useAlumniMembers();
  const { restoreToTeam, deleteMember, updateMember, createMember } =
    useTeamMutations();

  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);

  const filteredAlumni = useMemo(() => {
    if (!alumni) return [];
    return alumni.filter(
      (m) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.batch_year?.includes(search),
    );
  }, [alumni, search]);

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
      }
    >
      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search..."
          className="pl-10 bg-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filteredAlumni.map((member) => (
          <div
            key={member.id}
            className="group bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center gap-4"
          >
            <div className="flex items-center gap-4 min-w-[30%]">
              <Avatar className="h-12 w-12 border border-slate-100">
                <AvatarImage src={member.image_url || ""} />
                <AvatarFallback className="bg-slate-100 text-slate-500 font-bold">
                  {member.name.slice(0, 2)}
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
              <div
                className={member.linkedin_url ? "text-blue-600" : "opacity-20"}
              >
                <Linkedin className="w-4 h-4" />
              </div>
              <div className={member.email ? "text-slate-600" : "opacity-20"}>
                <Mail className="w-4 h-4" />
              </div>
              <div className={member.phone ? "text-slate-600" : "opacity-20"}>
                <Phone className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 md:w-[20%]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openEdit(member)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRestore(member.id, member.name)}
                className="text-blue-500 hover:bg-blue-50"
              >
                <Undo2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteMember.mutate(member.id)}
                className="text-red-400 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit" : "Add"} Alumni</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
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
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
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
            <Button type="submit" className="w-full">
              Save
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
