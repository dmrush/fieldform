 import { NextResponse } from "next/server";
 import { createClient } from "@supabase/supabase-js";
 
 const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
 const key = process.env.SUPABASE_SERVICE_ROLE || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
 const supa = createClient(url, key);
 
 const cache = new Map<string, { ts: number; data: { labels: string[]; points: number[] } }>();
 const TTL = 30_000;
 
 function fmt(d: Date) {
   return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
 }
 
 export async function GET(req: Request) {
   const u = new URL(req.url);
   const org = u.searchParams.get("org") || "";
   const range = (u.searchParams.get("range") || "month").toLowerCase();
  const fresh = u.searchParams.get("fresh") === "1";
   if (!org) return NextResponse.json({ error: "org_required" }, { status: 400 });
   const now = Date.now();
   const keyC = `${org}:${range}`;
  const hit = cache.get(keyC);
  if (!fresh && hit && now - hit.ts < TTL) return NextResponse.json(hit.data, { status: 200 });
 
   const days = range === "week" ? 7 : 30;
   const start = new Date();
   start.setHours(0, 0, 0, 0);
   start.setDate(start.getDate() - (days - 1));
   const { data, error } = await supa
     .from("submissions")
     .select("id,created_at")
     .eq("organization_id", org)
     .gte("created_at", start.toISOString());
   if (error) return NextResponse.json({ labels: [], points: [] }, { status: 200 });
   const map = new Map<string, number>();
   for (let i = 0; i < days; i++) {
     const d = new Date(start);
     d.setDate(start.getDate() + i);
     map.set(fmt(d), 0);
   }
   for (const row of data || []) {
     const t = new Date(row.created_at as string);
     const k = fmt(t);
     if (map.has(k)) map.set(k, (map.get(k) || 0) + 1);
   }
   const labels = Array.from(map.keys());
   const points = Array.from(map.values());
   const payload = { labels, points };
   cache.set(keyC, { ts: now, data: payload });
   return NextResponse.json(payload, { status: 200 });
 }
