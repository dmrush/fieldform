"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function randomCode(len = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const code = randomCode(8);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }
    if (!signUpData.session) {
      await supabase.auth.signInWithPassword({ email, password });
    }
    const userId = signUpData.user?.id || (await supabase.auth.getUser()).data.user?.id || "";
    if (!userId) {
      setError("Unable to initialize session");
      setLoading(false);
      return;
    }
    const { data: orgRes, error: orgErr } = await supabase
      .from("organizations")
      .insert({ name: org, invite_code: code })
      .select("id")
      .single();
    if (orgErr) {
      setError(orgErr.message);
      setLoading(false);
      return;
    }
    const orgId = orgRes.id;
    const { error: profErr } = await supabase
      .from("users")
      .upsert({ id: userId, name, role: "admin", organization_id: orgId });
    if (profErr) {
      setError(profErr.message);
      setLoading(false);
      return;
    }
    setLoading(false);
    router.replace("/admin/dashboard");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-2xl font-semibold">Register as Admin</h1>
        <p className="mt-2 text-zinc-600">Create your organization and admin account.</p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4" aria-labelledby="register-heading">
          <label className="block">
            <span className="text-sm font-medium text-zinc-700">Organization Name</span>
            <input
              type="text"
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-700">Your Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </label>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
