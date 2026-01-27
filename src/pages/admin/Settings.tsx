import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useSiteSettings, useUpdateSiteSetting } from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Mail,
  Globe,
  Facebook,
  Linkedin,
  Instagram,
  Twitter,
  MapPin,
  Phone,
  Copyright,
  Map,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/admin/ImageUpload";

export default function AdminSettings() {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings) {
      const initialValues: Record<string, string> = {};
      settings.forEach((s) => {
        initialValues[s.setting_key] = s.setting_value || "";
      });
      setValues(initialValues);
    }
  }, [settings]);

  const handleChange = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  // Function to handle saving a single setting (used by ImageUpload auto-save)
  const saveSingleSetting = async (key: string, value: string) => {
    try {
      const settingObj = settings?.find((s) => s.setting_key === key);
      if (!settingObj) {
        // If the setting key doesn't exist in DB, we can't update it.
        // You must ensure the SQL insert was run.
        toast.error(`Setting '${key}' not found. Please run database setup.`);
        return;
      }
      await updateSetting.mutateAsync({
        id: settingObj.id,
        setting_value: value,
      });
      toast.success("Logo updated successfully");
    } catch (error) {
      toast.error("Failed to save logo");
    }
  };

  const handleSave = async (keysToSave: string[]) => {
    try {
      const promises = keysToSave.map((key) => {
        const settingObj = settings?.find((s) => s.setting_key === key);
        if (!settingObj) return Promise.resolve();
        return updateSetting.mutateAsync({
          id: settingObj.id,
          setting_value: values[key],
        });
      });
      await Promise.all(promises);
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    }
  };

  if (isLoading)
    return (
      <AdminLayout title="Settings">
        <Loader2 className="animate-spin" />
      </AdminLayout>
    );

  return (
    <AdminLayout title="General Settings">
      <div className="max-w-4xl space-y-8 pb-10">
        {/* --- BRANDING & LOGOS --- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2">
              <ImageIcon className="w-5 h-5 text-purple-500" /> Branding & Logos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              {/* SAC Logo Upload */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  SAC Logo (Navbar)
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Used in the top navigation bar. Recommend a transparent PNG.
                </p>
                <ImageUpload
                  value={values["sac_logo_url"] || ""}
                  onChange={(url) => {
                    handleChange("sac_logo_url", url);
                    if (url) saveSingleSetting("sac_logo_url", url);
                  }}
                  folder="logos" // FIXED: Changed from bucketName to folder
                />
              </div>

              {/* College Logo Upload */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  College Logo (Footer)
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Used in the footer area. Recommend a white/light transparent
                  PNG.
                </p>
                <ImageUpload
                  value={values["college_logo_url"] || ""}
                  onChange={(url) => {
                    handleChange("college_logo_url", url);
                    if (url) saveSingleSetting("college_logo_url", url);
                  }}
                  folder="logos" // FIXED: Changed from bucketName to folder
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- CONTACT INFO --- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2">
              <Mail className="w-5 h-5" /> Contact Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    value={values["contact_email"] || ""}
                    onChange={(e) =>
                      handleChange("contact_email", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    value={values["contact_phone"] || ""}
                    onChange={(e) =>
                      handleChange("contact_phone", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  className="pl-9"
                  value={values["contact_address"] || ""}
                  onChange={(e) =>
                    handleChange("contact_address", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Google Maps Embed URL</Label>
              <div className="relative">
                <Map className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  value={values["contact_map_url"] || ""}
                  onChange={(e) =>
                    handleChange("contact_map_url", e.target.value)
                  }
                  placeholder="http://googleusercontent.com/maps.google.com/..."
                />
              </div>
            </div>

            <Button
              onClick={() =>
                handleSave([
                  "contact_email",
                  "contact_phone",
                  "contact_address",
                  "contact_map_url",
                ])
              }
              disabled={updateSetting.isPending}
            >
              {updateSetting.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}{" "}
              Save Contact Info
            </Button>
          </CardContent>
        </Card>

        {/* --- SOCIAL LINKS --- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2">
              <Globe className="w-5 h-5" /> Social Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Instagram</Label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    value={values["social_instagram"] || ""}
                    onChange={(e) =>
                      handleChange("social_instagram", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>LinkedIn</Label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    value={values["social_linkedin"] || ""}
                    onChange={(e) =>
                      handleChange("social_linkedin", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Twitter</Label>
                <div className="relative">
                  <Twitter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    value={values["social_twitter"] || ""}
                    onChange={(e) =>
                      handleChange("social_twitter", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Facebook</Label>
                <div className="relative">
                  <Facebook className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    value={values["social_facebook"] || ""}
                    onChange={(e) =>
                      handleChange("social_facebook", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() =>
                handleSave([
                  "social_instagram",
                  "social_linkedin",
                  "social_twitter",
                  "social_facebook",
                ])
              }
              disabled={updateSetting.isPending}
            >
              {updateSetting.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}{" "}
              Save Social Links
            </Button>
          </CardContent>
        </Card>

        {/* --- FOOTER SETTINGS --- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2">
              <Copyright className="w-5 h-5" /> Footer Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Copyright Text</Label>
              <Input
                value={values["copyright_text"] || ""}
                onChange={(e) => handleChange("copyright_text", e.target.value)}
                placeholder="© 2024 SAC. All rights reserved."
              />
            </div>
            <Button
              variant="outline"
              onClick={() => handleSave(["copyright_text"])}
              disabled={updateSetting.isPending}
            >
              {updateSetting.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}{" "}
              Save Footer Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
