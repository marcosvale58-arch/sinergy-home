"use client";

import React, { useState } from "react";
import { 
  TrendingUp, 
  Wallet, 
  BarChart3, 
  Plus, 
  Trash2, 
  Layers, 
  Target,
  ShoppingBag,
  Coins,
  CircleDot,
  Building,
  Search,
  FileText,
  Boxes
} from "lucide-react";
import { useStore, Investment } from "@/lib/mock-data";
import { formatNumber } from "@/lib/format";

export default function InvestmentsPage() {
  const { investments, household, addInvestment, deleteInvestment } = useStore();
  
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Investment | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    assetName: string;
    assetType: Investment["assetType"];
    investedAmount: string;
    notes: string;
  }>({
    assetName: "",
    assetType: "Merchandise",
    investedAmount: "",
    notes: ""
  });

  const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.investedAmount || 0), 0);
  const merchandiseInvestments = investments.filter(inv => inv.assetType === "Merchandise");
  const totalMerchandise = merchandiseInvestments.reduce((sum, inv) => sum + Number(inv.investedAmount || 0), 0);
  const totalOtherAssets = totalInvested - totalMerchandise;

  const categories = ["Todos", "Mercancía", "Acciones", "Bienes Raíces", "Criptomonedas", "Otros"];

  const filteredInvestments = investments.filter(inv => {
    const matchesSearch = inv.assetName.toLowerCase().includes(search.toLowerCase()) ||
      (inv.notes && inv.notes.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = activeCategory === "Todos" ||
      (activeCategory === "Mercancía" && inv.assetType === "Merchandise") ||
      (activeCategory === "Acciones" && inv.assetType === "Stocks") ||
      (activeCategory === "Bienes Raíces" && inv.assetType === "Real Estate") ||
      (activeCategory === "Criptomonedas" && inv.assetType === "Crypto") ||
      (activeCategory === "Otros" && (inv.assetType === "Other" || inv.assetType === "Cash" || inv.assetType === "Fixed Income"));

    return matchesSearch && matchesCategory;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.investedAmount);
    if (isNaN(amount) || amount <= 0 || !formData.assetName.trim()) return;

    addInvestment(
      formData.assetName.trim(),
      formData.assetType,
      amount,
      formData.notes.trim()
    );
    setIsModalOpen(false);
    setFormData({ assetName: "", assetType: "Merchandise", investedAmount: "", notes: "" });
  };

  const handleDelete = () => {
    if (itemToDelete) {
      deleteInvestment(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  const assetIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    Merchandise: ShoppingBag,
    Stocks: BarChart3,
    "Real Estate": Building,
    Crypto: Coins,
    "Fixed Income": Target,
    Cash: Wallet,
    Other: CircleDot
  };

  const assetTypeLabels: Record<string, string> = {
    Merchandise: "Mercancía",
    Stocks: "Acciones / ETFs",
    "Real Estate": "Bienes Raíces",
    Crypto: "Criptomonedas",
    "Fixed Income": "Renta Fija",
    Cash: "Efectivo / Ahorro",
    Other: "Otros"
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-emerald-500" /> {"Portafolio"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">
            {"Control y registro de activos, mercancías e inversiones para"} {household.name}.
          </p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" /> {"Añadir Activo"}
        </button>
      </div>

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Invertido */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">
              {"Total Invertido"}
            </span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white">
            ${formatNumber(totalInvested)}
          </h3>
          <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mt-2">
            {investments.length} {investments.length === 1 ? "posición registrada" : "posiciones registradas"}
          </p>
        </div>

        {/* Inversión en Mercancía */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">
              {"Inversión en Mercancía"}
            </span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white">
            ${formatNumber(totalMerchandise)}
          </h3>
          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-2">
            {merchandiseInvestments.length} {merchandiseInvestments.length === 1 ? "lote / producto" : "lotes / productos"}
          </p>
        </div>

        {/* Otros Activos e Inversiones */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">
              {"Otros Activos e Inversiones"}
            </span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white">
            ${formatNumber(totalOtherAssets)}
          </h3>
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
            {investments.length - merchandiseInvestments.length} posiciones en otros tipos
          </p>
        </div>

      </div>

      {/* Main Assets Section */}
      <div className="space-y-6">
        
        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder={"Buscar por activo u observaciones..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
            />
          </div>
          
          <div className="flex items-center bg-white dark:bg-zinc-900 p-1 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-x-auto w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === cat 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" 
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* List of Active Positions */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Boxes className="w-5 h-5 text-indigo-600" /> {"Posiciones Registradas"}
            </h4>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {filteredInvestments.length} {filteredInvestments.length === 1 ? "Activo" : "Activos"}
            </span>
          </div>
          
          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {filteredInvestments.map((inv) => {
              const Icon = assetIcons[inv.assetType] || CircleDot;
              const typeLabel = assetTypeLabels[inv.assetType] || inv.assetType;

              return (
                <div key={inv.id} className="p-6 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition group">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-zinc-700 shrink-0">
                        <Icon className="w-6 h-6" />
                      </div>
                      
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="font-bold text-slate-900 dark:text-white text-base">{inv.assetName}</h5>
                          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30">
                            {typeLabel}
                          </span>
                        </div>
                        
                        {/* Observaciones */}
                        {inv.notes && (
                          <div className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800/60 px-3 py-2 rounded-xl border border-slate-100 dark:border-zinc-800 w-fit max-w-xl">
                            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span>{inv.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 shrink-0">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                          {"Monto Invertido"}
                        </span>
                        <span className="text-xl font-black text-slate-900 dark:text-white">
                          ${formatNumber(inv.investedAmount)}
                        </span>
                      </div>

                      <button 
                        onClick={() => setItemToDelete(inv)}
                        className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
                        title="Eliminar activo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}

            {filteredInvestments.length === 0 && (
              <div className="p-12 text-center">
                <Boxes className="w-12 h-12 text-slate-200 dark:text-zinc-700 mx-auto mb-4" />
                <h4 className="font-bold text-slate-900 dark:text-white">{"No se encontraron activos"}</h4>
                <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                  {"Prueba ajustando los filtros o registra una nueva inversión o mercancía."}
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Asset Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-8 shadow-2xl animate-scale-up">
            <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-6">
              {"Añadir Activo o Inversión"}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Nombre del Activo */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">
                  {"Nombre del Activo / Inversión"}
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Lote de Ropa Deportiva, Acciones Apple, Terreno..."
                  value={formData.assetName}
                  onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white text-sm"
                />
              </div>

              {/* Tipo de Activo */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">
                  {"Tipo de Activo"}
                </label>
                <select
                  value={formData.assetType}
                  onChange={(e) => setFormData({ ...formData, assetType: e.target.value as any })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white text-sm cursor-pointer"
                >
                  <option value="Merchandise">Mercancía</option>
                  <option value="Stocks">Acciones / ETFs</option>
                  <option value="Real Estate">Bienes Raíces</option>
                  <option value="Crypto">Criptomonedas</option>
                  <option value="Fixed Income">Renta Fija</option>
                  <option value="Cash">Efectivo / Ahorro</option>
                  <option value="Other">Otros</option>
                </select>
              </div>

              {/* Monto Invertido */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">
                  {"Monto a Invertir ($)"}
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={formData.investedAmount}
                  onChange={(e) => setFormData({ ...formData, investedAmount: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white text-sm"
                />
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">
                  {"Observaciones"}
                </label>
                <textarea
                  rows={3}
                  placeholder="ej. Proveedor, detalles del lote, fecha estimada de venta o notas adicionales..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white text-sm resize-none"
                />
              </div>

              {/* Botones */}
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  {"Cancelar"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  {"Registrar Activo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-2">
              {"¿Eliminar activo?"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6">
              {"¿Estás seguro de que deseas eliminar"} <strong className="text-slate-800 dark:text-zinc-200 font-semibold">{itemToDelete.assetName}</strong> {"del portafolio? Esta acción no se puede deshacer."}
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-3 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold text-sm text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                {"Cancelar"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-500 shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                {"Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
