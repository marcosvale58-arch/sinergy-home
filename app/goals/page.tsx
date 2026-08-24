"use client";

import React, { useState } from "react";
import { 
  Target, 
  Plus, 
  TrendingUp, 
  Calendar, 
  Flag, 
  ChevronRight, 
  DollarSign, 
  Clock, 
  Trophy, 
  PieChart as PieIcon, 
  Search, 
  Filter, 
  X 
} from "lucide-react";
import { useStore, Goal } from "@/lib/mock-data";
import { formatNumber, formatDateMonthYear } from "@/lib/format";

export default function GoalsPage() {
  const { goals, household, addGoal, contributeToGoal } = useStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    targetAmount: "",
    deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    timeframe: "MEDIUM" as Goal["timeframe"],
    category: "Vacaciones",
    priority: "MEDIUM" as Goal["priority"]
  });

  const [contribModal, setContribModal] = useState<{ open: boolean; goalId: string; title: string }>({
    open: false,
    goalId: "",
    title: ""
  });
  const [contribAmount, setContribAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addGoal(
      formData.title,
      parseFloat(formData.targetAmount),
      formData.deadline,
      formData.timeframe,
      formData.category,
      formData.priority
    );
    setIsModalOpen(false);
    setFormData({
      title: "",
      targetAmount: "",
      deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      timeframe: "MEDIUM",
      category: "Vacaciones",
      priority: "MEDIUM"
    });
  };

  const handleContribute = (e: React.FormEvent) => {
    e.preventDefault();
    contributeToGoal(contribModal.goalId, parseFloat(contribAmount));
    setContribModal({ open: false, goalId: "", title: "" });
    setContribAmount("");
  };

  const categories = ["Vacaciones", "Fondo de Emergencia", "Compra de Vivienda", "Vehículo", "Educación", "Jubilación", "General"];
  const timeframes = [
    { label: "Corto Plazo", value: "SHORT" as const },
    { label: "Mediano Plazo", value: "MEDIUM" as const },
    { label: "Largo Plazo", value: "LONG" as const }
  ];
  const priorities = [
    { label: "Baja", value: "LOW" as const },
    { label: "Media", value: "MEDIUM" as const },
    { label: "Alta", value: "HIGH" as const }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-7 h-7 text-indigo-600" /> {"Planificador de Metas"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">{"Estrategiza y rastrea hitos de riqueza del hogar."}</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-5 h-5" /> {"Crear Meta"}
        </button>
      </div>

      {/* Goals Display Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const ratio = Math.min(100, (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100);
          const isCompleted = ratio >= 100;
          const timeframeText = goal.timeframe === "SHORT" ? "Corto Plazo" : goal.timeframe === "MEDIUM" ? "Mediano Plazo" : "Largo Plazo";

          return (
            <div key={goal.id} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition group relative overflow-hidden">
              {isCompleted && (
                <div className="absolute top-0 right-0 p-4">
                  <div className="bg-emerald-500 text-white p-1.5 rounded-full shadow-lg">
                    <Trophy className="w-4 h-4" />
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${
                    goal.priority === "HIGH" ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400" : 
                    goal.priority === "MEDIUM" ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400" : 
                    "bg-slate-50 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}>
                    <Flag className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{goal.title}</h4>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">{goal.category} • {timeframeText}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500 dark:text-zinc-400">{"Progreso"}</span>
                    <span className="text-indigo-600 dark:text-indigo-400">{ratio.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? "bg-emerald-500" : "bg-indigo-600"}`}
                      style={{ width: `${ratio}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-medium text-slate-400">
                    <span>{"Ahorrado"}: ${formatNumber(goal.currentAmount)}</span>
                    <span>{"Objetivo"}: ${formatNumber(goal.targetAmount)}</span>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                    <Calendar className="w-3.5 h-3.5" /> {formatDateMonthYear(goal.deadline)}
                  </div>
                  {!isCompleted && (
                    <button 
                      onClick={() => setContribModal({ open: true, goalId: goal.id, title: goal.title })}
                      className="px-4 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all"
                    >
                      {"Aportar Fondos"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-8 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-950 dark:text-white">{"Diseñar Nueva Meta"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">{"Título de la Meta"}</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Inicial para Casa Propia"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">{"Monto Objetivo"} ({household.baseCurrency})</label>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">{"Fecha Límite"}</label>
                  <input
                    type="date"
                    required
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">{"Categoría"}</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">{"Plazo"}</label>
                  <select
                    value={formData.timeframe}
                    onChange={(e) => setFormData({ ...formData, timeframe: e.target.value as any })}
                    className="w-full px-3 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                  >
                    {timeframes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">{"Prioridad"}</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                  >
                    {priorities.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 transition-all"
              >
                {"Lanzar Meta de Riqueza"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Contribution Modal */}
      {contribModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-sm w-full p-8 shadow-2xl animate-scale-up text-center">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-2">{"Aportar a Meta"}</h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6 font-medium">{"Añadiendo fondos a"}: <span className="text-indigo-600 font-bold">{contribModal.title}</span></p>
            
            <form onSubmit={handleContribute} className="space-y-6">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  required
                  autoFocus
                  placeholder="0.00"
                  value={contribAmount}
                  onChange={(e) => setContribAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-4 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-black text-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white text-center"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setContribModal({ open: false, goalId: "", title: "" })}
                  className="flex-1 py-3 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-50 transition"
                >
                  {"Cancelar"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 shadow-xl shadow-emerald-600/20 transition-all"
                >
                  {"Depositar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
