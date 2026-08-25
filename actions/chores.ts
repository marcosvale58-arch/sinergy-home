"use server";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface CreateChoreInput {
  householdId: string;
  assignedToUserId: string;
  title: string;
  pointsReward: number;
  dueDate?: string;
}

export async function getChores(householdId: string = "hh-1") {
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

    const chores = await db.query.chores.findMany({
      where: eq(schema.chores.householdId, targetHouseholdId),
      with: {
        assignedUser: true,
      },
    });

    return chores.map((c) => ({
      id: c.id,
      householdId: c.householdId,
      assignedToUserId: c.assignedToUserId,
      assignedToUserName: c.assignedUser?.name || "Usuario",
      title: c.title,
      pointsReward: c.pointsReward,
      status: c.status as "PENDING" | "COMPLETED",
      dueDate: c.dueDate ? c.dueDate.toISOString() : undefined,
    }));
  } catch (error) {
    console.error("Error fetching chores:", error);
    return [];
  }
}

export async function createChore(input: CreateChoreInput) {
  try {
    // 1. Resolve household
    let targetHouseholdId = input.householdId;
    const hh = await db.query.households.findFirst({
      where: eq(schema.households.id, input.householdId),
    });
    if (!hh) {
      const firstHh = await db.query.households.findFirst();
      if (firstHh) {
        targetHouseholdId = firstHh.id;
      }
    }

    // 2. Resolve assigned user safely
    let targetUserId = input.assignedToUserId;
    const dbUser = await db.query.user.findFirst({
      where: eq(schema.user.id, targetUserId),
    });

    if (!dbUser) {
      const [createdUser] = await db
        .insert(schema.user)
        .values({
          id: targetUserId,
          name: "Miembro del Hogar",
          email: `usuario-${targetUserId}@sinergy.home`,
          emailVerified: true,
          role: "CHILD",
          pointsBalance: 0,
          householdId: targetHouseholdId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoNothing()
        .returning();

      if (createdUser) {
        targetUserId = createdUser.id;
      }
    }

    const nextId = `ch-${Date.now()}`;
    const [chore] = await db
      .insert(schema.chores)
      .values({
        id: nextId,
        householdId: targetHouseholdId,
        assignedToUserId: targetUserId,
        title: input.title,
        pointsReward: input.pointsReward,
        status: "PENDING",
        dueDate: input.dueDate ? new Date(input.dueDate) : new Date(),
      })
      .returning();

    revalidatePath("/");
    revalidatePath("/chores");
    return { success: true, data: chore };
  } catch (error: any) {
    console.error("Error creating chore:", error);
    return { success: false, error: error.message };
  }
}

export async function completeChore(id: string) {
  try {
    const chore = await db.query.chores.findFirst({
      where: eq(schema.chores.id, id),
    });

    if (!chore || chore.status === "COMPLETED") {
      return { success: false, error: "Chore already completed or not found" };
    }

    // 1. Mark chore as COMPLETED
    const [updatedChore] = await db
      .update(schema.chores)
      .set({ status: "COMPLETED" })
      .where(eq(schema.chores.id, id))
      .returning();

    // 2. Award points to assigned user!
    const assignedUser = await db.query.user.findFirst({
      where: eq(schema.user.id, chore.assignedToUserId),
    });

    if (assignedUser) {
      await db
        .update(schema.user)
        .set({ pointsBalance: assignedUser.pointsBalance + chore.pointsReward })
        .where(eq(schema.user.id, assignedUser.id));
    }

    revalidatePath("/");
    revalidatePath("/chores");
    return { success: true, data: updatedChore };
  } catch (error: any) {
    console.error("Error completing chore:", error);
    return { success: false, error: error.message };
  }
}

export async function getScreenTimeLogs(householdId: string = "hh-1") {
  try {
    const dateStr = new Date().toISOString().split("T")[0];
    const logs = await db.query.screenTimeLogs.findMany({
      with: {
        childUser: true,
      },
    });

    return logs.map((l) => ({
      id: l.id,
      childUserId: l.childUserId,
      childUserName: l.childUser?.name || "Niño",
      date: l.date,
      minutesUsed: l.minutesUsed,
      dailyLimitMinutes: l.dailyLimitMinutes,
    }));
  } catch (error) {
    console.error("Error fetching screen time logs:", error);
    return [];
  }
}

export async function logScreenTime(childUserId: string, minutes: number) {
  try {
    const dateStr = new Date().toISOString().split("T")[0];
    const existing = await db.query.screenTimeLogs.findFirst({
      where: and(
        eq(schema.screenTimeLogs.childUserId, childUserId),
        eq(schema.screenTimeLogs.date, dateStr)
      ),
    });

    if (existing) {
      const [updated] = await db
        .update(schema.screenTimeLogs)
        .set({ minutesUsed: existing.minutesUsed + minutes })
        .where(eq(schema.screenTimeLogs.id, existing.id))
        .returning();

      revalidatePath("/");
      revalidatePath("/chores");
      return { success: true, data: updated };
    } else {
      const nextId = `st-${Date.now()}`;
      const [created] = await db
        .insert(schema.screenTimeLogs)
        .values({
          id: nextId,
          childUserId,
          date: dateStr,
          minutesUsed: minutes,
          dailyLimitMinutes: 120,
        })
        .returning();

      revalidatePath("/");
      revalidatePath("/chores");
      return { success: true, data: created };
    }
  } catch (error: any) {
    console.error("Error logging screen time:", error);
    return { success: false, error: error.message };
  }
}

export async function redeemScreenTime(childUserId: string, pointsToRedeem: number) {
  try {
    const child = await db.query.user.findFirst({
      where: eq(schema.user.id, childUserId),
    });

    if (!child || child.pointsBalance < pointsToRedeem) {
      return { success: false, error: "Insufficient points" };
    }

    // 1. Deduct points from child balance
    await db
      .update(schema.user)
      .set({ pointsBalance: child.pointsBalance - pointsToRedeem })
      .where(eq(schema.user.id, childUserId));

    // 2. Grant minutes (10 points = 15 minutes)
    const minutesGranted = Math.floor((pointsToRedeem / 10) * 15);
    const dateStr = new Date().toISOString().split("T")[0];

    const existingLog = await db.query.screenTimeLogs.findFirst({
      where: and(
        eq(schema.screenTimeLogs.childUserId, childUserId),
        eq(schema.screenTimeLogs.date, dateStr)
      ),
    });

    if (existingLog) {
      await db
        .update(schema.screenTimeLogs)
        .set({ dailyLimitMinutes: existingLog.dailyLimitMinutes + minutesGranted })
        .where(eq(schema.screenTimeLogs.id, existingLog.id));
    } else {
      const nextId = `st-${Date.now()}`;
      await db.insert(schema.screenTimeLogs).values({
        id: nextId,
        childUserId,
        date: dateStr,
        minutesUsed: 0,
        dailyLimitMinutes: 120 + minutesGranted,
      });
    }

    revalidatePath("/");
    revalidatePath("/chores");
    return { success: true, minutesGranted };
  } catch (error: any) {
    console.error("Error redeeming screen time:", error);
    return { success: false, error: error.message };
  }
}

export async function updateScreenTimeLimit(childUserId: string, dailyLimitMinutes: number) {
  try {
    const dateStr = new Date().toISOString().split("T")[0];
    const existing = await db.query.screenTimeLogs.findFirst({
      where: and(
        eq(schema.screenTimeLogs.childUserId, childUserId),
        eq(schema.screenTimeLogs.date, dateStr)
      ),
    });

    if (existing) {
      const [updated] = await db
        .update(schema.screenTimeLogs)
        .set({ dailyLimitMinutes })
        .where(eq(schema.screenTimeLogs.id, existing.id))
        .returning();

      revalidatePath("/");
      revalidatePath("/chores");
      return { success: true, data: updated };
    } else {
      const nextId = `st-${Date.now()}`;
      const [created] = await db
        .insert(schema.screenTimeLogs)
        .values({
          id: nextId,
          childUserId,
          date: dateStr,
          minutesUsed: 0,
          dailyLimitMinutes,
        })
        .returning();

      revalidatePath("/");
      revalidatePath("/chores");
      return { success: true, data: created };
    }
  } catch (error: any) {
    console.error("Error updating screen time limit:", error);
    return { success: false, error: error.message };
  }
}

export async function setScreenTime(childUserId: string, minutesUsed: number, dailyLimitMinutes?: number) {
  try {
    const dateStr = new Date().toISOString().split("T")[0];
    const existing = await db.query.screenTimeLogs.findFirst({
      where: and(
        eq(schema.screenTimeLogs.childUserId, childUserId),
        eq(schema.screenTimeLogs.date, dateStr)
      ),
    });

    if (existing) {
      const [updated] = await db
        .update(schema.screenTimeLogs)
        .set({
          minutesUsed,
          ...(dailyLimitMinutes !== undefined ? { dailyLimitMinutes } : {}),
        })
        .where(eq(schema.screenTimeLogs.id, existing.id))
        .returning();

      revalidatePath("/");
      revalidatePath("/chores");
      return { success: true, data: updated };
    } else {
      const nextId = `st-${Date.now()}`;
      const [created] = await db
        .insert(schema.screenTimeLogs)
        .values({
          id: nextId,
          childUserId,
          date: dateStr,
          minutesUsed,
          dailyLimitMinutes: dailyLimitMinutes ?? 120,
        })
        .returning();

      revalidatePath("/");
      revalidatePath("/chores");
      return { success: true, data: created };
    }
  } catch (error: any) {
    console.error("Error setting screen time:", error);
    return { success: false, error: error.message };
  }
}

export async function resetDailyChores(householdId: string = "hh-1") {
  try {
    const updated = await db
      .update(schema.chores)
      .set({ status: "PENDING" })
      .where(eq(schema.chores.householdId, householdId))
      .returning();

    revalidatePath("/");
    revalidatePath("/chores");
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Error resetting daily chores:", error);
    return { success: false, error: error.message };
  }
}

export async function updateChore(input: {
  id: string;
  title: string;
  assignedToUserId: string;
  pointsReward: number;
  status?: "PENDING" | "COMPLETED";
}) {
  try {
    const [updated] = await db
      .update(schema.chores)
      .set({
        title: input.title,
        assignedToUserId: input.assignedToUserId,
        pointsReward: input.pointsReward,
        ...(input.status ? { status: input.status } : {}),
      })
      .where(eq(schema.chores.id, input.id))
      .returning();

    revalidatePath("/");
    revalidatePath("/chores");
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Error updating chore:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteChore(id: string) {
  try {
    await db.delete(schema.chores).where(eq(schema.chores.id, id));

    revalidatePath("/");
    revalidatePath("/chores");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting chore:", error);
    return { success: false, error: error.message };
  }
}


