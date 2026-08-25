"use server";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { convertToBase } from "@/lib/currency";

export interface CreateTransactionInput {
  householdId: string;
  userId: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  originalAmount: number;
  originalCurrency: string;
  category: string;
  date?: string;
  notes?: string;
  isRecurring?: boolean;
  recurrenceInterval?: "weekly" | "monthly" | "yearly";
}

export async function getTransactions(householdId: string = "hh-1") {
  try {
    let targetHouseholdId = householdId;
    const hh = await db.query.households.findFirst({
      where: eq(schema.households.id, householdId),
    });
    if (!hh) {
      const firstHh = await db.query.households.findFirst();
      if (firstHh) {
        targetHouseholdId = firstHh.id;
      }
    }

    const txs = await db.query.transactions.findMany({
      where: eq(schema.transactions.householdId, targetHouseholdId),
      orderBy: [desc(schema.transactions.date)],
      with: {
        user: true,
      },
    });

    return txs.map((t) => ({
      id: t.id,
      householdId: t.householdId,
      userId: t.userId,
      userName: t.user?.name || "Usuario",
      type: t.type as "INCOME" | "EXPENSE" | "TRANSFER",
      amount: parseFloat(String(t.amount || 0)),
      baseAmount: parseFloat(String(t.baseAmount || t.amount || 0)),
      originalAmount: parseFloat(String(t.originalAmount || t.amount || 0)),
      originalCurrency: t.originalCurrency || "USD",
      category: t.category,
      date: t.date instanceof Date ? t.date.toISOString() : new Date(t.date).toISOString(),
      notes: t.notes || "",
      isRecurring: t.isRecurring || false,
      recurrenceInterval: t.recurrenceInterval as "weekly" | "monthly" | "yearly" | undefined,
    }));
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}

export async function createTransaction(input: CreateTransactionInput) {
  try {
    // 1. Resolve household
    let householdId = input.householdId;
    let hh = await db.query.households.findFirst({
      where: eq(schema.households.id, householdId),
    });

    if (!hh) {
      const firstHh = await db.query.households.findFirst();
      if (firstHh) {
        hh = firstHh;
        householdId = firstHh.id;
      } else {
        const [createdHh] = await db
          .insert(schema.households)
          .values({
            id: householdId || "hh-1",
            name: "Mi Hogar",
            baseCurrency: "USD",
            createdAt: new Date(),
          })
          .returning();
        hh = createdHh;
        householdId = createdHh.id;
      }
    }

    const baseCurrency = hh?.baseCurrency || "USD";

    // 2. Resolve user
    let userId = input.userId;
    let targetUser = await db.query.user.findFirst({
      where: eq(schema.user.id, userId),
    });

    if (!targetUser) {
      const hhUser = await db.query.user.findFirst({
        where: eq(schema.user.householdId, householdId),
      });
      if (hhUser) {
        userId = hhUser.id;
        targetUser = hhUser;
      } else {
        const anyUser = await db.query.user.findFirst();
        if (anyUser) {
          userId = anyUser.id;
          targetUser = anyUser;
        } else {
          const [createdUser] = await db
            .insert(schema.user)
            .values({
              id: userId || `u-${Date.now()}`,
              name: "Usuario",
              email: "usuario@sinergy.home",
              emailVerified: true,
              role: "ADMIN",
              pointsBalance: 0,
              householdId: householdId,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning();
          userId = createdUser.id;
          targetUser = createdUser;
        }
      }
    }

    // 3. Convert to base currency
    const originalAmountNum = Number(input.originalAmount) || 0;
    const baseAmount = convertToBase(originalAmountNum, input.originalCurrency || baseCurrency, baseCurrency);
    const nextId = `t-${Date.now()}`;

    // 4. Insert transaction
    const [tx] = await db
      .insert(schema.transactions)
      .values({
        id: nextId,
        householdId: householdId,
        userId: userId,
        type: input.type,
        amount: baseAmount.toFixed(2),
        baseAmount: baseAmount.toFixed(2),
        originalAmount: originalAmountNum.toFixed(2),
        originalCurrency: input.originalCurrency || baseCurrency,
        category: input.category || "Otros",
        date: input.date ? new Date(input.date) : new Date(),
        notes: input.notes || "",
        isRecurring: input.isRecurring || false,
        recurrenceInterval: input.recurrenceInterval || null,
      })
      .returning();

    // 5. Auto-route income into Investment/Savings based on distribution rules
    if (input.type === "INCOME") {
      const rules = await db.query.distributionRules.findMany({
        where: eq(schema.distributionRules.householdId, householdId),
      });

      for (const rule of rules) {
        const ruleVal = parseFloat(rule.value);
        const ruleAmt = rule.type === "PERCENTAGE" ? (baseAmount * ruleVal) / 100 : ruleVal;

        if (rule.targetBucket === "Investment" && ruleAmt > 0) {
          const invs = await db.query.investments.findMany({
            where: eq(schema.investments.householdId, householdId),
          });
          const targetInv = invs.find((i) => i.assetType === "Cash") || invs[0];
          if (targetInv) {
            const newCurVal = parseFloat(targetInv.currentValue) + ruleAmt;
            await db
              .update(schema.investments)
              .set({ currentValue: newCurVal.toFixed(2), updatedAt: new Date() })
              .where(eq(schema.investments.id, targetInv.id));
          }
        } else if (rule.targetBucket === "Savings" && ruleAmt > 0) {
          const gls = await db.query.goals.findMany({
            where: eq(schema.goals.householdId, householdId),
          });
          if (gls.length > 0) {
            const firstGoal = gls[0];
            const newGoalAmt = parseFloat(firstGoal.currentAmount) + ruleAmt;
            await db
              .update(schema.goals)
              .set({ currentAmount: newGoalAmt.toFixed(2) })
              .where(eq(schema.goals.id, firstGoal.id));
          }
        }
      }
    }

    revalidatePath("/");
    revalidatePath("/transactions");
    revalidatePath("/investments");
    revalidatePath("/goals");

    return { success: true, data: tx };
  } catch (error: any) {
    console.error("Error creating transaction:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteTransaction(id: string) {
  try {
    await db.delete(schema.transactions).where(eq(schema.transactions.id, id));
    revalidatePath("/");
    revalidatePath("/transactions");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting transaction:", error);
    return { success: false, error: error.message };
  }
}
