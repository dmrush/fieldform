 import { NextResponse } from "next/server";
 import { createClient } from "@supabase/supabase-js";
 
 const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
 const key = process.env.SUPABASE_SERVICE_ROLE || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
 const supa = createClient(url, key);
 
 export async function POST(req: Request) {
   try {
     const body = await req.json();
     const payload = {
       event: String(body?.event || ""),
       duration_ms: Number(body?.duration || 0),
       organization_id: String(body?.organization_id || ""),
       created_at: new Date().toISOString(),
     };
     if (!payload.event) return NextResponse.json({ ok: false }, { status: 400 });
     try {
       await supa.from("perf_metrics").insert(payload);
     } catch {}
     return NextResponse.json({ ok: true }, { status: 200 });
   } catch {
     return NextResponse.json({ ok: false }, { status: 400 });
   }
 }
