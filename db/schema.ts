import { pgTable, text, timestamp, boolean, integer, numeric, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// HOUSEHOLDS
export const households = pgTable("households", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  baseCurrency: text("base_currency").default("USD").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// BETTER AUTH TABLES
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  householdId: text("household_id").references(() => households.id),
  role: text("role").default("MEMBER").notNull(), // ADMIN, MEMBER, CHILD
  pointsBalance: integer("points_balance").default(0).notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  issuer: text("issuer"),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// SINERGYHOME DOMAIN TABLES

// Module 1: Household Income & Expense Control
export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  householdId: text("household_id").notNull().references(() => households.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id),
  type: text("type").notNull(), // INCOME, EXPENSE, TRANSFER
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(), // Amount in base currency
  baseAmount: numeric("base_amount", { precision: 12, scale: 2 }).notNull(), // Amount in base currency (for calculation)
  originalAmount: numeric("original_amount", { precision: 12, scale: 2 }).notNull(), // Amount in original currency
  originalCurrency: text("original_currency").default("USD").notNull(), // Original currency
  category: text("category").notNull(), // Food, Utilities, Education, Entertainment, Health, Savings, Investment, Discretionary, etc.
  date: timestamp("date").defaultNow().notNull(),
  notes: text("notes"),
  isRecurring: boolean("is_recurring").default(false).notNull(),
  recurrenceInterval: text("recurrence_interval"), // weekly, monthly, yearly
});

// Module 2: Customizable Income Distribution System
export const distributionRules = pgTable("distribution_rules", {
  id: text("id").primaryKey(),
  householdId: text("household_id").notNull().references(() => households.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(), // PERCENTAGE, FIXED
  targetBucket: text("target_bucket").notNull(), // Savings, Investment, Expenses, Discretionary
  value: numeric("value", { precision: 12, scale: 2 }).notNull(), // percentage (e.g., 50) or fixed amount
});

// Module 3: Investment Portfolio & Projections
export const investments = pgTable("investments", {
  id: text("id").primaryKey(),
  householdId: text("household_id").notNull().references(() => households.id, { onDelete: "cascade" }),
  assetName: text("asset_name").notNull(),
  assetType: text("asset_type").notNull(), // Stocks, Real Estate, Crypto, Fixed Income, Cash
  investedAmount: numeric("invested_amount", { precision: 12, scale: 2 }).notNull(),
  currentValue: numeric("current_value", { precision: 12, scale: 2 }).notNull(),
  expectedAnnualReturn: numeric("expected_annual_return", { precision: 5, scale: 2 }).notNull(), // percentage e.g. 8.5
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Module 4: Household Inventory & Supply Management
export const inventoryItems = pgTable("inventory_items", {
  id: text("id").primaryKey(),
  householdId: text("household_id").notNull().references(() => households.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: text("category").notNull(), // Pantry, Cleaning, Toiletries, Medicine
  currentQuantity: numeric("current_quantity", { precision: 10, scale: 2 }).default("0").notNull(),
  minQuantity: numeric("min_quantity", { precision: 10, scale: 2 }).default("0").notNull(),
  unit: text("unit").default("units").notNull(), // units, kg, liters, etc.
});

// Module 5: Goal Planner (Short, Medium & Long-Term)
export const goals = pgTable("goals", {
  id: text("id").primaryKey(),
  householdId: text("household_id").notNull().references(() => households.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  targetAmount: numeric("target_amount", { precision: 12, scale: 2 }).notNull(),
  currentAmount: numeric("current_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  deadline: date("deadline").notNull(),
  timeframe: text("timeframe").notNull(), // SHORT, MEDIUM, LONG
  category: text("category").default("General").notNull(), // Vacation, Emergency Fund, Home Purchase, etc.
  priority: text("priority").default("MEDIUM").notNull(), // LOW, MEDIUM, HIGH
});

// Module 6: Household Calendar & Smart Alerts
export const calendarEvents = pgTable("calendar_events", {
  id: text("id").primaryKey(),
  householdId: text("household_id").notNull().references(() => households.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  dueDate: timestamp("due_date").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }),
  type: text("type").notNull(), // BILL, TAX, SUBSCRIPTION, GENERAL
  googleEventId: text("google_event_id"),
  status: text("status").default("UNPAID").notNull(), // PAID, UNPAID, OVERDUE
});

// Module 7: Task & Chore Organizer
export const chores = pgTable("chores", {
  id: text("id").primaryKey(),
  householdId: text("household_id").notNull().references(() => households.id, { onDelete: "cascade" }),
  assignedToUserId: text("assigned_to_user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  pointsReward: integer("points_reward").default(0).notNull(),
  status: text("status").default("PENDING").notNull(), // PENDING, COMPLETED
  dueDate: timestamp("due_date"),
});

// Module 9: Screen Time & Screen Rules Tracker
export const screenTimeLogs = pgTable("screen_time_logs", {
  id: text("id").primaryKey(),
  childUserId: text("child_user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  minutesUsed: integer("minutes_used").default(0).notNull(),
  dailyLimitMinutes: integer("daily_limit_minutes").default(120).notNull(),
});

// RELATIONS DEFINITION FOR EASY DRIZZLE QUERYING
export const householdRelations = relations(households, ({ many }) => ({
  users: many(user),
  transactions: many(transactions),
  distributionRules: many(distributionRules),
  investments: many(investments),
  inventoryItems: many(inventoryItems),
  goals: many(goals),
  calendarEvents: many(calendarEvents),
  chores: many(chores),
}));

export const userRelations = relations(user, ({ one, many }) => ({
  household: one(households, {
    fields: [user.householdId],
    references: [households.id],
  }),
  sessions: many(session),
  accounts: many(account),
  transactions: many(transactions),
  chores: many(chores, { relationName: "userChores" }),
  screenTimeLogs: many(screenTimeLogs),
}));

export const transactionRelations = relations(transactions, ({ one }) => ({
  household: one(households, {
    fields: [transactions.householdId],
    references: [households.id],
  }),
  user: one(user, {
    fields: [transactions.userId],
    references: [user.id],
  }),
}));

export const distributionRuleRelations = relations(distributionRules, ({ one }) => ({
  household: one(households, {
    fields: [distributionRules.householdId],
    references: [households.id],
  }),
}));

export const investmentRelations = relations(investments, ({ one }) => ({
  household: one(households, {
    fields: [investments.householdId],
    references: [households.id],
  }),
}));

export const inventoryItemRelations = relations(inventoryItems, ({ one }) => ({
  household: one(households, {
    fields: [inventoryItems.householdId],
    references: [households.id],
  }),
}));

export const goalRelations = relations(goals, ({ one }) => ({
  household: one(households, {
    fields: [goals.householdId],
    references: [households.id],
  }),
}));

export const calendarEventRelations = relations(calendarEvents, ({ one }) => ({
  household: one(households, {
    fields: [calendarEvents.householdId],
    references: [households.id],
  }),
}));

export const choreRelations = relations(chores, ({ one }) => ({
  household: one(households, {
    fields: [chores.householdId],
    references: [households.id],
  }),
  assignedUser: one(user, {
    fields: [chores.assignedToUserId],
    references: [user.id],
  }),
}));

export const screenTimeLogRelations = relations(screenTimeLogs, ({ one }) => ({
  childUser: one(user, {
    fields: [screenTimeLogs.childUserId],
    references: [user.id],
  }),
}));
