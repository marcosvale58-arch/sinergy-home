"use client";

import React, { useState } from "react";
import { 
  Settings, 
  Users, 
  Globe, 
  Shield, 
  Bell, 
  Database, 
  Plus, 
  UserPlus, 
  MoreVertical, 
  Mail, 
  Key,
  Smartphone,
  CreditCard,
  ChevronRight,
  LogOut,
  Save,
  Trash2
} from "lucide-react";
import { useStore } from "@/lib/mock-data";

export default function SettingsPage() {
  const { household, users, updateHousehold, addUser } = useStore();
  const [activeTab, setActiveTab] = useState("general");

  const [householdName, setHouseholdName] = useState(household.name);
  const [currency, setCurrency] = useState(household.baseCurrency);
  
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    role: "MEMBER" as "ADMIN" | "MEMBER" | "CHILD"
  });

  const handleUpdateHousehold = (e: React.FormEvent) => {
    e.preventDefault();
    updateHousehold(householdName, currency);
    alert("Configuración del hogar actualizada exitosamente.");
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    addUser(userForm.name, userForm.email, userForm.role);
    setIsAddUserModalOpen(false);
    setUserForm({ name: "", email: "", role: "MEMBER" });
  };

  const navItems = [
    { id: "general", name: "General", icon: Globe },
    { id: "members", name: "Miembros del Hogar", icon: Users },
    { id: "security", name: "Seguridad", icon: Shield },
    { id: "notifications", name: "Notificaciones", icon: Bell },
    { id: "subscription", name: "Suscripción", icon: CreditCard },
    { id: "devices", name: "Dispositivos", icon: Smartphone },
    { id: "data", name: "Datos y Exportación", icon: Database },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fade-in pb-20">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white">Panel de Control del Sistema</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Navigation / Sidebar Tabs */}
        <div className="lg:col-span-3 space-y-2">
          {navItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === item.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                  : "text-slate-500 hover:bg-white dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-200"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </button>
          ))}
          
          <div className="pt-8">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all">
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 space-y-10">
          {activeTab === "general" && (
            <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Configuración del Hogar</h3>
                </div>
              </div>

              <form onSubmit={handleUpdateHousehold} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Nombre Legal del Hogar</label>
                    <input 
                      type="text" 
                      value={householdName}
                      onChange={(e) => setHouseholdName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Moneda Base</label>
                    <select 
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="VES">VES - Bolivar Soberano</option>
                    </select>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
                  <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-xl shadow-indigo-600/10 transition-all">
                    <Save className="w-5 h-5" /> Guardar Cambios
                  </button>
                </div>
              </form>
            </section>
          )}

          {activeTab === "members" && (
            <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Registro de Miembros</h3>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAddUserModalOpen(true)}
                  className="p-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 transition shadow-sm border border-indigo-100 dark:border-indigo-900/50"
                >
                  <UserPlus className="w-5 h-5" />
                </button>
              </div>

              <div className="divide-y divide-slate-50 dark:divide-zinc-800">
                {users.map((user) => (
                  <div key={user.id} className="py-4 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center font-black text-indigo-600">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</h5>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{user.email}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className={`text-[10px] font-black uppercase tracking-widest ${
                            user.role === "ADMIN" ? "text-rose-500" : user.role === "CHILD" ? "text-amber-500" : "text-emerald-500"
                          }`}>{user.role}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab !== "general" && activeTab !== "members" && (
            <div className="text-center p-20 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl">
              <p className="text-slate-400 font-bold">Esta sección está actualmente en desarrollo.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-8 shadow-2xl animate-scale-up">
            <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-6">Invitar Miembro</h3>
            
            <form onSubmit={handleAddUser} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Juan Perez"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="nombre@ejemplo.com"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="flex-1 py-4 border border-slate-200 dark:border-zinc-700 rounded-2xl font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 transition-all"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
