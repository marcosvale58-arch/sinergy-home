"use server";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface CreateGoalInput {
  householdId: string;
  title: string;
  targetAmount: number;
  deadline: string;
  timeframe: "SHORT" | "MEDIUM" | "LONG";
  category?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
}

export async function getGoals(householdId: string = "hh-1") {
  try {
    const goals = await db.query.goals.findMany({
      where: eq(schema.goals.householdId, householdId),
    });

    return goals.map((g) => ({
      id: g.id,
      householdId: g.householdId,
      title: g.title,
      targetAmount: parseFloat(g.targetAmount),
      currentAmount: parseFloat(g.currentAmount),
      deadline: g.deadline,
      timeframe: g.timeframe as "SHORT" | "MEDIUM" | "LONG",
      category: g.category,
      priority: g.priority as "LOW" | "MEDIUM" | "HIGH",
    }));
  } catch (error) {
    console.error("Error fetching goals:", error);
    return [];
  }
}

export async function createGoal(input: CreateGoalInput) {
  try {
    const nextId = `g-${Date.now()}`;
    const [goal] = await db
      .insert(schema.goals)
      .values({
        id: nextId,
        householdId: input.householdId,
        title: input.title,
        targetAmount: input.targetAmount.toFixed(2),
        currentAmount: "0.00",
        deadline: input.deadline,
        timeframe: input.timeframe,
        category: input.category || "General",
        priority: input.priority || "MEDIUM",
      })
      .returning();

    revalidatePath("/");
    revalidatePath("/goals");
    return { success: true, data: goal };
  } catch (error: any) {
    console.error("Error creating goal:", error);
    return { success: false, error: error.message };
  }
}

export async function contributeToGoal(id: string, amount: number) {
  try {
    const goal = await db.query.goals.findFirst({
      where: eq(schema.goals.id, id),
    });

    if (!goal) throw new Error("Goal not found");

    const current = parseFloat(goal.currentAmount);
    const target = parseFloat(goal.targetAmount);
    const updated = Math.min(target, current + amount);

    const [saved] = await db
      .update(schema.goals)
      .set({ currentAmount: updated.toFixed(2) })
      .where(eq(schema.goals.id, id))
      .returning();

    revalidatePath("/");
    revalidatePath("/goals");
    return { success: true, data: saved };
  } catch (error: any) {
    console.error("Error contributing to goal:", error);
    return { success: false, error: error.message };
  }
}
