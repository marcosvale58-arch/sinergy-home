"use server";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface CreateCalendarEventInput {
  householdId: string;
  title: string;
  dueDate: string;
  amount: number;
  type: "BILL" | "TAX" | "SUBSCRIPTION" | "GENERAL";
}

export async function getCalendarEvents(householdId: string = "hh-1") {
  try {
    const events = await db.query.calendarEvents.findMany({
      where: eq(schema.calendarEvents.householdId, householdId),
      orderBy: [asc(schema.calendarEvents.dueDate)],
    });

    return events.map((e) => ({
      id: e.id,
      householdId: e.householdId,
      title: e.title,
      dueDate: e.dueDate.toISOString(),
      amount: e.amount ? parseFloat(e.amount) : 0,
      type: e.type as "BILL" | "TAX" | "SUBSCRIPTION" | "GENERAL",
      googleEventId: e.googleEventId || undefined,
      status: e.status as "PAID" | "UNPAID" | "OVERDUE",
    }));
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return [];
  }
}

export async function createCalendarEvent(input: CreateCalendarEventInput) {
  try {
    const nextId = `ev-${Date.now()}`;
    const [event] = await db
      .insert(schema.calendarEvents)
      .values({
        id: nextId,
        householdId: input.householdId,
        title: input.title,
        dueDate: new Date(input.dueDate),
        amount: input.amount.toFixed(2),
        type: input.type,
        status: "UNPAID",
      })
      .returning();

    revalidatePath("/");
    revalidatePath("/calendar");
    return { success: true, data: event };
  } catch (error: any) {
    console.error("Error creating calendar event:", error);
    return { success: false, error: error.message };
  }
}

export async function payCalendarBill(id: string, userId: string = "u-1") {
  try {
    const event = await db.query.calendarEvents.findFirst({
      where: eq(schema.calendarEvents.id, id),
    });

    if (!event) throw new Error("Event not found");

    // 1. Mark event as PAID
    const [updated] = await db
      .update(schema.calendarEvents)
      .set({ status: "PAID" })
      .where(eq(schema.calendarEvents.id, id))
      .returning();

    // 2. Automatically log expense transaction in household ledger!
    const amt = event.amount ? parseFloat(event.amount) : 0;
    if (amt > 0) {
      const hh = await db.query.households.findFirst({
        where: eq(schema.households.id, event.householdId),
      });
      const baseCurr = hh?.baseCurrency || "USD";

      const txId = `t-pay-${Date.now()}`;
      await db.insert(schema.transactions).values({
        id: txId,
        householdId: event.householdId,
        userId,
        type: "EXPENSE",
        amount: amt.toFixed(2),
        baseAmount: amt.toFixed(2),
        originalAmount: amt.toFixed(2),
        originalCurrency: baseCurr,
        category: event.type === "BILL" ? "Utilities" : event.type === "TAX" ? "Taxes" : "Subscription",
        date: new Date(),
        notes: `Paid upcoming item: ${event.title}`,
        isRecurring: false,
      });
    }

    revalidatePath("/");
    revalidatePath("/calendar");
    revalidatePath("/transactions");
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Error paying calendar bill:", error);
    return { success: false, error: error.message };
  }
}
