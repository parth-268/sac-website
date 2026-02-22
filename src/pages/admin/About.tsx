import { useState, useEffect, useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  useAboutContent,
  useUpsertAboutContent,
} from "@/hooks/useAboutContent";
import { useSiteSettings, useUpdateSiteSetting } from "@/hooks/useSiteSettings"; // Import Settings Hook
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Users, Target } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminAbout = () => {
  // 1. Hooks for Mission/Vision
  const { data: aboutContent, isLoading: loadingContent } = useAboutContent();
  const upsertContent = useUpsertAboutContent();

  // 2. Hooks for Batch Stats (Site Settings)
  const { data: settings, isLoading: loadingSettings } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();

  // --- States ---
  const [content, setContent] = useState({
    title: "About SAC",
    description: "",
    mission: "",
    vision: "",
  });
  const [isContentDirty, setIsContentDirty] = useState(false);

  const [batchData, setBatchData] = useState({
    batch_1_label: "",
    batch_1_male: "",
    batch_1_female: "",
    batch_2_label: "",
    batch_2_male: "",
    batch_2_female: "",
  });
  const [isBatchDirty, setIsBatchDirty] = useState(false);

  // --- Memoized settings map ---
  const settingsMap = useMemo(() => {
    if (!settings) return {};
    const map: Record<
      string,
      { id: string; setting_key: string; setting_value: string }
    > = {};
    settings.forEach((s) => {
      map[s.setting_key] = s;
    });
    return map;
  }, [settings]);

  // --- Load Data ---
  useEffect(() => {
    if (aboutContent) {
      setContent({
        title: aboutContent.title,
        description: aboutContent.description,
        mission: aboutContent.mission || "",
        vision: aboutContent.vision || "",
      });
      setIsContentDirty(false);
    }
  }, [aboutContent]);

  useEffect(() => {
    if (settings) {
      setBatchData({
        batch_1_label: settingsMap["batch_1_label"]?.setting_value || "",
        batch_1_male: settingsMap["batch_1_male"]?.setting_value || "0",
        batch_1_female: settingsMap["batch_1_female"]?.setting_value || "0",
        batch_2_label: settingsMap["batch_2_label"]?.setting_value || "",
        batch_2_male: settingsMap["batch_2_male"]?.setting_value || "0",
        batch_2_female: settingsMap["batch_2_female"]?.setting_value || "0",
      });
      setIsBatchDirty(false);
    }
  }, [settings, settingsMap]);

  // --- Handlers ---
  const handleSaveContent = async () => {
    try {
      await upsertContent.mutateAsync({
        title: content.title,
        description: content.description,
        mission: content.mission || null,
        vision: content.vision || null,
      });
      toast.success("Mission & Vision saved");
      setIsContentDirty(false);
    } catch (error) {
      toast.error("Failed to save content");
    }
  };

  const handleSaveBatchData = async () => {
    try {
      const keys = Object.keys(batchData);
      await Promise.all(
        keys.map((key) => {
          const settingObj = settingsMap[key];
          if (settingObj) {
            return updateSetting.mutateAsync({
              id: settingObj.id,
              setting_value: String(
                Number(batchData[key as keyof typeof batchData]) || 0,
              ),
            });
          }
          return Promise.resolve();
        }),
      );
      toast.success("Batch stats saved");
      setIsBatchDirty(false);
    } catch (error) {
      toast.error("Failed to save stats");
    }
  };

  if (loadingContent || loadingSettings)
    return (
      <AdminLayout title="About Section">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin" />
        </div>
      </AdminLayout>
    );

  return (
    <AdminLayout title="About Section">
      <div className="max-w-4xl space-y-8 pb-10">
        {/* --- SECTION 1: MISSION & VISION --- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2">
              <Target className="w-5 h-5 text-accent" /> Strategic Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Section Title</Label>
              <Input
                value={content.title}
                onChange={(e) => {
                  setContent({ ...content, title: e.target.value });
                  setIsContentDirty(true);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Main Description</Label>
              <Textarea
                value={content.description}
                onChange={(e) => {
                  setContent({ ...content, description: e.target.value });
                  setIsContentDirty(true);
                }}
                rows={3}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-accent">Our Mission</Label>
                <Textarea
                  className="min-h-[120px]"
                  value={content.mission}
                  onChange={(e) => {
                    setContent({ ...content, mission: e.target.value });
                    setIsContentDirty(true);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-500">Our Vision</Label>
                <Textarea
                  className="min-h-[120px]"
                  value={content.vision}
                  onChange={(e) => {
                    setContent({ ...content, vision: e.target.value });
                    setIsContentDirty(true);
                  }}
                />
              </div>
            </div>
            <Button
              onClick={handleSaveContent}
              disabled={upsertContent.isPending || !isContentDirty}
            >
              {upsertContent.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}{" "}
              Save Content
            </Button>
          </CardContent>
        </Card>

        {/* --- SECTION 2: BATCH PROFILE --- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2">
              <Users className="w-5 h-5 text-green-600" /> Batch Profile Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Batch 1 */}
            <div className="p-4 border rounded-lg bg-slate-50/50">
              <h3 className="font-bold text-sm mb-3 text-slate-700">
                Senior Batch (Batch 1)
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Batch Name</Label>
                  <Input
                    value={batchData.batch_1_label}
                    onChange={(e) => {
                      setBatchData({
                        ...batchData,
                        batch_1_label: e.target.value,
                      });
                      setIsBatchDirty(true);
                    }}
                    placeholder="MBA 2024-26"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Male Count</Label>
                  <Input
                    type="number"
                    value={batchData.batch_1_male}
                    onChange={(e) => {
                      setBatchData({
                        ...batchData,
                        batch_1_male: e.target.value,
                      });
                      setIsBatchDirty(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Female Count</Label>
                  <Input
                    type="number"
                    value={batchData.batch_1_female}
                    onChange={(e) => {
                      setBatchData({
                        ...batchData,
                        batch_1_female: e.target.value,
                      });
                      setIsBatchDirty(true);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Batch 2 */}
            <div className="p-4 border rounded-lg bg-slate-50/50">
              <h3 className="font-bold text-sm mb-3 text-slate-700">
                Junior Batch (Batch 2)
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Batch Name</Label>
                  <Input
                    value={batchData.batch_2_label}
                    onChange={(e) => {
                      setBatchData({
                        ...batchData,
                        batch_2_label: e.target.value,
                      });
                      setIsBatchDirty(true);
                    }}
                    placeholder="MBA 2025-27"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Male Count</Label>
                  <Input
                    type="number"
                    value={batchData.batch_2_male}
                    onChange={(e) => {
                      setBatchData({
                        ...batchData,
                        batch_2_male: e.target.value,
                      });
                      setIsBatchDirty(true);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Female Count</Label>
                  <Input
                    type="number"
                    value={batchData.batch_2_female}
                    onChange={(e) => {
                      setBatchData({
                        ...batchData,
                        batch_2_female: e.target.value,
                      });
                      setIsBatchDirty(true);
                    }}
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={handleSaveBatchData}
              disabled={updateSetting.isPending || !isBatchDirty}
            >
              {updateSetting.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}{" "}
              Save Statistics
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAbout;
