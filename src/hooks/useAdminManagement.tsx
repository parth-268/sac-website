import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAdminManagement = () => {
  // 1. Create a new Admin Login
  const registerAdmin = useMutation({
    mutationFn: async ({ email, password, name, memberId }: any) => {
      const { error } = await supabase.rpc("create_admin_user", {
        target_email: email,
        target_password: password,
        target_name: name,
        target_member_id: memberId, // Passing the Team Member ID
      });
      if (error) throw error;
    },
    onSuccess: () => toast.success("Admin access granted!"),
    onError: (e: any) => toast.error(e.message || "Failed to create user"),
  });

  // 2. Revoke Admin Login
  const revokeAdmin = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.rpc("delete_admin_by_email", {
        target_email: email,
      });
      if (error) throw error;
    },
    onSuccess: () => toast.success("Access revoked."),
    onError: (e: any) => console.error("Revoke failed:", e),
  });

  // 3. Reset Password
  const resetUserPassword = useMutation({
    mutationFn: async ({ email, password }: any) => {
      const { error } = await supabase.rpc("update_admin_password", {
        target_email: email,
        new_password: password,
      });
      if (error) throw error;
    },
    onSuccess: () => toast.success("Password updated."),
    onError: (e: any) => toast.error(e.message),
  });

  // 4. Update MY OWN Password
  const updateMyPassword = useMutation({
    mutationFn: async (newPassword: string) => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
    },
    onSuccess: () => toast.success("Your password has been changed."),
    onError: (e: any) => toast.error(e.message),
  });

  // 5. Update MY OWN Profile
  const updateMyProfile = useMutation({
    mutationFn: async ({
      email,
      fullName,
    }: {
      email?: string;
      fullName?: string;
    }) => {
      const user = await supabase.auth.getUser();
      const updates: any = {};
      if (email) updates.email = email;
      if (fullName) updates.data = { full_name: fullName };

      const { error: authError } = await supabase.auth.updateUser(updates);
      if (authError) throw authError;

      if (fullName && user.data.user) {
        // Try updating profile, ignore if missing
        await supabase
          .from("profiles")
          .update({ full_name: fullName })
          .eq("user_id", user.data.user.id); // Using user_id based on your schema
      }
    },
    onSuccess: () => toast.success("Profile updated."),
    onError: (e: any) => toast.error(e.message),
  });

  return {
    registerAdmin,
    revokeAdmin,
    resetUserPassword,
    updateMyPassword,
    updateMyProfile,
  };
};
