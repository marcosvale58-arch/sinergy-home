"use client";

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
  image?: string;
  householdId: string;
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
  currency: string;
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
  expectedAnnualReturn: number; // e.g. 8.5
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
  category: string; // Vacation, Emergency Fund, Home Purchase, etc.
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

// Pre-seeded initial state
const INITIAL_HOUSEHOLD: Household = {
  id: "hh-1",
  name: "Sinergy Mansion",
  baseCurrency: "USD",
  createdAt: "2026-01-15T12:00:00.000Z",
};

const INITIAL_USERS: User[] = [
  { id: "u-1", name: "John Doe", email: "john@sinergy.home", role: "ADMIN", pointsBalance: 20, householdId: "hh-1" },
  { id: "u-2", name: "Jane Doe", email: "jane@sinergy.home", role: "ADMIN", pointsBalance: 50, householdId: "hh-1" },
  { id: "u-3", name: "Emily Doe", email: "emily@sinergy.home", role: "CHILD", pointsBalance: 350, householdId: "hh-1" },
  { id: "u-4", name: "Leo Doe", email: "leo@sinergy.home", role: "CHILD", pointsBalance: 120, householdId: "hh-1" },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: "t-1", householdId: "hh-1", userId: "u-1", type: "INCOME", amount: 7500, currency: "USD", category: "Salary", date: "2026-08-01T09:00:00.000Z", notes: "John Tech Corp Salary", isRecurring: true, recurrenceInterval: "monthly" },
  { id: "t-2", householdId: "hh-1", userId: "u-2", type: "INCOME", amount: 5200, currency: "USD", category: "Salary", date: "2026-08-02T10:00:00.000Z", notes: "Jane Consulting Invoice", isRecurring: true, recurrenceInterval: "monthly" },
  { id: "t-3", householdId: "hh-1", userId: "u-1", type: "EXPENSE", amount: 2200, currency: "USD", category: "Housing", date: "2026-08-03T12:00:00.000Z", notes: "Monthly Mortgage payment", isRecurring: true, recurrenceInterval: "monthly" },
  { id: "t-4", householdId: "hh-1", userId: "u-2", type: "EXPENSE", amount: 480, currency: "USD", category: "Utilities", date: "2026-08-05T14:30:00.000Z", notes: "Electricity & Gas combo", isRecurring: true, recurrenceInterval: "monthly" },
  { id: "t-5", householdId: "hh-1", userId: "u-1", type: "EXPENSE", amount: 650, currency: "USD", category: "Food", date: "2026-08-10T18:00:00.000Z", notes: "Organic Groceries", isRecurring: false },
  { id: "t-6", householdId: "hh-1", userId: "u-1", type: "EXPENSE", amount: 120, currency: "USD", category: "Education", date: "2026-08-12T11:00:00.000Z", notes: "Emily Ballet Class", isRecurring: true, recurrenceInterval: "monthly" },
  { id: "t-7", householdId: "hh-1", userId: "u-2", type: "EXPENSE", amount: 15.99, currency: "USD", category: "Entertainment", date: "2026-08-14T20:00:00.000Z", notes: "Netflix Premium Subscription", isRecurring: true, recurrenceInterval: "monthly" },
  { id: "t-8", householdId: "hh-1", userId: "u-1", type: "EXPENSE", amount: 180, currency: "USD", category: "Health", date: "2026-08-15T15:00:00.000Z", notes: "Family Dental Checkup", isRecurring: false },
  { id: "t-9", householdId: "hh-1", userId: "u-2", type: "TRANSFER", amount: 1000, currency: "USD", category: "Investment", date: "2026-08-15T09:00:00.000Z", notes: "Transfer to S&P 500 Index Fund", isRecurring: true, recurrenceInterval: "monthly" },
];

const INITIAL_RULES: DistributionRule[] = [
  { id: "dr-1", householdId: "hh-1", name: "Essential Needs", type: "PERCENTAGE", targetBucket: "Expenses", value: 50 },
  { id: "dr-2", householdId: "hh-1", name: "Future Growth", type: "PERCENTAGE", targetBucket: "Investment", value: 25 },
  { id: "dr-3", householdId: "hh-1", name: "Rainy Day", type: "PERCENTAGE", targetBucket: "Savings", value: 15 },
  { id: "dr-4", householdId: "hh-1", name: "Fun & Leisure", type: "PERCENTAGE", targetBucket: "Discretionary", value: 10 },
];

const INITIAL_INVESTMENTS: Investment[] = [
  { id: "inv-1", householdId: "hh-1", assetName: "Vanguard S&P 500 ETF (VOO)", assetType: "Stocks", investedAmount: 45000, currentValue: 52400, expectedAnnualReturn: 9.5, updatedAt: "2026-08-15T00:00:00.000Z" },
  { id: "inv-2", householdId: "hh-1", assetName: "Miami Rental Apartment Co-Invest", assetType: "Real Estate", investedAmount: 30000, currentValue: 34500, expectedAnnualReturn: 7.2, updatedAt: "2026-08-15T00:00:00.000Z" },
  { id: "inv-3", householdId: "hh-1", assetName: "Bitcoin (BTC) Ledger", assetType: "Crypto", investedAmount: 15000, currentValue: 21200, expectedAnnualReturn: 18.0, updatedAt: "2026-08-15T00:00:00.000Z" },
  { id: "inv-4", householdId: "hh-1", assetName: "Ally High Yield Savings Account", assetType: "Cash", investedAmount: 12000, currentValue: 12150, expectedAnnualReturn: 4.5, updatedAt: "2026-08-15T00:00:00.000Z" },
];

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: "item-1", householdId: "hh-1", name: "Organic Whole Milk", category: "Pantry", currentQuantity: 1, minQuantity: 3, unit: "liters" },
  { id: "item-2", householdId: "hh-1", name: "Basmati Rice", category: "Pantry", currentQuantity: 5, minQuantity: 2, unit: "kg" },
  { id: "item-3", householdId: "hh-1", name: "Dishwasher Pods", category: "Cleaning", currentQuantity: 45, minQuantity: 15, unit: "pods" },
  { id: "item-4", householdId: "hh-1", name: "Lavender Laundry Detergent", category: "Cleaning", currentQuantity: 0.5, minQuantity: 1.0, unit: "bottles" },
  { id: "item-5", householdId: "hh-1", name: "Bamboo Toilet Paper", category: "Toiletries", currentQuantity: 12, minQuantity: 16, unit: "rolls" },
  { id: "item-6", householdId: "hh-1", name: "Sensodyne Toothpaste", category: "Toiletries", currentQuantity: 3, minQuantity: 1, unit: "tubes" },
  { id: "item-7", householdId: "hh-1", name: "Kids Paracetamol Syrup", category: "Medicine", currentQuantity: 1, minQuantity: 1, unit: "bottles" },
  { id: "item-8", householdId: "hh-1", name: "Vitamin C 1000mg Gummies", category: "Medicine", currentQuantity: 40, minQuantity: 20, unit: "gummies" },
];

const INITIAL_GOALS: Goal[] = [
  { id: "g-1", householdId: "hh-1", title: "European Family Vacation", targetAmount: 8000, currentAmount: 5400, deadline: "2027-06-15", timeframe: "SHORT", category: "Vacation", priority: "HIGH" },
  { id: "g-2", householdId: "hh-1", title: "6-Month Emergency Fund", targetAmount: 24000, currentAmount: 18500, deadline: "2028-12-31", timeframe: "MEDIUM", category: "Emergency Fund", priority: "HIGH" },
  { id: "g-3", householdId: "hh-1", title: "New EV Downpayment", targetAmount: 15000, currentAmount: 4200, deadline: "2027-11-20", timeframe: "SHORT", category: "Vehicle", priority: "MEDIUM" },
  { id: "g-4", householdId: "hh-1", title: "Lake House Purchase Downpayment", targetAmount: 120000, currentAmount: 35000, deadline: "2031-09-01", timeframe: "LONG", category: "Home Purchase", priority: "MEDIUM" },
];

const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  { id: "ev-1", householdId: "hh-1", title: "Mortgage Auto-pay", dueDate: "2026-08-03T12:00:00.000Z", amount: 2200, type: "BILL", status: "PAID" },
  { id: "ev-2", householdId: "hh-1", title: "Comcast Internet Bill", dueDate: "2026-08-18T10:00:00.000Z", amount: 89.99, type: "BILL", status: "UNPAID" },
  { id: "ev-3", householdId: "hh-1", title: "State Property Tax installment", dueDate: "2026-08-25T00:00:00.000Z", amount: 1450, type: "TAX", status: "UNPAID" },
  { id: "ev-4", householdId: "hh-1", title: "Gym Premium Family Plan", dueDate: "2026-08-28T09:00:00.000Z", amount: 110, type: "SUBSCRIPTION", status: "UNPAID" },
  { id: "ev-5", householdId: "hh-1", title: "Car Insurance Auto-renewal", dueDate: "2026-08-10T12:00:00.000Z", amount: 320, type: "BILL", status: "PAID" },
  { id: "ev-6", householdId: "hh-1", title: "Annual Water District Assessment", dueDate: "2026-08-12T12:00:00.000Z", amount: 450, type: "TAX", status: "OVERDUE" },
];

const INITIAL_CHORES: Chore[] = [
  { id: "ch-1", householdId: "hh-1", assignedToUserId: "u-3", title: "Unload the Dishwasher completely", pointsReward: 30, status: "PENDING", dueDate: "2026-08-17T18:00:00.000Z" },
  { id: "ch-2", householdId: "hh-1", assignedToUserId: "u-3", title: "Walk Toby and clean paws", pointsReward: 20, status: "COMPLETED", dueDate: "2026-08-16T12:00:00.000Z" },
  { id: "ch-3", householdId: "hh-1", assignedToUserId: "u-4", title: "Tidy up play room toys", pointsReward: 40, status: "PENDING", dueDate: "2026-08-16T20:00:00.000Z" },
  { id: "ch-4", householdId: "hh-1", assignedToUserId: "u-3", title: "Prepare and pack lunchbox for school", pointsReward: 50, status: "COMPLETED", dueDate: "2026-08-15T21:00:00.000Z" },
  { id: "ch-5", householdId: "hh-1", assignedToUserId: "u-4", title: "Feed Toby (Morning & Evening)", pointsReward: 15, status: "COMPLETED", dueDate: "2026-08-16T19:00:00.000Z" },
  { id: "ch-6", householdId: "hh-1", assignedToUserId: "u-4", title: "Do Math Worksheet exercise 4", pointsReward: 60, status: "PENDING", dueDate: "2026-08-18T15:00:00.000Z" },
];

const INITIAL_SCREENTIME: ScreenTimeLog[] = [
  { id: "st-1", childUserId: "u-3", date: "2026-08-16", minutesUsed: 85, dailyLimitMinutes: 120 },
  { id: "st-2", childUserId: "u-4", date: "2026-08-16", minutesUsed: 110, dailyLimitMinutes: 90 },
];

// Helper to safely load state from LocalStorage or initialize with defaults
class StorageEngine {
  private get<T>(key: string, defaultValue: T): T {
    if (typeof window === "undefined") return defaultValue;
    try {
      const stored = localStorage.getItem(`sinergy_${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(`sinergy_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error("Storage error:", e);
    }
  }

  // Current active user
  get currentUser(): User {
    const users = this.users;
    return users.find((u) => u.role === "ADMIN") || users[0];
  }

  get household(): Household {
    return this.get<Household>("household", INITIAL_HOUSEHOLD);
  }
  set household(val: Household) {
    this.set("household", val);
  }

  get users(): User[] {
    return this.get<User[]>("users", INITIAL_USERS);
  }
  set users(val: User[]) {
    this.set("users", val);
  }

  get transactions(): Transaction[] {
    return this.get<Transaction[]>("transactions", INITIAL_TRANSACTIONS);
  }
  set transactions(val: Transaction[]) {
    this.set("transactions", val);
  }

  get rules(): DistributionRule[] {
    return this.get<DistributionRule[]>("rules", INITIAL_RULES);
  }
  set rules(val: DistributionRule[]) {
    this.set("rules", val);
  }

  get investments(): Investment[] {
    return this.get<Investment[]>("investments", INITIAL_INVESTMENTS);
  }
  set investments(val: Investment[]) {
    this.set("investments", val);
  }

  get inventory(): InventoryItem[] {
    return this.get<InventoryItem[]>("inventory", INITIAL_INVENTORY);
  }
  set inventory(val: InventoryItem[]) {
    this.set("inventory", val);
  }

  get goals(): Goal[] {
    return this.get<Goal[]>("goals", INITIAL_GOALS);
  }
  set goals(val: Goal[]) {
    this.set("goals", val);
  }

  get calendarEvents(): CalendarEvent[] {
    return this.get<CalendarEvent[]>("calendarEvents", INITIAL_CALENDAR_EVENTS);
  }
  set calendarEvents(val: CalendarEvent[]) {
    this.set("calendarEvents", val);
  }

  get chores(): Chore[] {
    return this.get<Chore[]>("chores", INITIAL_CHORES);
  }
  set chores(val: Chore[]) {
    this.set("chores", val);
  }

  get screenTime(): ScreenTimeLog[] {
    return this.get<ScreenTimeLog[]>("screentime", INITIAL_SCREENTIME);
  }
  set screenTime(val: ScreenTimeLog[]) {
    this.set("screentime", val);
  }
}

export const dbStore = new StorageEngine();

// Reactive State Provider Hook (Simulated state broadcast for multiple views)
import { useState, useEffect } from "react";

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

  useEffect(() => {
    const handleUpdate = () => {
      setState({
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
    };

    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  const triggerUpdate = () => {
    listeners.forEach((l) => l());
  };

  return {
    ...state,
    currentUser: dbStore.currentUser,

    // HOUSEHOLD ACTIONS
    updateHousehold: (name: string, baseCurrency: string) => {
      const h = { ...dbStore.household, name, baseCurrency };
      dbStore.household = h;
      triggerUpdate();
    },

    // USER ACTIONS
    addUser: (name: string, email: string, role: "ADMIN" | "MEMBER" | "CHILD") => {
      const users = dbStore.users;
      const newUser: User = {
        id: `u-${Date.now()}`,
        name,
        email,
        role,
        pointsBalance: 0,
        householdId: dbStore.household.id,
      };
      dbStore.users = [...users, newUser];
      triggerUpdate();
    },

    // TRANSACTION ACTIONS
    addTransaction: (t: Omit<Transaction, "id" | "householdId">) => {
      const ts = dbStore.transactions;
      const nextId = `t-${Date.now()}`;
      const newTx: Transaction = {
        ...t,
        id: nextId,
        householdId: dbStore.household.id,
      };
      dbStore.transactions = [newTx, ...ts];

      // Automatically execute customizable distribution rule routing for INCOME!
      if (t.type === "INCOME") {
        const rules = dbStore.rules;
        const totalPct = rules.reduce((acc, curr) => acc + (curr.type === "PERCENTAGE" ? Number(curr.value) : 0), 0);
        
        // Let's routed amount directly into relevant virtual buckets / goals / investment / savings as transaction splits if we want,
        // or directly update investments / goals balances!
        rules.forEach((rule) => {
          const ruleAmt = rule.type === "PERCENTAGE" ? (t.amount * rule.value) / 100 : rule.value;
          
          if (rule.targetBucket === "Investment" && ruleAmt > 0) {
            // Find cash investment or default investment to increase
            const invs = dbStore.investments;
            const target = invs.find((i) => i.assetType === "Cash") || invs[0];
            if (target) {
              target.currentValue = Number(target.currentValue) + ruleAmt;
              dbStore.investments = [...invs];
            }
          } else if (rule.targetBucket === "Savings" && ruleAmt > 0) {
            // Distribute to the first available goal
            const gls = dbStore.goals;
            if (gls.length > 0) {
              gls[0].currentAmount = Number(gls[0].currentAmount) + ruleAmt;
              dbStore.goals = [...gls];
            }
          }
        });
      }

      triggerUpdate();
    },

    deleteTransaction: (id: string) => {
      dbStore.transactions = dbStore.transactions.filter((tx) => tx.id !== id);
      triggerUpdate();
    },

    // RULE ACTIONS
    updateRule: (id: string, value: number) => {
      const rules = dbStore.rules.map((r) => (r.id === id ? { ...r, value } : r));
      dbStore.rules = rules;
      triggerUpdate();
    },

    // INVESTMENT ACTIONS
    addInvestment: (assetName: string, assetType: Investment["assetType"], invested: number, current: number, returnRate: number) => {
      const nextId = `inv-${Date.now()}`;
      const newInv: Investment = {
        id: nextId,
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
    },

    updateInvestmentValue: (id: string, newValue: number) => {
      const invs = dbStore.investments.map((inv) =>
        inv.id === id ? { ...inv, currentValue: newValue, updatedAt: new Date().toISOString() } : inv
      );
      dbStore.investments = invs;
      triggerUpdate();
    },

    // INVENTORY ACTIONS
    updateInventoryStock: (id: string, delta: number) => {
      const items = dbStore.inventory.map((item) => {
        if (item.id === id) {
          const qty = Math.max(0, Number(item.currentQuantity) + delta);
          return { ...item, currentQuantity: Number(qty.toFixed(2)) };
        }
        return item;
      });
      dbStore.inventory = items;
      triggerUpdate();
    },

    addInventoryItem: (name: string, category: InventoryItem["category"], minQty: number, unit: string) => {
      const nextId = `item-${Date.now()}`;
      const newItem: InventoryItem = {
        id: nextId,
        householdId: dbStore.household.id,
        name,
        category,
        currentQuantity: 0,
        minQuantity: minQty,
        unit,
      };
      dbStore.inventory = [...dbStore.inventory, newItem];
      triggerUpdate();
    },

    // GOAL ACTIONS
    addGoal: (title: string, target: number, deadline: string, timeframe: Goal["timeframe"], category: string, priority: Goal["priority"]) => {
      const nextId = `g-${Date.now()}`;
      const newGoal: Goal = {
        id: nextId,
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
    },

    contributeToGoal: (id: string, amount: number) => {
      const gls = dbStore.goals.map((g) => {
        if (g.id === id) {
          const updated = Math.min(Number(g.targetAmount), Number(g.currentAmount) + amount);
          return { ...g, currentAmount: Number(updated.toFixed(2)) };
        }
        return g;
      });
      dbStore.goals = gls;
      triggerUpdate();
    },

    // CALENDAR ACTIONS
    addCalendarEvent: (title: string, dueDate: string, amount: number, type: CalendarEvent["type"]) => {
      const nextId = `ev-${Date.now()}`;
      const newEv: CalendarEvent = {
        id: nextId,
        householdId: dbStore.household.id,
        title,
        dueDate,
        amount,
        type,
        status: "UNPAID",
      };
      dbStore.calendarEvents = [...dbStore.calendarEvents, newEv];
      triggerUpdate();
    },

    payBill: (id: string) => {
      const evs = dbStore.calendarEvents.map((ev) => {
        if (ev.id === id) {
          // Subtract from user's general cash or record expense
          return { ...ev, status: "PAID" as const };
        }
        return ev;
      });
      dbStore.calendarEvents = evs;

      // also record as actual transaction automatically!
      const evObj = dbStore.calendarEvents.find((e) => e.id === id);
      if (evObj && evObj.amount > 0) {
        const adminUser = dbStore.currentUser;
        const newTx: Transaction = {
          id: `t-pay-${Date.now()}`,
          householdId: dbStore.household.id,
          userId: adminUser.id,
          type: "EXPENSE",
          amount: evObj.amount,
          currency: dbStore.household.baseCurrency,
          category: evObj.type === "BILL" ? "Utilities" : evObj.type === "TAX" ? "Taxes" : "Subscription",
          date: new Date().toISOString(),
          notes: `Paid upcoming item: ${evObj.title}`,
          isRecurring: false,
        };
        dbStore.transactions = [newTx, ...dbStore.transactions];
      }

      triggerUpdate();
    },

    // CHORE ACTIONS
    completeChore: (id: string) => {
      const chs = dbStore.chores.map((ch) => {
        if (ch.id === id && ch.status === "PENDING") {
          // Award points to the assigned user
          const users = dbStore.users.map((u) => {
            if (u.id === ch.assignedToUserId) {
              return { ...u, pointsBalance: u.pointsBalance + ch.pointsReward };
            }
            return u;
          });
          dbStore.users = users;
          return { ...ch, status: "COMPLETED" as const };
        }
        return ch;
      });
      dbStore.chores = chs;
      triggerUpdate();
    },

    addChore: (title: string, assignedToUserId: string, pointsReward: number, dueDate?: string) => {
      const nextId = `ch-${Date.now()}`;
      const newCh: Chore = {
        id: nextId,
        householdId: dbStore.household.id,
        assignedToUserId,
        title,
        pointsReward,
        status: "PENDING",
        dueDate: dueDate || new Date().toISOString(),
      };
      dbStore.chores = [...dbStore.chores, newCh];
      triggerUpdate();
    },

    // SCREEN TIME ACTIONS
    logScreenTime: (childUserId: string, minutes: number) => {
      const dateStr = new Date().toISOString().split("T")[0];
      const logs = dbStore.screenTime;
      const matchIndex = logs.findIndex((log) => log.childUserId === childUserId && log.date === dateStr);

      if (matchIndex !== -1) {
        logs[matchIndex].minutesUsed += minutes;
      } else {
        logs.push({
          id: `st-${Date.now()}`,
          childUserId,
          date: dateStr,
          minutesUsed: minutes,
          dailyLimitMinutes: 120, // default
        });
      }
      dbStore.screenTime = [...logs];
      triggerUpdate();
    },

    redeemScreenTime: (childUserId: string, pointsToRedeem: number) => {
      // 10 chore points = 15 screen minutes
      const users = dbStore.users;
      const child = users.find((u) => u.id === childUserId);
      if (!child || child.pointsBalance < pointsToRedeem) return false;

      // Deduct points
      child.pointsBalance -= pointsToRedeem;
      dbStore.users = [...users];

      // Increase daily limit for today
      const dateStr = new Date().toISOString().split("T")[0];
      const logs = dbStore.screenTime;
      const minutesGranted = Math.floor((pointsToRedeem / 10) * 15);
      const matchIndex = logs.findIndex((log) => log.childUserId === childUserId && log.date === dateStr);

      if (matchIndex !== -1) {
        logs[matchIndex].dailyLimitMinutes += minutesGranted;
      } else {
        logs.push({
          id: `st-${Date.now()}`,
          childUserId,
          date: dateStr,
          minutesUsed: 0,
          dailyLimitMinutes: 120 + minutesGranted,
        });
      }
      dbStore.screenTime = [...logs];
      triggerUpdate();
      return true;
    },
  };
}
