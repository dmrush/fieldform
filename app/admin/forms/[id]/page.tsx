"use client";
import { useEffect, useState } from "react";
 import { useParams } from "next/navigation";
 import { supabase } from "@/lib/supabase";
 
 type FieldType = "text" | "textarea" | "number" | "select" | "date";
 type FormData = {
   id: string;
   title: string;
   description: string | null;
   fields: { id: string; type: FieldType; label: string; required: boolean; options?: string[] }[];
 };
 
 type SubmissionRow = {
   id: string;
   created_at: string | null;
   submitted_by: string;
  answers: Record<string, unknown>;
 };
 
 export default function AdminFormDetailPage() {
   const params = useParams<{ id: string }>();
   const formId = params?.id || "";
   const [form, setForm] = useState<FormData | null>(null);
   const [subs, setSubs] = useState<SubmissionRow[]>([]);
   const [names, setNames] = useState<Record<string, string>>({});
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
 
   useEffect(() => {
     const run = async () => {
       if (!formId) return;
       const f = await supabase.from("forms").select("id,title,description,fields").eq("id", formId).maybeSingle();
       if (f.error || !f.data) {
         setError(f.error?.message || "Form not found");
         setLoading(false);
         return;
       }
       setForm(f.data as FormData);
       const s = await supabase
         .from("submissions")
         .select("id,created_at,submitted_by,answers")
         .eq("form_id", formId)
         .order("created_at", { ascending: false });
       if (s.error) {
         setError(s.error.message);
         setLoading(false);
         return;
       }
       const subsData = (s.data || []) as SubmissionRow[];
       setSubs(subsData);
       const ids = Array.from(new Set(subsData.map((r) => r.submitted_by))).filter(Boolean);
       if (ids.length > 0) {
         const u = await supabase.from("users").select("id,name").in("id", ids);
         if (!u.error && u.data) {
           const map: Record<string, string> = {};
           for (const row of u.data as { id: string; name: string | null }[]) {
             map[row.id] = row.name || "Worker";
           }
           setNames(map);
         }
       }
       setLoading(false);
     };
     run();
   }, [formId]);
 
 
 
   return (
     <div className="space-y-8">
       {loading ? (
         <div className="text-zinc-600">Loading…</div>
       ) : error ? (
         <div className="rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>
       ) : (
         <>
           <div>
             <h1 className="text-2xl font-semibold">{form?.title}</h1>
             {form?.description && <p className="mt-2 text-zinc-600">{form.description}</p>}
           </div>
           <div>
             <h2 className="text-lg font-semibold">Structure</h2>
             <div className="mt-3 space-y-2">
               {form?.fields.map((f) => (
                 <div key={f.id} className="rounded-lg border border-zinc-200 p-3">
                   <div className="text-sm font-medium text-zinc-900">{f.label}</div>
                   <div className="text-xs text-zinc-600">{f.type}{f.required ? " • required" : ""}</div>
                 </div>
               ))}
             </div>
           </div>
           <div>
             <h2 className="text-lg font-semibold">Submissions</h2>
             {subs.length === 0 ? (
               <div className="mt-3 rounded-lg border border-zinc-200 p-6 text-zinc-600">No submissions yet.</div>
             ) : (
               <div className="mt-3 space-y-3">
                 {subs.map((r) => (
                   <div key={r.id} className="rounded-lg border border-zinc-200 p-4">
                     <div className="flex items-center justify-between">
                       <div className="text-sm font-medium text-zinc-900">{names[r.submitted_by] || r.submitted_by}</div>
                       <div className="text-xs text-zinc-600">{r.created_at ? new Date(r.created_at).toLocaleString() : ""}</div>
                     </div>
                     <div className="mt-3 space-y-2">
                       {form?.fields.map((f) => (
                         <div key={f.id} className="text-sm">
                           <span className="font-medium text-zinc-900">{f.label}:</span>{" "}
                           <span className="text-zinc-700">
                             {String(r.answers?.[f.id] ?? "")}
                           </span>
                         </div>
                       ))}
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>
         </>
       )}
     </div>
   );
 }
