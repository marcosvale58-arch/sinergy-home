"use client";

import React, { useState } from "react";
import { 
  TrendingUp, 
  Wallet, 
  BarChart3, 
  LineChart, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCcw, 
  Layers, 
  Target,
  ChevronRight,
  Info
} from "lucide-react";
import { useStore, Investment } from "@/lib/mock-data";
import { formatNumber } from "@/lib/format";

export default function InvestmentsPage() {
  const { investments, household, addInvestment, updateInvestmentValue } = useStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    assetName: "",
    assetType: "Stocks" as Investment["assetType"],
    investedAmount: "",
    currentValue: "",
    expectedReturn: "8.0"
  });

  const [forecastYears, setForecastYears] = useState(10);

  const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.investedAmount), 0);
  const totalCurrentValue = investments.reduce((sum, inv) => sum + Number(inv.currentValue), 0);
  const totalGain = totalCurrentValue - totalInvested;
  const totalGainPct = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  // Average annual return weighted by current value
  const avgReturn = totalCurrentValue > 0 
    ? investments.reduce((acc, inv) => acc + (Number(inv.currentValue) * Number(inv.expectedAnnualReturn)), 0) / totalCurrentValue 
    : 0;

  // Projection logic
  const projectionValue = totalCurrentValue * Math.pow(1 + avgReturn / 100, forecastYears);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addInvestment(
      formData.assetName,
      formData.assetType,
      parseFloat(formData.investedAmount),
      parseFloat(formData.currentValue),
      parseFloat(formData.expectedReturn)
    );
    setIsModalOpen(false);
    setFormData({ assetName: "", assetType: "Stocks", investedAmount: "", currentValue: "", expectedReturn: "8.0" });
  };

  const assetIcons = {
    Stocks: BarChart3,
    "Real Estate": Layers,
    Crypto: Wallet,
    "Fixed Income": Target,
    Cash: Wallet
  };

  const assetTypeLabels: Record<string, string> = {
    Stocks: "Acciones / ETFs",
    "Real Estate": "Bienes Raíces",
    Crypto: "Criptomonedas",
    "Fixed Income": "Renta Fija",
    Cash: "Efectivo / Ahorro"
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Header & High-level KPIs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-emerald-500" /> {"Portafolio y Proyecciones"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">{"Seguimiento de activos y proyección de patrimonio para"} {household.name}.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-5 h-5" /> {"Añadir Activo"}
        </button>
      </div>

      {/* Portfolio Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-1 block">{"Valor Total de Mercado"}</span>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white">${formatNumber(totalCurrentValue)}</h3>
          <div className="flex items-center gap-2 mt-3 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="w-4 h-4" />
            <span>${formatNumber(totalGain)} {"Ganancia Total"}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-1 block">{"Rendimiento Ponderado"}</span>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white">{avgReturn.toFixed(2)}% <span className="text-sm text-slate-400 font-bold uppercase tracking-tight">{"Prom. Anual"}</span></h3>
          <div className="flex items-center gap-2 mt-3 text-xs font-bold text-indigo-600 dark:text-indigo-400">
            <RefreshCcw className="w-4 h-4" />
            <span>{"Interés Compuesto Multiactivo"}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 rounded-2xl shadow-xl shadow-emerald-600/10 text-white">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100/60 mb-1 block">{"Proyección de Patrimonio"}</span>
          <h3 className="text-3xl font-black">${formatNumber(projectionValue, { maximumFractionDigits: 0 })}</h3>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold">
              {"Horizonte de"} {forecastYears} {"Años"}
            </div>
            <input 
              type="range" 
              min="1" 
              max="40" 
              value={forecastYears}
              onChange={(e) => setForecastYears(parseInt(e.target.value))}
              className="w-24 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Assets List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-white">{"Posiciones Activas del Portafolio"}</h4>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                {"Actualizado: Hoy"} <RefreshCcw className="w-3 h-3" />
              </span>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {investments.map((inv) => {
                const gain = Number(inv.currentValue) - Number(inv.investedAmount);
                const gainPct = Number(inv.investedAmount) > 0 ? (gain / Number(inv.investedAmount)) * 100 : 0;
                const Icon = assetIcons[inv.assetType] || BarChart3;

                return (
                  <div key={inv.id} className="p-6 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-zinc-700">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-900 dark:text-white">{inv.assetName}</h5>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{assetTypeLabels[inv.assetType] || inv.assetType}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{inv.expectedAnnualReturn}% {"Retorno Anual"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:text-right">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{"Invertido"}</span>
                          <span className="text-sm font-bold text-slate-700 dark:text-zinc-300">${formatNumber(inv.investedAmount)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{"Valor Actual"}</span>
                          <span className="text-sm font-black text-slate-900 dark:text-white">${formatNumber(inv.currentValue)}</span>
                        </div>
                        <div className="hidden sm:block">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{"Rendimiento"}</span>
                          <div className={`flex items-center md:justify-end gap-1 text-sm font-bold ${gain >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                            {gain >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                            {gainPct.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Forecast Details & Logic */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <LineChart className="w-5 h-5 text-indigo-600" /> {"Pronóstico de Crecimiento"}
            </h4>
            
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>{"Horizonte"}</span>
                  <span className="text-indigo-600">{forecastYears} {"Años"}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>{"Balance Inicial"}</span>
                  <span className="text-slate-900 dark:text-white">${formatNumber(totalCurrentValue)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>{"Tasa de Crecimiento"}</span>
                  <span className="text-emerald-600">{avgReturn.toFixed(2)}% {"Anual"}</span>
                </div>
                <div className="pt-2 mt-2 border-t border-slate-200 dark:border-zinc-700 flex justify-between items-center">
                  <span className="text-sm font-black text-slate-900 dark:text-white">{"Pronóstico Final"}</span>
                  <span className="text-lg font-black text-emerald-600">${formatNumber(projectionValue, { maximumFractionDigits: 0 })}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex items-start gap-3">
                <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-[11px] font-medium text-indigo-700 dark:text-indigo-400 leading-relaxed">
                  {"El pronóstico asume capitalización anual compuesta de los rendimientos ponderados sin aportes adicionales. Los resultados reales pueden variar según el mercado."}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Asset Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-8 shadow-2xl animate-scale-up">
            <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-6">{"Añadir Activo al Portafolio"}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">{"Nombre del Activo"}</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Apple Inc (AAPL) o Inmueble Alquilado"
                  value={formData.assetName}
                  onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">{"Tipo de Activo"}</label>
                  <select
                    value={formData.assetType}
                    onChange={(e) => setFormData({ ...formData, assetType: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                  >
                    <option value="Stocks">Acciones / ETFs</option>
                    <option value="Real Estate">Bienes Raíces</option>
                    <option value="Crypto">Criptomonedas</option>
                    <option value="Fixed Income">Renta Fija / Bonos</option>
                    <option value="Cash">Efectivo / Cuenta de Ahorro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">{"Retorno Anual Estimado (%)"}</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.expectedReturn}
                    onChange={(e) => setFormData({ ...formData, expectedReturn: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">{"Monto Invertido"}</label>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={formData.investedAmount}
                    onChange={(e) => setFormData({ ...formData, investedAmount: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">{"Valor Actual de Mercado"}</label>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={formData.currentValue}
                    onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 border border-slate-200 dark:border-zinc-700 rounded-2xl font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-50 transition"
                >
                  {"Cancelar"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 transition-all"
                >
                  {"Añadir Activo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
