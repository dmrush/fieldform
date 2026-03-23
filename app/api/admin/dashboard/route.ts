 import { NextResponse } from "next/server";
 import { createClient } from "@supabase/supabase-js";
 
 const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
 const key = process.env.SUPABASE_SERVICE_ROLE || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
 const supa = createClient(url, key);
 
 const cache = new Map<string, { ts: number; data: { forms: number; submissions: number; workers: number } }>();
 const TTL = 30_000;
 
 export async function GET(req: Request) {
   const u = new URL(req.url);
   const org = u.searchParams.get("org") || "";
  const fresh = u.searchParams.get("fresh") === "1";
   if (!org) return NextResponse.json({ error: "org_required" }, { status: 400 });
   const now = Date.now();
   const hit = cache.get(org);
  if (!fresh && hit && now - hit.ts < TTL) {
     return NextResponse.json(hit.data, { status: 200 });
   }
   const [cf, cs, cw] = await Promise.all([
     supa.from("forms").select("*", { count: "exact", head: true }).eq("organization_id", org),
     supa.from("submissions").select("*", { count: "exact", head: true }).eq("organization_id", org),
     supa.from("users").select("*", { count: "exact", head: true }).eq("organization_id", org).eq("role", "worker"),
   ]);
   const data = {
     forms: cf.count || 0,
     submissions: cs.count || 0,
     workers: cw.count || 0,
   };
   cache.set(org, { ts: now, data });
   return NextResponse.json(data, { status: 200 });
 }
