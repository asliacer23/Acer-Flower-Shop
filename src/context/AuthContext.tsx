import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { UserRole } from "@/types";

interface AppUser {
  id: string;
  email: string;
  name: string;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ----------------------------------------------------------
  // LOAD USER SESSION + PROFILE + ROLE ON REFRESH
  // ----------------------------------------------------------
  const loadUser = async () => {
    try {
      setIsLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const authUser = session.user;
      const userEmail = authUser.email || "";

      // Get profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (profileError) {
        console.warn("Profile not found, creating one...", profileError);
        // Create profile if it doesn't exist
        await supabase.from("profiles").insert([{
          id: authUser.id,
          name: authUser.user_metadata?.name || userEmail.split('@')[0] || "User",
          email: userEmail,
          wishlist: [],
        }]);
      }

      // Get role
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("userid", authUser.id)
        .single();

      let finalRole: UserRole = "buyer";

      if (roleError) {
        console.warn("Role not found, creating role based on email...", roleError);
        // Create role based on email if it doesn't exist
        finalRole = userEmail.includes('admin') ? 'admin' : 'buyer';
        await supabase.from("user_roles").insert([{
          userid: authUser.id,
          role: finalRole,
        }]);
      } else {
        finalRole = (roleData?.role as UserRole) || "buyer";
      }

      const formattedUser: AppUser = {
        id: authUser.id,
        email: profile?.email || userEmail,
        name: profile?.name || authUser.user_metadata?.name || userEmail.split('@')[0] || "User",
        wishlist: profile?.wishlist ?? [],
        role: finalRole,
      };

      console.log("User loaded:", formattedUser);
      setUser(formattedUser);
    } catch (error) {
      console.error("Error loading user:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUser();

    // Auto refresh when auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // ----------------------------------------------------------
  // SIGN UP (AUTH + PROFILE + ROLE)
  // ----------------------------------------------------------
  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth?verified=true`,
        },
      });

      if (error) throw error;
      const authUser = data.user;
      if (!authUser) throw new Error("User not returned by signUp.");

      // Determine role based on email
      const role = email.includes('admin') ? 'admin' : 'buyer';

      // Insert into profiles
      await supabase.from("profiles").insert([
        {
          id: authUser.id,
          name: name,
          email: email,
          wishlist: [],
        },
      ]);

      // Insert into user_roles with proper role
      await supabase.from("user_roles").insert([
        {
          userid: authUser.id,
          role: role,
        },
      ]);

      return { success: true, user: authUser };
    } catch (err: any) {
      console.error(err);
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
      if (!data.session) throw new Error("No session returned");

      // Wait for session to be established
      await new Promise(r => setTimeout(r, 500));
      
      // Fix existing demo admin account role if needed
      if (email.includes('admin')) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("userid", data.user?.id)
          .single();

        // If the admin account has wrong role, update it
        if (roleData?.role === 'buyer') {
          console.log("Fixing admin account role from buyer to admin...");
          await supabase
            .from("user_roles")
            .update({ role: 'admin' })
            .eq("userid", data.user?.id);
        }
      }

      await loadUser();
      
      return { success: true };
    } catch (err: any) {
      console.error("Sign in error:", err);
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
  // ROLE CHECK (admin | buyer | guest)
  // ----------------------------------------------------------
  const hasRole = (role: UserRole) => {
    if (!user) return role === "guest";
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ----------------------------------------------------------
// useAuth hook
// ----------------------------------------------------------
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
