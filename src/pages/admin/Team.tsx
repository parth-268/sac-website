import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  GraduationCap,
  KeyRound,
  UserCog,
  Linkedin,
} from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

// Helper for initials
const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

// Initial Form State
const initialForm = {
  name: "",
  designation: "",
  image_url: "",
  linkedin_url: "",
  email: "",
  phone: "",
  display_order: 0,
  is_active: true,
};

export default function AdminTeam() {
  const { data: members, isLoading } = useTeamMembers();
  const { createMember, updateMember, deleteMember, moveToAlumni } =
    useTeamMutations();
  const { registerAdmin, resetUserPassword, revokeAdmin } =
    useAdminManagement();

  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAccessOpen, setIsAccessOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  // Selection States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState(initialForm);

  // Admin Dialog States
  const [adminPassword, setAdminPassword] = useState("");
  const [adminTab, setAdminTab] = useState("grant");
  const [archiveBatch, setArchiveBatch] = useState(
    new Date().getFullYear().toString(),
  );

  // --- HANDLERS ---
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateMember.mutateAsync({ id: editingId, ...formData });
    } else {
      await createMember.mutateAsync(formData);
    }
    setIsFormOpen(false);
  };

  const handleDelete = async (member: TeamMember) => {
    if (!confirm("Delete member? This revokes admin access immediately."))
      return;
    if (member.email) await revokeAdmin.mutateAsync(member.email);
    deleteMember.mutate(member.id);
  };

  const handleArchive = async () => {
    if (!selectedMember || !archiveBatch) return;
    if (selectedMember.email)
      await revokeAdmin.mutateAsync(selectedMember.email);
    await moveToAlumni.mutateAsync({
      id: selectedMember.id,
      batch_year: archiveBatch,
    });
    setIsArchiveOpen(false);
    toast.success("Member archived.");
  };

  const handleAdminAction = async () => {
    if (!selectedMember || !adminPassword) return toast.error("Enter password");

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
    setAdminPassword("");
    setIsAccessOpen(false);
  };

  // --- OPENERS ---
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

  if (isLoading)
    return (
      <AdminLayout title="Team">
        <Loader2 className="animate-spin mx-auto mt-10" />
      </AdminLayout>
    );

  return (
    <AdminLayout
      title="Team Management"
      description="Manage active members and control their dashboard access."
      actions={
        <Button onClick={openNew} className="gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Add Member
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {members?.map((member) => (
          <Card
            key={member.id}
            className={`group relative overflow-hidden transition-all duration-200 hover:shadow-md border-slate-200 ${!member.is_active ? "bg-slate-50/50" : "bg-white"}`}
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                {/* Avatar */}
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
                  {/* Name & Badges Row */}
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

                    {/* Status Badges - Pinned Top Right */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <Badge
                        variant={member.is_active ? "default" : "secondary"}
                        className="h-5 px-2 text-[10px] font-semibold uppercase tracking-wide"
                      >
                        {member.is_active ? "Active" : "Inactive"}
                      </Badge>

                      {/* Admin Badge - Renders if user_id is present */}
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

                  {/* Contact Icons Row */}
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

            {/* Action Footer */}
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

      {/* --- DIALOGS (Kept logic same, just updated style slightly) --- */}

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
                  placeholder="e.g. General Secretary"
                />
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
            <div className="flex items-center gap-2 pt-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(c) =>
                  setFormData({ ...formData, is_active: c })
                }
              />
              <Label>Active Member</Label>
            </div>
            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. Access Dialog */}
      <Dialog open={isAccessOpen} onOpenChange={setIsAccessOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Admin Access</DialogTitle>
            <DialogDescription>
              Manage login for {selectedMember?.name}
            </DialogDescription>
          </DialogHeader>
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
        </DialogContent>
      </Dialog>

      {/* 3. Archive Dialog */}
      <Dialog open={isArchiveOpen} onOpenChange={setIsArchiveOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Move to Alumni</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label>Batch Year</Label>
            <Input
              value={archiveBatch}
              onChange={(e) => setArchiveBatch(e.target.value)}
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
