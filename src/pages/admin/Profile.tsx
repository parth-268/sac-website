import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminManagement } from "@/hooks/useAdminManagement";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Lock, User, Mail } from "lucide-react";

export default function AdminSettings() {
  const { user } = useAuth();
  const { updateMyPassword, updateMyProfile } = useAdminManagement();

  const [fullName, setFullName] = useState(
    user?.user_metadata?.full_name || "",
  );
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMyProfile.mutateAsync({ email, fullName });
  };

  const handleSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    await updateMyPassword.mutateAsync(password);
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <AdminLayout
      title="Settings"
      description="Manage your account preferences."
    >
      <div className="max-w-2xl">
        <Tabs defaultValue="profile">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>My Profile</CardTitle>
                <CardDescription>Update your public details.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        className="pl-9"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        className="pl-9"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={updateMyProfile.isPending}>
                    {updateMyProfile.isPending && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}{" "}
                    Save
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Update your login password.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSecurity} className="space-y-4">
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        type="password"
                        className="pl-9"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        type="password"
                        className="pl-9"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={updateMyPassword.isPending}>
                    {updateMyPassword.isPending && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}{" "}
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
