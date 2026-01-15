import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  useAboutContent,
  useUpsertAboutContent,
  useAboutStats,
  useUpsertAboutStats,
} from "@/hooks/useAboutContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

interface StatItem {
  label: string;
  value: string;
  display_order: number;
}

const AdminAbout = () => {
  const { data: aboutContent, isLoading: loadingContent } = useAboutContent();
  const { data: aboutStats, isLoading: loadingStats } = useAboutStats();
  const upsertContent = useUpsertAboutContent();
  const upsertStats = useUpsertAboutStats();

  const [content, setContent] = useState({
    title: "About SAC",
    description: "",
    mission: "",
    vision: "",
  });

  const [stats, setStats] = useState<StatItem[]>([]);

  useEffect(() => {
    if (aboutContent) {
      setContent({
        title: aboutContent.title,
        description: aboutContent.description,
        mission: aboutContent.mission || "",
        vision: aboutContent.vision || "",
      });
    }
  }, [aboutContent]);

  useEffect(() => {
    if (aboutStats) {
      setStats(
        aboutStats.map((s) => ({
          label: s.label,
          value: s.value,
          display_order: s.display_order,
        })),
      );
    }
  }, [aboutStats]);

  const handleSaveContent = async () => {
    try {
      await upsertContent.mutateAsync({
        title: content.title,
        description: content.description,
        mission: content.mission || null,
        vision: content.vision || null,
      });
      toast.success("About content saved");
    } catch (error) {
      toast.error("Failed to save content");
    }
  };

  const handleSaveStats = async () => {
    try {
      await upsertStats.mutateAsync(
        stats.map((s, i) => ({
          label: s.label,
          value: s.value,
          display_order: i,
        })),
      );
      toast.success("Stats saved");
    } catch (error) {
      toast.error("Failed to save stats");
    }
  };

  const addStat = () => {
    setStats([...stats, { label: "", value: "", display_order: stats.length }]);
  };

  const removeStat = (index: number) => {
    setStats(stats.filter((_, i) => i !== index));
  };

  const updateStat = (index: number, field: keyof StatItem, value: string) => {
    const updated = [...stats];
    updated[index] = { ...updated[index], [field]: value };
    setStats(updated);
  };

  const isLoading = loadingContent || loadingStats;

  return (
    <AdminLayout title="About Section">
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Content Section */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="font-heading text-lg font-semibold mb-4">
              About Content
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Section Title</Label>
                <Input
                  id="title"
                  value={content.title}
                  onChange={(e) =>
                    setContent({ ...content, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={content.description}
                  onChange={(e) =>
                    setContent({ ...content, description: e.target.value })
                  }
                  rows={4}
                  placeholder="Main description about SAC..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mission">Mission Statement</Label>
                <Textarea
                  id="mission"
                  value={content.mission}
                  onChange={(e) =>
                    setContent({ ...content, mission: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vision">Vision Statement</Label>
                <Textarea
                  id="vision"
                  value={content.vision}
                  onChange={(e) =>
                    setContent({ ...content, vision: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <Button
                variant="gold"
                onClick={handleSaveContent}
                disabled={upsertContent.isPending}
              >
                {upsertContent.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                <Save className="h-4 w-4 mr-2" />
                Save Content
              </Button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-heading text-lg font-semibold">Statistics</h2>
              <Button variant="outline" size="sm" onClick={addStat}>
                <Plus className="h-4 w-4 mr-2" />
                Add Stat
              </Button>
            </div>

            {stats.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No statistics added yet. Click "Add Stat" to create one.
              </p>
            ) : (
              <div className="space-y-4">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="flex gap-4 items-start p-4 bg-secondary/50 rounded-lg"
                  >
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Value (e.g., 500+)</Label>
                        <Input
                          value={stat.value}
                          onChange={(e) =>
                            updateStat(index, "value", e.target.value)
                          }
                          placeholder="500+"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Label (e.g., Students)</Label>
                        <Input
                          value={stat.label}
                          onChange={(e) =>
                            updateStat(index, "label", e.target.value)
                          }
                          placeholder="Students"
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeStat(index)}
                      className="text-destructive hover:text-destructive mt-6"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Button
              variant="gold"
              onClick={handleSaveStats}
              disabled={upsertStats.isPending}
              className="mt-4"
            >
              {upsertStats.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              <Save className="h-4 w-4 mr-2" />
              Save Statistics
            </Button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminAbout;
