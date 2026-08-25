"use client";

import { useState, useEffect } from "react";
import { convertToBase } from "@/lib/currency";
import { getHouseholdFullState, getHouseholdFullStateForUser } from "@/actions/dashboard";
import { createTransaction as serverCreateTransaction, deleteTransaction as serverDeleteTransaction } from "@/actions/transactions";
import { updateDistributionRule as serverUpdateRule } from "@/actions/distribution";
import { createInvestment as serverCreateInvestment, updateInvestmentValue as serverUpdateInvestmentValue } from "@/actions/investments";
import { createInventoryItem as serverCreateInventoryItem, updateInventoryStock as serverUpdateInventoryStock, deleteInventoryItem as serverDeleteInventoryItem } from "@/actions/inventory";
import { createGoal as serverCreateGoal, contributeToGoal as serverContributeToGoal } from "@/actions/goals";
import { createCalendarEvent as serverCreateCalendarEvent, payCalendarBill as serverPayBill } from "@/actions/calendar";
import { createChore as serverCreateChore, completeChore as serverCompleteChore, logScreenTime as serverLogScreenTime, redeemScreenTime as serverRedeemScreenTime, updateScreenTimeLimit as serverUpdateScreenTimeLimit, setScreenTime as serverSetScreenTime, resetDailyChores as serverResetDailyChores, updateChore as serverUpdateChore, deleteChore as serverDeleteChore } from "@/actions/chores";
import { updateHousehold as serverUpdateHousehold, addUserToHousehold as serverAddUser, removeUserFromHousehold as serverRemoveUser, updateUserRole as serverUpdateUserRole } from "@/actions/household";

// TypeScript interfaces mirroring schema.ts
export interface Household {
  id: string;
  name: string;
  baseCurrency: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  householdId?: string | null;
  role: "ADMIN" | "MEMBER" | "CHILD";
  pointsBalance: number;
}

export interface Transaction {
  id: string;
  householdId: string;
  userId: string;
  userName?: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  amount: number;
  baseAmount: number;
  originalAmount: number;
  originalCurrency: string;
  category: string;
  date: string;
  notes: string;
  isRecurring: boolean;
  recurrenceInterval?: "weekly" | "monthly" | "yearly";
}

export interface DistributionRule {
  id: string;
  householdId: string;
  name: string;
  type: "PERCENTAGE" | "FIXED";
  targetBucket: "Savings" | "Investment" | "Expenses" | "Discretionary";
  value: number;
}

export interface Investment {
  id: string;
  householdId: string;
  assetName: string;
  assetType: "Stocks" | "Real Estate" | "Crypto" | "Fixed Income" | "Cash";
  investedAmount: number;
  currentValue: number;
  expectedAnnualReturn: number;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  householdId: string;
  name: string;
  category: "Pantry" | "Cleaning" | "Toiletries" | "Medicine";
  currentQuantity: number;
  minQuantity: number;
  unit: string;
}

export interface Goal {
  id: string;
  householdId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  timeframe: "SHORT" | "MEDIUM" | "LONG";
  category: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
}

export interface CalendarEvent {
  id: string;
  householdId: string;
  title: string;
  dueDate: string;
  amount: number;
  type: "BILL" | "TAX" | "SUBSCRIPTION" | "GENERAL";
  googleEventId?: string;
  status: "PAID" | "UNPAID" | "OVERDUE";
}

export interface Chore {
  id: string;
  householdId: string;
  assignedToUserId: string;
  assignedToUserName?: string;
  title: string;
  pointsReward: number;
  status: "PENDING" | "COMPLETED";
  dueDate?: string;
}

export interface ScreenTimeLog {
  id: string;
  childUserId: string;
  childUserName?: string;
  date: string;
  minutesUsed: number;
  dailyLimitMinutes: number;
}

// Fallback initial values if DB is still loading
const INITIAL_HOUSEHOLD: Household = {
  id: "hh-1",
  name: "Mansión Sinergy",
  baseCurrency: "USD",
  createdAt: "2026-01-15T12:00:00.000Z",
};

const INITIAL_USERS: User[] = [
  { id: "u-1", name: "Juan Pérez", email: "juan@sinergy.home", role: "ADMIN", pointsBalance: 20, householdId: "hh-1" },
  { id: "u-2", name: "María Pérez", email: "maria@sinergy.home", role: "ADMIN", pointsBalance: 50, householdId: "hh-1" },
  { id: "u-3", name: "Emilia Pérez", email: "emilia@sinergy.home", role: "CHILD", pointsBalance: 350, householdId: "hh-1" },
  { id: "u-4", name: "Leo Pérez", email: "leo@sinergy.home", role: "CHILD", pointsBalance: 120, householdId: "hh-1" },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: "t-1", householdId: "hh-1", userId: "u-1", type: "INCOME", amount: 7500, baseAmount: 7500, originalAmount: 7500, originalCurrency: "USD", category: "Salario", date: "2026-08-01T09:00:00.000Z", notes: "Sueldo Principal Tech Corp", isRecurring: true, recurrenceInterval: "monthly" },
  { id: "t-2", householdId: "hh-1", userId: "u-2", type: "INCOME", amount: 5200, baseAmount: 5200, originalAmount: 5200, originalCurrency: "USD", category: "Salario", date: "2026-08-02T10:00:00.000Z", notes: "Factura Consultoría María", isRecurring: true, recurrenceInterval: "monthly" },
  { id: "t-3", householdId: "hh-1", userId: "u-1", type: "EXPENSE", amount: 2200, baseAmount: 2200, originalAmount: 2200, originalCurrency: "USD", category: "Vivienda", date: "2026-08-03T12:00:00.000Z", notes: "Pago Mensual de Hipoteca", isRecurring: true, recurrenceInterval: "monthly" },
  { id: "t-4", householdId: "hh-1", userId: "u-2", type: "EXPENSE", amount: 480, baseAmount: 480, originalAmount: 480, originalCurrency: "USD", category: "Servicios", date: "2026-08-05T14:30:00.000Z", notes: "Combo Electricidad, Gas y Agua", isRecurring: true, recurrenceInterval: "monthly" },
  { id: "t-5", householdId: "hh-1", userId: "u-1", type: "EXPENSE", amount: 650, baseAmount: 650, originalAmount: 650, originalCurrency: "USD", category: "Alimentos", date: "2026-08-10T18:00:00.000Z", notes: "Supermercado y Frutería Semanal", isRecurring: false },
  { id: "t-6", householdId: "hh-1", userId: "u-1", type: "EXPENSE", amount: 120, baseAmount: 120, originalAmount: 120, originalCurrency: "USD", category: "Educación", date: "2026-08-12T11:00:00.000Z", notes: "Clases de Ballet Emilia", isRecurring: true, recurrenceInterval: "monthly" },
  { id: "t-7", householdId: "hh-1", userId: "u-2", type: "EXPENSE", amount: 15.99, baseAmount: 15.99, originalAmount: 15.99, originalCurrency: "USD", category: "Entretenimiento", date: "2026-08-14T20:00:00.000Z", notes: "Suscripción Familiar Netflix", isRecurring: true, recurrenceInterval: "monthly" },
  { id: "t-8", householdId: "hh-1", userId: "u-1", type: "EXPENSE", amount: 180, baseAmount: 180, originalAmount: 180, originalCurrency: "USD", category: "Salud", date: "2026-08-15T15:00:00.000Z", notes: "Consulta Odontológica Familiar", isRecurring: false },
];

const INITIAL_RULES: DistributionRule[] = [
  { id: "dr-1", householdId: "hh-1", name: "Gastos y Necesidades", type: "PERCENTAGE", targetBucket: "Expenses", value: 50 },
  { id: "dr-2", householdId: "hh-1", name: "Inversión y Patrimonio", type: "PERCENTAGE", targetBucket: "Investment", value: 25 },
  { id: "dr-3", householdId: "hh-1", name: "Fondo de Emergencia / Ahorro", type: "PERCENTAGE", targetBucket: "Savings", value: 15 },
  { id: "dr-4", householdId: "hh-1", name: "Ocio y Gastos Personales", type: "PERCENTAGE", targetBucket: "Discretionary", value: 10 },
];

const INITIAL_INVESTMENTS: Investment[] = [
  { id: "inv-1", householdId: "hh-1", assetName: "Vanguard S&P 500 ETF (VOO)", assetType: "Stocks", investedAmount: 45000, currentValue: 52400, expectedAnnualReturn: 9.5, updatedAt: "2026-08-15T00:00:00.000Z" },
  { id: "inv-2", householdId: "hh-1", assetName: "Apartamento en Alquiler Miami", assetType: "Real Estate", investedAmount: 30000, currentValue: 34500, expectedAnnualReturn: 7.2, updatedAt: "2026-08-15T00:00:00.000Z" },
  { id: "inv-3", householdId: "hh-1", assetName: "Billetera Bitcoin (BTC)", assetType: "Crypto", investedAmount: 15000, currentValue: 21200, expectedAnnualReturn: 18.0, updatedAt: "2026-08-15T00:00:00.000Z" },
  { id: "inv-4", householdId: "hh-1", assetName: "Cuenta de Alto Rendimiento (HYSA)", assetType: "Cash", investedAmount: 12000, currentValue: 12150, expectedAnnualReturn: 4.5, updatedAt: "2026-08-15T00:00:00.000Z" },
];

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: "item-1", householdId: "hh-1", name: "Leche Entera Orgánica", category: "Pantry", currentQuantity: 1, minQuantity: 3, unit: "litros" },
  { id: "item-2", householdId: "hh-1", name: "Arroz Basmati", category: "Pantry", currentQuantity: 5, minQuantity: 2, unit: "kg" },
  { id: "item-3", householdId: "hh-1", name: "Cápsulas para Lavavajillas", category: "Cleaning", currentQuantity: 45, minQuantity: 15, unit: "cápsulas" },
  { id: "item-4", householdId: "hh-1", name: "Detergente de Lavandería", category: "Cleaning", currentQuantity: 0.5, minQuantity: 1.0, unit: "botellas" },
  { id: "item-5", householdId: "hh-1", name: "Papel Higiénico Premium", category: "Toiletries", currentQuantity: 12, minQuantity: 16, unit: "rollos" },
  { id: "item-6", householdId: "hh-1", name: "Crema Dental Sensodyne", category: "Toiletries", currentQuantity: 3, minQuantity: 1, unit: "tubes" },
  { id: "item-7", householdId: "hh-1", name: "Jarabe Infantil Paracetamol", category: "Medicine", currentQuantity: 1, minQuantity: 1, unit: "frascos" },
  { id: "item-8", householdId: "hh-1", name: "Gomitas Vitamina C 1000mg", category: "Medicine", currentQuantity: 40, minQuantity: 20, unit: "gomitas" },
];

const INITIAL_GOALS: Goal[] = [
  { id: "g-1", householdId: "hh-1", title: "Vacaciones Familiares en Europa", targetAmount: 8000, currentAmount: 5400, deadline: "2027-06-15", timeframe: "SHORT", category: "Vacaciones", priority: "HIGH" },
  { id: "g-2", householdId: "hh-1", title: "Fondo de Emergencia de 6 Meses", targetAmount: 24000, currentAmount: 18500, deadline: "2028-12-31", timeframe: "MEDIUM", category: "Fondo de Emergencia", priority: "HIGH" },
  { id: "g-3", householdId: "hh-1", title: "Inicial de Auto Eléctrico", targetAmount: 15000, currentAmount: 4200, deadline: "2027-11-20", timeframe: "SHORT", category: "Vehículo", priority: "MEDIUM" },
  { id: "g-4", householdId: "hh-1", title: "Inicial para Casa de Campo", targetAmount: 120000, currentAmount: 35000, deadline: "2031-09-01", timeframe: "LONG", category: "Compra de Vivienda", priority: "MEDIUM" },
];

const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  { id: "ev-1", householdId: "hh-1", title: "Pago Automático de Hipoteca", dueDate: "2026-08-03T12:00:00.000Z", amount: 2200, type: "BILL", status: "PAID" },
  { id: "ev-2", householdId: "hh-1", title: "Factura Internet Fibra Óptica", dueDate: "2026-08-18T10:00:00.000Z", amount: 89.99, type: "BILL", status: "UNPAID" },
  { id: "ev-3", householdId: "hh-1", title: "Cuota de Impuesto Inmobiliario", dueDate: "2026-08-25T00:00:00.000Z", amount: 1450, type: "TAX", status: "UNPAID" },
  { id: "ev-4", householdId: "hh-1", title: "Plan Familiar Gimnasio", dueDate: "2026-08-28T09:00:00.000Z", amount: 110, type: "SUBSCRIPTION", status: "UNPAID" },
  { id: "ev-5", householdId: "hh-1", title: "Renovación Seguro de Auto", dueDate: "2026-08-10T12:00:00.000Z", amount: 320, type: "BILL", status: "PAID" },
  { id: "ev-6", householdId: "hh-1", title: "Servicio Anual de Agua y Drenaje", dueDate: "2026-08-12T12:00:00.000Z", amount: 450, type: "TAX", status: "OVERDUE" },
];

const INITIAL_CHORES: Chore[] = [
  { id: "ch-1", householdId: "hh-1", assignedToUserId: "u-3", title: "Vaciar el lavavajillas por completo", pointsReward: 30, status: "PENDING", dueDate: "2026-08-17T18:00:00.000Z" },
  { id: "ch-2", householdId: "hh-1", assignedToUserId: "u-3", title: "Pasear a Toby y limpiar sus patas", pointsReward: 20, status: "COMPLETED", dueDate: "2026-08-16T12:00:00.000Z" },
  { id: "ch-3", householdId: "hh-1", assignedToUserId: "u-4", title: "Ordenar los juguetes de la sala", pointsReward: 40, status: "PENDING", dueDate: "2026-08-16T20:00:00.000Z" },
  { id: "ch-4", householdId: "hh-1", assignedToUserId: "u-3", title: "Preparar lonchera para la escuela", pointsReward: 50, status: "COMPLETED", dueDate: "2026-08-15T21:00:00.000Z" },
  { id: "ch-5", householdId: "hh-1", assignedToUserId: "u-4", title: "Alimentar a Toby (Mañana y Noche)", pointsReward: 15, status: "COMPLETED", dueDate: "2026-08-16T19:00:00.000Z" },
  { id: "ch-6", householdId: "hh-1", assignedToUserId: "u-4", title: "Hacer la guía de matemáticas ejercicio 4", pointsReward: 60, status: "PENDING", dueDate: "2026-08-18T15:00:00.000Z" },
];

const INITIAL_SCREENTIME: ScreenTimeLog[] = [
  { id: "st-1", childUserId: "u-3", date: "2026-08-16", minutesUsed: 85, dailyLimitMinutes: 120 },
  { id: "st-2", childUserId: "u-4", date: "2026-08-16", minutesUsed: 110, dailyLimitMinutes: 90 },
];

// Global Memory State Engine (with DB synchronization)
class StorageEngine {
  public household: Household = INITIAL_HOUSEHOLD;
  public users: User[] = INITIAL_USERS;
  public transactions: Transaction[] = INITIAL_TRANSACTIONS;
  public rules: DistributionRule[] = INITIAL_RULES;
  public investments: Investment[] = INITIAL_INVESTMENTS;
  public inventory: InventoryItem[] = INITIAL_INVENTORY;
  public goals: Goal[] = INITIAL_GOALS;
  public calendarEvents: CalendarEvent[] = INITIAL_CALENDAR_EVENTS;
  public chores: Chore[] = INITIAL_CHORES;
  public screenTime: ScreenTimeLog[] = INITIAL_SCREENTIME;

  public isLoaded: boolean = false;

  get currentUser(): User {
    return this.users.find((u) => u.role === "ADMIN") || this.users[0];
  }

  async syncWithDatabase(userEmailOrId?: string) {
    try {
      const emailOrId = userEmailOrId || 
        (typeof window !== "undefined" ? (localStorage.getItem("sinergy_active_user_email") || localStorage.getItem("sinergy_active_user_id")) : null);

      const data = await getHouseholdFullStateForUser(emailOrId || undefined);
      if (data) {
        if (data.household) {
          this.household = {
            id: data.household.id,
            name: data.household.name,
            baseCurrency: data.household.baseCurrency,
            createdAt: typeof data.household.createdAt === 'object' ? data.household.createdAt.toISOString() : String(data.household.createdAt),
          };
        }
        if (data.users && Array.isArray(data.users)) {
          this.users = data.users.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            image: u.image,
            householdId: u.householdId,
            role: u.role as "ADMIN" | "MEMBER" | "CHILD",
            pointsBalance: u.pointsBalance,
          }));
        }
        if (data.transactions && Array.isArray(data.transactions)) {
          this.transactions = data.transactions;
        }
        if (data.rules && Array.isArray(data.rules)) {
          this.rules = data.rules;
        }
        if (data.investments && Array.isArray(data.investments)) {
          this.investments = data.investments;
        }
        if (data.inventory && Array.isArray(data.inventory)) {
          this.inventory = data.inventory;
        }
        if (data.goals && Array.isArray(data.goals)) {
          this.goals = data.goals;
        }
        if (data.calendarEvents && Array.isArray(data.calendarEvents)) {
          this.calendarEvents = data.calendarEvents;
        }
        if (data.chores && Array.isArray(data.chores)) {
          this.chores = data.chores;
        }
        if (data.screenTime && Array.isArray(data.screenTime)) {
          this.screenTime = data.screenTime;
        }
        this.isLoaded = true;
      }
    } catch (e) {
      console.warn("Could not sync with PostgreSQL (offline or connecting):", e);
    }
  }
}

export const dbStore = new StorageEngine();

type StoreListener = () => void;
const listeners = new Set<StoreListener>();

export function useStore() {
  const [state, setState] = useState({
    household: dbStore.household,
    users: dbStore.users,
    transactions: dbStore.transactions,
    rules: dbStore.rules,
    investments: dbStore.investments,
    inventory: dbStore.inventory,
    goals: dbStore.goals,
    calendarEvents: dbStore.calendarEvents,
    chores: dbStore.chores,
    screenTime: dbStore.screenTime,
  });

  const triggerUpdate = () => {
    setState({
      household: { ...dbStore.household },
      users: [...dbStore.users],
      transactions: [...dbStore.transactions],
      rules: [...dbStore.rules],
      investments: [...dbStore.investments],
      inventory: [...dbStore.inventory],
      goals: [...dbStore.goals],
      calendarEvents: [...dbStore.calendarEvents],
      chores: [...dbStore.chores],
      screenTime: [...dbStore.screenTime],
    });
    listeners.forEach((l) => l());
  };

  useEffect(() => {
    const handleUpdate = () => {
      setState({
        household: { ...dbStore.household },
        users: [...dbStore.users],
        transactions: [...dbStore.transactions],
        rules: [...dbStore.rules],
        investments: [...dbStore.investments],
        inventory: [...dbStore.inventory],
        goals: [...dbStore.goals],
        calendarEvents: [...dbStore.calendarEvents],
        chores: [...dbStore.chores],
        screenTime: [...dbStore.screenTime],
      });
    };

    listeners.add(handleUpdate);

    // Initial fetch from PostgreSQL on mount
    if (!dbStore.isLoaded) {
      const userKey = typeof window !== "undefined" ? (localStorage.getItem("sinergy_active_user_email") || localStorage.getItem("sinergy_active_user_id")) : null;
      dbStore.syncWithDatabase(userKey || undefined).then(() => {
        triggerUpdate();
      });
    }

    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  return {
    ...state,
    currentUser: dbStore.currentUser,

    // HOUSEHOLD ACTIONS
    updateHousehold: async (name: string, baseCurrency: string) => {
      dbStore.household = { ...dbStore.household, name, baseCurrency };
      triggerUpdate();
      await serverUpdateHousehold(dbStore.household.id, name, baseCurrency);
    },

    // USER ACTIONS
    addUser: async (name: string, email: string, role: "ADMIN" | "MEMBER" | "CHILD") => {
      const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
      const cleanEmail = email && email.trim().length > 0 ? email.trim() : `${cleanName || "miembro"}-${Date.now()}@sinergy.home`;
      const newUser: User = {
        id: `u-${Date.now()}`,
        name,
        email: cleanEmail,
        role,
        pointsBalance: 0,
        householdId: dbStore.household.id,
      };
      dbStore.users = [...dbStore.users, newUser];
      triggerUpdate();

      try {
        const res = await serverAddUser(dbStore.household.id, name, cleanEmail, role);
        if (res?.success && res.data) {
          dbStore.users = dbStore.users.map((u) => (u.id === newUser.id ? { ...u, id: res.data.id } : u));
          triggerUpdate();
        }
      } catch (err) {
        console.error("Error adding user to household on server:", err);
      }
    },

    removeUser: async (userId: string) => {
      dbStore.users = dbStore.users.filter((u) => u.id !== userId);
      triggerUpdate();
      await serverRemoveUser(userId);
    },

    updateUserRole: async (userId: string, role: "ADMIN" | "MEMBER" | "CHILD") => {
      dbStore.users = dbStore.users.map((u) =>
        u.id === userId ? { ...u, role } : u
      );
      triggerUpdate();
      await serverUpdateUserRole(userId, role);
    },

    // TRANSACTION ACTIONS
    addTransaction: async (t: {
      userId: string;
      type: "INCOME" | "EXPENSE" | "TRANSFER";
      originalAmount: number;
      originalCurrency: string;
      category: string;
      date: string;
      notes: string;
      isRecurring?: boolean;
      recurrenceInterval?: "weekly" | "monthly" | "yearly";
    }) => {
      const originalAmountNum = Number(t.originalAmount) || 0;
      const baseAmount = convertToBase(
        originalAmountNum,
        t.originalCurrency || dbStore.household.baseCurrency,
        dbStore.household.baseCurrency
      );
      const newTx: Transaction = {
        ...t,
        id: `t-${Date.now()}`,
        householdId: dbStore.household.id,
        userId: t.userId || dbStore.users[0]?.id || "u-1",
        amount: baseAmount,
        baseAmount,
        originalAmount: originalAmountNum,
        originalCurrency: t.originalCurrency || dbStore.household.baseCurrency,
        isRecurring: t.isRecurring || false,
      };

      dbStore.transactions = [newTx, ...dbStore.transactions];
      triggerUpdate();

      try {
        // Persist to Postgres via Server Action
        const res = await serverCreateTransaction({
          householdId: dbStore.household.id,
          userId: t.userId || dbStore.users[0]?.id || "u-1",
          type: t.type,
          originalAmount: originalAmountNum,
          originalCurrency: t.originalCurrency || dbStore.household.baseCurrency,
          category: t.category,
          date: t.date,
          notes: t.notes,
          isRecurring: t.isRecurring,
          recurrenceInterval: t.recurrenceInterval,
        });

        if (res?.success && res.data) {
          dbStore.transactions = dbStore.transactions.map((tx) =>
            tx.id === newTx.id ? { ...tx, id: res.data.id } : tx
          );
          triggerUpdate();
        }
      } catch (err) {
        console.error("Error creating transaction in DB:", err);
      }
    },

    deleteTransaction: async (id: string) => {
      dbStore.transactions = dbStore.transactions.filter((tx) => tx.id !== id);
      triggerUpdate();
      await serverDeleteTransaction(id);
    },

    // RULE ACTIONS
    updateRule: async (id: string, value: number) => {
      dbStore.rules = dbStore.rules.map((r) => (r.id === id ? { ...r, value } : r));
      triggerUpdate();
      await serverUpdateRule(id, value);
    },

    // INVESTMENT ACTIONS
    addInvestment: async (
      assetName: string,
      assetType: Investment["assetType"],
      invested: number,
      current: number,
      returnRate: number
    ) => {
      const newInv: Investment = {
        id: `inv-${Date.now()}`,
        householdId: dbStore.household.id,
        assetName,
        assetType,
        investedAmount: invested,
        currentValue: current,
        expectedAnnualReturn: returnRate,
        updatedAt: new Date().toISOString(),
      };
      dbStore.investments = [newInv, ...dbStore.investments];
      triggerUpdate();

      await serverCreateInvestment({
        householdId: dbStore.household.id,
        assetName,
        assetType,
        investedAmount: invested,
        currentValue: current,
        expectedAnnualReturn: returnRate,
      });
    },

    updateInvestmentValue: async (id: string, newValue: number) => {
      dbStore.investments = dbStore.investments.map((inv) =>
        inv.id === id ? { ...inv, currentValue: newValue, updatedAt: new Date().toISOString() } : inv
      );
      triggerUpdate();
      await serverUpdateInvestmentValue(id, newValue);
    },

    // INVENTORY ACTIONS
    updateInventoryStock: async (id: string, delta: number) => {
      dbStore.inventory = dbStore.inventory.map((item) => {
        if (item.id === id) {
          const qty = Math.max(0, Number(item.currentQuantity) + delta);
          return { ...item, currentQuantity: Number(qty.toFixed(2)) };
        }
        return item;
      });
      triggerUpdate();
      await serverUpdateInventoryStock(id, delta);
    },

    addInventoryItem: async (
      name: string,
      category: InventoryItem["category"],
      minQty: number,
      unit: string
    ) => {
      const newItem: InventoryItem = {
        id: `item-${Date.now()}`,
        householdId: dbStore.household.id,
        name,
        category,
        currentQuantity: 0,
        minQuantity: minQty,
        unit,
      };
      dbStore.inventory = [...dbStore.inventory, newItem];
      triggerUpdate();

      await serverCreateInventoryItem({
        householdId: dbStore.household.id,
        name,
        category,
        minQuantity: minQty,
        unit,
      });
    },

    deleteInventoryItem: async (id: string) => {
      dbStore.inventory = dbStore.inventory.filter((item) => item.id !== id);
      triggerUpdate();
      await serverDeleteInventoryItem(id);
    },

    // GOAL ACTIONS
    addGoal: async (
      title: string,
      target: number,
      deadline: string,
      timeframe: Goal["timeframe"],
      category: string,
      priority: Goal["priority"]
    ) => {
      const newGoal: Goal = {
        id: `g-${Date.now()}`,
        householdId: dbStore.household.id,
        title,
        targetAmount: target,
        currentAmount: 0,
        deadline,
        timeframe,
        category,
        priority,
      };
      dbStore.goals = [...dbStore.goals, newGoal];
      triggerUpdate();

      await serverCreateGoal({
        householdId: dbStore.household.id,
        title,
        targetAmount: target,
        deadline,
        timeframe,
        category,
        priority,
      });
    },

    contributeToGoal: async (id: string, amount: number) => {
      dbStore.goals = dbStore.goals.map((g) => {
        if (g.id === id) {
          const updated = Math.min(Number(g.targetAmount), Number(g.currentAmount) + amount);
          return { ...g, currentAmount: Number(updated.toFixed(2)) };
        }
        return g;
      });
      triggerUpdate();
      await serverContributeToGoal(id, amount);
    },

    // CALENDAR ACTIONS
    addCalendarEvent: async (title: string, dueDate: string, amount: number, type: CalendarEvent["type"]) => {
      const newEv: CalendarEvent = {
        id: `ev-${Date.now()}`,
        householdId: dbStore.household.id,
        title,
        dueDate,
        amount,
        type,
        status: "UNPAID",
      };
      dbStore.calendarEvents = [...dbStore.calendarEvents, newEv];
      triggerUpdate();

      await serverCreateCalendarEvent({
        householdId: dbStore.household.id,
        title,
        dueDate,
        amount,
        type,
      });
    },

    payBill: async (id: string) => {
      dbStore.calendarEvents = dbStore.calendarEvents.map((ev) =>
        ev.id === id ? { ...ev, status: "PAID" as const } : ev
      );
      triggerUpdate();
      await serverPayBill(id, dbStore.currentUser.id);
      dbStore.syncWithDatabase().then(triggerUpdate);
    },

    // CHORE ACTIONS
    completeChore: async (id: string) => {
      const chore = dbStore.chores.find((c) => c.id === id);
      if (chore && chore.status === "PENDING") {
        dbStore.users = dbStore.users.map((u) =>
          u.id === chore.assignedToUserId ? { ...u, pointsBalance: u.pointsBalance + chore.pointsReward } : u
        );
        dbStore.chores = dbStore.chores.map((ch) =>
          ch.id === id ? { ...ch, status: "COMPLETED" as const } : ch
        );
        triggerUpdate();
        await serverCompleteChore(id);
      }
    },

    addChore: async (title: string, assignedToUserId: string, pointsReward: number, dueDate?: string) => {
      const newCh: Chore = {
        id: `ch-${Date.now()}`,
        householdId: dbStore.household.id,
        assignedToUserId,
        title,
        pointsReward,
        status: "PENDING",
        dueDate: dueDate || new Date().toISOString(),
      };
      dbStore.chores = [...dbStore.chores, newCh];
      triggerUpdate();

      await serverCreateChore({
        householdId: dbStore.household.id,
        assignedToUserId,
        title,
        pointsReward,
        dueDate,
      });
    },

    updateChore: async (input: {
      id: string;
      title: string;
      assignedToUserId: string;
      pointsReward: number;
      status?: "PENDING" | "COMPLETED";
    }) => {
      dbStore.chores = dbStore.chores.map((ch) =>
        ch.id === input.id
          ? {
              ...ch,
              title: input.title,
              assignedToUserId: input.assignedToUserId,
              pointsReward: input.pointsReward,
              ...(input.status ? { status: input.status } : {}),
            }
          : ch
      );
      triggerUpdate();
      await serverUpdateChore(input);
    },

    deleteChore: async (id: string) => {
      dbStore.chores = dbStore.chores.filter((ch) => ch.id !== id);
      triggerUpdate();
      await serverDeleteChore(id);
    },

    resetDailyChores: async () => {
      dbStore.chores = dbStore.chores.map((ch) => ({
        ...ch,
        status: "PENDING" as const,
      }));
      triggerUpdate();
      await serverResetDailyChores(dbStore.household.id);
    },

    // SCREEN TIME ACTIONS
    logScreenTime: async (childUserId: string, minutes: number) => {
      const dateStr = new Date().toISOString().split("T")[0];
      const matchIndex = dbStore.screenTime.findIndex(
        (log) => log.childUserId === childUserId && log.date === dateStr
      );

      if (matchIndex !== -1) {
        dbStore.screenTime[matchIndex].minutesUsed += minutes;
      } else {
        dbStore.screenTime.push({
          id: `st-${Date.now()}`,
          childUserId,
          date: dateStr,
          minutesUsed: minutes,
          dailyLimitMinutes: 120,
        });
      }
      triggerUpdate();
      await serverLogScreenTime(childUserId, minutes);
    },

    redeemScreenTime: async (childUserId: string, pointsToRedeem: number) => {
      const child = dbStore.users.find((u) => u.id === childUserId);
      if (!child || child.pointsBalance < pointsToRedeem) return false;

      child.pointsBalance -= pointsToRedeem;
      const minutesGranted = Math.floor((pointsToRedeem / 10) * 15);
      const dateStr = new Date().toISOString().split("T")[0];
      const matchIndex = dbStore.screenTime.findIndex(
        (log) => log.childUserId === childUserId && log.date === dateStr
      );

      if (matchIndex !== -1) {
        dbStore.screenTime[matchIndex].dailyLimitMinutes += minutesGranted;
      } else {
        dbStore.screenTime.push({
          id: `st-${Date.now()}`,
          childUserId,
          date: dateStr,
          minutesUsed: 0,
          dailyLimitMinutes: 120 + minutesGranted,
        });
      }
      triggerUpdate();

      const res = await serverRedeemScreenTime(childUserId, pointsToRedeem);
      return res.success;
    },

    updateScreenTimeLimit: async (childUserId: string, dailyLimitMinutes: number) => {
      const dateStr = new Date().toISOString().split("T")[0];
      const matchIndex = dbStore.screenTime.findIndex(
        (log) => log.childUserId === childUserId && log.date === dateStr
      );

      if (matchIndex !== -1) {
        dbStore.screenTime[matchIndex].dailyLimitMinutes = dailyLimitMinutes;
      } else {
        dbStore.screenTime.push({
          id: `st-${Date.now()}`,
          childUserId,
          date: dateStr,
          minutesUsed: 0,
          dailyLimitMinutes,
        });
      }
      triggerUpdate();
      await serverUpdateScreenTimeLimit(childUserId, dailyLimitMinutes);
    },

    setScreenTime: async (childUserId: string, minutesUsed: number, dailyLimitMinutes?: number) => {
      const dateStr = new Date().toISOString().split("T")[0];
      const matchIndex = dbStore.screenTime.findIndex(
        (log) => log.childUserId === childUserId && log.date === dateStr
      );

      if (matchIndex !== -1) {
        dbStore.screenTime[matchIndex].minutesUsed = minutesUsed;
        if (dailyLimitMinutes !== undefined) {
          dbStore.screenTime[matchIndex].dailyLimitMinutes = dailyLimitMinutes;
        }
      } else {
        dbStore.screenTime.push({
          id: `st-${Date.now()}`,
          childUserId,
          date: dateStr,
          minutesUsed,
          dailyLimitMinutes: dailyLimitMinutes ?? 120,
        });
      }
      triggerUpdate();
      await serverSetScreenTime(childUserId, minutesUsed, dailyLimitMinutes);
    },
  };
}

