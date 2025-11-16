import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { UserRole } from "@/types";
import { termsService } from "@/services/terms";

interface AppUser {
  id: string;
  email: string;
  name: string;
  photo_url?: string;
  role: UserRole;
  wishlist: any[];
}

interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, name: string) => Promise<any>;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  updateUser: (updates: Partial<AppUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ----------------------------------------------------------
  // LOAD USER SESSION + PROFILE + ROLE
  // ----------------------------------------------------------
  const loadUser = async () => {
    try {
      setIsLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setUser(null);
        return;
      }

      const authUser = session.user;
      const email = authUser.email || "";

      // Get profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      // Auto-create missing profile
      if (!profile) {
        await supabase.from("profiles").insert([
          {
            id: authUser.id,
            email,
            name: authUser.user_metadata?.full_name || email.split("@")[0],
            photo_url: authUser.user_metadata?.photo_url || null,
            wishlist: [],
          },
        ]);
      }

      // Get user role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("userid", authUser.id)
        .single();

      const userRole: UserRole = roleData?.role || (email.includes("admin") ? "admin" : "buyer");

      setUser({
        id: authUser.id,
        email: profile?.email || email,
        name: profile?.name || authUser.user_metadata?.full_name || email.split("@")[0],
        photo_url: profile?.photo_url,
        wishlist: profile?.wishlist || [],
        role: userRole,
      });

    } catch (err) {
      console.error("Error loading user:", err);
      setUser(null);

    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // ----------------------------------------------------------
  // UPDATE USER (name/photo)  **IMPORTANT**
  // ----------------------------------------------------------
  const updateUser = async (updates: Partial<AppUser>) => {
    if (!user) return;

    // Update UI instantly
    setUser(prev => prev ? { ...prev, ...updates } : prev);

    // Sync name
    if (updates.name) {
      await supabase
        .from("profiles")
        .update({ name: updates.name, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      await supabase.auth.updateUser({ data: { full_name: updates.name } });
    }

    // Sync photo
    if (updates.photo_url !== undefined) {
      await supabase
        .from("profiles")
        .update({ photo_url: updates.photo_url, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      await supabase.auth.updateUser({ data: { photo_url: updates.photo_url } });
    }

    await loadUser();
  };

  // ----------------------------------------------------------
  // SIGN UP
  // ----------------------------------------------------------
  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error("No user returned.");

      const role: UserRole = email.includes("admin") ? "admin" : "buyer";

      await supabase.from("profiles").insert([
        {
          id: data.user.id,
          email,
          name,
          wishlist: [],
        },
      ]);

      await supabase.from("user_roles").insert([
        {
          userid: data.user.id,
          role,
        },
      ]);

      await termsService.recordTermsAcceptance(data.user.id);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // ----------------------------------------------------------
  // SIGN IN
  // ----------------------------------------------------------
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      await new Promise(r => setTimeout(r, 300));

      await loadUser();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // ----------------------------------------------------------
  // SIGN OUT
  // ----------------------------------------------------------
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // ----------------------------------------------------------
  // ROLE CHECK
  // ----------------------------------------------------------
  const hasRole = (role: UserRole) => {
    if (!user) return false;
    return user.role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
        hasRole,
        updateUser,   // <-- Added here
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
