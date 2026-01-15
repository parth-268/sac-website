import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  useHeroBanners,
  useCreateHeroBanner,
  useUpdateHeroBanner,
  useDeleteHeroBanner,
} from "@/hooks/useHeroBanners";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Image,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type HeroBanner = Tables<"hero_banners">;

interface BannerForm {
  title: string;
  subtitle: string;
  image_url: string;
  cta_text: string;
  cta_link: string;
  display_order: number;
  is_active: boolean;
}

const emptyForm: BannerForm = {
  title: "",
  subtitle: "",
  image_url: "",
  cta_text: "",
  cta_link: "",
  display_order: 0,
  is_active: true,
};

const AdminHeroBanners = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BannerForm>(emptyForm);

  const { data: banners, isLoading } = useHeroBanners();
  const createBanner = useCreateHeroBanner();
  const updateBanner = useUpdateHeroBanner();
  const deleteBanner = useDeleteHeroBanner();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.image_url) {
      toast.error("Please upload a banner image");
      return;
    }

    try {
      if (editingId) {
        await updateBanner.mutateAsync({ id: editingId, ...form });
        toast.success("Banner updated");
      } else {
        await createBanner.mutateAsync(form);
        toast.success("Banner created");
      }
      setDialogOpen(false);
      setForm(emptyForm);
      setEditingId(null);
    } catch (error) {
      toast.error("Failed to save banner");
    }
  };

  const handleEdit = (banner: HeroBanner) => {
    setForm({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      image_url: banner.image_url,
      cta_text: banner.cta_text || "",
      cta_link: banner.cta_link || "",
      display_order: banner.display_order,
      is_active: banner.is_active,
    });
    setEditingId(banner.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this banner?")) {
      try {
        await deleteBanner.mutateAsync(id);
        toast.success("Banner deleted");
      } catch (error) {
        toast.error("Failed to delete banner");
      }
    }
  };

  const toggleActive = async (banner: HeroBanner) => {
    try {
      await updateBanner.mutateAsync({
        id: banner.id,
        is_active: !banner.is_active,
      });
      toast.success(`Banner ${banner.is_active ? "deactivated" : "activated"}`);
    } catch (error) {
      toast.error("Failed to update banner");
    }
  };

  const openNewDialog = () => {
    setForm(emptyForm);
    setEditingId(null);
    setDialogOpen(true);
  };

  return (
    <AdminLayout title="Hero Banners">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">
          Manage homepage hero banners and carousel slides
        </p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="gold" onClick={openNewDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Banner" : "Add Banner"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <ImageUpload
                value={form.image_url}
                onChange={(url) => setForm({ ...form, image_url: url })}
                folder="banners"
                label="Banner Image *"
              />

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Banner headline..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={form.subtitle}
                  onChange={(e) =>
                    setForm({ ...form, subtitle: e.target.value })
                  }
                  placeholder="Supporting text..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cta_text">Button Text</Label>
                  <Input
                    id="cta_text"
                    value={form.cta_text}
                    onChange={(e) =>
                      setForm({ ...form, cta_text: e.target.value })
                    }
                    placeholder="Learn More"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cta_link">Button Link</Label>
                  <Input
                    id="cta_link"
                    value={form.cta_link}
                    onChange={(e) =>
                      setForm({ ...form, cta_link: e.target.value })
                    }
                    placeholder="/about"
                  />
                </div>
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
                disabled={createBanner.isPending || updateBanner.isPending}
              >
                {(createBanner.isPending || updateBanner.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingId ? "Update" : "Create"} Banner
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : banners && banners.length > 0 ? (
        <div className="grid gap-4">
          {banners.map((banner) => (
            <Card
              key={banner.id}
              className={`overflow-hidden ${!banner.is_active ? "opacity-60" : ""}`}
            >
              <CardContent className="p-0">
                <div className="flex items-stretch">
                  {/* Banner Image Preview */}
                  <div className="w-48 h-32 flex-shrink-0">
                    <img
                      src={banner.image_url}
                      alt={banner.title || "Banner"}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Banner Info */}
                  <div className="flex-1 p-4 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Order: {banner.display_order}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          banner.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {banner.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground">
                      {banner.title || "(No title)"}
                    </h3>
                    {banner.subtitle && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {banner.subtitle}
                      </p>
                    )}
                    {banner.cta_text && (
                      <p className="text-xs text-accent mt-1">
                        Button: {banner.cta_text} → {banner.cta_link || "#"}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 p-4 border-l border-border">
                    <Switch
                      checked={banner.is_active}
                      onCheckedChange={() => toggleActive(banner)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(banner)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(banner.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No banners yet
          </h3>
          <p className="text-muted-foreground mb-4">
            Add your first hero banner
          </p>
          <Button variant="gold" onClick={openNewDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Banner
          </Button>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminHeroBanners;
