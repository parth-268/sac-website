import { useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { AuthContext } from "./AuthContextBase";
import { supabase } from "@/integrations/supabase/client";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditor, setIsEditor] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkUserRoles = useCallback(async (userId: string) => {
    try {
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching roles:", error);
        setIsAdmin(false);
        setIsEditor(false);
        return;
      }

      if (roles && roles.length > 0) {
        const hasAdmin = roles.some((r) => r.role === "admin");
        const hasEditor = roles.some(
          (r) => r.role === "editor" || r.role === "admin",
        );
        setIsAdmin(hasAdmin);
        setIsEditor(hasEditor);
        console.log("Roles loaded:", { hasAdmin, hasEditor, roles });
      } else {
        setIsAdmin(false);
        setIsEditor(false);
        console.log("No roles found for user");
      }
    } catch (err) {
      console.error("Role check error:", err);
      setIsAdmin(false);
      setIsEditor(false);
    }
  }, []);

  const refreshRoles = useCallback(async () => {
    if (user?.id) {
      await checkUserRoles(user.id);
    }
  }, [user?.id, checkUserRoles]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Use setTimeout to avoid blocking the auth state change
        setTimeout(() => {
          checkUserRoles(session.user.id);
        }, 0);
      } else {
        setIsAdmin(false);
        setIsEditor(false);
      }

      setLoading(false);
    });

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await checkUserRoles(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [checkUserRoles]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error && data.user) {
      // Immediately check roles after successful sign in
      await checkUserRoles(data.user.id);
    }
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName },
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setIsEditor(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isEditor,
        isAdmin,
        signIn,
        signUp,
        signOut,
        refreshRoles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
