"use client";

import React, { useState } from "react";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  DollarSign,
  Filter,
  MoreVertical,
  X,
  CreditCard
} from "lucide-react";
import { useStore, CalendarEvent } from "@/lib/mock-data";

export default function CalendarPage() {
  const { calendarEvents, household, addCalendarEvent, payBill } = useStore();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    dueDate: new Date().toISOString().split('T')[0],
    type: "BILL" as CalendarEvent["type"]
  });

  const nextMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  const prevMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));

  const unpaidCount = calendarEvents.filter(e => e.status !== "PAID").length;
  const totalUpcoming = calendarEvents.filter(e => e.status !== "PAID").reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCalendarEvent(
      formData.title,
      new Date(formData.dueDate).toISOString(),
      parseFloat(formData.amount),
      formData.type
    );
    setIsModalOpen(false);
    setFormData({ title: "", amount: "", dueDate: new Date().toISOString().split('T')[0], type: "BILL" });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-7 h-7 text-indigo-600" /> {"Calendario Inteligente y Facturas"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">{"Seguimiento automático de pagos recurrentes, impuestos y fechas límite."}</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-5 h-5" /> {"Programar Pago"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Bill Management List */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-indigo-900 text-white p-6 rounded-3xl shadow-xl shadow-indigo-900/20 relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-24 h-24 bg-white/5 rounded-full" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-1">{"Pasivos Próximos"}</h3>
            <p className="text-3xl font-black">${totalUpcoming.toLocaleString()}</p>
            <div className="flex items-center gap-2 mt-4 text-xs font-bold text-indigo-200">
              <Clock className="w-4 h-4" /> {unpaidCount} {"Pagos Pendientes"}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <h4 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center justify-between">
              {"Vista de Línea de Tiempo"}
              <button className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline">{"Pagar Todo"}</button>
            </h4>

            <div className="space-y-5">
              {calendarEvents.sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map((ev) => {
                const isOverdue = new Date(ev.dueDate) < new Date() && ev.status !== "PAID";
                return (
                  <div key={ev.id} className="group relative pl-6 border-l border-slate-100 dark:border-zinc-800 pb-1">
                    <div className={`absolute left-0 top-1 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-900 ${
                      ev.status === "PAID" ? "bg-emerald-500" : isOverdue ? "bg-rose-500 animate-pulse" : "bg-amber-400"
                    }`} />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h5 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition">{ev.title}</h5>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{new Date(ev.dueDate).toLocaleDateString()}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className={`text-[10px] font-black uppercase tracking-widest ${
                            ev.type === "BILL" ? "text-indigo-400" : ev.type === "TAX" ? "text-rose-400" : "text-sky-400"
                          }`}>{ev.type}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900 dark:text-white">${ev.amount}</p>
                        {ev.status !== "PAID" && (
                          <button 
                            onClick={() => payBill(ev.id)}
                            className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-tighter"
                          >
                            {"Confirmar Pago"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Interactive Calendar Widget (Conceptual Visualization) */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <button onClick={prevMonth} className="p-2 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-xl transition"><ChevronLeft className="w-5 h-5" /></button>
              {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              <button onClick={nextMonth} className="p-2 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-xl transition"><ChevronRight className="w-5 h-5" /></button>
            </h3>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-800 p-1 rounded-xl border border-slate-200 dark:border-zinc-700">
               <button className="px-4 py-1.5 bg-white dark:bg-zinc-700 text-xs font-bold text-indigo-600 dark:text-indigo-400 rounded-lg shadow-sm">{"Vista de Calendario"}</button>
               <button className="px-4 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg">{"Vista de Lista"}</button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-slate-100 dark:bg-zinc-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-zinc-800">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(d => (
              <div key={d} className="bg-slate-50 dark:bg-zinc-800/50 py-3 text-center text-[10px] font-black text-slate-400 tracking-widest">{d}</div>
            ))}
            {Array.from({ length: 35 }).map((_, i) => {
              const dayNum = i - 2; // Rough offset for visualization
              const hasEvent = i === 5 || i === 18 || i === 25 || i === 28;
              const isToday = i === 16;
              
              return (
                <div key={i} className="bg-white dark:bg-zinc-900 min-h-[100px] p-3 hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition cursor-default group border-r border-b border-slate-100 dark:border-zinc-800">
                  <div className={`text-xs font-bold ${isToday ? "bg-indigo-600 text-white w-6 h-6 flex items-center justify-center rounded-lg shadow-lg shadow-indigo-600/20" : "text-slate-400"}`}>
                    {dayNum > 0 && dayNum <= 31 ? dayNum : ""}
                  </div>
                  {hasEvent && dayNum > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className={`h-1.5 w-full rounded-full ${i === 5 ? "bg-emerald-500" : i === 25 ? "bg-rose-500" : "bg-indigo-500"}`} />
                      <div className="text-[9px] font-bold text-slate-900 dark:text-zinc-200 truncate group-hover:whitespace-normal">
                        {i === 5 ? "Paid: Mortgage" : i === 18 ? "Internet Bill" : i === 25 ? "Prop. Tax" : "Gym sub."}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 p-6 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-700 flex flex-col items-center justify-center text-center space-y-3">
             <div className="p-3 bg-white dark:bg-zinc-800 rounded-full shadow-sm text-indigo-600">
                <CreditCard className="w-6 h-6" />
             </div>
             <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{"Integración Lista"}</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">{"Conecta tu feed de Google Calendar o iCal para sincronizar fechas límite y recordatorios de pago."}</p>
             </div>
             <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 shadow-lg shadow-indigo-600/10 transition">
                {"Conectar API de Google Calendar"}
             </button>
          </div>
        </div>

      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-8 shadow-2xl animate-scale-up">
            <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-6">{"Programar Pasivo"}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">{"Título del Pasivo"}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Insurance Renewal"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">{"Fecha de Vencimiento"}</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">{"Monto"} ({household.baseCurrency})</label>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">{"Tipo de Pasivo"}</label>
                <div className="grid grid-cols-3 gap-3">
                  {(["BILL", "TAX", "SUBSCRIPTION"] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: t })}
                      className={`py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                        formData.type === t 
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                          : "border-slate-200 dark:border-zinc-700 text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
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
                  {"Confirmar Programación"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
