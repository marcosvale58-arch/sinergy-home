"use server";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { getHousehold, getHouseholdUsers } from "./household";
import { getTransactions } from "./transactions";
import { getDistributionRules } from "./distribution";
import { getInvestments } from "./investments";
import { getInventory } from "./inventory";
import { getGoals } from "./goals";
import { getCalendarEvents } from "./calendar";
import { getChores, getScreenTimeLogs } from "./chores";

export async function getHouseholdFullState(householdId: string = "hh-1") {
  try {
    const [
      household,
      users,
      transactions,
      rules,
      investments,
      inventory,
      goals,
      calendarEvents,
      chores,
      screenTime,
    ] = await Promise.all([
      getHousehold(householdId),
      getHouseholdUsers(householdId),
      getTransactions(householdId),
      getDistributionRules(householdId),
      getInvestments(householdId),
      getInventory(householdId),
      getGoals(householdId),
      getCalendarEvents(householdId),
      getChores(householdId),
      getScreenTimeLogs(householdId),
    ]);

    return {
      household: household || {
        id: householdId,
        name: "Mi Hogar",
        baseCurrency: "USD",
        createdAt: new Date().toISOString(),
      },
      users,
      transactions,
      rules,
      investments,
      inventory,
      goals,
      calendarEvents,
      chores,
      screenTime,
    };
  } catch (error) {
    console.error("Error fetching full household state:", error);
    return null;
  }
}

export async function getHouseholdFullStateForUser(userEmailOrId?: string) {
  let targetHouseholdId = "hh-1";

  if (userEmailOrId) {
    try {
      const cleanTarget = userEmailOrId.trim().toLowerCase();
      const user = await db.query.user.findFirst({
        where: or(
          eq(schema.user.email, cleanTarget),
          eq(schema.user.id, userEmailOrId)
        ),
      });

      if (user?.householdId) {
        targetHouseholdId = user.householdId;
      }
    } catch (err) {
      console.error("Error resolving user household:", err);
    }
  }

  return getHouseholdFullState(targetHouseholdId);
}
