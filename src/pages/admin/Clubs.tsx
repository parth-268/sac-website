import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  useClubs,
  useCreateClub,
  useUpdateClub,
  useDeleteClub,
} from "@/hooks/useClubs";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Club = Tables<"clubs">;

const AdminClubs = () => {
  const { data: clubs, isLoading } = useClubs();
  const createClub = useCreateClub();
  const updateClub = useUpdateClub();
  const deleteClub = useDeleteClub();
  const { uploadFile, uploading } = useFileUpload();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "Users",
    image_url: "",
    head_name: "",
    head_email: "",
    head_phone: "",
    instagram_url: "",
    linkedin_url: "",
    member_count: 0,
    activities: [] as string[],
    display_order: 0,
  });
  const [activitiesInput, setActivitiesInput] = useState("");

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      icon: "Users",
      image_url: "",
      head_name: "",
      head_email: "",
      head_phone: "",
      instagram_url: "",
      linkedin_url: "",
      member_count: 0,
      activities: [],
      display_order: 0,
    });
    setActivitiesInput("");
    setEditingClub(null);
  };

  const openEditDialog = (club: Club) => {
    setEditingClub(club);
    setFormData({
      name: club.name,
      description: club.description,
      icon: club.icon,
      image_url: club.image_url || "",
      head_name: club.head_name || "",
      head_email: club.head_email || "",
      head_phone: club.head_phone || "",
      instagram_url: club.instagram_url || "",
      linkedin_url: club.linkedin_url || "",
      member_count: club.member_count || 0,
      activities: club.activities || [],
      display_order: club.display_order,
    });
    setActivitiesInput((club.activities || []).join(", "));
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
    const activities = activitiesInput
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    try {
      if (editingClub) {
        await updateClub.mutateAsync({
          id: editingClub.id,
          ...formData,
          activities,
        });
        toast.success("Club updated");
      } else {
        await createClub.mutateAsync({ ...formData, activities });
        toast.success("Club created");
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      toast.error("Failed to save club");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this club?")) return;
    try {
      await deleteClub.mutateAsync(id);
      toast.success("Club deleted");
    } catch (err) {
      toast.error("Failed to delete club");
    }
  };

  const toggleActive = async (club: Club) => {
    try {
      await updateClub.mutateAsync({ id: club.id, is_active: !club.is_active });
      toast.success(`Club ${club.is_active ? "deactivated" : "activated"}`);
    } catch (err) {
      toast.error("Failed to update club");
    }
  };

  return (
    <AdminLayout title="Clubs & Contingents">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Manage Clubs</CardTitle>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Club
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingClub ? "Edit Club" : "Add New Club"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                    <Label>Icon Name</Label>
                    <Input
                      value={formData.icon}
                      onChange={(e) =>
                        setFormData({ ...formData, icon: e.target.value })
                      }
                      placeholder="e.g., Users, Music, Camera"
                    />
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Club Head Name</Label>
                    <Input
                      value={formData.head_name}
                      onChange={(e) =>
                        setFormData({ ...formData, head_name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Member Count</Label>
                    <Input
                      type="number"
                      value={formData.member_count}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          member_count: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Head Email</Label>
                    <Input
                      type="email"
                      value={formData.head_email}
                      onChange={(e) =>
                        setFormData({ ...formData, head_email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Head Phone</Label>
                    <Input
                      value={formData.head_phone}
                      onChange={(e) =>
                        setFormData({ ...formData, head_phone: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Instagram URL</Label>
                    <Input
                      value={formData.instagram_url}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          instagram_url: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>LinkedIn URL</Label>
                    <Input
                      value={formData.linkedin_url}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          linkedin_url: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Activities (comma-separated)</Label>
                  <Input
                    value={activitiesInput}
                    onChange={(e) => setActivitiesInput(e.target.value)}
                    placeholder="e.g., Workshops, Competitions, Events"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        display_order: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createClub.isPending || updateClub.isPending}
                  >
                    {(createClub.isPending || updateClub.isPending) && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {editingClub ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Head</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clubs?.map((club) => (
                  <TableRow key={club.id}>
                    <TableCell className="font-medium">{club.name}</TableCell>
                    <TableCell>{club.head_name || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {club.member_count || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={club.is_active}
                        onCheckedChange={() => toggleActive(club)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(club)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(club.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminClubs;
