"use client";

import React, { useState } from "react";
import { 
  PieChart, 
  Settings2, 
  Info, 
  ChevronRight, 
  Plus, 
  Save, 
  HelpCircle, 
  Target,
  TrendingUp,
  Wallet,
  Compass,
  LayoutGrid
} from "lucide-react";
import { useStore, DistributionRule } from "@/lib/mock-data";

export default function DistributionPage() {
  const { rules, household, updateRule } = useStore();
  
  // Local edit state for the percentages
  const [localRules, setLocalRules] = useState<DistributionRule[]>(rules);

  const handleSliderChange = (id: string, newVal: number) => {
    const updated = localRules.map(r => r.id === id ? { ...r, value: newVal } : r);
    setLocalRules(updated);
  };

  const handleSave = () => {
    localRules.forEach(r => updateRule(r.id, Number(r.value)));
  };

  const totalPercentage = localRules.reduce((acc, r) => acc + (r.type === "PERCENTAGE" ? Number(r.value) : 0), 0);

  const bucketIcons = {
    "Expenses": LayoutGrid,
    "Investment": TrendingUp,
    "Savings": Target,
    "Discretionary": Compass
  };

  const bucketColors = {
    "Expenses": "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800",
    "Investment": "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
    "Savings": "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800",
    "Discretionary": "text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-800"
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PieChart className="w-7 h-7 text-indigo-600" /> {"Motor de Distribución de Ingresos"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">{"Configura cómo el ingreso del hogar se distribuye automáticamente en depósitos virtuales."}</p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={totalPercentage !== 100}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
        >
          <Save className="w-5 h-5" /> {"Implementar Reglas de Distribución"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Configuration Sliders */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-slate-900 dark:text-white">{"Estrategia de Asignación Activa"}</h3>
              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                totalPercentage === 100 ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-rose-50 text-rose-600 border-rose-200"
              }`}>
                {"Total"}: {totalPercentage}%
              </div>
            </div>

            <div className="space-y-10">
              {localRules.map((rule) => {
                const Icon = bucketIcons[rule.targetBucket as keyof typeof bucketIcons] || Settings2;
                const colorClasses = bucketColors[rule.targetBucket as keyof typeof bucketColors];
                
                return (
                  <div key={rule.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl border ${colorClasses}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{rule.name}</h4>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{"Objetivo"}: {rule.targetBucket}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black text-slate-900 dark:text-white">{rule.value}%</span>
                      </div>
                    </div>

                    <div className="relative group">
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        step="5"
                        value={rule.value}
                        onChange={(e) => handleSliderChange(rule.id, parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <div className="flex justify-between mt-2">
                        <span className="text-[10px] font-bold text-slate-300">{"Mínimo"} 0%</span>
                        <span className="text-[10px] font-bold text-slate-300">{"Máximo"} 100%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {totalPercentage !== 100 && (
              <div className="mt-8 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-xl flex items-start gap-3">
                <Info className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-rose-700 dark:text-rose-400 leading-relaxed">
                  {"La asignación total debe ser exactamente 100% para implementar. Actualmente estás"} {totalPercentage > 100 ? "excedido por" : "por debajo por"} {Math.abs(100 - totalPercentage)}%.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Preview & Explainability */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Example Routing Preview */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 shadow-xl text-white">
            <h3 className="font-bold text-base mb-2 flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-400" /> {"Vista Previa de Auto-Enrutamiento"}
            </h3>
            <p className="text-xs text-indigo-200/70 font-medium mb-6">{"Simulación basada en un depósito hipotético de $10,000 mensuales de ingresos familiares."}</p>
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="text-sm font-semibold">{"Depósito Bruto"}</span>
                <span className="text-lg font-black text-emerald-400">$10,000.00</span>
              </div>

              <div className="space-y-3 pt-2">
                {localRules.map(r => {
                  const amt = (10000 * Number(r.value)) / 100;
                  return (
                    <div key={r.id} className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        <span className="text-xs font-bold text-indigo-100">{r.name} ({r.value}%)</span>
                      </div>
                      <span className="text-xs font-black">${amt.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 mt-2 border-t border-white/5">
                <p className="text-[10px] text-indigo-300/60 font-medium italic">
                  * Funds will be automatically credited to corresponding digital asset ledgers and goal balances upon income verification.
                </p>
              </div>
            </div>
          </div>

          {/* Tips / Documentation */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-slate-400" /> {"Lógica de Distribución"}
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">The 50/30/20 Rule</h4>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  A popular strategy where 50% goes to Needs (Expenses), 30% to Wants (Discretionary), and 20% to Savings &amp; Debt repayment.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Waterfall Method</h4>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Priority routing where fixed amounts go to high-priority goals first, and percentages handle the overflow.
                </p>
              </div>
              <button className="w-full py-2.5 mt-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 transition">
                {"Explorar Biblioteca de Estrategias"}
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
