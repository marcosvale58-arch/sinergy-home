"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Settings, 
  Users, 
  Globe, 
  Bell, 
  Plus, 
  UserPlus, 
  Save, 
  LogOut, 
  Check, 
  Mail, 
  Smartphone, 
  AlertTriangle, 
  Calendar, 
  PackageCheck, 
  CheckCircle2, 
  Trash2,
  Clock,
  ShieldCheck
} from "lucide-react";
import { useStore, User } from "@/lib/mock-data";
import { signOut } from "@/lib/auth-client";

export default function SettingsPage() {
  const router = useRouter();
  const { household, users, updateHousehold, addUser, removeUser, updateUserRole } = useStore();
  const [activeTab, setActiveTab] = useState<"general" | "members" | "notifications">("general");

  // General settings state
  const [householdName, setHouseholdName] = useState(household?.name || "Mi Hogar");
  const [currency, setCurrency] = useState(household?.baseCurrency || "USD");
  const [timezone, setTimezone] = useState("America/Caracas");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [generalSaved, setGeneralSaved] = useState(false);

  // Sync state when household loads or updates
  useEffect(() => {
    if (household) {
      if (household.name) setHouseholdName(household.name);
      if (household.baseCurrency) setCurrency(household.baseCurrency);
    }
  }, [household]);

  // Add User modal state
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    role: "MEMBER" as "ADMIN" | "MEMBER" | "CHILD"
  });

  // Notification settings state
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushAlerts: true,
    billReminders: true,
    billDaysNotice: "3",
    lowStockAlerts: true,
    screenTimeLimitAlerts: true,
    weeklyReport: true,
    choreCompletionAlerts: true,
  });
  const [notificationsSaved, setNotificationsSaved] = useState(false);

  const handleUpdateHousehold = (e: React.FormEvent) => {
    e.preventDefault();
    updateHousehold(householdName, "USD");
    setGeneralSaved(true);
    setTimeout(() => setGeneralSaved(false), 3000);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    addUser(userForm.name, userForm.email, userForm.role);
    setIsAddUserModalOpen(false);
    setUserForm({ name: "", email: "", role: "MEMBER" });
  };

  const handleConfirmDeleteUser = () => {
    if (userToDelete) {
      removeUser(userToDelete.id);
      setUserToDelete(null);
    }
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    setNotificationsSaved(true);
    setTimeout(() => setNotificationsSaved(false), 3000);
  };

  const navItems = [
    { id: "general" as const, name: "General", icon: Globe },
    { id: "members" as const, name: "Miembros del Hogar", icon: Users },
    { id: "notifications" as const, name: "Notificaciones", icon: Bell },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fade-in pb-20">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white">{"Ajustes del Sistema"}</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
          {"Administra la configuración del hogar, los miembros de la familia y las preferencias de notificación."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Navigation / Sidebar Tabs */}
        <div className="lg:col-span-4 space-y-2">
          {navItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                activeTab === item.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                  : "text-slate-500 hover:bg-white dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-200"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </button>
          ))}
          
          <div className="pt-6 border-t border-slate-200 dark:border-zinc-800 mt-6">
            <button 
              onClick={async () => {
                if (typeof window !== "undefined") {
                  localStorage.removeItem("sinergy_active_user_id");
                  localStorage.removeItem("sinergy_active_user_email");
                  sessionStorage.clear();
                }
                try {
                  await signOut();
                } catch (e) {
                  console.error("SignOut error:", e);
                }
                window.location.href = "/login";
              }}
              className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
            >
              <LogOut className="w-5 h-5" />
              {"Cerrar Sesión"}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* 1. GENERAL TAB */}
          {activeTab === "general" && (
            <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm space-y-8">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-zinc-800">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{"Configuración General del Hogar"}</h3>
                  <p className="text-xs text-slate-400 dark:text-zinc-500">{"Datos principales del núcleo familiar y moneda contable."}</p>
                </div>
              </div>

              <form onSubmit={handleUpdateHousehold} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">{"Nombre del Hogar"}</label>
                    <input 
                      type="text" 
                      required
                      value={householdName}
                      onChange={(e) => setHouseholdName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                      placeholder="ej. Familia Pérez"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">{"Moneda del Sistema"}</label>
                    <div className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800/60 font-semibold text-slate-700 dark:text-zinc-300 flex items-center justify-between text-sm">
                      <span className="font-bold">USD ($) - Dólar Estadounidense</span>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
                        Moneda Fija
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">{"Zona Horaria"}</label>
                    <select 
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                    >
                      <option value="America/Caracas">America/Caracas (GMT-4)</option>
                      <option value="America/Bogota">America/Bogotá (GMT-5)</option>
                      <option value="America/Mexico_City">America/Ciudad de México (GMT-6)</option>
                      <option value="America/New_York">America/New York (GMT-5 / EDT)</option>
                      <option value="America/Madrid">Europe/Madrid (GMT+1)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">{"Formato de Fecha"}</label>
                    <select 
                      value={dateFormat}
                      onChange={(e) => setDateFormat(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY (ej. 23/08/2026)</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY (ej. 08/23/2026)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (ej. 2026-08-23)</option>
                    </select>
                  </div>
                </div>

                {generalSaved && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    {"¡Configuración del hogar guardada exitosamente!"}
                  </div>
                )}
                
                <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
                  <button 
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-xl shadow-indigo-600/20 transition-all"
                  >
                    <Save className="w-5 h-5" /> {"Guardar Cambios"}
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* 2. MEMBERS TAB */}
          {activeTab === "members" && (
            <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm space-y-8">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{"Miembros del Hogar"}</h3>
                    <p className="text-xs text-slate-400 dark:text-zinc-500">{users.length} {"miembros activos en la familia"}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAddUserModalOpen(true)}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition"
                >
                  <UserPlus className="w-4 h-4" />
                  {"Invitar Miembro"}
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                {users.map((user) => (
                  <div key={user.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-zinc-800 flex items-center justify-center font-black text-indigo-600 dark:text-indigo-400 text-lg border border-indigo-100 dark:border-zinc-700 shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</h5>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-semibold text-slate-400">{user.email}</span>
                          {user.role === "CHILD" && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-slate-300" />
                              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">{user.pointsBalance} pts</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value as any)}
                        className={`text-xs py-1.5 px-3 rounded-xl font-bold uppercase tracking-wider border transition outline-none cursor-pointer ${
                          user.role === "ADMIN" 
                            ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/40" 
                            : user.role === "CHILD" 
                            ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/40" 
                            : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40"
                        }`}
                      >
                        <option value="ADMIN">Administrador</option>
                        <option value="MEMBER">Miembro</option>
                        <option value="CHILD">Hijo / Menor</option>
                      </select>

                      {users.length > 1 && (
                        <button
                          onClick={() => setUserToDelete(user)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition"
                          title={`Eliminar a ${user.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 3. NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm space-y-8">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-zinc-800">
                <div className="p-2.5 bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-xl">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{"Preferencias de Notificaciones y Alertas"}</h3>
                  <p className="text-xs text-slate-400 dark:text-zinc-500">{"Configura cómo y cuándo deseas recibir recordatorios y alertas críticas."}</p>
                </div>
              </div>

              <form onSubmit={handleSaveNotifications} className="space-y-6">
                
                {/* Canales de notificación */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{"Canales de Notificación"}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/20 cursor-pointer hover:bg-slate-50 transition">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-indigo-500" />
                        <div>
                          <span className="text-sm font-bold text-slate-900 dark:text-white block">{"Notificaciones por Correo"}</span>
                          <span className="text-[11px] text-slate-400 font-medium">{"Enviar resúmenes y alertas al email"}</span>
                        </div>
                      </div>
                      <input 
                        type="checkbox"
                        checked={notifications.emailAlerts}
                        onChange={(e) => setNotifications({ ...notifications, emailAlerts: e.target.checked })}
                        className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/20 cursor-pointer hover:bg-slate-50 transition">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-emerald-500" />
                        <div>
                          <span className="text-sm font-bold text-slate-900 dark:text-white block">{"Alertas Push en Dispositivos"}</span>
                          <span className="text-[11px] text-slate-400 font-medium">{"Notificaciones instantáneas en pantalla"}</span>
                        </div>
                      </div>
                      <input 
                        type="checkbox"
                        checked={notifications.pushAlerts}
                        onChange={(e) => setNotifications({ ...notifications, pushAlerts: e.target.checked })}
                        className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                {/* Reglas de alertas */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{"Eventos y Alertas Inteligentes"}</h4>
                  
                  <div className="space-y-3">
                    {/* Alerta 1: Facturas */}
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-150 dark:border-zinc-800">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-xl mt-0.5">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-slate-900 dark:text-white">{"Recordatorio de Facturas y Pasivos"}</h5>
                          <p className="text-xs text-slate-500 dark:text-zinc-400">{"Avisar antes de que una factura o impuesto venza en el calendario."}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <select 
                          value={notifications.billDaysNotice}
                          onChange={(e) => setNotifications({ ...notifications, billDaysNotice: e.target.value })}
                          className="text-xs py-1.5 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-bold"
                        >
                          <option value="1">1 día antes</option>
                          <option value="3">3 días antes</option>
                          <option value="7">7 días antes</option>
                        </select>
                        <input 
                          type="checkbox"
                          checked={notifications.billReminders}
                          onChange={(e) => setNotifications({ ...notifications, billReminders: e.target.checked })}
                          className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Alerta 2: Inventario bajo */}
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-150 dark:border-zinc-800">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-xl mt-0.5">
                          <PackageCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-slate-900 dark:text-white">{"Stock Crítico de Suministros"}</h5>
                          <p className="text-xs text-slate-500 dark:text-zinc-400">{"Alerta cuando un artículo del hogar caiga por debajo de su stock mínimo."}</p>
                        </div>
                      </div>
                      <input 
                        type="checkbox"
                        checked={notifications.lowStockAlerts}
                        onChange={(e) => setNotifications({ ...notifications, lowStockAlerts: e.target.checked })}
                        className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>

                    {/* Alerta 3: Límite de pantalla */}
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-150 dark:border-zinc-800">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-xl mt-0.5">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-slate-900 dark:text-white">{"Exceso de Tiempo de Pantalla"}</h5>
                          <p className="text-xs text-slate-500 dark:text-zinc-400">{"Notificar a los administradores si un menor sobrepasa su límite diario."}</p>
                        </div>
                      </div>
                      <input 
                        type="checkbox"
                        checked={notifications.screenTimeLimitAlerts}
                        onChange={(e) => setNotifications({ ...notifications, screenTimeLimitAlerts: e.target.checked })}
                        className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>

                    {/* Alerta 4: Resumen semanal */}
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-150 dark:border-zinc-800">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl mt-0.5">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-slate-900 dark:text-white">{"Informe Semanal de Finanzas"}</h5>
                          <p className="text-xs text-slate-500 dark:text-zinc-400">{"Resumen cada domingo de ingresos, gastos y avance de metas."}</p>
                        </div>
                      </div>
                      <input 
                        type="checkbox"
                        checked={notifications.weeklyReport}
                        onChange={(e) => setNotifications({ ...notifications, weeklyReport: e.target.checked })}
                        className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {notificationsSaved && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    {"¡Preferencias de notificaciones guardadas exitosamente!"}
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
                  <button 
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-xl shadow-indigo-600/20 transition-all"
                  >
                    <Save className="w-5 h-5" /> {"Guardar Preferencias"}
                  </button>
                </div>
              </form>
            </section>
          )}

        </div>
      </div>

      {/* Add Member Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-8 shadow-2xl animate-scale-up">
            <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-6">{"Invitar Miembro del Hogar"}</h3>
            
            <form onSubmit={handleAddUser} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">{"Nombre Completo"}</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Carlos Pérez"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">{"Correo Electrónico"}</label>
                <input
                  type="email"
                  required
                  placeholder="carlos@ejemplo.com"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">{"Rol en el Hogar"}</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                >
                  <option value="ADMIN">Administrador (Acceso Total)</option>
                  <option value="MEMBER">Miembro (Finanzas y Compras)</option>
                  <option value="CHILD">Hijo / Menor (Tareas y Tiempo de Pantalla)</option>
                </select>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="flex-1 py-3.5 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-50 transition"
                >
                  {"Cancelar"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 transition-all"
                >
                  {"Confirmar Invitación"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-2">
              {"¿Eliminar miembro del hogar?"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6">
              {"¿Estás seguro de que deseas eliminar a"} <strong className="text-slate-800 dark:text-zinc-200 font-semibold">{userToDelete.name}</strong> ({userToDelete.email}) {"del hogar? Esta acción eliminará su acceso."}
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-3 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold text-sm text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
              >
                {"Cancelar"}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-500 shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2"
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
