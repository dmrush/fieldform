"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
 
 type SubmissionRow = {
   id: string;
   form_id: string;
   submitted_by: string;
   created_at: string | null;
 };
 
 export default function AdminSubmissionsPage() {
   const { profile } = useAuth();
   const orgId = profile?.organization_id || null;
   const [subs, setSubs] = useState<SubmissionRow[]>([]);
   const [formNames, setFormNames] = useState<Record<string, string>>({});
   const [userNames, setUserNames] = useState<Record<string, string>>({});
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
 
  const reload = useCallback(async () => {
    setError(null);
    setLoading(true);
    setSubs([]);
    setFormNames({});
    setUserNames({});
    if (!orgId) {
      setLoading(false);
      return;
    }
    const s = await supabase
      .from("submissions")
      .select("id,form_id,submitted_by,created_at")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false });
    if (s.error) {
      setError(s.error.message);
      setLoading(false);
      return;
    }
    const rows = (s.data || []) as SubmissionRow[];
    setSubs(rows);
    const formIds = Array.from(new Set(rows.map((r) => r.form_id))).filter(Boolean);
    const userIds = Array.from(new Set(rows.map((r) => r.submitted_by))).filter(Boolean);
    if (formIds.length > 0) {
      const f = await supabase.from("forms").select("id,title").in("id", formIds);
      if (!f.error && f.data) {
        const map: Record<string, string> = {};
        for (const row of f.data as { id: string; title: string }[]) map[row.id] = row.title;
        setFormNames(map);
      }
    }
    if (userIds.length > 0) {
      const u = await supabase.from("users").select("id,name").in("id", userIds);
      if (!u.error && u.data) {
        const map: Record<string, string> = {};
        for (const row of u.data as { id: string; name: string | null }[]) map[row.id] = row.name || "Worker";
        setUserNames(map);
      }
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
      if (ce.detail === "submissions") {
        void reload();
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("ff:nav", handler as EventListener);
      return () => window.removeEventListener("ff:nav", handler as EventListener);
    }
  }, [reload]);
 
   return (
     <div className="space-y-8">
       <div>
         <h1 className="text-2xl font-semibold">Submissions</h1>
         <p className="mt-2 text-zinc-600">All submissions across your forms.</p>
       </div>
       {error && <div className="rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>}
       {loading ? (
         <div className="text-zinc-600">Loading…</div>
       ) : subs.length === 0 ? (
         <div className="rounded-lg border border-zinc-200 p-6 text-zinc-600">No submissions yet.</div>
       ) : (
         <div className="overflow-x-auto rounded-lg border border-zinc-200">
           <table className="min-w-full divide-y divide-zinc-200">
             <thead className="bg-zinc-50">
               <tr>
                 <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600">Form</th>
                 <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600">Submitted By</th>
                 <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600">Submitted At</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-zinc-200 bg-white">
               {subs.map((r) => (
                 <tr key={r.id}>
                   <td className="px-4 py-3 text-sm text-zinc-700">{formNames[r.form_id] || r.form_id}</td>
                   <td className="px-4 py-3 text-sm text-zinc-700">{userNames[r.submitted_by] || r.submitted_by}</td>
                   <td className="px-4 py-3 text-sm text-zinc-700">
                     {r.created_at ? new Date(r.created_at).toLocaleString() : ""}
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
       )}
     </div>
   );
 }
