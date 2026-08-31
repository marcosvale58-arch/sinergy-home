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
  History,
  FileDown,
  X,
  Check,
  CheckSquare,
  Square
} from "lucide-react";
import { useStore, InventoryItem } from "@/lib/mock-data";
import { generateShoppingListPdf } from "@/lib/generate-shopping-list-pdf";

export default function InventoryPage() {
  const { inventory, household, updateInventoryStock, addInventoryItem, deleteInventoryItem } = useStore();
  
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [isShoppingListModalOpen, setIsShoppingListModalOpen] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  // Form
  const [formData, setFormData] = useState<{
    name: string;
    category: InventoryItem["category"];
    minQuantity: string;
    unit: string;
  }>({
    name: "",
    category: "Pantry",
    minQuantity: "1",
    unit: "unidades"
  });

  const categories = ["Todos", "Despensa", "Limpieza", "Higiene", "Medicina"];

  const filteredItems = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "Todos" || item.category === activeCategory || 
      (activeCategory === "Despensa" && item.category === "Pantry") ||
      (activeCategory === "Limpieza" && item.category === "Cleaning") ||
      (activeCategory === "Higiene" && item.category === "Toiletries") ||
      (activeCategory === "Medicina" && item.category === "Medicine");
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
    setFormData({ name: "", category: "Pantry", minQuantity: "1", unit: "unidades" });
  };

  const handleDelete = () => {
    if (itemToDelete) {
      deleteInventoryItem(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  const handleOpenShoppingList = () => {
    setSelectedItemIds(lowStockItems.map(i => i.id));
    setPdfDownloaded(false);
    setIsShoppingListModalOpen(true);
  };

  const handleToggleSelectItem = (id: string) => {
    if (selectedItemIds.includes(id)) {
      setSelectedItemIds(selectedItemIds.filter(itemId => itemId !== id));
    } else {
      setSelectedItemIds([...selectedItemIds, id]);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedItemIds.length === lowStockItems.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(lowStockItems.map(i => i.id));
    }
  };

  const handleDownloadPdf = () => {
    const itemsToExport = lowStockItems.filter(item => selectedItemIds.includes(item.id));
    if (itemsToExport.length === 0) return;
    generateShoppingListPdf({
      householdName: household?.name || "Hogar Principal",
      items: itemsToExport,
    });
    setPdfDownloaded(true);
    setTimeout(() => setPdfDownloaded(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PackageCheck className="w-7 h-7 text-indigo-600" /> {"Inventario"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">{"Gestiona los niveles de stock del hogar y listas de compras automatizadas."}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition" title="Historial">
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
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => updateInventoryStock(item.id, 1)}
                    className="p-1.5 bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-100 transition"
                    title="Aumentar"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setItemToDelete(item)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-100/50 dark:hover:bg-rose-900/40 rounded-lg transition"
                    title="Eliminar suministro"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {lowStockItems.length === 0 && (
              <div className="text-center py-8">
                <Sparkles className="w-8 h-8 text-rose-300 dark:text-rose-800 mx-auto mb-2" />
                <p className="text-xs font-bold text-rose-400 uppercase tracking-widest">{"Inventario totalmente abastecido"}</p>
              </div>
            )}
          </div>

          {lowStockItems.length > 0 && (
            <button 
              onClick={handleOpenShoppingList}
              className="w-full mt-4 py-3 bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-rose-500 transition shadow-lg shadow-rose-600/10 cursor-pointer active:scale-[0.99]"
            >
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
                <div key={item.id} className={`bg-white dark:bg-zinc-900 border ${isLow ? "border-rose-200 dark:border-rose-900/40 ring-1 ring-rose-50 dark:ring-rose-900/10" : "border-slate-200 dark:border-zinc-800"} p-5 rounded-2xl shadow-sm hover:shadow-md transition group flex flex-col justify-between`}>
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className={`text-xl font-black ${isLow ? "text-rose-600" : "text-slate-900 dark:text-white"}`}>
                            {item.currentQuantity}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{item.unit}</span>
                        </div>
                        <button 
                          onClick={() => setItemToDelete(item)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                          title="Eliminar suministro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h5 className="font-bold text-slate-900 dark:text-white mb-1">{item.name}</h5>
                    <div className="flex items-center gap-2 mb-6">
                      <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                        {item.category === "Pantry" ? "Despensa" : item.category === "Cleaning" ? "Limpieza" : item.category === "Toiletries" ? "Higiene" : item.category === "Medicine" ? "Medicina" : item.category}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-zinc-700" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">MIN: {item.minQuantity} {item.unit}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800/60">
                    <button 
                      onClick={() => updateInventoryStock(item.id, -1)}
                      className="flex-1 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 transition flex items-center justify-center gap-1 text-xs font-semibold"
                      title="Disminuir"
                    >
                      <ArrowDown className="w-4 h-4" /> -1
                    </button>
                    <button 
                      onClick={() => updateInventoryStock(item.id, 1)}
                      className="flex-1 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/30 transition flex items-center justify-center gap-1 text-xs font-semibold"
                      title="Aumentar"
                    >
                      <ArrowUp className="w-4 h-4" /> +1
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center">
              <PackageCheck className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h4 className="font-bold text-slate-900 dark:text-white">{"No se encontraron artículos"}</h4>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">{"Prueba cambiando los filtros o añade un nuevo suministro."}</p>
            </div>
          )}

        </div>

      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-8 shadow-2xl animate-scale-up">
            <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-6">{"Nuevo Suministro del Hogar"}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">{"Nombre del Artículo"}</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Cápsulas de Lavavajillas"
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
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as InventoryItem["category"] })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                  >
                    <option value="Pantry">Despensa</option>
                    <option value="Cleaning">Limpieza</option>
                    <option value="Toiletries">Higiene</option>
                    <option value="Medicine">Medicina</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">{"Tipo de Unidad"}</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. unidades, kg, paquetes"
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

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-2">
              {"¿Eliminar suministro?"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6">
              {"¿Estás seguro de que deseas eliminar"} <strong className="text-slate-800 dark:text-zinc-200 font-semibold">{itemToDelete.name}</strong> {"del inventario? Esta acción no se puede deshacer."}
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-3 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold text-sm text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
              >
                {"Cancelar"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-500 shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {"Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shopping List Modal */}
      {isShoppingListModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl animate-scale-up max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-xl">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-950 dark:text-white flex items-center gap-2">
                    {"Lista de Compras"}
                    <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      {lowStockItems.length} {"CRÍTICOS"}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    {"Artículos que requieren reposición urgente en el hogar."}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsShoppingListModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Subheader / Controls */}
            <div className="py-3 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
              <button 
                onClick={handleToggleSelectAll}
                className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {selectedItemIds.length === lowStockItems.length ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                {selectedItemIds.length === lowStockItems.length ? "Deseleccionar todos" : "Seleccionar todos"}
              </button>
              <span className="font-semibold">
                {selectedItemIds.length} de {lowStockItems.length} seleccionados
              </span>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 my-2">
              {lowStockItems.map((item) => {
                const isSelected = selectedItemIds.includes(item.id);
                const current = Number(item.currentQuantity);
                const min = Number(item.minQuantity);
                const deficit = Math.max(1, Math.round((min - current) * 10) / 10);

                const getCategoryText = (cat: string) => {
                  switch (cat) {
                    case "Pantry": return "Despensa";
                    case "Cleaning": return "Limpieza";
                    case "Toiletries": return "Higiene";
                    case "Medicine": return "Medicina";
                    default: return cat;
                  }
                };

                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggleSelectItem(item.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected 
                        ? "bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40" 
                        : "bg-slate-50/60 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-800 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center text-white transition ${isSelected ? "bg-rose-600" : "border-2 border-slate-300 dark:border-zinc-600 bg-transparent"}`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</span>
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 text-slate-500 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                            {getCategoryText(item.category)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs">
                          <span className="text-rose-600 dark:text-rose-400 font-bold">
                            Stock: {current} {item.unit}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500 dark:text-zinc-400 font-medium">
                            Mínimo: {min} {item.unit}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase block tracking-wider">
                        Sugerido
                      </span>
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                        +{deficit} {item.unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setIsShoppingListModalOpen(false)}
                className="py-3 px-5 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold text-sm text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
              >
                {"Cerrar"}
              </button>
              <button
                type="button"
                disabled={selectedItemIds.length === 0}
                onClick={handleDownloadPdf}
                className="flex-1 py-3 px-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
              >
                {pdfDownloaded ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    {"¡PDF Descargado con Éxito!"}
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4" />
                    {`Descargar Lista en PDF (${selectedItemIds.length})`}
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
