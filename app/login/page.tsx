"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck,
  AlertCircle,
  Loader2,
  UserCheck
} from "lucide-react";
import { signIn } from "@/lib/auth-client";
import { dbStore } from "@/lib/mock-data";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const cleanEmail = email.trim().toLowerCase();
      const result = await signIn.email({
        email: cleanEmail,
        password,
      });

      if (result?.error) {
        setErrorMessage(result.error.message || "Credenciales incorrectas. Por favor verifica tus datos.");
        setIsLoading(false);
      } else {
        const loggedUser = result?.data?.user;
        if (loggedUser) {
          if (typeof window !== "undefined") {
            localStorage.setItem("sinergy_active_user_id", loggedUser.id);
            localStorage.setItem("sinergy_active_user_email", loggedUser.email);
          }
        }
        await dbStore.syncWithDatabase(cleanEmail);
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Ocurrió un error inesperado al intentar iniciar sesión.");
      setIsLoading(false);
    }
  };

  // Quick Demo Login Helper
  const handleQuickDemo = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await signIn.email({
        email: demoEmail,
        password: demoPass,
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("sinergy_active_user_email", demoEmail);
      }

      await dbStore.syncWithDatabase(demoEmail);
      router.push("/");
      router.refresh();
    } catch {
      await dbStore.syncWithDatabase(demoEmail);
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-slate-50 dark:bg-zinc-950 relative overflow-hidden">
      
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
            {"Ingresa a tu centro financiero y de gestión del hogar"}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl space-y-6">
          
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{"Iniciar Sesión"}</h2>
            <p className="text-xs text-slate-400 dark:text-zinc-500">{"Ingresa tus credenciales para continuar"}</p>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wide">
                {"Correo Electrónico"}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="email"
                  required
                  placeholder="usuario@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wide">
                  {"Contraseña"}
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white text-sm"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {"Verificando..."}
                </>
              ) : (
                <>
                  {"Entrar al Sistema"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Access Helper for Development / Demo */}
          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block text-center">
              {"Acceso Rápido de Demostración"}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button 
                type="button"
                onClick={() => handleQuickDemo("juan@sinergy.home", "Password123!")}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-slate-700 dark:text-zinc-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                {"Juan (Admin)"}
              </button>
              <button 
                type="button"
                onClick={() => handleQuickDemo("maria@sinergy.home", "Password123!")}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-slate-700 dark:text-zinc-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                {"María (Admin)"}
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {"¿No tienes una cuenta aún? "}
              <Link href="/register" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                {"Regístrate aquí"}
              </Link>
            </p>
          </div>

        </div>

        {/* Security badge footer */}
        <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>{"Cifrado de grado bancario y autenticación segura"}</span>
        </div>

      </div>

    </div>
  );
}
