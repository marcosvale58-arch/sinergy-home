"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  TrendingUp, 
  PackageCheck, 
  Target, 
  Calendar, 
  CheckSquare, 
  Settings, 
  Menu, 
  X, 
  User as UserIcon, 
  Sparkles, 
  Coins, 
  Hourglass,
  DollarSign,
  Sun,
  Moon
} from "lucide-react";
import { useStore } from "@/lib/mock-data";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  
  // Connect to our reactive state
  const { household, users, screenTime, chores } = useStore();
  const [currentUserSession, setCurrentUserSession] = useState("u-1"); // Default to John (ADMIN)

  useEffect(() => {
    // Sync theme with document class
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // Set selected user in global store (direct mutation of storage for session switching simplicity in mock state)
  const activeUser = users.find(u => u.id === currentUserSession) || users[0];

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  const navItems = [
    { name: "Panel Ejecutivo", href: "/", icon: LayoutDashboard, roles: ["ADMIN", "MEMBER", "CHILD"] },
    { name: "Ingresos y Gastos", href: "/transactions", icon: Receipt, roles: ["ADMIN", "MEMBER"] },
    { name: "Distribución de Ingresos", href: "/distribution", icon: PieChart, roles: ["ADMIN"] },
    { name: "Portafolio y Proyecciones", href: "/investments", icon: TrendingUp, roles: ["ADMIN", "MEMBER"] },
    { name: "Inventario y Suministros", href: "/inventory", icon: PackageCheck, roles: ["ADMIN", "MEMBER"] },
    { name: "Planificador de Metas", href: "/goals", icon: Target, roles: ["ADMIN", "MEMBER", "CHILD"] },
    { name: "Calendario y Facturas", href: "/calendar", icon: Calendar, roles: ["ADMIN", "MEMBER"] },
    { name: "Tareas y Tiempo de Pantalla", href: "/chores", icon: CheckSquare, roles: ["ADMIN", "MEMBER", "CHILD"] },
    { name: "Ajustes del Sistema", href: "/settings", icon: Settings, roles: ["ADMIN"] },
  ];

  // Helper to check authorization
  const isAuthorized = (itemRoles: string[]) => {
    return itemRoles.includes(activeUser?.role || "MEMBER");
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-zinc-950 transition-colors duration-200">
      
      {/* SIDEBAR FOR DESKTOP */}
      <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-zinc-800 gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-600/30">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight text-slate-900 dark:text-white">SINERGY<span className="text-indigo-600 dark:text-indigo-400">HOME</span></h1>
            <p className="text-xs text-slate-400 font-medium tracking-wide">SMART FINTECH HUB</p>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const allowed = isAuthorized(item.roles);
            const isActive = pathname === item.href;
            
            if (!allowed) return null;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-200"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-zinc-500"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User context selector at bottom of sidebar */}
        <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/20">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold tracking-wider">USUARIO DE SESIÓN</span>
              <button 
                onClick={toggleTheme}
                className="p-1 rounded-lg text-slate-500 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-all"
                title="Toggle Theme"
              >
                {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
            </div>
            
            <select
              value={currentUserSession}
              onChange={(e) => {
                setCurrentUserSession(e.target.value);
                // Trigger a full state rewrite in localstorage for the session mock to stick
                if (typeof window !== "undefined") {
                  localStorage.setItem("sinergy_active_user_id", e.target.value);
                  // Notify pages of change
                  window.dispatchEvent(new Event("storage"));
                }
              }}
              className="text-xs py-2 px-3 border border-slate-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 font-medium text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden h-16 flex items-center justify-between px-6 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 shadow-sm z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-base text-slate-900 dark:text-white">SINERGY<span className="text-indigo-600">HOME</span></span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-white dark:bg-zinc-900 z-20 flex flex-col p-6 animate-fade-in-down border-t border-slate-100 dark:border-zinc-800">
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const allowed = isAuthorized(item.roles);
              const isActive = pathname === item.href;
              if (!allowed) return null;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                      : "text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          <div className="pt-6 border-t border-slate-200 dark:border-zinc-800">
            <span className="text-xs text-slate-400 font-bold tracking-wider block mb-2">USUARIO DE SESIÓN</span>
            <select
              value={currentUserSession}
              onChange={(e) => {
                setCurrentUserSession(e.target.value);
                if (typeof window !== "undefined") {
                  localStorage.setItem("sinergy_active_user_id", e.target.value);
                  window.dispatchEvent(new Event("storage"));
                }
              }}
              className="text-sm py-2.5 w-full px-3 border border-slate-200 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-800 font-medium text-slate-700 dark:text-zinc-300"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* TOP STATUS BAR (Fintech KPIs & Quick info) */}
        <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-zinc-700">
              {activeUser?.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-slate-900 dark:text-white leading-none">{activeUser?.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  activeUser?.role === "ADMIN" 
                    ? "bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400" 
                    : activeUser?.role === "CHILD"
                    ? "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
                    : "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                }`}>
                  {activeUser?.role}
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium mt-0.5">Hogar: <span className="font-semibold text-indigo-500">{household.name}</span></p>
            </div>
          </div>

          {/* Quick Stats / Household Status Bar */}
          <div className="flex items-center flex-wrap gap-4 text-xs">
            {activeUser?.role === "CHILD" ? (
              <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 py-1.5 px-3.5 rounded-xl border border-amber-100 dark:border-amber-950/50 shadow-sm">
                <Coins className="w-4 h-4 text-amber-500" />
                <span className="font-semibold">Mis Puntos:</span>
                <span className="font-bold text-sm leading-none">{activeUser.pointsBalance} pts</span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 py-1.5 px-3.5 rounded-xl border border-indigo-100 dark:border-indigo-950/50 shadow-sm">
                  <Coins className="w-4 h-4 text-indigo-500" />
                  <span className="font-medium">Tabla de Tareas:</span>
                  <span className="font-bold">
                    {users.filter(u => u.role === "CHILD")
                          .map(c => `${c.name} (${c.pointsBalance} pts)`)
                          .join(" | ")}
                  </span>
                </div>
              </>
            )}
            
            <div className="bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 py-1.5 px-3 rounded-lg font-medium border border-slate-200/50 dark:border-zinc-700/50">
              Base: <span className="font-bold text-slate-800 dark:text-zinc-200">{household.baseCurrency}</span>
            </div>
          </div>
        </div>

        {/* PAGE CONTENT CONTAINER */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
