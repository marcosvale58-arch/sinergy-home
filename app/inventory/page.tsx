"use client";

import React, { useState } from "react";
import { 
  PackageCheck, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  ChevronRight,
  ShoppingCart,
  Layers,
  Sparkles,
  RefreshCcw,
  History
} from "lucide-react";
import { useStore, InventoryItem } from "@/lib/mock-data";

export default function InventoryPage() {
  const { inventory, household, updateInventoryStock, addInventoryItem } = useStore();
  
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    name: "",
    category: "Pantry" as InventoryItem["category"],
    minQuantity: "1",
    unit: "units"
  });

  const categories = ["All", "Pantry", "Cleaning", "Toiletries", "Medicine"];

  const filteredItems = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = inventory.filter(item => Number(item.currentQuantity) <= Number(item.minQuantity));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addInventoryItem(
      formData.name,
      formData.category,
      parseFloat(formData.minQuantity),
      formData.unit
    );
    setIsModalOpen(false);
    setFormData({ name: "", category: "Pantry", minQuantity: "1", unit: "units" });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PackageCheck className="w-7 h-7 text-indigo-600" /> {"Inventario y Stock"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">{"Gestiona los niveles de stock del hogar y listas de compras automatizadas."}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition">
            <History className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-5 h-5" /> {"Añadir Suministro"}
          </button>
        </div>
      </div>

      {/* Stats & Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Low Stock Alerts */}
        <div className="lg:col-span-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-rose-800 dark:text-rose-400 flex items-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4" /> {"Alertas Críticas de Stock"}
            </h4>
            <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              {lowStockItems.length} {"ARTÍCULOS"}
            </span>
          </div>

          <div className="space-y-3">
            {lowStockItems.slice(0, 4).map(item => (
              <div key={item.id} className="bg-white/80 dark:bg-zinc-900/60 p-3 rounded-xl border border-rose-200 dark:border-rose-900/40 flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">{item.name}</span>
                  <span className="text-[10px] text-rose-500 font-bold uppercase">{"STOCK"}: {item.currentQuantity} {item.unit}</span>
                </div>
                <button 
                  onClick={() => updateInventoryStock(item.id, 1)}
                  className="p-1.5 bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-100 transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))}
            {lowStockItems.length === 0 && (
              <div className="text-center py-8">
                <Sparkles className="w-8 h-8 text-rose-300 dark:text-rose-800 mx-auto mb-2" />
                <p className="text-xs font-bold text-rose-400 uppercase tracking-widest">Inventory fully stocked</p>
              </div>
            )}
          </div>

          {lowStockItems.length > 0 && (
            <button className="w-full mt-4 py-3 bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-rose-500 transition shadow-lg shadow-rose-600/10">
              <ShoppingCart className="w-4 h-4" /> {"Generar Lista de Compras"}
            </button>
          )}
        </div>

        {/* Inventory Browser */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder={"Buscar artículo..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            
            <div className="flex items-center bg-white dark:bg-zinc-900 p-1 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-x-auto w-full sm:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
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

          {/* Grid of Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredItems.map(item => {
              const isLow = Number(item.currentQuantity) <= Number(item.minQuantity);
              return (
                <div key={item.id} className={`bg-white dark:bg-zinc-900 border ${isLow ? "border-rose-200 dark:border-rose-900/40 ring-1 ring-rose-50 dark:ring-rose-900/10" : "border-slate-200 dark:border-zinc-800"} p-5 rounded-2xl shadow-sm hover:shadow-md transition group`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div className="text-right">
                      <span className={`text-xl font-black ${isLow ? "text-rose-600" : "text-slate-900 dark:text-white"}`}>
                        {item.currentQuantity}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{item.unit}</span>
                    </div>
                  </div>

                  <h5 className="font-bold text-slate-900 dark:text-white mb-1">{item.name}</h5>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{item.category}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">MIN: {item.minQuantity} {item.unit}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => updateInventoryStock(item.id, -1)}
                      className="flex-1 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-rose-50 hover:text-rose-600 transition flex items-center justify-center"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => updateInventoryStock(item.id, 1)}
                      className="flex-1 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-emerald-50 hover:text-emerald-600 transition flex items-center justify-center"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center">
              <PackageCheck className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h4 className="font-bold text-slate-900 dark:text-white">No items found</h4>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Try changing your filters or add a new supply.</p>
            </div>
          )}

        </div>

      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-8 shadow-2xl animate-scale-up">
            <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-6">New Household Supply</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">{"Nombre del Artículo"}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dishwasher Pods"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">{"Categoría"}</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                  >
                    <option value="Pantry">Pantry</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Toiletries">Toiletries</option>
                    <option value="Medicine">Medicine</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">{"Tipo de Unidad"}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. units, kg, packs"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">{"Cantidad Mínima de Alerta"}</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.minQuantity}
                  onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                />
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
                  {"Registrar Artículo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
