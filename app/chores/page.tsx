"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckSquare, 
  Smartphone, 
  Trophy, 
  Plus, 
  Clock, 
  User as UserIcon, 
  Star, 
  Gamepad2, 
  Zap, 
  Hourglass,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  ChevronRight,
  Trash2
} from "lucide-react";
import { useStore, Chore, User } from "@/lib/mock-data";

export default function ChoresPage() {
  const { 
    chores, 
    users, 
    screenTime, 
    completeChore, 
    addChore, 
    logScreenTime, 
    redeemScreenTime 
  } = useStore();

  const [activeUser, setActiveUser] = useState<User | null>(null);

  useEffect(() => {
    const checkUser = () => {
      if (typeof window !== "undefined") {
        const activeId = localStorage.getItem("sinergy_active_user_id") || "u-1";
        const current = users.find(u => u.id === activeId);
        if (current) setActiveUser(current);
      }
    };
    checkUser();
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, [users]);

  // Modal States
  const [isChoreModalOpen, setIsChoreModalOpen] = useState(false);
  const [choreForm, setChoreForm] = useState({
    title: "",
    assignedTo: "u-3",
    points: "25"
  });

  const [isLogScreenModalOpen, setIsLogScreenModalOpen] = useState(false);
  const [screenMinutes, setScreenMinutes] = useState("15");

  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);

  const handleAddChore = (e: React.FormEvent) => {
    e.preventDefault();
    addChore(choreForm.title, choreForm.assignedTo, parseInt(choreForm.points));
    setIsChoreModalOpen(false);
    setChoreForm({ title: "", assignedTo: "u-3", points: "25" });
  };

  const handleLogScreen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) return;
    logScreenTime(activeUser.id, parseInt(screenMinutes));
    setIsLogScreenModalOpen(false);
    setScreenMinutes("15");
  };

  const handleRedeem = (points: number) => {
    if (!activeUser) return;
    const success = redeemScreenTime(activeUser.id, points);
    if (success) {
      setIsRedeemModalOpen(false);
    } else {
      alert("Insufficient points balance!");
    }
  };

  const children = users.filter(u => u.role === "CHILD");
  const myChores = chores.filter(c => c.assignedToUserId === activeUser?.id);
  const otherChores = chores.filter(c => c.assignedToUserId !== activeUser?.id);

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-indigo-600" /> {"Tareas y Tiempo de Pantalla"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">{"Tareas gamificadas y reglas de uso de pantalla para niños y adolescentes."}</p>
        </div>
        
        {activeUser?.role === "ADMIN" && (
          <button 
            onClick={() => setIsChoreModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-5 h-5" /> {"Asignar Nueva Tarea"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Chores List */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active User's Perspective */}
          {activeUser?.role === "CHILD" && (
            <div className="bg-indigo-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
               <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
               <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <h3 className="text-indigo-200 text-xs font-black uppercase tracking-widest">{"Mi Billetera de Recompensas"}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-4xl font-black">{activeUser.pointsBalance}</span>
                      <span className="text-sm font-bold text-indigo-300">{"Puntos Totales Disponibles"}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsRedeemModalOpen(true)}
                    className="bg-amber-400 hover:bg-amber-300 text-amber-950 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-400/20 transition-all flex items-center gap-2"
                  >
                    <Gamepad2 className="w-4 h-4" /> {"Canjear Tiempo de Pantalla"}
                  </button>
               </div>
            </div>
          )}

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30">
               <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                 <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> 
                 {activeUser?.role === "CHILD" ? "Mis Tareas Personales" : "Tareas Activas del Hogar"}
               </h4>
            </div>

            <div className="divide-y divide-slate-50 dark:divide-zinc-800">
              {(activeUser?.role === "CHILD" ? myChores : chores).map(chore => (
                <div key={chore.id} className="p-6 flex items-center justify-between gap-4 group hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      chore.status === "COMPLETED" 
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20" 
                        : "bg-slate-100 text-slate-400 dark:bg-zinc-800"
                    }`}>
                      <CheckSquare className={`w-5 h-5 ${chore.status === "COMPLETED" ? "animate-bounce" : ""}`} />
                    </div>
                    <div>
                      <h5 className={`text-sm font-bold ${chore.status === "COMPLETED" ? "line-through text-slate-400" : "text-slate-900 dark:text-white"}`}>
                        {chore.title}
                      </h5>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">+{chore.pointsReward} {"Puntos"}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{"Miembro"}: {users.find(u => u.id === chore.assignedToUserId)?.name}</span>
                      </div>
                    </div>
                  </div>

                  {chore.status === "PENDING" && (activeUser?.role === "ADMIN" || activeUser?.id === chore.assignedToUserId) && (
                    <button 
                      onClick={() => completeChore(chore.id)}
                      className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    >
                      {"Hecho"}
                    </button>
                  )}
                  {chore.status === "COMPLETED" && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1 rounded-full">
                       <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{"Verificado"}</span>
                    </div>
                  )}
                </div>
              ))}

              {(activeUser?.role === "CHILD" ? myChores : chores).length === 0 && (
                <div className="p-12 text-center">
                  <Sparkles className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <h5 className="font-bold text-slate-400 uppercase tracking-widest text-sm">{"No hay tareas asignadas aún"}</h5>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Screen Time & Leaderboard */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Screen Time Tracker */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-rose-500" /> {"Reglas de Tiempo de Pantalla"}
              </h4>
              <button 
                onClick={() => setIsLogScreenModalOpen(true)}
                className="p-2 bg-rose-50 dark:bg-rose-950/20 text-rose-600 rounded-xl hover:bg-rose-100 transition"
                title={"Registrar Uso"}
              >
                <Clock className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-6">
              {children.map(child => {
                const log = screenTime.find(s => s.childUserId === child.id) || { minutesUsed: 0, dailyLimitMinutes: 120 };
                const ratio = Math.min(100, (log.minutesUsed / log.dailyLimitMinutes) * 100);
                const isOver = log.minutesUsed > log.dailyLimitMinutes;

                return (
                  <div key={child.id} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">{child.name}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{"LÍMITE DIARIO"}: {log.dailyLimitMinutes} {"Minutos"}</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-black ${isOver ? "text-rose-600" : "text-slate-900 dark:text-zinc-200"}`}>
                          {log.minutesUsed} <span className="text-[10px] text-slate-400">{"MIN UTILIZADOS"}</span>
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-3 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${isOver ? "bg-rose-500 animate-pulse" : "bg-rose-400"}`}
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                    {isOver && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-600 uppercase tracking-tight">
                        <ShieldAlert className="w-3.5 h-3.5" /> {"Límite excedido. Bloqueo activado."}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Points Leaderboard */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
            <h4 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" /> {"Ranking del Hogar"}
            </h4>

            <div className="space-y-4">
              {children.sort((a,b) => b.pointsBalance - a.pointsBalance).map((child, idx) => (
                <div key={child.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-black text-slate-300 w-4">#{idx+1}</span>
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center font-black text-indigo-600 text-sm">
                      {child.name.charAt(0)}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white block">{child.name}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{"Ayudante Estrella"}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{child.pointsBalance}</span>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">{"Puntos"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Assign Chore Modal */}
      {isChoreModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-8 shadow-2xl animate-scale-up">
            <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-6">{"Asignar Tarea del Hogar"}</h3>
            
            <form onSubmit={handleAddChore} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">{"Descripción de la Tarea"}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Empty the living room trash"
                  value={choreForm.title}
                  onChange={(e) => setChoreForm({ ...choreForm, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">{"Asignado a"}</label>
                  <select
                    value={choreForm.assignedTo}
                    onChange={(e) => setChoreForm({ ...choreForm, assignedTo: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                  >
                    {children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">{"Puntos de Recompensa"}</label>
                  <input
                    type="number"
                    required
                    value={choreForm.points}
                    onChange={(e) => setChoreForm({ ...choreForm, points: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChoreModalOpen(false)}
                  className="flex-1 py-4 border border-slate-200 dark:border-zinc-700 rounded-2xl font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-50 transition"
                >
                  {"Cancelar"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 transition-all"
                >
                  {"Desplegar Tarea"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Screen Time Modal */}
      {isLogScreenModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-sm w-full p-8 shadow-2xl animate-scale-up text-center">
            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Hourglass className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-2">{"Registrar Uso de Pantalla"}</h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6 font-medium">{"Registrando tiempo para"}: <span className="text-rose-600 font-bold">{activeUser?.name}</span></p>
            
            <form onSubmit={handleLogScreen} className="space-y-6">
              <div className="relative">
                <input
                  type="number"
                  required
                  autoFocus
                  placeholder="Minutes"
                  value={screenMinutes}
                  onChange={(e) => setScreenMinutes(e.target.value)}
                  className="w-full px-4 py-4 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-black text-2xl focus:ring-2 focus:ring-rose-500 outline-none text-slate-900 dark:text-white text-center"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsLogScreenModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-50 transition"
                >
                  {"Cancelar"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-500 shadow-xl shadow-rose-600/20 transition-all"
                >
                  {"Añadir"} {"Minutos"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Redeem Points Modal */}
      {isRedeemModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-8 shadow-2xl animate-scale-up">
            <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-2">{"Mercado de Puntos"}</h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-8 font-medium">{"Canjea tus puntos por minutos adicionales de pantalla."}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { minutes: 15, points: 10, label: "Descanso Rápido" },
                { minutes: 30, points: 18, label: "Sesión Corta" },
                { minutes: 60, points: 35, label: "Pase Estándar" },
                { minutes: 120, points: 65, label: "Especial de Fin de Semana" },
              ].map((tier, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRedeem(tier.points)}
                  disabled={(activeUser?.pointsBalance || 0) < tier.points}
                  className="p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40 hover:border-amber-400 dark:hover:border-amber-500 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2 bg-white dark:bg-zinc-900 rounded-lg shadow-sm text-amber-500">
                      <Zap className="w-4 h-4 fill-amber-500" />
                    </div>
                    <span className="text-xs font-black text-amber-600 uppercase tracking-widest">{tier.points} {"Puntos"}</span>
                  </div>
                  <h5 className="font-bold text-slate-900 dark:text-white">{tier.minutes} {"Minutos"}</h5>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{tier.label}</p>
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsRedeemModalOpen(false)}
              className="w-full mt-8 py-4 border border-slate-200 dark:border-zinc-700 rounded-2xl font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-50 transition"
            >
              {"Cerrar Mercado"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
