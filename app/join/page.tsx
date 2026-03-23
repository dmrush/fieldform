"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function genEmail() {
  const suffix = Math.random().toString(36).slice(2, 10);
  return `worker-${suffix}@example.local`;
}

function JoinClient() {
  const router = useRouter();
  const params = useSearchParams();
  const code = params.get("code") || "";
  const [valid, setValid] = useState(false);
  const [orgName, setOrgName] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    const run = async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("id,name")
        .eq("invite_code", code)
        .maybeSingle();
      if (error || !data) {
        setValid(false);
        setOrgId(null);
        setOrgName(null);
      } else {
        setValid(true);
        setOrgId(data.id);
        setOrgName(data.name);
      }
    };
    run();
  }, [code]);

  const disabled = useMemo(() => !valid || !name || !password, [valid, name, password]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const email = genEmail();
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
    if (!userId || !orgId) {
      setError("Unable to initialize session");
      setLoading(false);
      return;
    }
    const { error: profErr } = await supabase
      .from("users")
      .upsert({ id: userId, name, role: "worker", organization_id: orgId });
    if (profErr) {
      setError(profErr.message);
      setLoading(false);
      return;
    }
    setLoading(false);
    router.replace("/worker/dashboard");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-2xl font-semibold">Join Organization</h1>
        {!code && <p className="mt-2 text-zinc-600">Provide an invite link with a code parameter.</p>}
        {code && !valid && (
          <div className="mt-4 rounded-lg bg-red-50 text-red-700 px-4 py-3">
            Invalid or expired invite code.
          </div>
        )}
        {valid && (
          <div className="mt-2 text-zinc-600">
            Joining <span className="font-medium text-zinc-900">{orgName}</span>
          </div>
        )}
        {valid && (
          <form onSubmit={onSubmit} className="mt-8 space-y-4" aria-labelledby="join-heading">
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
              disabled={disabled || loading}
              className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 disabled:opacity-60"
            >
              {loading ? "Creating..." : "Join"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function WorkerJoinPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading</div>}>
      <JoinClient />
    </Suspense>
  );
}
