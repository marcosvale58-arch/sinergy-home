"use server";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface CreateInventoryItemInput {
  householdId: string;
  name: string;
  category: "Pantry" | "Cleaning" | "Toiletries" | "Medicine";
  minQuantity: number;
  unit: string;
}

export async function getInventory(householdId: string = "hh-1") {
  try {
    const items = await db.query.inventoryItems.findMany({
      where: eq(schema.inventoryItems.householdId, householdId),
    });

    return items.map((item) => ({
      id: item.id,
      householdId: item.householdId,
      name: item.name,
      category: item.category as "Pantry" | "Cleaning" | "Toiletries" | "Medicine",
      currentQuantity: parseFloat(item.currentQuantity),
      minQuantity: parseFloat(item.minQuantity),
      unit: item.unit,
    }));
  } catch (error) {
    console.error("Error fetching inventory items:", error);
    return [];
  }
}

export async function createInventoryItem(input: CreateInventoryItemInput) {
  try {
    const nextId = `item-${Date.now()}`;
    const [item] = await db
      .insert(schema.inventoryItems)
      .values({
        id: nextId,
        householdId: input.householdId,
        name: input.name,
        category: input.category,
        currentQuantity: "0.00",
        minQuantity: input.minQuantity.toFixed(2),
        unit: input.unit,
      })
      .returning();

    revalidatePath("/inventory");
    return { success: true, data: item };
  } catch (error: any) {
    console.error("Error creating inventory item:", error);
    return { success: false, error: error.message };
  }
}

export async function updateInventoryStock(id: string, delta: number) {
  try {
    const item = await db.query.inventoryItems.findFirst({
      where: eq(schema.inventoryItems.id, id),
    });

    if (!item) throw new Error("Item not found");

    const current = parseFloat(item.currentQuantity);
    const updated = Math.max(0, current + delta);

    const [saved] = await db
      .update(schema.inventoryItems)
      .set({ currentQuantity: updated.toFixed(2) })
      .where(eq(schema.inventoryItems.id, id))
      .returning();

    revalidatePath("/inventory");
    return { success: true, data: saved };
  } catch (error: any) {
    console.error("Error updating inventory stock:", error);
    return { success: false, error: error.message };
  }
}
