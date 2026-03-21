import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  username: text("username").notNull(),
  phone: text("phone").notNull().unique(),
  password: text("password").notNull(),
  balance: integer("balance").notNull().default(0),
  isAdmin: boolean("is_admin").notNull().default(false),
  referralCode: text("referral_code").notNull().unique(),
  referredBy: integer("referred_by"),
  bankName: text("bank_name"),
  ifscCode: text("ifsc_code"),
  accountNumber: text("account_number"),
  accountHolderName: text("account_holder_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const gameRounds = pgTable("game_rounds", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  roundNumber: integer("round_number").notNull(),
  resultColor: text("result_color").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bets = pgTable("bets", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").notNull(),
  roundId: integer("round_id").notNull(),
  betColor: text("bet_color").notNull(),
  betAmount: integer("bet_amount").notNull(),
  won: boolean("won"),
  winAmount: integer("win_amount").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(),
  amount: integer("amount").notNull(),
  status: text("status").notNull().default("pending"),
  paymentId: text("payment_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const gameState = pgTable("game_state", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  currentRound: integer("current_round").notNull().default(1),
  phase: text("phase").notNull().default("betting"),
  countdown: integer("countdown").notNull().default(30),
  lastResult: text("last_result"),
  nextResult: text("next_result"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  phone: true,
  password: true,
});

export const loginSchema = z.object({
  phone: z.string().min(10),
  password: z.string().min(4),
});

export const insertBetSchema = z.object({
  betColor: z.enum(["red", "yellow", "green"]),
  betAmount: z.number().min(10).max(10000),
});

export const addMoneySchema = z.object({
  amount: z.number().min(100).max(100000),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type GameRound = typeof gameRounds.$inferSelect;
export type Bet = typeof bets.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type GameState = typeof gameState.$inferSelect;
