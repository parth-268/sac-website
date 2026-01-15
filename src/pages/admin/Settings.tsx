import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useContactInfo, useUpsertContactInfo } from "@/hooks/useContactInfo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

const AdminSettings = () => {
  const { data: contactInfo, isLoading } = useContactInfo();
  const upsertContactInfo = useUpsertContactInfo();

  const [form, setForm] = useState({
    email: "",
    phone: "",
    address: "",
    map_url: "",
  });

  useEffect(() => {
    if (contactInfo) {
      setForm({
        email: contactInfo.email,
        phone: contactInfo.phone || "",
        address: contactInfo.address || "",
        map_url: contactInfo.map_url || "",
      });
    }
  }, [contactInfo]);

  const handleSave = async () => {
    try {
      await upsertContactInfo.mutateAsync({
        email: form.email,
        phone: form.phone || null,
        address: form.address || null,
        map_url: form.map_url || null,
      });
      toast.success("Contact information saved");
    } catch (error) {
      toast.error("Failed to save contact information");
    }
  };

  return (
    <AdminLayout title="Settings">
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : (
        <div className="max-w-2xl">
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="font-heading text-lg font-semibold mb-4">
              Contact Information
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              This information is displayed in the contact section of the
              website.
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="sac@iimsambalpur.ac.in"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 663 243 0012"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  rows={3}
                  placeholder="Indian Institute of Management Sambalpur..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="map_url">Google Maps URL</Label>
                <Input
                  id="map_url"
                  value={form.map_url}
                  onChange={(e) =>
                    setForm({ ...form, map_url: e.target.value })
                  }
                  placeholder="https://maps.google.com/..."
                />
              </div>

              <Button
                variant="gold"
                onClick={handleSave}
                disabled={upsertContactInfo.isPending || !form.email}
              >
                {upsertContactInfo.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminSettings;
