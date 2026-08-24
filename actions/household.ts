"use server";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getHousehold(householdId: string = "hh-1") {
  try {
    const hh = await db.query.households.findFirst({
      where: eq(schema.households.id, householdId),
      with: {
        users: true,
      },
    });

    if (hh) return hh;

    // Fallback: get first available household
    const firstHh = await db.query.households.findFirst({
      with: { users: true },
    });
    return firstHh || null;
  } catch (error) {
    console.error("Error fetching household:", error);
    return null;
  }
}

export async function updateHousehold(householdId: string, name: string, baseCurrency: string) {
  try {
    const [updated] = await db
      .update(schema.households)
      .set({ name, baseCurrency })
      .where(eq(schema.households.id, householdId))
      .returning();

    revalidatePath("/");
    revalidatePath("/settings");
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Error updating household:", error);
    return { success: false, error: error.message };
  }
}

export async function getHouseholdUsers(householdId: string = "hh-1") {
  try {
    return await db.query.user.findMany({
      where: eq(schema.user.householdId, householdId),
    });
  } catch (error) {
    console.error("Error fetching household users:", error);
    return [];
  }
}

export async function addUserToHousehold(
  householdId: string,
  name: string,
  email: string,
  role: "ADMIN" | "MEMBER" | "CHILD" = "MEMBER"
) {
  try {
    const id = `u-${Date.now()}`;
    const [newUser] = await db
      .insert(schema.user)
      .values({
        id,
        name,
        email: email.trim().toLowerCase(),
        emailVerified: true,
        role,
        pointsBalance: 0,
        householdId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    revalidatePath("/settings");
    revalidatePath("/");
    return { success: true, data: newUser };
  } catch (error: any) {
    console.error("Error adding user to household:", error);
    return { success: false, error: error.message };
  }
}

export async function createNewHouseholdForUser(
  email: string,
  householdName: string,
  baseCurrency: string = "USD"
) {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await db.query.user.findFirst({
      where: eq(schema.user.email, cleanEmail),
    });

    if (!existingUser) {
      return { success: false, error: "Usuario no encontrado" };
    }

    const newHouseholdId = `hh-${Date.now()}`;
    const [newHousehold] = await db
      .insert(schema.households)
      .values({
        id: newHouseholdId,
        name: householdName.trim() || "Mi Hogar",
        baseCurrency: baseCurrency || "USD",
        createdAt: new Date(),
      })
      .returning();

    // Assign registering user as ADMIN of their new household
    const [updatedUser] = await db
      .update(schema.user)
      .set({
        householdId: newHousehold.id,
        role: "ADMIN",
        updatedAt: new Date(),
      })
      .where(eq(schema.user.id, existingUser.id))
      .returning();

    // Create default income distribution rules for this new household
    await db.insert(schema.distributionRules).values([
      { id: `dr-${Date.now()}-1`, householdId: newHousehold.id, name: "Gastos y Necesidades", type: "PERCENTAGE", targetBucket: "Expenses", value: "50" },
      { id: `dr-${Date.now()}-2`, householdId: newHousehold.id, name: "Inversión y Patrimonio", type: "PERCENTAGE", targetBucket: "Investment", value: "25" },
      { id: `dr-${Date.now()}-3`, householdId: newHousehold.id, name: "Fondo de Emergencia / Ahorro", type: "PERCENTAGE", targetBucket: "Savings", value: "15" },
      { id: `dr-${Date.now()}-4`, householdId: newHousehold.id, name: "Ocio y Gastos Personales", type: "PERCENTAGE", targetBucket: "Discretionary", value: "10" },
    ]);

    revalidatePath("/");
    revalidatePath("/settings");
    return { success: true, household: newHousehold, user: updatedUser };
  } catch (error: any) {
    console.error("Error creating new household for user:", error);
    return { success: false, error: error.message };
  }
}
