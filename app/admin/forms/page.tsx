"use client";
import Link from "next/link";
import { useCallback, useEffect, useState, startTransition } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
 
 type FormRow = {
   id: string;
   title: string;
   description: string | null;
   created_at: string | null;
 };
 
 export default function AdminFormsPage() {
   const { profile } = useAuth();
   const orgId = profile?.organization_id || null;
   const [forms, setForms] = useState<FormRow[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
 
  const reload = useCallback(async () => {
    setError(null);
    setLoading(true);
    setForms([]);
    if (!orgId) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("forms")
      .select("id,title,description,created_at")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false });
    startTransition(() => {
      if (error) {
        setError(error.message);
      } else {
        setForms(data || []);
      }
      setLoading(false);
    });
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
      if (ce.detail === "forms") {
        void reload();
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("ff:nav", handler as EventListener);
      return () => window.removeEventListener("ff:nav", handler as EventListener);
    }
  }, [reload]);
 
   const onDelete = async (id: string) => {
     const ok = typeof window !== "undefined" ? window.confirm("Delete this form?") : true;
     if (!ok) return;
     const { error } = await supabase.from("forms").delete().eq("id", id);
     if (error) {
       setError(error.message);
       return;
     }
     setForms((prev) => prev.filter((f) => f.id !== id));
   };
 
   return (
     <div className="space-y-8">
       <div className="flex items-center justify-between">
         <div>
           <h1 className="text-2xl font-semibold">Forms</h1>
           <p className="mt-2 text-zinc-600">Manage forms for your organization.</p>
         </div>
         <Link href="/admin/forms/new" className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
           Create Form
         </Link>
       </div>
       {error && <div className="rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>}
       {loading ? (
         <div className="text-zinc-600">Loading…</div>
       ) : forms.length === 0 ? (
         <div className="rounded-lg border border-zinc-200 p-6 text-zinc-600">No forms yet.</div>
       ) : (
         <div className="overflow-x-auto rounded-lg border border-zinc-200">
           <table className="min-w-full divide-y divide-zinc-200">
             <thead className="bg-zinc-50">
               <tr>
                 <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600">Title</th>
                 <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600">Description</th>
                 <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600">Created</th>
                 <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-zinc-200 bg-white">
               {forms.map((f) => (
                 <tr key={f.id}>
                   <td className="px-4 py-3 text-sm font-medium text-zinc-900">{f.title}</td>
                   <td className="px-4 py-3 text-sm text-zinc-700">{f.description || ""}</td>
                   <td className="px-4 py-3 text-sm text-zinc-700">
                     {f.created_at ? new Date(f.created_at).toLocaleString() : ""}
                   </td>
                   <td className="px-4 py-3 text-sm">
                     <div className="flex items-center gap-2">
                       <Link
                         href={`/admin/forms/${f.id}`}
                         className="inline-flex items-center rounded-lg ring-1 ring-zinc-200 px-3 py-1.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                       >
                         View
                       </Link>
                      <Link
                        href={`/admin/forms/${f.id}/edit`}
                        className="inline-flex items-center rounded-lg ring-1 ring-emerald-200 px-3 py-1.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
                      >
                        Edit
                      </Link>
                      <button
                         onClick={() => onDelete(f.id)}
                         className="inline-flex items-center rounded-lg ring-1 ring-red-200 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50"
                       >
                         Delete
                       </button>
                     </div>
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
