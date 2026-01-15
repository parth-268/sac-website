import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  useCommittees,
  useCreateCommittee,
  useUpdateCommittee,
  useDeleteCommittee,
} from "@/hooks/useCommittees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Pencil, Trash2, Loader2, Building2 } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface CommitteeForm {
  name: string;
  description: string;
  icon: string;
  display_order: number;
  is_active: boolean;
}

const emptyForm: CommitteeForm = {
  name: "",
  description: "",
  icon: "Users",
  display_order: 0,
  is_active: true,
};

const iconOptions = [
  "Users",
  "Palette",
  "Trophy",
  "Briefcase",
  "Heart",
  "BookOpen",
  "Megaphone",
  "Globe",
  "Music",
  "Camera",
  "Code",
  "Lightbulb",
];

const AdminCommittees = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CommitteeForm>(emptyForm);

  const { data: committees, isLoading } = useCommittees();
  const createCommittee = useCreateCommittee();
  const updateCommittee = useUpdateCommittee();
  const deleteCommittee = useDeleteCommittee();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await updateCommittee.mutateAsync({ id: editingId, ...form });
        toast.success("Committee updated");
      } else {
        await createCommittee.mutateAsync(form);
        toast.success("Committee created");
      }
      setDialogOpen(false);
      setForm(emptyForm);
      setEditingId(null);
    } catch (error) {
      toast.error("Failed to save committee");
    }
  };

  const handleEdit = (committee: NonNullable<typeof committees>[number]) => {
    setForm({
      name: committee.name,
      description: committee.description,
      icon: committee.icon,
      display_order: committee.display_order,
      is_active: committee.is_active,
    });
    setEditingId(committee.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this committee?")) {
      try {
        await deleteCommittee.mutateAsync(id);
        toast.success("Committee deleted");
      } catch (error) {
        toast.error("Failed to delete committee");
      }
    }
  };

  const openNewDialog = () => {
    setForm(emptyForm);
    setEditingId(null);
    setDialogOpen(true);
  };

  return (
    <AdminLayout title="Committees Management">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">Manage SAC committees and clubs</p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="gold" onClick={openNewDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Committee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Committee" : "Create Committee"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Cultural Committee"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <select
                  id="icon"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {iconOptions.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={form.display_order}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      display_order: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={form.is_active}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, is_active: checked })
                  }
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={
                  createCommittee.isPending || updateCommittee.isPending
                }
              >
                {(createCommittee.isPending || updateCommittee.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingId ? "Update" : "Create"} Committee
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : committees && committees.length > 0 ? (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {committees.map((committee) => (
                <TableRow key={committee.id}>
                  <TableCell className="font-medium">
                    {committee.name}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {committee.description}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        committee.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {committee.is_active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(committee)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(committee.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No committees yet
          </h3>
          <p className="text-muted-foreground mb-4">
            Create your first committee or club
          </p>
          <Button variant="gold" onClick={openNewDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Committee
          </Button>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCommittees;
