import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  useSacReports,
  useCreateSacReport,
  useUpdateSacReport,
  useDeleteSacReport,
} from "@/hooks/useSacReports";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  Loader2,
  FileText,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type SacReport = Tables<"sac_reports">;

const AdminReports = () => {
  const { data: reports, isLoading } = useSacReports();
  const createReport = useCreateSacReport();
  const updateReport = useUpdateSacReport();
  const deleteReport = useDeleteSacReport();
  const { uploadFile, uploading } = useFileUpload();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<SacReport | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    academic_year: "",
    file_url: "",
    description: "",
    display_order: 0,
  });

  const resetForm = () => {
    setFormData({
      title: "",
      academic_year: "",
      file_url: "",
      description: "",
      display_order: 0,
    });
    setEditingReport(null);
  };

  const openEditDialog = (report: SacReport) => {
    setEditingReport(report);
    setFormData({
      title: report.title,
      academic_year: report.academic_year,
      file_url: report.file_url,
      description: report.description || "",
      display_order: report.display_order,
    });
    setIsDialogOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await uploadFile(file, "reports");
    if (result) {
      setFormData((prev) => ({ ...prev, file_url: result.url }));
      toast.success("PDF uploaded");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingReport) {
        await updateReport.mutateAsync({ id: editingReport.id, ...formData });
        toast.success("Report updated");
      } else {
        await createReport.mutateAsync(formData);
        toast.success("Report created");
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      toast.error("Failed to save report");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this report?")) return;
    try {
      await deleteReport.mutateAsync(id);
      toast.success("Report deleted");
    } catch (err) {
      toast.error("Failed to delete report");
    }
  };

  const toggleActive = async (report: SacReport) => {
    try {
      await updateReport.mutateAsync({
        id: report.id,
        is_active: !report.is_active,
      });
      toast.success(`Report ${report.is_active ? "hidden" : "published"}`);
    } catch (err) {
      toast.error("Failed to update report");
    }
  };

  return (
    <AdminLayout title="SAC Reports">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Annual Reports Archive</CardTitle>
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
                Add Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingReport ? "Edit Report" : "Add New Report"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Report Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g., Annual SAC Report"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Academic Year *</Label>
                  <Input
                    value={formData.academic_year}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        academic_year: e.target.value,
                      })
                    }
                    placeholder="e.g., 2024-25"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>PDF File *</Label>
                  <div className="flex items-center gap-4">
                    {formData.file_url && (
                      <a
                        href={formData.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-accent hover:underline"
                      >
                        <FileText className="h-4 w-4" />
                        View PDF
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    <label className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted">
                        {uploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        Upload PDF
                      </div>
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Brief description of the report"
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
                    disabled={
                      createReport.isPending ||
                      updateReport.isPending ||
                      !formData.file_url
                    }
                  >
                    {(createReport.isPending || updateReport.isPending) && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {editingReport ? "Update" : "Create"}
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
          ) : reports && reports.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      {report.title}
                    </TableCell>
                    <TableCell>{report.academic_year}</TableCell>
                    <TableCell>
                      <Switch
                        checked={report.is_active}
                        onCheckedChange={() => toggleActive(report)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(report)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(report.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No reports added yet
            </p>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminReports;
