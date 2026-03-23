"use client";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
 
 export default function AdminLayout({ children }: { children: React.ReactNode }) {
 const { profile, user, signOut } = useAuth();
 const [sidebarOpen, setSidebarOpen] = useState(false);
 const dispatchNav = (section: "dashboard" | "forms" | "submissions" | "settings") => {
   try {
     if (typeof window !== "undefined") {
       window.dispatchEvent(new CustomEvent("ff:nav", { detail: section }));
     }
   } catch {}
 };
   return (
     <ProtectedRoute allowedRole="admin">
      <div className="min-h-screen bg-[#f6f7f8] text-slate-900" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
        <div className="flex h-screen overflow-hidden">
          <aside className="hidden md:flex w-64 flex-shrink-0 border-r border-slate-200 bg-white flex-col justify-between py-6 px-4">
            <div className="flex flex-col gap-8">
              <div className="flex items-center gap-3 px-2">
                <div className="bg-[#16a34a] size-10 rounded-lg flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-2xl">dynamic_form</span>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-slate-900 text-lg font-bold leading-none">FormBuilder</h1>
                  <p className="text-slate-500 text-xs font-medium">Enterprise Plan</p>
                </div>
              </div>
              <nav className="flex flex-col gap-1">
                <Link href="/admin/dashboard" onClick={() => dispatchNav("dashboard")} className="flex items-center gap-3 px-3 py-3 rounded-lg bg-[#16a34a]/10 text-[#16a34a]">
                  <span className="text-sm font-semibold">Dashboard</span>
                </Link>
                <Link href="/admin/forms" onClick={() => dispatchNav("forms")} className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-600 hover:bg-slate-100">
                  <span className="text-sm font-medium">Forms</span>
                </Link>
                <Link href="/admin/submissions" onClick={() => dispatchNav("submissions")} className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-600 hover:bg-slate-100">
                  <span className="text-sm font-medium">Submissions</span>
                </Link>
                <Link href="/admin/settings" onClick={() => dispatchNav("settings")} className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-600 hover:bg-slate-100">
                  <span className="text-sm font-medium">Settings</span>
                </Link>
              </nav>
            </div>
            <div className="flex flex-col gap-4">
              <Link href="/admin/forms/new" className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#16a34a] py-3 px-4 text-white text-sm font-bold shadow-sm hover:bg-[#16a34a]/90">
                <span>Create New Form</span>
              </Link>
              <div className="flex items-center gap-3 px-2 pt-4 border-t border-slate-200">
                <div className="size-10 rounded-full bg-slate-200 aspect-square" />
                <div className="flex flex-col min-w-0">
                  <p className="text-slate-900 text-sm font-semibold truncate">{profile?.name || user?.email || "Admin"}</p>
                  <p className="text-slate-500 text-xs truncate">Admin Profile</p>
                </div>
                <button onClick={signOut} className="ml-auto rounded-lg px-3 py-2 text-xs text-slate-600 hover:bg-slate-100">Logout</button>
              </div>
            </div>
          </aside>
          <div className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-white border-r border-slate-200 p-4 md:hidden transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
            <div className="flex flex-col gap-8">
              <div className="flex items-center gap-3 px-2">
                <div className="bg-[#16a34a] size-10 rounded-lg flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-2xl">dynamic_form</span>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-slate-900 text-lg font-bold leading-none">FormBuilder</h1>
                  <p className="text-slate-500 text-xs font-medium">Enterprise Plan</p>
                </div>
              </div>
              <nav className="flex flex-col gap-1">
                <Link onClick={() => { setSidebarOpen(false); dispatchNav("dashboard"); }} href="/admin/dashboard" className="flex items-center gap-3 px-3 py-3 rounded-lg bg-[#16a34a]/10 text-[#16a34a]">
                  <span className="text-sm font-semibold">Dashboard</span>
                </Link>
                <Link onClick={() => { setSidebarOpen(false); dispatchNav("forms"); }} href="/admin/forms" className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-600 hover:bg-slate-100">
                  <span className="text-sm font-medium">Forms</span>
                </Link>
                <Link onClick={() => { setSidebarOpen(false); dispatchNav("submissions"); }} href="/admin/submissions" className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-600 hover:bg-slate-100">
                  <span className="text-sm font-medium">Submissions</span>
                </Link>
                <Link onClick={() => { setSidebarOpen(false); dispatchNav("settings"); }} href="/admin/settings" className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-600 hover:bg-slate-100">
                  <span className="text-sm font-medium">Settings</span>
                </Link>
              </nav>
            </div>
            <div className="flex flex-col gap-4 mt-6">
              <Link onClick={() => setSidebarOpen(false)} href="/admin/forms/new" className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#16a34a] py-3 px-4 text-white text-sm font-bold shadow-sm hover:bg-[#16a34a]/90">
                <span>Create New Form</span>
              </Link>
              <div className="flex items-center gap-3 px-2 pt-4 border-t border-slate-200">
                <div className="size-10 rounded-full bg-slate-200 aspect-square" />
                <div className="flex flex-col min-w-0">
                  <p className="text-slate-900 text-sm font-semibold truncate">{profile?.name || user?.email || "Admin"}</p>
                  <p className="text-slate-500 text-xs truncate">Admin Profile</p>
                </div>
                <button onClick={async () => { setSidebarOpen(false); await signOut(); }} className="ml-auto rounded-lg px-3 py-2 text-xs text-slate-600 hover:bg-slate-100">Logout</button>
              </div>
            </div>
          </div>
          {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/30 md:hidden"></div>}
          <main className="flex-1 flex flex-col overflow-y-auto">
            <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 md:px-8 sticky top-0 z-10">
              <div className="flex items-center gap-3 sm:gap-6">
                <button aria-label="Open menu" onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 md:hidden" style={{ touchAction: "manipulation" }}>
                  <span className="material-symbols-outlined">menu</span>
                </button>
                <h2 className="text-xl font-bold text-slate-900">Overview</h2>
                <div className="relative w-40 sm:w-56 md:w-64 hidden md:block">
                  <input
                    placeholder="Search"
                    className="w-full pl-10 pr-4 py-1.5 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-[#16a34a]/50 text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <button aria-label="Notifications" className="size-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-lg" style={{ touchAction: "manipulation" }}>
                  <span className="material-symbols-outlined">notifications</span>
                </button>
                <button aria-label="Help" className="size-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-lg" style={{ touchAction: "manipulation" }}>
                  <span className="material-symbols-outlined">help_outline</span>
                </button>
                <button onClick={signOut} className="ml-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 md:hidden" style={{ touchAction: "manipulation" }}>Logout</button>
              </div>
            </header>
            <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full">{children}</div>
          </main>
        </div>
      </div>
     </ProtectedRoute>
   );
 }
