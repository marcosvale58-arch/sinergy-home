"use client";

import React, { useState, useEffect } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  ArrowRight, 
  ChevronRight, 
  Plus, 
  AlertCircle, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Backpack, 
  Percent, 
  Smartphone,
  Sparkles
} from "lucide-react";
import { useStore, Transaction } from "@/lib/mock-data";
import { formatNumber, formatDate } from "@/lib/format";
import Link from "next/link";

export default function Dashboard() {
  const { 
    household, 
    transactions, 
    investments, 
    goals, 
    calendarEvents, 
    chores, 
    screenTime, 
    users,
    addTransaction 
  } = useStore();

  const [activeUserRole, setActiveUserRole] = useState("ADMIN");

  // Track session storage to update UI if user shifts in the sidebar
  useEffect(() => {
    const checkRole = () => {
      if (typeof window !== "undefined") {
        const activeId = localStorage.getItem("sinergy_active_user_id");
        const activeEmail = localStorage.getItem("sinergy_active_user_email");
        const current = users.find((u) => u.id === activeId || (activeEmail && u.email.toLowerCase() === activeEmail.toLowerCase()));
        if (current) {
          setActiveUserRole(prev => prev === current.role ? prev : current.role);
        }
      }
    };
    checkRole();
    window.addEventListener("storage", checkRole);
    return () => {
      window.removeEventListener("storage", checkRole);
    };
  }, [users]);

  // CALCULATION LOGIC FOR FINTECH KPIs
  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + (parseFloat(String(t.baseAmount ?? t.amount ?? t.originalAmount ?? 0)) || 0), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + (parseFloat(String(t.baseAmount ?? t.amount ?? t.originalAmount ?? 0)) || 0), 0);

  const netCashflow = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  // Net Worth = sum of assets (investments current value)
  const netWorth = investments.reduce((sum, inv) => sum + (parseFloat(String(inv.currentValue || 0)) || 0), 0);

  // Debt-to-Income: e.g. housing mortgage ($2200) / total income
  const housingExpense = transactions
    .filter((t) => t.category === "Vivienda" || t.category === "Servicios" || t.category === "Housing" || t.category === "Utilities")
    .reduce((sum, t) => sum + (parseFloat(String(t.baseAmount ?? t.amount ?? t.originalAmount ?? 0)) || 0), 0);
  const debtToIncome = totalIncome > 0 ? (housingExpense / totalIncome) * 100 : 0;

  // Unpaid bills summary
  const unpaidBills = calendarEvents.filter((ev) => ev.status === "UNPAID" || ev.status === "OVERDUE");
  const upcomingBillsTotal = unpaidBills.reduce((sum, b) => sum + (parseFloat(String(b.amount || 0)) || 0), 0);

  // Asset allocations
  const assetTypeTotals = investments.reduce((acc, inv) => {
    const val = parseFloat(String(inv.currentValue || 0)) || 0;
    acc[inv.assetType] = (acc[inv.assetType] || 0) + val;
    return acc;
  }, {} as Record<string, number>);

  // Interactive Quick Income Logger Modal / Form
  const [showQuickIncome, setShowQuickIncome] = useState(false);
  const [quickAmount, setQuickAmount] = useState("");
  const [quickCategory, setQuickCategory] = useState("Bono");
  const [quickNotes, setQuickNotes] = useState("");

  const handleAddQuickIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(quickAmount);
    if (isNaN(amt) || amt <= 0) return;

    const activeUserId = (typeof window !== "undefined" ? localStorage.getItem("sinergy_active_user_id") : null) || users[0]?.id || "u-1";

    addTransaction({
      userId: activeUserId,
      type: "INCOME",
      originalAmount: amt,
      originalCurrency: household.baseCurrency,
      category: quickCategory,
      date: new Date().toISOString(),
      notes: quickNotes || `Ingreso rápido ${quickCategory}`,
      isRecurring: false,
    });

    setQuickAmount("");
    setQuickNotes("");
    setShowQuickIncome(false);
  };

  const assetTypeTranslations: Record<string, string> = {
    Merchandise: "Mercancía",
    Stocks: "Acciones",
    "Real Estate": "Bienes Raíces",
    Crypto: "Criptomonedas",
    Cash: "Efectivo / Ahorro",
    "Fixed Income": "Renta Fija",
    Other: "Otros",
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      
      {/* HEADER SECTION WITH HERO BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-8 shadow-xl border border-indigo-950">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold uppercase tracking-wider border border-indigo-400/20">
              <Sparkles className="w-3.5 h-3.5" /> {"Operaciones Fintech Principales Activas"}
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {"Tablero Financiero Consolidado"}
            </h2>
            <p className="text-indigo-200/80 text-sm md:text-base font-medium">
              {"Un centro de comando integral que orquesta el enrutamiento de ingresos, activos multimoneda, metas y tareas del hogar."}
            </p>
          </div>

          {activeUserRole === "ADMIN" && (
            <button
              onClick={() => setShowQuickIncome(true)}
              className="px-5 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 border border-emerald-600/30"
            >
              <Plus className="w-5 h-5" /> {"Registrar Ingreso del Hogar"}
            </button>
          )}
        </div>
      </div>

      {/* QUICK ROUTED INCOME MODAL */}
      {showQuickIncome && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-up">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-2 flex items-center gap-2">
              <PiggyBank className="text-emerald-500" /> {"Registro de Ingresos con Auto-Enrutamiento"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4">
              {"El ingreso recién registrado se distribuye automáticamente en depósitos virtuales de Ahorro e Inversión de acuerdo con sus reglas de distribución personalizadas (ej. 50/30/20)."}
            </p>

            <form onSubmit={handleAddQuickIncome} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">{"Monto"} ({household.baseCurrency})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={quickAmount}
                  onChange={(e) => setQuickAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">{"Categoría"}</label>
                <select
                  value={quickCategory}
                  onChange={(e) => setQuickCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                >
                  <option value="Salario">{"Pago de Salario"}</option>
                  <option value="Consultoría">{"Honorarios de Consultoría"}</option>
                  <option value="Bono">{"Bono de Desempeño"}</option>
                  <option value="Inversión">{"Dividendos / Retorno"}</option>
                  <option value="Otros">{"Otros Ingresos"}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">{"Notas"}</label>
                <input
                  type="text"
                  placeholder="ej. Bono de Desempeño Q3"
                  value={quickNotes}
                  onChange={(e) => setQuickNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuickIncome(false)}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
                >
                  {"Cancelar"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-400 shadow-lg shadow-emerald-500/10 transition"
                >
                  {"Distribuir Ingreso"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CORE FINTECH KPIs GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1: Net Worth */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition duration-150 relative overflow-hidden group">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-20 h-20 bg-indigo-500/5 rounded-full group-hover:scale-150 transition-all duration-300" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-400 dark:text-zinc-500 uppercase">{"Patrimonio Neto"}</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              ${formatNumber(netWorth, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <div className="flex items-center gap-1.5 mt-2.5">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">+8.4% Rendimiento Promedio</span>
              <span className="text-xs text-slate-400 font-medium">{"crecimiento proyectado"}</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Monthly Cashflow */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition duration-150 relative overflow-hidden group">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-20 h-20 bg-emerald-500/5 rounded-full group-hover:scale-150 transition-all duration-300" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-400 dark:text-zinc-500 uppercase">{"Flujo de Caja Mensual"}</span>
            <div className={`p-2 rounded-xl ${netCashflow >= 0 ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600" : "bg-rose-50 text-rose-600"} dark:text-emerald-400`}>
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              ${formatNumber(netCashflow, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <div className="flex items-center gap-1.5 mt-2.5">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">{"Ingresos"}: ${formatNumber(totalIncome)}</span>
              <span className="text-xs text-slate-400 font-medium">{"Egresos"}: ${formatNumber(totalExpense)}</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Savings Rate */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition duration-150 relative overflow-hidden group">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-20 h-20 bg-sky-500/5 rounded-full group-hover:scale-150 transition-all duration-300" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-400 dark:text-zinc-500 uppercase">{"Tasa de Ahorro"}</span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {savingsRate.toFixed(1)}%
            </h3>
            <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
              <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, savingsRate)}%` }} />
              </div>
              <span className="text-[10px] text-slate-400 font-bold mt-1">{"Objetivo: 50% Necesidades / 30% Deseos / 20% Ahorro"}</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Debt-to-Income / Mortgage Load */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition duration-150 relative overflow-hidden group">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-20 h-20 bg-amber-500/5 rounded-full group-hover:scale-150 transition-all duration-300" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-400 dark:text-zinc-500 uppercase">{"Deuda sobre Ingreso"}</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {debtToIncome.toFixed(1)}%
            </h3>
            <div className="flex items-center gap-1.5 mt-2.5">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${debtToIncome < 36 ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"}`}>
                {debtToIncome < 36 ? "Rango Saludable" : "Carga Elevada"}
              </span>
              <span className="text-xs text-slate-400 font-medium">{"Ratio vivienda y servicios"}</span>
            </div>
          </div>
        </div>

      </div>

      {/* DETAILED INTERACTIVE CHARTS & PORTFOLIO ALLOCATION SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Section: Financial Visualizations */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-950 dark:text-white">{"Distribución de Gastos por Categoría"}</h3>
              <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium">{"Resumen de gastos mensuales mapeados dinámicamente"}</p>
            </div>
            <Link href="/transactions" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline">
              {"Ver Transacciones"} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Sinergy Custom Premium Bar / Trend Chart */}
          <div className="space-y-4 pt-2">
            {[
              { label: "Vivienda e Hipoteca", amount: 2200, pct: 60.5, color: "bg-indigo-600" },
              { label: "Alimentos y Mercado", amount: 650, pct: 17.9, color: "bg-emerald-500" },
              { label: "Servicios (Luz/Gas/Agua)", amount: 480, pct: 13.2, color: "bg-sky-500" },
              { label: "Salud y Medicina", amount: 180, pct: 4.9, color: "bg-rose-500" },
              { label: "Educación y Clases", amount: 120, pct: 3.3, color: "bg-amber-500" },
              { label: "Entretenimiento y Suscripciones", amount: 15.99, pct: 0.2, color: "bg-pink-500" },
            ].map((exp, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-zinc-300">{exp.label}</span>
                  <span className="text-slate-900 dark:text-white">
                    ${formatNumber(exp.amount, { maximumFractionDigits: 2 })} ({exp.pct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-3 overflow-hidden">
                  <div className={`${exp.color} h-3 rounded-full transition-all duration-500`} style={{ width: `${exp.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Asset Allocation Donut Visualizer */}
          <div className="pt-6 border-t border-slate-100 dark:border-zinc-800/80">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-4">{"Desglose de Asignación de Inversiones"}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {Object.entries(assetTypeTotals).map(([type, value], idx) => {
                const totalInvs = Number(netWorth) || 1;
                const ratio = (value / totalInvs) * 100;

                return (
                  <div key={idx} className="bg-slate-50 dark:bg-zinc-800/40 p-3 rounded-xl border border-slate-150 dark:border-zinc-800/60 flex flex-col justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                      {assetTypeTranslations[type] || type}
                    </span>
                    <div className="mt-2.5">
                      <span className="text-sm font-bold text-slate-800 dark:text-zinc-100">${formatNumber(value)}</span>
                      <span className="text-[10px] font-semibold block text-slate-400 mt-0.5">{ratio.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Section: Goals & Progress timelines */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm lg:col-span-4 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-950 dark:text-white">{"Progreso de Metas Activas"}</h3>
                <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium">{"Hitos patrimoniales a corto y largo plazo"}</p>
              </div>
              <Link href="/goals" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline">
                {"Gestionar"} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-5">
              {goals.slice(0, 3).map((goal) => {
                const ratio = Math.min(100, (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100);
                const timeframeLabel = goal.timeframe === "SHORT" ? "CORTO PLAZO" : goal.timeframe === "MEDIUM" ? "MEDIANO PLAZO" : "LARGO PLAZO";
                return (
                  <div key={goal.id} className="space-y-1.5 bg-slate-50/50 dark:bg-zinc-800/20 p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800/40">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">{goal.title}</h4>
                        <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 tracking-wide mt-0.5 block">{timeframeLabel} • {goal.category}</span>
                      </div>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{ratio.toFixed(1)}%</span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden mt-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${ratio}%` }} />
                    </div>

                    <div className="flex justify-between text-[11px] font-medium text-slate-500 dark:text-zinc-400 mt-1">
                      <span>${formatNumber(goal.currentAmount)} {"ahorrado"}</span>
                      <span>{"Objetivo"}: ${formatNumber(goal.targetAmount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-zinc-800/80 mt-4">
            <h4 className="font-bold text-xs text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-3">{"Perfil de Distribución del Hogar"}</h4>
            <div className="bg-indigo-600 text-white rounded-2xl p-4 flex items-center justify-between shadow-md shadow-indigo-600/10">
              <div className="space-y-1">
                <p className="text-[10px] font-bold tracking-wide uppercase text-indigo-200">{"Perfil de Asignación Activo"}</p>
                <h5 className="font-extrabold text-base">{"50% Gastos / 25% Inversión / 15% Ahorro"}</h5>
              </div>
              <Link href="/distribution" className="bg-white/10 hover:bg-white/20 p-2 rounded-xl text-white transition">
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* ALERTS, CHORES LEADERBOARD & UPCOMING EVENTS SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. UPCOMING BILLS & SMART CALENDAR ALERTS */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/80 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" /> {"Calendario y Facturas"}
            </h4>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 uppercase">
              {unpaidBills.length} {"alertas"}
            </span>
          </div>

          <div className="space-y-3">
            {calendarEvents.slice(0, 3).map((ev) => (
              <div key={ev.id} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800/60 bg-slate-50/30 dark:bg-zinc-800/10">
                <div className="space-y-0.5">
                  <span className="font-semibold text-xs text-slate-800 dark:text-zinc-200 block">{ev.title}</span>
                  <span className="text-[10px] text-slate-400 font-semibold block">{formatDate(ev.dueDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">${ev.amount}</span>
                  <span className={`text-[9px] font-extrabold tracking-wider px-1.5 py-0.5 rounded uppercase ${
                    ev.status === "PAID" 
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20" 
                      : ev.status === "OVERDUE"
                      ? "bg-rose-100 text-rose-600 dark:bg-rose-950/20 animate-pulse"
                      : "bg-amber-50 text-amber-600 dark:bg-amber-950/20"
                  }`}>
                    {ev.status === "PAID" ? "PAGADO" : ev.status === "OVERDUE" ? "VENCIDO" : "PENDIENTE"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Link href="/calendar" className="block text-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline pt-2">
            {"Abrir Calendario de Facturas"} &rarr;
          </Link>
        </div>

        {/* 2. CHORE POINT SYSTEM & KID LEADERBOARD */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/80 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {"Ranking de Tareas"}
            </h4>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 uppercase">
              {"activo"}
            </span>
          </div>

          <div className="space-y-3">
            {users
              .filter((u) => u.role === "CHILD")
              .sort((a, b) => b.pointsBalance - a.pointsBalance)
              .map((child, idx) => (
                <div key={child.id} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800/60 bg-slate-50/30 dark:bg-zinc-800/10">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 w-4">#{idx+1}</span>
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-[10px] text-indigo-600">
                      {child.name.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">{child.name}</span>
                  </div>
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{child.pointsBalance} pts</span>
                </div>
              ))}
          </div>

          <Link href="/chores" className="block text-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline pt-2">
            {"Organizar Tareas"} &rarr;
          </Link>
        </div>

        {/* 3. SCREEN TIME USAGE LIMIT TRACKER */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/80 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-rose-500" /> {"Límite de Pantalla"}
            </h4>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 uppercase">
              {"Hoy"}
            </span>
          </div>

          <div className="space-y-3">
            {users
              .filter((u) => u.role === "CHILD")
              .map((child) => {
                const log = screenTime.find((s) => s.childUserId === child.id) || { minutesUsed: 0, dailyLimitMinutes: 120 };
                const ratio = Math.min(100, (log.minutesUsed / log.dailyLimitMinutes) * 100);
                const isOver = log.minutesUsed > log.dailyLimitMinutes;

                return (
                  <div key={child.id} className="p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800/60 bg-slate-50/30 dark:bg-zinc-800/10 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-800 dark:text-zinc-200">{child.name}</span>
                      <span className={isOver ? "text-rose-500" : "text-slate-600 dark:text-zinc-400"}>
                        {log.minutesUsed}/{log.dailyLimitMinutes} min
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <div className={`h-1.5 rounded-full ${isOver ? "bg-rose-500 animate-pulse" : "bg-rose-400"}`} style={{ width: `${ratio}%` }} />
                    </div>
                  </div>
                );
              })}
          </div>

          <Link href="/chores" className="block text-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline pt-2">
            {"Canjear Puntos por Pantalla"} &rarr;
          </Link>
        </div>

      </div>

    </div>
  );
}
