"use server";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getDistributionRules(householdId: string = "hh-1") {
  try {
    const rules = await db.query.distributionRules.findMany({
      where: eq(schema.distributionRules.householdId, householdId),
    });

    return rules.map((r) => ({
      id: r.id,
      householdId: r.householdId,
      name: r.name,
      type: r.type as "PERCENTAGE" | "FIXED",
      targetBucket: r.targetBucket as "Savings" | "Investment" | "Expenses" | "Discretionary",
      value: parseFloat(r.value),
    }));
  } catch (error) {
    console.error("Error fetching distribution rules:", error);
    return [];
  }
}

export async function updateDistributionRule(id: string, value: number) {
  try {
    const [updated] = await db
      .update(schema.distributionRules)
      .set({ value: value.toString() })
      .where(eq(schema.distributionRules.id, id))
      .returning();

    revalidatePath("/");
    revalidatePath("/distribution");
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Error updating distribution rule:", error);
    return { success: false, error: error.message };
  }
}

export async function updateMultipleRules(rules: { id: string; value: number }[]) {
  try {
    for (const r of rules) {
      await db
        .update(schema.distributionRules)
        .set({ value: r.value.toString() })
        .where(eq(schema.distributionRules.id, r.id));
    }

    revalidatePath("/");
    revalidatePath("/distribution");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating rules:", error);
    return { success: false, error: error.message };
  }
}
