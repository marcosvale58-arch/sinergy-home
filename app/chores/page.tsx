"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  ShieldCheck,
  ChevronRight, 
  Trash2,
  Sliders,
  Check,
  Moon,
  AlertCircle,
  SlidersHorizontal,
  CalendarCheck,
  Edit2,
  RotateCcw,
  RefreshCw,
  Filter,
  Search,
  Users
} from "lucide-react";
import { useStore, Chore, User } from "@/lib/mock-data";

export default function ChoresPage() {
  const { 
    chores, 
    users, 
    screenTime, 
    completeChore, 
    addChore, 
    updateChore,
    deleteChore,
    resetDailyChores,
    logScreenTime, 
    redeemScreenTime,
    updateScreenTimeLimit,
    setScreenTime
  } = useStore();

  const [activeUser, setActiveUser] = useState<User | null>(null);

  useEffect(() => {
    const checkUser = () => {
      if (typeof window !== "undefined") {
        const activeId = localStorage.getItem("sinergy_active_user_id");
        const activeEmail = localStorage.getItem("sinergy_active_user_email");
        const current = users.find(u => u.id === activeId || (activeEmail && u.email.toLowerCase() === activeEmail.toLowerCase()));
        if (current) {
          setActiveUser(prev => prev?.id === current.id ? prev : current);
        } else if (users.length > 0) {
          setActiveUser(prev => prev?.id === users[0].id ? prev : users[0]);
        }
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
    assignedTo: "",
    points: "25"
  });

  // Edit Chore State
  const [editingChore, setEditingChore] = useState<Chore | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    assignedTo: "",
    points: "25",
    status: "PENDING" as "PENDING" | "COMPLETED"
  });

  // Delete & Reset Confirmation States
  const [deletingChore, setDeletingChore] = useState<Chore | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Filter States
  const [filterMemberId, setFilterMemberId] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PENDING" | "COMPLETED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [isLogScreenModalOpen, setIsLogScreenModalOpen] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [screenMinutes, setScreenMinutes] = useState("30");
  const [logMode, setLogMode] = useState<"add" | "set">("add");

  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [customLimits, setCustomLimits] = useState<{ [childId: string]: number }>({});
  const [rulesConfig, setRulesConfig] = useState({
    strictLock: true,
    choresFirst: true,
    nightCurfew: true,
    curfewTime: "20:30",
    weekendBonus: true
  });

  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);

  const children = useMemo(() => users.filter(u => u.role === "CHILD"), [users]);

  // Filtered Chores Calculation
  const filteredChores = useMemo(() => {
    return chores.filter((c) => {
      const matchesMember = filterMemberId === "ALL" ? true : c.assignedToUserId === filterMemberId;
      const matchesStatus = filterStatus === "ALL" ? true : c.status === filterStatus;
      const matchesSearch = !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesMember && matchesStatus && matchesSearch;
    });
  }, [chores, filterMemberId, filterStatus, searchQuery]);

  const openNewChoreModal = () => {
    const defaultAssignee = children[0]?.id || users[0]?.id || "";
    setChoreForm({
      title: "",
      assignedTo: defaultAssignee,
      points: "25",
    });
    setIsChoreModalOpen(true);
  };

  const openRulesModal = () => {
    const limits: { [childId: string]: number } = {};
    children.forEach(child => {
      const log = screenTime.find(s => s.childUserId === child.id);
      limits[child.id] = customLimits[child.id] ?? (log?.dailyLimitMinutes || 120);
    });
    setCustomLimits(limits);
    setIsRulesModalOpen(true);
  };

  const openLogScreenModal = (childId?: string) => {
    if (childId) {
      setSelectedChildId(childId);
    } else if (children.length > 0) {
      setSelectedChildId(children[0].id);
    }
    setIsLogScreenModalOpen(true);
  };

  const handleAddChore = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedUserId = choreForm.assignedTo || children[0]?.id || users[0]?.id;
    if (!choreForm.title.trim() || !assignedUserId) return;

    addChore(choreForm.title.trim(), assignedUserId, parseInt(choreForm.points) || 25);
    setIsChoreModalOpen(false);
    setChoreForm({ title: "", assignedTo: assignedUserId, points: "25" });
  };

  const handleUpdateChore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChore) return;
    updateChore({
      id: editingChore.id,
      title: editForm.title.trim(),
      assignedToUserId: editForm.assignedTo || editingChore.assignedToUserId,
      pointsReward: parseInt(editForm.points) || 0,
      status: editForm.status
    });
    setEditingChore(null);
  };

  const handleLogScreen = (e: React.FormEvent) => {
    e.preventDefault();
    const targetChildId = selectedChildId || children[0]?.id || activeUser?.id;
    if (!targetChildId) return;

    const mins = parseInt(screenMinutes) || 0;
    if (logMode === "add") {
      logScreenTime(targetChildId, mins);
    } else {
      setScreenTime(targetChildId, mins);
    }

    setIsLogScreenModalOpen(false);
    setScreenMinutes("30");
  };

  const handleQuickAddScreenTime = (childId: string, minutes: number) => {
    logScreenTime(childId, minutes);
  };

  const handleSaveRules = (e: React.FormEvent) => {
    e.preventDefault();
    Object.entries(customLimits).forEach(([childId, limit]) => {
      updateScreenTimeLimit(childId, limit);
    });
    setIsRulesModalOpen(false);
  };

  const handleRedeem = (points: number) => {
    if (!activeUser) return;
    const success = redeemScreenTime(activeUser.id, points);
    if (success) {
      setIsRedeemModalOpen(false);
    } else {
      alert("¡Saldo de puntos insuficiente!");
    }
  };

  const myChores = chores.filter(c => c.assignedToUserId === activeUser?.id);
  const otherChores = chores.filter(c => c.assignedToUserId !== activeUser?.id);

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-indigo-600" /> {"Tareas y Tiempo de Pantalla"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">{"Tareas gamificadas y reglas de uso de pantalla para niños y adolescentes."}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button 
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
            title="Reiniciar ciclo diario de tareas a pendientes"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{"Reiniciar Ciclo Diario"}</span>
          </button>
          <button 
            type="button"
            onClick={openNewChoreModal}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5" /> {"Asignar Nueva Tarea"}
          </button>
        </div>
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
            
            {/* Chores Header & Total Count */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 flex items-center justify-between">
               <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                 <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> 
                 {activeUser?.role === "CHILD" ? "Tareas del Hogar" : "Gestor de Tareas del Hogar"}
               </h4>
               <div className="flex items-center gap-3">
                 <span className="text-xs font-bold text-slate-400">
                   {filteredChores.length} de {chores.length} {"tareas"}
                 </span>
                 <button
                   type="button"
                   onClick={openNewChoreModal}
                   className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition"
                 >
                   <Plus className="w-3.5 h-3.5" />
                   <span>{"Nueva Tarea"}</span>
                 </button>
               </div>
            </div>

            {/* Filter Section */}
            <div className="p-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/20 space-y-3">
              {/* Row 1: Member Filter Pills */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                    {"Ver Tareas por Miembro"}
                  </span>
                  {filterMemberId !== "ALL" && (
                    <button
                      onClick={() => setFilterMemberId("ALL")}
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {"Mostrar todos"}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {/* All members button */}
                  <button
                    type="button"
                    onClick={() => setFilterMemberId("ALL")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                      filterMemberId === "ALL"
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                        : "bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-100"
                    }`}
                  >
                    <span>{"Todos los Miembros"}</span>
                    <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                      filterMemberId === "ALL" ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-zinc-700 text-slate-500"
                    }`}>
                      {chores.length}
                    </span>
                  </button>

                  {/* Individual members */}
                  {users.map((u) => {
                    const memberChoresCount = chores.filter((c) => c.assignedToUserId === u.id).length;
                    const isSelected = filterMemberId === u.id;

                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => setFilterMemberId(u.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                            : "bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-100"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                          isSelected ? "bg-white/20 text-white" : "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600"
                        }`}>
                          {u.name.charAt(0)}
                        </div>
                        <span>{u.name}</span>
                        <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                          isSelected ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-zinc-700 text-slate-500"
                        }`}>
                          {memberChoresCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 2: Status & Search Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-200/60 dark:border-zinc-800">
                {/* Status Tabs */}
                <div className="flex items-center p-0.5 bg-slate-200/70 dark:bg-zinc-800 rounded-xl shrink-0">
                  <button
                    type="button"
                    onClick={() => setFilterStatus("ALL")}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition ${
                      filterStatus === "ALL"
                        ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300"
                    }`}
                  >
                    {"Todas"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterStatus("PENDING")}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition ${
                      filterStatus === "PENDING"
                        ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300"
                    }`}
                  >
                    {"Pendientes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterStatus("COMPLETED")}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition ${
                      filterStatus === "COMPLETED"
                        ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300"
                    }`}
                  >
                    {"Completadas"}
                  </button>
                </div>

                {/* Search input */}
                <div className="relative flex-1 sm:max-w-xs">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar tarea..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Chores Items */}
            <div className="divide-y divide-slate-50 dark:divide-zinc-800">
              {filteredChores.map(chore => (
                <div key={chore.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition">
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
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{"Asignado a"}: <strong className="text-slate-600 dark:text-zinc-300 font-semibold">{users.find(u => u.id === chore.assignedToUserId)?.name || "Sin asignar"}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {/* Status button / badge */}
                    {chore.status === "PENDING" && (activeUser?.role === "ADMIN" || activeUser?.id === chore.assignedToUserId) && (
                      <button 
                        type="button"
                        onClick={() => completeChore(chore.id)}
                        className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                      >
                        {"Hecho"}
                      </button>
                    )}
                    {chore.status === "COMPLETED" && (
                      <div className="bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-xl flex items-center gap-1 border border-emerald-200/50 dark:border-emerald-900/30">
                         <Check className="w-3.5 h-3.5 text-emerald-600" />
                         <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{"Completada"}</span>
                      </div>
                    )}

                    {/* Admin Actions: Edit & Delete */}
                    {activeUser?.role === "ADMIN" && (
                      <div className="flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-zinc-800">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingChore(chore);
                            setEditForm({
                              title: chore.title,
                              assignedTo: chore.assignedToUserId,
                              points: chore.pointsReward.toString(),
                              status: chore.status,
                            });
                          }}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-xl transition"
                          title="Modificar tarea"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingChore(chore)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition"
                          title="Eliminar tarea"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {filteredChores.length === 0 && (
                <div className="p-12 text-center space-y-4">
                  <Sparkles className="w-12 h-12 text-indigo-400 dark:text-indigo-500 mx-auto" />
                  <div>
                    <h5 className="font-bold text-slate-700 dark:text-zinc-200 text-base">
                      {chores.length === 0 ? "No hay tareas registradas aún" : "No hay tareas con los filtros seleccionados"}
                    </h5>
                    <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 max-w-sm mx-auto">
                      {chores.length === 0 
                        ? "Crea y asigna tareas a cualquier miembro del hogar para ganar recompensas y puntos de pantalla."
                        : "Prueba seleccionando otro miembro o restableciendo los filtros."}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    {(filterMemberId !== "ALL" || filterStatus !== "ALL" || searchQuery) && (
                      <button
                        type="button"
                        onClick={() => {
                          setFilterMemberId("ALL");
                          setFilterStatus("ALL");
                          setSearchQuery("");
                        }}
                        className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-bold hover:bg-slate-200 transition"
                      >
                        {"Restablecer Filtros"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={openNewChoreModal}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{"Asignar Nueva Tarea"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Screen Time & Leaderboard */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Screen Time Tracker */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-rose-500" /> {"Reglas y Tiempo de Pantalla"}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">{"Monitoreo y límites de uso diario"}</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={openRulesModal}
                  className="p-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl transition flex items-center gap-1.5 text-xs font-bold"
                  title="Gestionar Reglas de Pantalla"
                >
                  <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="hidden sm:inline">{"Gestionar Reglas"}</span>
                </button>
                <button 
                  onClick={() => openLogScreenModal()}
                  className="p-2.5 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl transition flex items-center gap-1.5 text-xs font-bold shadow-sm"
                  title="Registrar Uso de Pantalla"
                >
                  <Clock className="w-4 h-4" />
                  <span>{"Registrar Uso"}</span>
                </button>
              </div>
            </div>

            {/* Active Rules Badges */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-100 dark:border-zinc-800">
              <div className="text-center">
                <span className="text-[10px] font-black text-rose-600 block uppercase">{"Bloqueo"}</span>
                <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">{rulesConfig.strictLock ? "Estricto" : "Flexible"}</span>
              </div>
              <div className="text-center border-x border-slate-200 dark:border-zinc-700">
                <span className="text-[10px] font-black text-indigo-600 block uppercase">{"Tareas"}</span>
                <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">{rulesConfig.choresFirst ? "Primero" : "Libre"}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] font-black text-amber-600 block uppercase">{"Toque Queda"}</span>
                <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">{rulesConfig.nightCurfew ? rulesConfig.curfewTime : "Off"}</span>
              </div>
            </div>

            {/* Children Screen Time Progress */}
            <div className="space-y-4">
              {children.map(child => {
                const log = screenTime.find(s => s.childUserId === child.id) || { minutesUsed: 0, dailyLimitMinutes: 120 };
                const ratio = Math.min(100, (log.minutesUsed / Math.max(1, log.dailyLimitMinutes)) * 100);
                const isOver = log.minutesUsed > log.dailyLimitMinutes;
                const remaining = Math.max(0, log.dailyLimitMinutes - log.minutesUsed);

                return (
                  <div key={child.id} className="p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-black text-sm">
                          {child.name.charAt(0)}
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-900 dark:text-white block">{child.name}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {"LÍMITE"}: {log.dailyLimitMinutes} min ({Math.floor(log.dailyLimitMinutes / 60)}h{log.dailyLimitMinutes % 60 > 0 ? ` ${log.dailyLimitMinutes % 60}m` : ""})
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-black ${isOver ? "text-rose-600" : "text-slate-900 dark:text-zinc-200"}`}>
                          {log.minutesUsed} <span className="text-[10px] text-slate-400">/ {log.dailyLimitMinutes} MIN</span>
                        </span>
                        <span className={`text-[10px] font-bold block ${isOver ? "text-rose-500 font-black" : "text-emerald-500"}`}>
                          {isOver ? `+${log.minutesUsed - log.dailyLimitMinutes} min excedidos` : `${remaining} min restantes`}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ${
                          isOver ? "bg-rose-500 animate-pulse" : ratio > 80 ? "bg-amber-500" : "bg-indigo-600"
                        }`}
                        style={{ width: `${ratio}%` }}
                      />
                    </div>

                    {/* Exceeded Warning */}
                    {isOver && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-600 uppercase tracking-tight bg-rose-50 dark:bg-rose-950/40 p-2 rounded-xl">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" /> {"Límite excedido. Bloqueo de pantalla activado."}
                      </div>
                    )}

                    {/* Quick Add and Action Buttons */}
                    <div className="flex items-center justify-between pt-1 gap-2 border-t border-slate-100 dark:border-zinc-800/80">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold text-slate-400 mr-1">{"Rápido:"}</span>
                        {[15, 30, 60].map(mins => (
                          <button
                            key={mins}
                            type="button"
                            onClick={() => handleQuickAddScreenTime(child.id, mins)}
                            className="px-2 py-1 bg-white dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 hover:border-rose-200 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 rounded-lg text-[10px] font-bold transition"
                            title={`Sumar +${mins} minutos a ${child.name}`}
                          >
                            +{mins}m
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => openLogScreenModal(child.id)}
                        className="px-3 py-1 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-600 dark:text-rose-400 rounded-lg text-[10px] font-black uppercase tracking-wider transition"
                      >
                        {"Registrar..."}
                      </button>
                    </div>
                  </div>
                );
              })}

              {children.length === 0 && (
                <div className="text-center py-8">
                  <Smartphone className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{"No hay niños registrados en el hogar"}</p>
                </div>
              )}
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
                  placeholder="ej. Sacar la basura de la sala"
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
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} {u.role === "CHILD" ? "👧👦 (Niño/a)" : u.role === "ADMIN" ? "👑 (Admin)" : "👤 (Miembro)"}
                      </option>
                    ))}
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
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-8 shadow-2xl animate-scale-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center">
                <Hourglass className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-950 dark:text-white">{"Registrar Tiempo de Pantalla"}</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{"Registra el tiempo que ha pasado frente a dispositivos."}</p>
              </div>
            </div>
            
            <form onSubmit={handleLogScreen} className="space-y-6">
              {/* Child Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-2 uppercase tracking-wide">
                  {"Seleccionar Niño(a)"}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {children.map(child => {
                    const isSelected = selectedChildId === child.id;
                    const log = screenTime.find(s => s.childUserId === child.id) || { minutesUsed: 0, dailyLimitMinutes: 120 };
                    return (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => setSelectedChildId(child.id)}
                        className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 ${
                          isSelected 
                            ? "bg-rose-50 dark:bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/20" 
                            : "bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 hover:border-slate-300"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isSelected ? "bg-rose-600 text-white" : "bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300"
                        }`}>
                          {child.name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                          <span className={`text-xs font-bold block truncate ${isSelected ? "text-rose-900 dark:text-rose-200" : "text-slate-900 dark:text-white"}`}>
                            {child.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-medium">
                            {log.minutesUsed}/{log.dailyLimitMinutes}m
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mode Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-2 uppercase tracking-wide">
                  {"Tipo de Registro"}
                </label>
                <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-zinc-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setLogMode("add")}
                    className={`py-2 text-xs font-bold rounded-lg transition ${
                      logMode === "add" 
                        ? "bg-white dark:bg-zinc-900 text-rose-600 shadow-sm" 
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300"
                    }`}
                  >
                    {"Sumar Minutos (+)"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogMode("set")}
                    className={`py-2 text-xs font-bold rounded-lg transition ${
                      logMode === "set" 
                        ? "bg-white dark:bg-zinc-900 text-rose-600 shadow-sm" 
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300"
                    }`}
                  >
                    {"Fijar Total Exacto (=)"}
                  </button>
                </div>
              </div>

              {/* Minutes presets & Input */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-2 uppercase tracking-wide">
                  {logMode === "add" ? "Minutos a Añadir" : "Total Minutos Utilizados Hoy"}
                </label>
                
                <div className="flex gap-2 mb-3">
                  {[15, 30, 45, 60, 120].map(mins => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setScreenMinutes(mins.toString())}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                        screenMinutes === mins.toString()
                          ? "bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20"
                          : "bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100"
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input
                    type="number"
                    required
                    min="0"
                    max="720"
                    placeholder="Minutos"
                    value={screenMinutes}
                    onChange={(e) => setScreenMinutes(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-black text-xl focus:ring-2 focus:ring-rose-500 outline-none text-slate-900 dark:text-white text-center"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase">
                    {"minutos"}
                  </span>
                </div>
              </div>

              {/* Summary Preview */}
              {(() => {
                const currentChild = children.find(c => c.id === selectedChildId) || children[0];
                const log = screenTime.find(s => s.childUserId === currentChild?.id) || { minutesUsed: 0, dailyLimitMinutes: 120 };
                const delta = parseInt(screenMinutes) || 0;
                const newTotal = logMode === "add" ? log.minutesUsed + delta : delta;
                const isOverNew = newTotal > log.dailyLimitMinutes;

                return (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 space-y-2 text-xs">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-500 dark:text-zinc-400">{"Uso Actual:"}</span>
                      <span className="text-slate-900 dark:text-white">{log.minutesUsed} min / {log.dailyLimitMinutes} min</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-500 dark:text-zinc-400">{"Resultado Tras Guardar:"}</span>
                      <span className={isOverNew ? "text-rose-600 font-black" : "text-emerald-600 font-black"}>
                        {newTotal} min ({Math.round((newTotal / Math.max(1, log.dailyLimitMinutes)) * 100)}%)
                      </span>
                    </div>
                    {isOverNew && (
                      <p className="text-[11px] text-rose-500 font-bold pt-1">
                        {"⚠️ Este registro superará el límite diario permitido."}
                      </p>
                    )}
                  </div>
                );
              })()}

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLogScreenModalOpen(false)}
                  className="flex-1 py-3.5 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
                >
                  {"Cancelar"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-500 shadow-xl shadow-rose-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  {"Guardar Registro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Screen Time Rules Modal */}
      {isRulesModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-xl w-full p-8 shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
                <Sliders className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-950 dark:text-white">{"Gestionar Reglas de Tiempo de Pantalla"}</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{"Configura los límites diarios y políticas de uso de dispositivos."}</p>
              </div>
            </div>

            <form onSubmit={handleSaveRules} className="space-y-6">
              
              {/* Section 1: Daily Limits per Child */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-3 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-rose-500" /> {"Límites Diarios de Pantalla por Niño"}
                </h4>

                <div className="space-y-4">
                  {children.map(child => {
                    const currentLimit = customLimits[child.id] ?? 120;
                    return (
                      <div key={child.id} className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/40 space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                              {child.name.charAt(0)}
                            </div>
                            <span className="font-bold text-sm text-slate-900 dark:text-white">{child.name}</span>
                          </div>
                          <div className="text-right font-black text-rose-600">
                            <span className="text-base">{currentLimit} min</span>
                            <span className="text-[10px] text-slate-400 block font-bold">
                              ({Math.floor(currentLimit / 60)}h{currentLimit % 60 > 0 ? ` ${currentLimit % 60}m` : ""})
                            </span>
                          </div>
                        </div>

                        {/* Slider */}
                        <div className="space-y-1">
                          <input
                            type="range"
                            min="30"
                            max="360"
                            step="15"
                            value={currentLimit}
                            onChange={(e) => setCustomLimits({ ...customLimits, [child.id]: parseInt(e.target.value) })}
                            className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                        </div>

                        {/* Presets */}
                        <div className="flex gap-2 pt-1">
                          {[60, 90, 120, 180, 240].map(mins => (
                            <button
                              key={mins}
                              type="button"
                              onClick={() => setCustomLimits({ ...customLimits, [child.id]: mins })}
                              className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition ${
                                currentLimit === mins
                                  ? "bg-indigo-600 text-white border-indigo-600"
                                  : "bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-slate-100"
                              }`}
                            >
                              {mins / 60}h
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Household Screen Policies */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> {"Políticas de Control y Seguridad"}
                </h4>

                <div className="space-y-3">
                  
                  {/* Strict Lock */}
                  <label className="flex items-start justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 transition">
                    <div className="pr-4">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {"Bloqueo Automático al Exceder Límite"}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                        {"Bloquear acceso a juegos y redes automáticamente al llegar al límite diario."}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={rulesConfig.strictLock}
                      onChange={(e) => setRulesConfig({ ...rulesConfig, strictLock: e.target.checked })}
                      className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 mt-0.5 accent-indigo-600"
                    />
                  </label>

                  {/* Chores First */}
                  <label className="flex items-start justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 transition">
                    <div className="pr-4">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {"Tareas Obligatorias Primero"}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                        {"Requiere completar todas las tareas pendientes antes de desbloquear tiempo de pantalla."}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={rulesConfig.choresFirst}
                      onChange={(e) => setRulesConfig({ ...rulesConfig, choresFirst: e.target.checked })}
                      className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 mt-0.5 accent-indigo-600"
                    />
                  </label>

                  {/* Night Curfew */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 space-y-2">
                    <label className="flex items-start justify-between cursor-pointer">
                      <div className="pr-4">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          {"Toque de Queda Nocturno"}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                          {"Desactivar pantallas durante la noche para garantizar descanso."}
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={rulesConfig.nightCurfew}
                        onChange={(e) => setRulesConfig({ ...rulesConfig, nightCurfew: e.target.checked })}
                        className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 mt-0.5 accent-indigo-600"
                      />
                    </label>
                    {rulesConfig.nightCurfew && (
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-zinc-700">
                        <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">{"Hora de apagado:"}</span>
                        <input
                          type="time"
                          value={rulesConfig.curfewTime}
                          onChange={(e) => setRulesConfig({ ...rulesConfig, curfewTime: e.target.value })}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-bold text-slate-900 dark:text-white"
                        />
                      </div>
                    )}
                  </div>

                  {/* Weekend Bonus */}
                  <label className="flex items-start justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 transition">
                    <div className="pr-4">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {"Bonificación de Fin de Semana"}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                        {"Añade +30 minutos adicionales automáticamente los sábados y domingos."}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={rulesConfig.weekendBonus}
                      onChange={(e) => setRulesConfig({ ...rulesConfig, weekendBonus: e.target.checked })}
                      className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 mt-0.5 accent-indigo-600"
                    />
                  </label>

                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsRulesModalOpen(false)}
                  className="flex-1 py-4 border border-slate-200 dark:border-zinc-700 rounded-2xl font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
                >
                  {"Cancelar"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  {"Guardar y Aplicar Reglas"}
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

      {/* Edit Chore Modal */}
      {editingChore && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-8 shadow-2xl animate-scale-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
                <Edit2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-950 dark:text-white">{"Modificar Tarea"}</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{"Actualiza los detalles, asignación o recompensa de la tarea."}</p>
              </div>
            </div>
            
            <form onSubmit={handleUpdateChore} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">{"Descripción de la Tarea"}</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Tender la cama y ordenar la habitación"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">{"Asignado a"}</label>
                  <select
                    value={editForm.assignedTo}
                    onChange={(e) => setEditForm({ ...editForm, assignedTo: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} {u.role === "CHILD" ? "👧👦 (Niño/a)" : u.role === "ADMIN" ? "👑 (Admin)" : "👤 (Miembro)"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">{"Puntos de Recompensa"}</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editForm.points}
                    onChange={(e) => setEditForm({ ...editForm, points: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">{"Estado de la Tarea"}</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                >
                  <option value="PENDING">Pendiente (Por hacer)</option>
                  <option value="COMPLETED">Completada (Verificado)</option>
                </select>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingChore(null)}
                  className="flex-1 py-3.5 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
                >
                  {"Cancelar"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  {"Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Chore Confirmation Modal */}
      {deletingChore && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-2">
              {"¿Eliminar esta tarea?"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6">
              {"¿Estás seguro de que deseas eliminar la tarea"} <strong className="text-slate-800 dark:text-zinc-200 font-semibold">&ldquo;{deletingChore.title}&rdquo;</strong>? {"Esta acción no se puede deshacer."}
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeletingChore(null)}
                className="flex-1 py-3 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold text-sm text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
              >
                {"Cancelar"}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteChore(deletingChore.id);
                  setDeletingChore(null);
                }}
                className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-500 shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {"Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Daily Chores Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <RotateCcw className="w-6 h-6" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-2">
              {"¿Reiniciar el ciclo diario de tareas?"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6">
              {"Esta acción marcará todas las tareas como"} <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{"Pendientes"}</strong> {"para comenzar el nuevo día, permitiendo a los niños volver a realizarlas sin necesidad de crear tareas duplicadas."}
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 py-3 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold text-sm text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
              >
                {"Cancelar"}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetDailyChores();
                  setIsResetConfirmOpen(false);
                }}
                className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                {"Comenzar Nuevo Día"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

