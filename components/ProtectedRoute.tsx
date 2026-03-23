"use client";
import { ReactNode, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

type Props = {
  allowedRole?: "admin" | "worker";
  children: ReactNode;
};

function dashboardFor(role: "admin" | "worker") {
  return role === "admin" ? "/admin/dashboard" : "/worker/dashboard";
}

export default function ProtectedRoute({ allowedRole, children }: Props) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const bypass =
    typeof process !== "undefined" &&
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_BYPASS_ADMIN_GUARD === "1";

  useEffect(() => {
    if (loading || bypass) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (allowedRole && profile?.role && profile.role !== allowedRole) {
      router.replace(dashboardFor(profile.role));
    }
  }, [loading, user, profile, allowedRole, router, bypass]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-zinc-600">Loading</div>
      </div>
    );
  }
  return <>{children}</>;
}
