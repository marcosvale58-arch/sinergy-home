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
    // 1. Resolve actual household in database first
    let targetHouseholdId = householdId;
    let hh = await db.query.households.findFirst({
      where: eq(schema.households.id, householdId),
    });

    if (!hh) {
      const firstHh = await db.query.households.findFirst();
      if (firstHh) {
        hh = firstHh;
        targetHouseholdId = firstHh.id;
      } else {
        const [createdHh] = await db
          .insert(schema.households)
          .values({
            id: householdId || "hh-1",
            name: "Mansión Sinergy",
            baseCurrency: "USD",
            createdAt: new Date(),
          })
          .returning();
        hh = createdHh;
        targetHouseholdId = createdHh.id;
      }
    }

    // 2. Ensure initial demo family members exist ONLY for the default demo household hh-1
    let dbUsers = await getHouseholdUsers(targetHouseholdId);
    if (targetHouseholdId === "hh-1" && (!dbUsers || dbUsers.length === 0)) {
      const initialUsersData = [
        {
          id: "u-1",
          name: "Juan Pérez",
          email: "juan@sinergy.home",
          emailVerified: true,
          role: "ADMIN" as const,
          pointsBalance: 20,
          householdId: targetHouseholdId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "u-2",
          name: "María Pérez",
          email: "maria@sinergy.home",
          emailVerified: true,
          role: "ADMIN" as const,
          pointsBalance: 50,
          householdId: targetHouseholdId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "u-3",
          name: "Emilia Pérez",
          email: "emilia@sinergy.home",
          emailVerified: true,
          role: "CHILD" as const,
          pointsBalance: 350,
          householdId: targetHouseholdId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "u-4",
          name: "Leo Pérez",
          email: "leo@sinergy.home",
          emailVerified: true,
          role: "CHILD" as const,
          pointsBalance: 120,
          householdId: targetHouseholdId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      for (const u of initialUsersData) {
        const existing = await db.query.user.findFirst({
          where: eq(schema.user.email, u.email),
        });
        if (existing) {
          await db
            .update(schema.user)
            .set({ householdId: targetHouseholdId })
            .where(eq(schema.user.id, existing.id));
        } else {
          await db.insert(schema.user).values(u);
        }
      }
      dbUsers = await getHouseholdUsers(targetHouseholdId);
    }

    // 3. Fetch all dependent collections using the resolved targetHouseholdId
    const [
      transactions,
      rules,
      investments,
      inventory,
      goals,
      calendarEvents,
      chores,
      screenTime,
    ] = await Promise.all([
      getTransactions(targetHouseholdId),
      getDistributionRules(targetHouseholdId),
      getInvestments(targetHouseholdId),
      getInventory(targetHouseholdId),
      getGoals(targetHouseholdId),
      getCalendarEvents(targetHouseholdId),
      getChores(targetHouseholdId),
      getScreenTimeLogs(targetHouseholdId),
    ]);

    return {
      household: {
        id: hh.id,
        name: hh.name,
        baseCurrency: hh.baseCurrency,
        createdAt: hh.createdAt instanceof Date ? hh.createdAt.toISOString() : String(hh.createdAt),
      },
      users: dbUsers,
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
