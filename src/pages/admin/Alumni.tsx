import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAlumniMembers, useTeamMutations } from "@/hooks/useTeamData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Undo2,
  Trash2,
  Loader2,
  Search,
  Phone,
  Pencil,
  Linkedin,
  Mail,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/ImageUpload";

// Initial state for the form
const initialForm = {
  name: "",
  designation: "",
  batch_year: "",
  image_url: "",
  linkedin_url: "",
  email: "",
  phone_number: "",
};

export default function AdminAlumni() {
  const { data: alumni, isLoading } = useAlumniMembers();
  // Added createMember to mutations
  const { restoreToTeam, deleteMember, updateMember, createMember } =
    useTeamMutations();

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);

  // --- Actions ---

  const handleRestore = async (id: string, name: string) => {
    if (confirm(`Restore ${name} to current team?`)) {
      try {
        await restoreToTeam.mutateAsync(id);
        toast.success("Restored to active team");
      } catch (e) {
        toast.error("Failed to restore");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure? This action cannot be undone.")) {
      try {
        await deleteMember.mutateAsync(id);
        toast.success("Alumni record deleted");
      } catch (e) {
        toast.error("Failed to delete");
      }
    }
  };

  const openNew = () => {
    setForm(initialForm);
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const openEdit = (member: any) => {
    setForm({
      name: member.name,
      designation: member.designation,
      batch_year: member.batch_year || "",
      image_url: member.image_url || "",
      linkedin_url: member.linkedin_url || "",
      email: member.email || "",
      phone_number: member.phone_number || "",
    });
    setEditingId(member.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update existing
        await updateMember.mutateAsync({ id: editingId, ...form });
        toast.success("Alumni updated successfully");
      } else {
        // Create new (Force is_alumni=true)
        await createMember.mutateAsync({
          ...form,
          is_alumni: true,
          is_active: false,
          display_order: 99, // Default order for alumni
        });
        toast.success("Alumni added successfully");
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Failed to save record");
    }
  };

  // --- Filter ---
  const filteredAlumni = alumni?.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.batch_year?.includes(searchTerm),
  );

  if (isLoading)
    return (
      <AdminLayout title="Alumni">
        <Loader2 className="animate-spin mx-auto mt-10" />
      </AdminLayout>
    );

  return (
    <AdminLayout
      title="Alumni Directory"
      description="Manage past council members and their contact info."
      actions={
        <Button onClick={openNew} className="gap-2">
          <Plus className="w-4 h-4" /> Add Alumni
        </Button>
      }
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Alumni Records</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name or batch..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlumni && filteredAlumni.length > 0 ? (
                filteredAlumni.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={member.image_url || ""} />
                          <AvatarFallback>
                            {member.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-medium text-sm block">
                            {member.name}
                          </span>
                          {/* Mini Contact Row */}
                          <div className="flex gap-2 mt-0.5">
                            {member.linkedin_url && (
                              <a
                                href={member.linkedin_url}
                                target="_blank"
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <Linkedin className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {member.email && (
                              <a
                                href={`mailto:${member.email}`}
                                className="text-slate-400 hover:text-red-600"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {member.phone_number && (
                              <a
                                href={`tel:${member.phone_number}`}
                                className="text-slate-400 hover:text-green-600"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {member.designation}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-slate-50 text-slate-600 font-mono"
                      >
                        {member.batch_year || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(member)}
                          title="Edit Details"
                        >
                          <Pencil className="h-4 w-4 text-slate-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRestore(member.id, member.name)}
                          title="Restore to Team"
                        >
                          <Undo2 className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(member.id)}
                          title="Delete Permanently"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No alumni found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --- ADD / EDIT DIALOG --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Alumni" : "Add New Alumni"}
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
                <Label>Batch Year</Label>
                <Input
                  value={form.batch_year}
                  onChange={(e) =>
                    setForm({ ...form, batch_year: e.target.value })
                  }
                  placeholder="e.g. 2024"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Former Designation</Label>
              <Input
                value={form.designation}
                onChange={(e) =>
                  setForm({ ...form, designation: e.target.value })
                }
                placeholder="e.g. Secretary"
              />
            </div>

            <ImageUpload
              value={form.image_url}
              onChange={(url) => setForm({ ...form, image_url: url })}
              folder="team"
              label="Profile Photo"
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    className="pl-9"
                    value={form.phone_number}
                    onChange={(e) =>
                      setForm({ ...form, phone_number: e.target.value })
                    }
                    placeholder="+91..."
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
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>LinkedIn URL</Label>
              <div className="relative">
                <Linkedin className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  className="pl-9"
                  value={form.linkedin_url}
                  onChange={(e) =>
                    setForm({ ...form, linkedin_url: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingId ? "Save Changes" : "Add Alumni"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
