import { eq, desc, sql } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  gameRounds,
  bets,
  transactions,
  gameState,
  type User,
  type InsertUser,
  type GameRound,
  type Bet,
  type Transaction,
  type GameState,
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  getUserByReferralCode(code: string): Promise<User | undefined>;
  createUser(user: any): Promise<User>;
  updateUserBalance(id: number, amount: number): Promise<User | undefined>;
  updateUserBankDetails(id: number, details: any): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  getGameState(): Promise<GameState | undefined>;
  createGameState(): Promise<GameState>;
  updateGameState(updates: Partial<GameState>): Promise<GameState | undefined>;
  
  createGameRound(roundNumber: number, resultColor: string): Promise<GameRound>;
  getRecentRounds(limit: number): Promise<GameRound[]>;
  getRoundById(id: number): Promise<GameRound | undefined>;
  
  createBet(userId: number, roundId: number, betColor: string, betAmount: number): Promise<Bet>;
  getBetsForRound(roundId: number): Promise<Bet[]>;
  getUserBets(userId: number, limit: number): Promise<Bet[]>;
  updateBetResult(betId: number, won: boolean, winAmount: number): Promise<void>;
  
  createTransaction(userId: number, type: string, amount: number, status: string, paymentId?: string): Promise<Transaction>;
  getUserTransactions(userId: number, limit: number): Promise<Transaction[]>;
  updateTransactionStatus(id: number, status: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
    return result[0];
  }

  async getUserByReferralCode(code: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.referralCode, code)).limit(1);
    return result[0];
  }

  async createUser(user: any): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUserBalance(id: number, amount: number): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set({ balance: sql`${users.balance} + ${amount}` })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async updateUserBankDetails(id: number, details: any): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set(details)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.balance));
  }

  async getGameState(): Promise<GameState | undefined> {
    const result = await db.select().from(gameState).limit(1);
    return result[0];
  }

  async createGameState(): Promise<GameState> {
    const result = await db.insert(gameState).values({
      currentRound: 1,
      phase: "betting",
      countdown: 30,
    }).returning();
    return result[0];
  }

  async updateGameState(updates: Partial<GameState>): Promise<GameState | undefined> {
    const state = await this.getGameState();
    if (!state) return undefined;
    
    const result = await db
      .update(gameState)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(gameState.id, state.id))
      .returning();
    return result[0];
  }

  async createGameRound(roundNumber: number, resultColor: string): Promise<GameRound> {
    const result = await db.insert(gameRounds).values({
      roundNumber,
      resultColor,
    }).returning();
    return result[0];
  }

  async getRecentRounds(limit: number): Promise<GameRound[]> {
    return await db
      .select()
      .from(gameRounds)
      .orderBy(desc(gameRounds.id))
      .limit(limit);
  }

  async getRoundById(id: number): Promise<GameRound | undefined> {
    const result = await db.select().from(gameRounds).where(eq(gameRounds.id, id)).limit(1);
    return result[0];
  }

  async createBet(userId: number, roundId: number, betColor: string, betAmount: number): Promise<Bet> {
    const result = await db.insert(bets).values({
      userId,
      roundId,
      betColor,
      betAmount,
    }).returning();
    return result[0];
  }

  async getBetsForRound(roundId: number): Promise<Bet[]> {
    return await db.select().from(bets).where(eq(bets.roundId, roundId));
  }

  async getUserBets(userId: number, limit: number): Promise<Bet[]> {
    return await db
      .select()
      .from(bets)
      .where(eq(bets.userId, userId))
      .orderBy(desc(bets.id))
      .limit(limit);
  }

  async updateBetResult(betId: number, won: boolean, winAmount: number): Promise<void> {
    await db
      .update(bets)
      .set({ won, winAmount })
      .where(eq(bets.id, betId));
  }

  async createTransaction(userId: number, type: string, amount: number, status: string, paymentId?: string): Promise<Transaction> {
    const result = await db.insert(transactions).values({
      userId,
      type,
      amount,
      status,
      paymentId,
    }).returning();
    return result[0];
  }

  async getUserTransactions(userId: number, limit: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.id))
      .limit(limit);
  }

  async updateTransactionStatus(id: number, status: string): Promise<void> {
    await db
      .update(transactions)
      .set({ status })
      .where(eq(transactions.id, id));
  }
}

export const storage = new DatabaseStorage();
