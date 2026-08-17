"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Repeat, 
  Trash2, 
  Calendar,
  Tag,
  DollarSign,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Download
} from "lucide-react";
import { useStore, Transaction } from "@/lib/mock-data";

export default function TransactionsPage() {
  const { transactions, household, users, addTransaction, deleteTransaction } = useStore();
  
  // States
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    amount: "",
    type: "EXPENSE" as "INCOME" | "EXPENSE" | "TRANSFER",
    category: "Food",
    notes: "",
    date: new Date().toISOString().split('T')[0],
    isRecurring: false,
    userId: "u-1"
  });

  // Filtered Data
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = "Notas".toLowerCase().includes(search.toLowerCase()) || 
                         "Categoría".toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "ALL" || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount) return;

    addTransaction({
      userId: formData.userId,
      type: formData.type,
      amount: parseFloat(formData.amount),
      currency: household.baseCurrency,
      category: formData.category,
      date: new Date(formData.date).toISOString(),
      notes: formData.notes,
      isRecurring: formData.isRecurring
    });

    setFormData({
      amount: "",
      type: "EXPENSE",
      category: "Food",
      notes: "",
      date: new Date().toISOString().split('T')[0],
      isRecurring: false,
      userId: "u-1"
    });
    setIsModalOpen(false);
  };

  const categories = {
    INCOME: ["Salary", "Bonus", "Consulting", "Investment", "Gift", "Other"],
    EXPENSE: ["Housing", "Utilities", "Food", "Transport", "Health", "Education", "Entertainment", "Shopping", "Savings", "Other"]
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{"Libro Mayor del Hogar"}</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400">{"Registro detallado de todos los ingresos y gastos para"} {household.name}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition">
            <Download className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-5 h-5" /> {"Nueva Transacción"}
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder={"Buscar notas o categorías..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        
        <div className="flex items-center bg-slate-50 dark:bg-zinc-800 p-1 rounded-xl border border-slate-200 dark:border-zinc-700 w-full md:w-auto">
          {(["ALL", "INCOME", "EXPENSE"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === type 
                  ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                  : "text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-800/50 text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                <th className="px-6 py-4">{"Transacción"}</th>
                <th className="px-6 py-4">{"Categoría"}</th>
                <th className="px-6 py-4">{"Miembro"}</th>
                <th className="px-6 py-4">{"Fecha"}</th>
                <th className="px-6 py-4 text-right">{"Monto"}</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${
                        tx.type === "INCOME" 
                          ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600" 
                          : "bg-rose-50 dark:bg-rose-950/30 text-rose-600"
                      }`}>
                        {tx.type === "INCOME" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{tx.notes}</p>
                        {tx.isRecurring && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">
                            <Repeat className="w-3 h-3" /> {"Recurrente"} {tx.recurrenceInterval}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                      {tx.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                        {(users.find(u => u.id === tx.userId)?.name || "User").charAt(0)}
                      </div>
                      <span className="text-xs font-medium text-slate-600 dark:text-zinc-300">
                        {users.find(u => u.id === tx.userId)?.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                      {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right font-bold text-sm ${
                    tx.type === "INCOME" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"
                  }`}>
                    {tx.type === "INCOME" ? "+" : "-"}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => deleteTransaction(tx.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTransactions.length === 0 && (
            <div className="p-12 text-center">
              <div className="bg-slate-50 dark:bg-zinc-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h4 className="text-slate-900 dark:text-white font-bold">{"No se encontraron transacciones"}</h4>
              <p className="text-sm text-slate-500 dark:text-zinc-400">{"Intenta ajustar tus filtros o términos de búsqueda."}</p>
            </div>
          )}
        </div>
        
        {/* Pagination placeholder */}
        <div className="bg-slate-50/50 dark:bg-zinc-800/30 px-6 py-4 flex items-center justify-between border-t border-slate-100 dark:border-zinc-800">
          <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">
            {"Mostrando"} <span className="text-slate-900 dark:text-zinc-200">{filteredTransactions.length}</span> {"de"} {transactions.length} {"entradas"}
          </p>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-400 disabled:opacity-50" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-400 disabled:opacity-50" disabled>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-8 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-950 dark:text-white flex items-center gap-2">
                <div className="p-2 bg-indigo-600 rounded-lg text-white">
                  <DollarSign className="w-5 h-5" />
                </div>
                {"Registrar Transacción"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-3">
                {(["EXPENSE", "INCOME"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: t, category: categories[t][0] })}
                    className={`py-3 rounded-xl border font-bold text-sm transition-all ${
                      formData.type === t 
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20" 
                        : "border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">{"Monto"}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">{"Categoría"}</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                  >
                    {categories[formData.type as "INCOME" | "EXPENSE"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">{"Nota / Descripción"}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekly family dinner"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">{"Fecha"}</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">{"Miembro"}</label>
                  <select
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white font-medium"
                  >
                    {users.filter(u => u.role !== "CHILD").map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 py-2">
                <input 
                  type="checkbox" 
                  id="recurring" 
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="recurring" className="text-sm font-semibold text-slate-700 dark:text-zinc-300 cursor-pointer">{"Recurrente (Mensual)"}</label>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-base hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {"Registrar"} {formData.type}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function X(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
