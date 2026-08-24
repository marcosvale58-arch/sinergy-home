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
    const chores = await db.query.chores.findMany({
      where: eq(schema.chores.householdId, householdId),
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
    const nextId = `ch-${Date.now()}`;
    const [chore] = await db
      .insert(schema.chores)
      .values({
        id: nextId,
        householdId: input.householdId,
        assignedToUserId: input.assignedToUserId,
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
