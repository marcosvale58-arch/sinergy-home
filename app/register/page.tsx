"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  Home, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { signUp } from "@/lib/auth-client";
import { useStore, dbStore } from "@/lib/mock-data";
import { createNewHouseholdForUser } from "@/actions/household";

export default function RegisterPage() {
  const router = useRouter();
  const { updateHousehold } = useStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    householdName: "Mi Hogar",
    baseCurrency: "USD",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden. Por favor verifícalas.");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setErrorMessage("La contraseña debe tener al menos 8 caracteres.");
      setIsLoading(false);
      return;
    }

    try {
      const result = await signUp.email({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (result?.error) {
        setErrorMessage(result.error.message || "Error al crear la cuenta. Intenta con otro correo.");
        setIsLoading(false);
      } else {
        // Create an exclusive, new household for this new user
        const hhRes = await createNewHouseholdForUser(formData.email, formData.householdName, formData.baseCurrency);
        
        const registeredUser = result?.data?.user;
        const userId = registeredUser?.id || (hhRes?.user?.id) || `u-${Date.now()}`;
        const householdId = hhRes?.household?.id || `hh-${Date.now()}`;

        if (typeof window !== "undefined") {
          localStorage.setItem("sinergy_active_user_id", userId);
          localStorage.setItem("sinergy_active_user_email", formData.email.trim().toLowerCase());
          localStorage.setItem("sinergy_household_id", householdId);
        }

        // Sync fresh household
        await dbStore.syncWithDatabase(formData.email.trim().toLowerCase());

        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      console.error(err);
      const hhRes = await createNewHouseholdForUser(formData.email, formData.householdName, formData.baseCurrency);
      if (typeof window !== "undefined") {
        localStorage.setItem("sinergy_active_user_email", formData.email.trim().toLowerCase());
        if (hhRes?.household?.id) {
          localStorage.setItem("sinergy_household_id", hhRes.household.id);
        }
      }
      await dbStore.syncWithDatabase(formData.email.trim().toLowerCase());
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-slate-50 dark:bg-zinc-950 relative overflow-hidden py-12">
      
      {/* Background glowing effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-8 relative z-10 animate-fade-in">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-600/30 mb-2">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            SINERGY<span className="text-indigo-600 dark:text-indigo-400">HOME</span>
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
            {"Crea tu cuenta de Administrador y configura tu hogar"}
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl space-y-6">
          
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{"Crear Nueva Cuenta"}</h2>
            <p className="text-xs text-slate-400 dark:text-zinc-500">{"Completa los datos para registrar tu núcleo familiar"}</p>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wide">
                {"Nombre Completo"}
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  required
                  placeholder="ej. Juan Pérez"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wide">
                {"Correo Electrónico"}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="email"
                  required
                  placeholder="juan@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wide">
                  {"Nombre del Hogar"}
                </label>
                <div className="relative">
                  <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    required
                    placeholder="ej. Familia Pérez"
                    value={formData.householdName}
                    onChange={(e) => setFormData({ ...formData, householdName: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wide">
                  {"Moneda Base"}
                </label>
                <select
                  value={formData.baseCurrency}
                  onChange={(e) => setFormData({ ...formData, baseCurrency: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white text-sm"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="VES">VES (Bs.)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wide">
                  {"Contraseña"}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Mínimo 8 caracteres"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wide">
                  {"Confirmar"}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Repetir contraseña"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input 
                type="checkbox"
                id="showPass"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="showPass" className="text-xs text-slate-500 dark:text-zinc-400 cursor-pointer">
                {"Mostrar contraseñas"}
              </label>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {"Creando cuenta..."}
                </>
              ) : (
                <>
                  {"Crear Hogar y Empezar"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {"¿Ya tienes una cuenta? "}
              <Link href="/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                {"Inicia sesión aquí"}
              </Link>
            </p>
          </div>

        </div>

        {/* Security badge footer */}
        <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>{"Tus datos están protegidos con encriptación avanzada"}</span>
        </div>

      </div>

    </div>
  );
}
