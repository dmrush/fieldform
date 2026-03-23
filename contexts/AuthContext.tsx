"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { usePathname, useRouter } from "next/navigation";

type Role = "admin" | "worker" | null;

type Profile = {
  id: string;
  name: string | null;
  role: Role;
  organization_id: string | null;
};

type AuthContextValue = {
  user: { id: string; email: string | null } | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthContextValue["user"]>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const sess = data.session;
      if (!mounted) return;
      if (sess?.user) {
        const u = { id: sess.user.id, email: sess.user.email ?? null };
        setUser(u);
        const { data: p } = await supabase
          .from("users")
          .select("id,name,role,organization_id")
          .eq("id", u.id)
          .maybeSingle();
        if (p) {
          setProfile({
            id: p.id,
            name: p.name ?? null,
            role: (p.role as Role) ?? null,
            organization_id: p.organization_id ?? null,
          });
        } else {
          setProfile(null);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    };
    init();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        const u = { id: session.user.id, email: session.user.email ?? null };
        setUser(u);
        const { data: p } = await supabase
          .from("users")
          .select("id,name,role,organization_id")
          .eq("id", u.id)
          .maybeSingle();
        if (p) {
          setProfile({
            id: p.id,
            name: p.name ?? null,
            role: (p.role as Role) ?? null,
            organization_id: p.organization_id ?? null,
          });
        } else {
          setProfile(null);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!loading && user && pathname === "/login") {
      if (profile?.role === "admin") router.replace("/admin/dashboard");
      else if (profile?.role === "worker") router.replace("/worker/dashboard");
    }
  }, [loading, user, profile, pathname, router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      signOut: async () => {
        try {
          await supabase.auth.signOut();
        } catch {}
        try {
          if (typeof window !== "undefined") {
            for (let i = 0; i < window.localStorage.length; i++) {
              const k = window.localStorage.key(i);
              if (k && k.startsWith("dashboard_counts:")) {
                window.localStorage.removeItem(k);
              }
            }
          }
        } catch {}
        setUser(null);
        setProfile(null);
        router.replace("/login");
      },
    }),
    [user, profile, loading, router]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
