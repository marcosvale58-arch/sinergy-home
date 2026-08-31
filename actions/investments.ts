"use server";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type AssetType = "Merchandise" | "Stocks" | "Real Estate" | "Crypto" | "Fixed Income" | "Cash" | "Other";

export interface CreateInvestmentInput {
  householdId: string;
  assetName: string;
  assetType: AssetType;
  investedAmount: number;
  currentValue?: number;
  expectedAnnualReturn?: number;
  notes?: string;
}

export async function getInvestments(householdId: string = "hh-1") {
  try {
    const invs = await db.query.investments.findMany({
      where: eq(schema.investments.householdId, householdId),
      orderBy: [desc(schema.investments.updatedAt)],
    });

    return invs.map((i) => ({
      id: i.id,
      householdId: i.householdId,
      assetName: i.assetName,
      assetType: i.assetType as AssetType,
      investedAmount: parseFloat(i.investedAmount),
      currentValue: parseFloat(i.currentValue || i.investedAmount),
      expectedAnnualReturn: parseFloat(i.expectedAnnualReturn || "0"),
      notes: i.notes || "",
      updatedAt: i.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching investments:", error);
    return [];
  }
}

export async function createInvestment(input: CreateInvestmentInput) {
  try {
    const nextId = `inv-${Date.now()}`;
    const currentValue = input.currentValue !== undefined ? input.currentValue : input.investedAmount;
    const expectedAnnualReturn = input.expectedAnnualReturn !== undefined ? input.expectedAnnualReturn : 0;

    const [inv] = await db
      .insert(schema.investments)
      .values({
        id: nextId,
        householdId: input.householdId,
        assetName: input.assetName,
        assetType: input.assetType,
        investedAmount: input.investedAmount.toFixed(2),
        currentValue: currentValue.toFixed(2),
        expectedAnnualReturn: expectedAnnualReturn.toFixed(2),
        notes: input.notes || null,
        updatedAt: new Date(),
      })
      .returning();

    revalidatePath("/");
    revalidatePath("/investments");
    return { success: true, data: inv };
  } catch (error: any) {
    console.error("Error creating investment:", error);
    return { success: false, error: error.message };
  }
}

export async function updateInvestmentValue(id: string, currentValue: number) {
  try {
    const [inv] = await db
      .update(schema.investments)
      .set({
        currentValue: currentValue.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(schema.investments.id, id))
      .returning();

    revalidatePath("/");
    revalidatePath("/investments");
    return { success: true, data: inv };
  } catch (error: any) {
    console.error("Error updating investment value:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteInvestment(id: string) {
  try {
    await db.delete(schema.investments).where(eq(schema.investments.id, id));
    revalidatePath("/");
    revalidatePath("/investments");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting investment:", error);
    return { success: false, error: error.message };
  }
}
