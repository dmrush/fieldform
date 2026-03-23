"use client";
import Link from "next/link";
import { useEffect, useRef, useState, startTransition, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
 
 export default function AdminDashboardPage() {
   const { profile } = useAuth();
   const orgId = profile?.organization_id || null;
   const [counts, setCounts] = useState<{ forms: number; submissions: number; workers: number }>({
     forms: 0,
     submissions: 0,
     workers: 0,
   });
  const [loading, setLoading] = useState(true);
  const startRef = useRef<number>(0);
  const [range, setRange] = useState<"week" | "month">("month");
  const [labels, setLabels] = useState<string[]>([]);
  const [points, setPoints] = useState<number[]>([]);
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null);
  const countsAbortRef = useRef<AbortController | null>(null);
  const trendsAbortRef = useRef<AbortController | null>(null);
  const refreshTimer = useRef<number | null>(null);
  const chartRef = useRef<HTMLDivElement | null>(null);
 
  const loadCounts = useCallback(async (fresh = false) => {
    if (!orgId) return;
    countsAbortRef.current?.abort();
    const ctrl = new AbortController();
    countsAbortRef.current = ctrl;
    const res = await fetch(`/api/admin/dashboard?org=${orgId}${fresh ? "&fresh=1" : ""}`, { signal: ctrl.signal }).catch(() => null);
    if (!res) return;
    const data = await res.json().catch(() => ({}));
    startTransition(() => {
      setCounts({ forms: data.forms || 0, submissions: data.submissions || 0, workers: data.workers || 0 });
      setLoading(false);
    });
    try {
      const k = `dashboard_counts:${orgId}`;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(k, JSON.stringify({ ts: Date.now(), data }));
      }
    } catch {}
  }, [orgId]);

  const loadTrends = useCallback(async (fresh = false) => {
    if (!orgId) return;
    trendsAbortRef.current?.abort();
    const ctrl = new AbortController();
    trendsAbortRef.current = ctrl;
    const res = await fetch(`/api/admin/trends?org=${orgId}&range=${range}${fresh ? "&fresh=1" : ""}`, { signal: ctrl.signal }).catch(() => null);
    if (!res) return;
    const d = await res.json().catch(() => ({}));
    startTransition(() => {
      setLabels(d.labels || []);
      setPoints(d.points || []);
    });
  }, [orgId, range]);

  const scheduleRealtimeRefresh = useCallback(() => {
    if (refreshTimer.current) {
      window.clearTimeout(refreshTimer.current);
    }
    refreshTimer.current = window.setTimeout(() => {
      loadTrends(true);
      loadCounts(true);
    }, 600);
  }, [loadCounts, loadTrends]);

   useEffect(() => {
     const run = async () => {
       if (!orgId) return;
      startRef.current = performance.now();
      const k = `dashboard_counts:${orgId}`;
      try {
        const cached = typeof window !== "undefined" ? window.localStorage.getItem(k) : null;
        if (cached) {
          const p = JSON.parse(cached);
          if (p && p.ts && Date.now() - p.ts < 5 * 60_000) {
            startTransition(() => {
              setCounts(p.data);
              setLoading(false);
            });
          }
        }
      } catch {}
      await loadCounts(false);
      try {
        const end = performance.now();
        const dur = Math.max(0, Math.round(end - (startRef.current || end)));
        try {
          await fetch("/api/metrics", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ event: "dashboard_load", duration: dur, organization_id: orgId }),
          });
        } catch {}
      } catch {}
    };
     run();
    return () => {
      countsAbortRef.current?.abort();
    };
  }, [orgId, loadCounts]);
 
  useEffect(() => {
    loadTrends(false);
    }, [orgId, range, loadTrends]);

  useEffect(() => {
    if (!orgId) return;
    const channel = supabase
      .channel("public:submissions")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "submissions", filter: orgId ? `organization_id=eq.${orgId}` : undefined },
        () => scheduleRealtimeRefresh()
      )
      .subscribe();
    return () => {
      if (refreshTimer.current) window.clearTimeout(refreshTimer.current);
      trendsAbortRef.current?.abort();
      supabase.removeChannel(channel);
    };
  }, [orgId, range, scheduleRealtimeRefresh]);

  useEffect(() => {
    if (!orgId) return;
    const id = window.setInterval(() => {
      loadTrends(false);
      loadCounts(false);
    }, 30000);
    return () => window.clearInterval(id);
  }, [orgId, loadTrends, loadCounts]);

  const maxVal = useMemo(() => Math.max(1, ...points), [points]);

   return (
    <div className="space-y-6 sm:space-y-8">
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Total Submissions</span>
            <div className="bg-[#16a34a]/10 p-2 rounded-lg text-[#16a34a]">
              <span className="material-symbols-outlined">analytics</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold">{loading ? "…" : counts.submissions}</h3>
            <span className="text-emerald-500 text-sm font-semibold">+12%</span>
          </div>
          <p className="text-slate-400 text-xs mt-2">v.s. last 30 days</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Active Forms</span>
            <div className="bg-indigo-500/10 p-2 rounded-lg text-indigo-500">
              <span className="material-symbols-outlined">list_alt</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold">{loading ? "…" : counts.forms}</h3>
            <span className="text-slate-400 text-sm font-semibold">0%</span>
          </div>
          <p className="text-slate-400 text-xs mt-2">No change this week</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Recent (24h)</span>
            <div className="bg-amber-500/10 p-2 rounded-lg text-amber-500">
              <span className="material-symbols-outlined">history</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold">{loading ? "…" : Math.max(0, points.slice(-1)[0] || 0)}</h3>
            <span className="text-rose-500 text-sm font-semibold">-5%</span>
          </div>
          <p className="text-slate-400 text-xs mt-2">Decreased since yesterday</p>
        </div>
      </section>
      <section className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Submission Trends</h3>
            <p className="text-slate-500 text-sm">Daily volume across all forms</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setRange("week")}
              className={`px-3 py-1.5 text-xs font-bold rounded ${range === "week" ? "bg-[#16a34a] text-white" : "bg-slate-100 text-slate-600"}`}
            >
              Week
            </button>
            <button
              onClick={() => setRange("month")}
              className={`px-3 py-1.5 text-xs font-bold rounded ${range === "month" ? "bg-[#16a34a] text-white" : "bg-slate-100 text-slate-600"}`}
            >
              Month
            </button>
          </div>
        </div>
        <div className="relative w-full h-48 sm:h-56 md:h-64" ref={chartRef}>
          <svg viewBox="0 0 800 200" preserveAspectRatio="none" className="w-full h-full">
            <line x1="0" y1="50" x2="800" y2="50" className="text-slate-100" stroke="currentColor" strokeWidth="1" />
            <line x1="0" y1="100" x2="800" y2="100" className="text-slate-100" stroke="currentColor" strokeWidth="1" />
            <line x1="0" y1="150" x2="800" y2="150" className="text-slate-100" stroke="currentColor" strokeWidth="1" />
            {points.map((v, i) => {
              const bw = 800 / Math.max(points.length, 1) - 10;
              const x = i * (800 / Math.max(points.length, 1)) + 10;
              const h = Math.round((v / maxVal) * 150);
              const y = 190 - h;
              return (
                <rect
                  key={i}
                  x={x}
                  y={y}
                  width={bw}
                  height={h}
                  rx="4"
                  fill="#16a34a"
                  onMouseEnter={(e) => {
                    const rect = chartRef.current?.getBoundingClientRect();
                    const x = rect ? e.clientX - rect.left : e.clientX;
                    const y = rect ? e.clientY - rect.top : e.clientY;
                    setHover({ i, x, y });
                  }}
                  onMouseLeave={() => setHover(null)}
                  onTouchStart={(e) => {
                    const t = e.touches?.[0];
                    if (t) {
                      const rect = chartRef.current?.getBoundingClientRect();
                      const x = rect ? t.clientX - rect.left : t.clientX;
                      const y = rect ? t.clientY - rect.top : t.clientY;
                      setHover({ i, x, y });
                    }
                  }}
                  onTouchEnd={() => setHover(null)}
                />
              );
            })}
          </svg>
          {hover && (
            <div
              style={{ left: hover.x - 40, top: hover.y - 80 }}
              className="pointer-events-none absolute rounded-md bg-slate-900 text-white text-xs px-2 py-1 shadow"
            >
              <div className="font-semibold">{labels[hover.i] || ""}</div>
              <div>{points[hover.i] ?? 0} submissions</div>
            </div>
          )}
        </div>
        <div className="flex justify-between mt-4 text-xs font-medium text-slate-400">
          <span>{labels[0] || ""}</span>
          <span>{labels[Math.floor(labels.length / 2)] || ""}</span>
          <span>{labels[labels.length - 1] || ""}</span>
        </div>
      </section>
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
          <Link href="/admin/submissions" className="text-[#16a34a] text-sm font-semibold hover:underline">
            View All Submissions
          </Link>
        </div>
        <RecentActivity orgId={orgId || ""} />
      </section>
    </div>
   );
 }

function RecentActivity({ orgId }: { orgId: string }) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Array<{ id: string; formName: string; submittedBy: string; createdAt: string | null }>>([]);
  const [total, setTotal] = useState(0);
  const pageSize = 10;
  useEffect(() => {
    const run = async () => {
      if (!orgId) return;
      const r = await fetch(`/api/admin/activity?org=${orgId}&page=${page}&pageSize=${pageSize}`);
      const d = await r.json();
      setItems(d.items || []);
      setTotal(d.total || 0);
    };
    run();
  }, [orgId, page]);
  const canPrev = page > 1;
  const canNext = page * pageSize < total;
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-xs font-bold text-slate-500 uppercase">Form Name</th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-xs font-bold text-slate-500 uppercase">Submission Date</th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-xs font-bold text-slate-500 uppercase hidden sm:table-cell">Submitted By</th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-xs font-bold text-slate-500 uppercase text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-4 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400">description</span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-900">{r.formName}</span>
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-600">{r.createdAt ? new Date(r.createdAt).toLocaleString() : ""}</td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded-full bg-[#16a34a]/20 flex items-center justify-center text-[10px] font-bold text-[#16a34a]">
                      {r.submittedBy?.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs sm:text-sm text-slate-600">{r.submittedBy}</span>
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                  <Link href="/admin/submissions" className="text-slate-400 hover:text-[#16a34a]">
                    <span className="material-symbols-outlined text-xl">open_in_new</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        <div className="text-xs sm:text-sm text-slate-500">
          Page {page} of {Math.max(1, Math.ceil(total / pageSize) || 1)}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!canPrev}
            className="rounded-lg px-3 py-2 text-sm bg-slate-100 text-slate-600 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => (canNext ? p + 1 : p))}
            disabled={!canNext}
            className="rounded-lg px-3 py-2 text-sm bg-slate-100 text-slate-600 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
