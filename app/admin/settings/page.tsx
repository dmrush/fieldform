"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
 
 function rnd(len = 8) {
   const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
   let out = "";
   for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
   return out;
 }
 
 export default function AdminSettingsPage() {
   const { profile } = useAuth();
   const orgId = profile?.organization_id || null;
   const [name, setName] = useState<string>("");
   const [code, setCode] = useState<string>("");
   const [copied, setCopied] = useState(false);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
 
  const reload = useCallback(async () => {
    setError(null);
    setLoading(true);
    setName("");
    setCode("");
    if (!orgId) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.from("organizations").select("name,invite_code").eq("id", orgId).maybeSingle();
    if (error) {
      setError(error.message);
    } else if (data) {
      setName(data.name || "");
      setCode(data.invite_code || "");
    }
    setLoading(false);
  }, [orgId]);

  useEffect(() => {
    const t = setTimeout(() => {
      void reload();
    }, 0);
    return () => clearTimeout(t);
  }, [reload]);

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<string>;
      if (ce.detail === "settings") {
        void reload();
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("ff:nav", handler as EventListener);
      return () => window.removeEventListener("ff:nav", handler as EventListener);
    }
  }, [reload]);
 
   const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
   const link = code ? `${origin}/join?code=${code}` : "";
 
   const onCopy = async () => {
     if (!link) return;
     try {
       await navigator.clipboard.writeText(link);
       setCopied(true);
       setTimeout(() => setCopied(false), 1500);
     } catch {}
   };
 
   const onRegen = async () => {
     if (!orgId) return;
     const ok = typeof window !== "undefined" ? window.confirm("Regenerate invite code? Existing links will stop working.") : true;
     if (!ok) return;
     const next = rnd(8);
     const { error } = await supabase.from("organizations").update({ invite_code: next }).eq("id", orgId);
     if (error) {
       setError(error.message);
       return;
     }
     setCode(next);
   };
 
   return (
     <div className="space-y-8">
       <div>
         <h1 className="text-2xl font-semibold">Settings</h1>
         <p className="mt-2 text-zinc-600">Organization and invite settings.</p>
       </div>
       {error && <div className="rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>}
       {loading ? (
         <div className="text-zinc-600">Loading…</div>
       ) : (
         <div className="space-y-6">
           <div className="rounded-2xl border border-zinc-200 p-6">
             <div className="text-sm font-medium text-zinc-600">Organization Name</div>
             <div className="mt-2 text-lg font-semibold text-zinc-900">{name || "—"}</div>
           </div>
           <div className="rounded-2xl border border-zinc-200 p-6">
             <div className="text-sm font-medium text-zinc-600">Invite Code</div>
             <div className="mt-2 text-lg font-semibold text-zinc-900">{code || "—"}</div>
             <div className="mt-4 flex flex-wrap items-center gap-3">
               <button onClick={onRegen} className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                 Regenerate Code
               </button>
             </div>
           </div>
           <div className="rounded-2xl border border-zinc-200 p-6">
             <div className="text-sm font-medium text-zinc-600">Invite Link</div>
             <div className="mt-2 text-sm text-zinc-900">{link || "—"}</div>
             <div className="mt-4 flex flex-wrap items-center gap-3">
               <button onClick={onCopy} disabled={!link} className="inline-flex items-center rounded-lg ring-1 ring-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 disabled:opacity-60">
                 {copied ? "Copied!" : "Copy Invite Link"}
               </button>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 }
