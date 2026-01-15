import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  useSiteSettings,
  useUpdateSiteSetting,
  useCreateSiteSetting,
} from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Save, Loader2, Settings2 } from "lucide-react";
import { toast } from "sonner";

const AdminSiteSettings = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();
  const createSetting = useCreateSiteSetting();

  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSetting, setNewSetting] = useState({
    setting_key: "",
    setting_label: "",
    setting_value: "",
    setting_type: "text",
    display_order: 0,
  });

  // Initialize edited values from settings
  useEffect(() => {
    if (settings) {
      const values: Record<string, string> = {};
      settings.forEach((s) => {
        values[s.id] = s.setting_value;
      });
      setEditedValues(values);
    }
  }, [settings]);

  const handleValueChange = (id: string, value: string) => {
    setEditedValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async (id: string) => {
    try {
      await updateSetting.mutateAsync({ id, setting_value: editedValues[id] });
      toast.success("Setting updated");
    } catch (err) {
      toast.error("Failed to update setting");
    }
  };

  const handleCreateSetting = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSetting.mutateAsync(newSetting);
      toast.success("Setting created");
      setIsDialogOpen(false);
      setNewSetting({
        setting_key: "",
        setting_label: "",
        setting_value: "",
        setting_type: "text",
        display_order: 0,
      });
    } catch (err) {
      toast.error("Failed to create setting");
    }
  };

  const hasChanged = (id: string, originalValue: string) => {
    return editedValues[id] !== originalValue;
  };

  return (
    <AdminLayout title="Site Settings">
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Global Settings
              </CardTitle>
              <CardDescription>
                Manage global values like contact info, copyright text, and more
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Setting
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Setting</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateSetting} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Setting Key *</Label>
                    <Input
                      value={newSetting.setting_key}
                      onChange={(e) =>
                        setNewSetting({
                          ...newSetting,
                          setting_key: e.target.value
                            .toLowerCase()
                            .replace(/\s+/g, "_"),
                        })
                      }
                      placeholder="e.g., contact_email"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Unique identifier (lowercase, underscores)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Display Label *</Label>
                    <Input
                      value={newSetting.setting_label}
                      onChange={(e) =>
                        setNewSetting({
                          ...newSetting,
                          setting_label: e.target.value,
                        })
                      }
                      placeholder="e.g., Contact Email"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={newSetting.setting_type}
                      onValueChange={(value) =>
                        setNewSetting({ ...newSetting, setting_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Single Line Text</SelectItem>
                        <SelectItem value="textarea">
                          Multi-line Text
                        </SelectItem>
                        <SelectItem value="url">URL</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Initial Value</Label>
                    {newSetting.setting_type === "textarea" ? (
                      <Textarea
                        value={newSetting.setting_value}
                        onChange={(e) =>
                          setNewSetting({
                            ...newSetting,
                            setting_value: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <Input
                        type={
                          newSetting.setting_type === "email"
                            ? "email"
                            : newSetting.setting_type === "url"
                              ? "url"
                              : "text"
                        }
                        value={newSetting.setting_value}
                        onChange={(e) =>
                          setNewSetting({
                            ...newSetting,
                            setting_value: e.target.value,
                          })
                        }
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Display Order</Label>
                    <Input
                      type="number"
                      value={newSetting.display_order}
                      onChange={(e) =>
                        setNewSetting({
                          ...newSetting,
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
                    <Button type="submit" disabled={createSetting.isPending}>
                      {createSetting.isPending && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Create
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : settings && settings.length > 0 ? (
              <div className="space-y-6">
                {settings.map((setting) => (
                  <div key={setting.id} className="border-b pb-6 last:border-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <Label className="text-base">
                          {setting.setting_label}
                        </Label>
                        <p className="text-xs text-muted-foreground mb-2">
                          Key: {setting.setting_key}
                        </p>
                        {setting.setting_type === "textarea" ? (
                          <Textarea
                            value={editedValues[setting.id] || ""}
                            onChange={(e) =>
                              handleValueChange(setting.id, e.target.value)
                            }
                            rows={3}
                          />
                        ) : (
                          <Input
                            type={
                              setting.setting_type === "email"
                                ? "email"
                                : setting.setting_type === "url"
                                  ? "url"
                                  : "text"
                            }
                            value={editedValues[setting.id] || ""}
                            onChange={(e) =>
                              handleValueChange(setting.id, e.target.value)
                            }
                          />
                        )}
                      </div>
                      <Button
                        onClick={() => handleSave(setting.id)}
                        disabled={
                          !hasChanged(setting.id, setting.setting_value) ||
                          updateSetting.isPending
                        }
                        className="shrink-0"
                      >
                        {updateSetting.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No settings configured yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSiteSettings;
