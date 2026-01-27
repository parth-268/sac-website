import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  useTeamMembers,
  useTeamMutations,
  TeamMember,
} from "@/hooks/useTeamData";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Linkedin,
  Mail,
  Phone,
  GripVertical,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";

const initialForm = {
  name: "",
  designation: "",
  image_url: "",
  linkedin_url: "",
  email: "",
  phone_number: "",
  display_order: 0,
  is_active: true,
};

export default function AdminTeam() {
  const { data: members, isLoading } = useTeamMembers();
  const { createMember, updateMember, deleteMember, moveToAlumni } =
    useTeamMutations();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [archiveBatch, setArchiveBatch] = useState(
    new Date().getFullYear().toString(),
  );
  const [memberToArchive, setMemberToArchive] = useState<TeamMember | null>(
    null,
  );

  // --- Handlers ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateMember.mutateAsync({ id: editingId, ...form });
        toast.success("Member updated");
      } else {
        await createMember.mutateAsync(form);
        toast.success("Member added");
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Failed to save");
    }
  };

  const handleArchive = async () => {
    if (!memberToArchive || !archiveBatch) return;
    try {
      await moveToAlumni.mutateAsync({
        id: memberToArchive.id,
        batch_year: archiveBatch,
      });
      toast.success("Moved to Alumni");
      setIsArchiveDialogOpen(false);
    } catch (error) {
      toast.error("Failed to archive");
    }
  };

  const openNew = () => {
    setForm(initialForm);
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const openEdit = (m: TeamMember) => {
    setForm({
      name: m.name,
      designation: m.designation,
      image_url: m.image_url || "",
      linkedin_url: m.linkedin_url || "",
      email: m.email || "",
      phone_number: m.phone_number || "",
      display_order: m.display_order,
      is_active: m.is_active,
    });
    setEditingId(m.id);
    setIsDialogOpen(true);
  };

  const openArchive = (m: TeamMember) => {
    setMemberToArchive(m);
    setIsArchiveDialogOpen(true);
  };

  if (isLoading)
    return (
      <AdminLayout title="Team">
        <Loader2 className="animate-spin mx-auto mt-10" />
      </AdminLayout>
    );

  return (
    <AdminLayout
      title="Current Team"
      description="Manage active council members. Move graduating members to Alumni."
      actions={
        <Button onClick={openNew} className="gap-2">
          <Plus className="w-4 h-4" /> Add Member
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {members?.map((member) => (
          <Card
            key={member.id}
            className={`overflow-hidden transition-all ${!member.is_active ? "opacity-70 border-dashed" : "hover:shadow-md"}`}
          >
            <CardContent className="p-4 flex items-start gap-4">
              <Avatar className="h-16 w-16 border-2 border-slate-100">
                <AvatarImage src={member.image_url || ""} />
                <AvatarFallback className="bg-slate-200 text-slate-500 font-bold text-lg">
                  {member.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 truncate pr-2">
                    {member.name}
                  </h3>
                  <Badge
                    variant={member.is_active ? "default" : "secondary"}
                    className="text-[10px] h-5"
                  >
                    {member.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-sm text-accent font-medium truncate">
                  {member.designation}
                </p>

                {/* --- CLICKABLE CONTACT ICONS --- */}
                <div className="flex items-center gap-3 pt-2">
                  {member.linkedin_url ? (
                    <a
                      href={member.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 hover:scale-110 transition-transform p-1 rounded-md hover:bg-blue-50"
                      title="LinkedIn Profile"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  ) : (
                    <Linkedin className="w-4 h-4 text-slate-200" />
                  )}

                  {member.email ? (
                    <a
                      href={`mailto:${member.email}`}
                      className="text-slate-500 hover:text-red-600 hover:scale-110 transition-transform p-1 rounded-md hover:bg-red-50"
                      title={member.email}
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  ) : (
                    <Mail className="w-4 h-4 text-slate-200" />
                  )}

                  {member.phone_number ? (
                    <a
                      href={`tel:${member.phone_number}`}
                      className="text-slate-500 hover:text-green-600 hover:scale-110 transition-transform p-1 rounded-md hover:bg-green-50"
                      title={member.phone_number}
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  ) : (
                    <Phone className="w-4 h-4 text-slate-200" />
                  )}

                  <div className="flex items-center gap-1 text-xs text-slate-400 ml-auto font-mono">
                    <GripVertical className="w-3 h-3" />
                    {member.display_order}
                  </div>
                </div>
              </div>
            </CardContent>

            <div className="px-4 py-2 bg-slate-50 border-t flex justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 text-slate-600"
                onClick={() => openEdit(member)}
              >
                <Pencil className="w-3 h-3" /> Edit
              </Button>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                  onClick={() => openArchive(member)}
                >
                  <GraduationCap className="w-3 h-3" /> Archive
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-red-400 hover:text-red-600"
                  onClick={() => {
                    if (confirm("Delete?")) deleteMember.mutate(member.id);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* --- CREATE / EDIT DIALOG --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Member" : "New Team Member"}
            </DialogTitle>
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
                <Label>Designation</Label>
                <Input
                  value={form.designation}
                  onChange={(e) =>
                    setForm({ ...form, designation: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <ImageUpload
              value={form.image_url}
              onChange={(url) => setForm({ ...form, image_url: url })}
              folder="team"
              label="Profile Photo"
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>LinkedIn</Label>
                <div className="relative">
                  <Linkedin className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    className="pl-9"
                    value={form.linkedin_url}
                    onChange={(e) =>
                      setForm({ ...form, linkedin_url: e.target.value })
                    }
                    placeholder="https://linkedin.com/..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    className="pl-9"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="name@iim..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  className="pl-9"
                  value={form.phone_number}
                  onChange={(e) =>
                    setForm({ ...form, phone_number: e.target.value })
                  }
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(c) => setForm({ ...form, is_active: c })}
                />
                <Label>Active Status</Label>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Order:</Label>
                <Input
                  type="number"
                  className="w-20 h-8"
                  value={form.display_order}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      display_order: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              Save Member
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- ARCHIVE DIALOG --- */}
      <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Move to Alumni</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              This will mark <strong>{memberToArchive?.name}</strong> as an
              alumnus.
            </p>
            <div className="space-y-2">
              <Label>Batch Year</Label>
              <Input
                value={archiveBatch}
                onChange={(e) => setArchiveBatch(e.target.value)}
                placeholder="2024"
              />
            </div>
            <Button
              onClick={handleArchive}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              Confirm Archive
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
