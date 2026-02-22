import { useState, useEffect, useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  useHeroBanners,
  useCreateHeroBanner,
  useUpdateHeroBanner,
  useDeleteHeroBanner,
  HeroBanner,
} from "@/hooks/useHeroBanners";
import { useSiteSettings, useUpdateSiteSetting } from "@/hooks/useSiteSettings";
import { ImageUpload } from "@/components/admin/ImageUpload";
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
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  GripVertical,
  Layers,
  Type,
} from "lucide-react";
import { toast } from "sonner";

const initialBannerForm = {
  image_url: "",
  display_order: 0,
  is_active: true,
  title: "", // Not used for main display anymore, but kept for alt text
  subtitle: "",
};

export default function AdminHeroBanners() {
  const { data: banners, isLoading: loadingBanners } = useHeroBanners();
  const { data: settings, isLoading: loadingSettings } = useSiteSettings();

  const createBanner = useCreateHeroBanner();
  const updateBanner = useUpdateHeroBanner();
  const deleteBanner = useDeleteHeroBanner();
  const updateSetting = useUpdateSiteSetting();

  // --- STATE: Text Content ---
  const [heroContent, setHeroContent] = useState({
    hero_line_1: "",
    hero_line_2: "",
    hero_line_3: "",
    hero_description: "",
    hero_cta_text: "",
    hero_cta_link: "",
  });

  // --- STATE: Banner Dialog ---
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [bannerForm, setBannerForm] = useState(initialBannerForm);

  // Load Settings
  // Optimize settings lookup by creating a map
  const settingsMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (settings) {
      for (const s of settings) {
        map[s.setting_key] = s.setting_value;
      }
    }
    return map;
  }, [settings]);
  useEffect(() => {
    if (settings) {
      setHeroContent({
        hero_line_1: settingsMap.hero_line_1 || "",
        hero_line_2: settingsMap.hero_line_2 || "",
        hero_line_3: settingsMap.hero_line_3 || "",
        hero_description: settingsMap.hero_description || "",
        hero_cta_text: settingsMap.hero_cta_text || "",
        hero_cta_link: settingsMap.hero_cta_link || "",
      });
    }
  }, [settingsMap, settings]);

  // Save Text Content
  const handleSaveContent = async () => {
    try {
      const keys = Object.keys(heroContent);
      await Promise.all(
        keys.map((key) => {
          const settingObj = settings?.find((s) => s.setting_key === key);
          return settingObj
            ? updateSetting.mutateAsync({
                id: settingObj.id,
                setting_value: heroContent[key as keyof typeof heroContent],
              })
            : Promise.resolve();
        }),
      );
      toast.success("Hero text updated");
    } catch (e) {
      toast.error("Failed to save text");
    }
  };

  // Save Background Image
  const handleSubmitBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.image_url) return toast.error("Image is required");
    try {
      if (editingId) {
        await updateBanner.mutateAsync({ id: editingId, ...bannerForm });
        toast.success("Background updated");
      } else {
        await createBanner.mutateAsync(bannerForm);
        toast.success("Background added");
      }
      setIsDialogOpen(false);
    } catch (err) {
      toast.error("Failed to save");
    }
  };

  // Memoize initialBannerForm to prevent unnecessary re-renders
  const memoizedInitialBannerForm = useMemo(() => initialBannerForm, []);
  const openNew = () => {
    setBannerForm(memoizedInitialBannerForm);
    setEditingId(null);
    setIsDialogOpen(true);
  };
  const handleEdit = (b: HeroBanner) => {
    // Memoize the banner object to prevent unnecessary renders
    setBannerForm({
      title: b.title || "",
      subtitle: b.subtitle || "",
      image_url: b.image_url,
      display_order: b.display_order,
      is_active: b.is_active,
    });
    setEditingId(b.id);
    setIsDialogOpen(true);
  };

  if (loadingBanners || loadingSettings)
    return (
      <AdminLayout title="Hero Section">
        <Loader2 className="animate-spin" />
      </AdminLayout>
    );

  return (
    <AdminLayout title="Hero Section">
      <div className="space-y-8 pb-10">
        {/* --- 1. TEXT CONTENT EDITOR --- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2">
              <Type className="w-5 h-5 text-accent" /> Hero Text & Overlay
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Title Line 1 (White)</Label>
                <Input
                  value={heroContent.hero_line_1}
                  onChange={(e) =>
                    setHeroContent({
                      ...heroContent,
                      hero_line_1: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Title Line 2 (Faded)</Label>
                <Input
                  value={heroContent.hero_line_2}
                  onChange={(e) =>
                    setHeroContent({
                      ...heroContent,
                      hero_line_2: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Title Line 3 (Colored)</Label>
                <Input
                  value={heroContent.hero_line_3}
                  onChange={(e) =>
                    setHeroContent({
                      ...heroContent,
                      hero_line_3: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={heroContent.hero_description}
                onChange={(e) =>
                  setHeroContent({
                    ...heroContent,
                    hero_description: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Button Text</Label>
                <Input
                  value={heroContent.hero_cta_text}
                  onChange={(e) =>
                    setHeroContent({
                      ...heroContent,
                      hero_cta_text: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Button Link</Label>
                <Input
                  value={heroContent.hero_cta_link}
                  onChange={(e) =>
                    setHeroContent({
                      ...heroContent,
                      hero_cta_link: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <Button
              onClick={handleSaveContent}
              disabled={updateSetting.isPending}
            >
              {updateSetting.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}{" "}
              Save Content
            </Button>
          </CardContent>
        </Card>

        {/* --- 2. BACKGROUND SLIDESHOW --- */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex gap-2">
              <Layers className="w-5 h-5 text-blue-500" /> Background Slideshow
            </CardTitle>
            <Button size="sm" onClick={openNew} className="gap-2">
              <Plus className="w-4 h-4" /> Add Image
            </Button>
          </CardHeader>
          <CardContent>
            {banners && banners.length > 0 ? (
              <div className="grid gap-3">
                {banners.map((banner) => (
                  <div
                    key={banner.id}
                    className="flex items-center gap-4 p-3 border rounded-lg bg-slate-50/50"
                  >
                    <div className="w-24 h-16 bg-slate-200 rounded overflow-hidden flex-shrink-0 relative">
                      <img
                        src={banner.image_url}
                        className={`w-full h-full object-cover ${!banner.is_active && "opacity-50 grayscale"}`}
                        alt={banner.title || "Hero banner image"}
                      />
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-slate-300" />
                      <span className="text-xs font-mono text-muted-foreground">
                        Order: {banner.display_order}
                      </span>
                      {!banner.is_active && (
                        <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Edit banner"
                        onClick={() => handleEdit(banner)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        aria-label="Delete banner"
                        onClick={() => {
                          if (confirm("Delete?"))
                            deleteBanner.mutate(banner.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No background images yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog for Image Upload */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Image" : "Add Background Image"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitBanner} className="space-y-4 pt-4">
              <ImageUpload
                value={bannerForm.image_url}
                onChange={(url) =>
                  setBannerForm({ ...bannerForm, image_url: url })
                }
                folder="banners"
                label="Background Image *"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={bannerForm.is_active}
                    onCheckedChange={(c) =>
                      setBannerForm({ ...bannerForm, is_active: c })
                    }
                  />
                  <Label>Active</Label>
                </div>
                <Input
                  type="number"
                  className="w-24"
                  placeholder="Order"
                  value={bannerForm.display_order}
                  min={0}
                  onChange={(e) => {
                    let val = parseInt(e.target.value);
                    if (isNaN(val) || val < 0) val = 0;
                    setBannerForm({
                      ...bannerForm,
                      display_order: val,
                    });
                  }}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createBanner.isPending || updateBanner.isPending}
              >
                Save Image
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
