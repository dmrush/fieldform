 import { NextResponse } from "next/server";
 import { createClient } from "@supabase/supabase-js";
 
 const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
 const key = process.env.SUPABASE_SERVICE_ROLE || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
 const supa = createClient(url, key);
 
 export async function GET(req: Request) {
   const u = new URL(req.url);
   const org = u.searchParams.get("org") || "";
   const page = parseInt(u.searchParams.get("page") || "1", 10);
   const pageSize = Math.min(50, Math.max(1, parseInt(u.searchParams.get("pageSize") || "10", 10)));
   if (!org) return NextResponse.json({ items: [], total: 0 }, { status: 200 });
   const from = (page - 1) * pageSize;
   const to = from + pageSize - 1;
 
   const s = await supa
     .from("submissions")
     .select("id,form_id,submitted_by,created_at", { count: "exact" })
     .eq("organization_id", org)
     .order("created_at", { ascending: false })
     .range(from, to);
   if (s.error) return NextResponse.json({ items: [], total: 0 }, { status: 200 });
   const rows = s.data || [];
   const formIds = Array.from(new Set(rows.map((r) => r.form_id))).filter(Boolean);
   const userIds = Array.from(new Set(rows.map((r) => r.submitted_by))).filter(Boolean);
   const [f, uRes] = await Promise.all([
     formIds.length > 0 ? supa.from("forms").select("id,title").in("id", formIds) : Promise.resolve({ data: [] }),
     userIds.length > 0 ? supa.from("users").select("id,name").in("id", userIds) : Promise.resolve({ data: [] }),
   ]);
  const fMap: Record<string, string> = {};
  const uMap: Record<string, string> = {};
  const fRows: Array<{ id: string; title: string }> = (f.data as Array<{ id: string; title: string }>) || [];
  const uRows: Array<{ id: string; name: string | null }> =
    (uRes.data as Array<{ id: string; name: string | null }>) || [];
  for (const r of fRows) fMap[r.id] = r.title;
  for (const r of uRows) uMap[r.id] = r.name || "Worker";
   const items = rows.map((r) => ({
     id: r.id,
     formName: fMap[r.form_id] || r.form_id,
     submittedBy: uMap[r.submitted_by] || r.submitted_by,
     createdAt: r.created_at,
   }));
   return NextResponse.json({ items, total: s.count || 0 }, { status: 200 });
 }
