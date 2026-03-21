import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import session from "express-session";
import { storage } from "./storage";
import { gameEngine } from "./game-engine";
import { insertUserSchema, loginSchema, insertBetSchema, addMoneySchema } from "@shared/schema";
import { z } from "zod";

declare module "express-session" {
  interface SessionData {
    userId?: number;
    isAdmin?: boolean;
  }
}

const ADMIN_PHONE = process.env.ADMIN_PHONE || "9999999999";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "batti-game-secret-key-2024",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    })
  );

  await gameEngine.initialize();

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { referralCodeUsed, ...userData } = req.body;
      const data = insertUserSchema.parse(userData);
      
      const existing = await storage.getUserByPhone(data.phone);
      if (existing) {
        return res.status(400).json({ error: "Phone number already registered" });
      }

      let referredBy: number | null = null;
      if (referralCodeUsed) {
        const referrer = await storage.getUserByReferralCode(referralCodeUsed);
        if (referrer) {
          referredBy = referrer.id;
        }
      }

      const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const user = await storage.createUser({ 
        ...data, 
        referralCode, 
        referredBy 
      });
      
      req.session.userId = user.id;
      req.session.isAdmin = user.isAdmin;

      res.json({
        id: user.id,
        username: user.username,
        phone: user.phone,
        balance: user.balance,
        isAdmin: user.isAdmin,
        referralCode: user.referralCode,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Register error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const data = loginSchema.parse(req.body);
      
      if (data.phone === ADMIN_PHONE && data.password === ADMIN_PASSWORD) {
        let admin = await storage.getUserByPhone(ADMIN_PHONE);
        if (!admin) {
          admin = await storage.createUser({
            username: "Admin",
            phone: ADMIN_PHONE,
            password: ADMIN_PASSWORD,
          });
          await storage.updateUserBalance(admin.id, 1000000);
        }
        
        req.session.userId = admin.id;
        req.session.isAdmin = true;
        
        return res.json({
          id: admin.id,
          username: "Admin",
          phone: admin.phone,
          balance: admin.balance,
          isAdmin: true,
        });
      }

      const user = await storage.getUserByPhone(data.phone);
      if (!user || user.password !== data.password) {
        return res.status(401).json({ error: "Invalid phone or password" });
      }

      req.session.userId = user.id;
      req.session.isAdmin = user.isAdmin;

      res.json({
        id: user.id,
        username: user.username,
        phone: user.phone,
        balance: user.balance,
        isAdmin: user.isAdmin,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    res.json({
      id: user.id,
      username: user.username,
      phone: user.phone,
      balance: user.balance,
      isAdmin: user.isAdmin || req.session.isAdmin,
    });
  });

  app.get("/api/game/state", async (req: Request, res: Response) => {
    try {
      const state = await gameEngine.getState();
      const recentRounds = await storage.getRecentRounds(20);
      
      res.json({
        currentRound: state.currentRound,
        phase: state.phase,
        countdown: state.countdown,
        lastResult: state.lastResult,
        history: recentRounds.map((r) => ({
          id: r.id,
          roundNumber: r.roundNumber,
          resultColor: r.resultColor,
          createdAt: r.createdAt,
        })),
      });
    } catch (error) {
      console.error("Get game state error:", error);
      res.status(500).json({ error: "Failed to get game state" });
    }
  });

  app.post("/api/game/bet", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const data = insertBetSchema.parse(req.body);
      const state = await gameEngine.getState();
      
      if (state.phase !== "betting") {
        return res.status(400).json({ error: "Betting is closed for this round" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      if (user.balance < data.betAmount) {
        return res.status(400).json({ error: "Insufficient balance" });
      }

      await storage.updateUserBalance(user.id, -data.betAmount);
      
      const round = await storage.getRecentRounds(1);
      const currentRoundId = round[0]?.id || 1;
      
      const bet = await storage.createBet(
        user.id,
        currentRoundId + 1,
        data.betColor,
        data.betAmount
      );

      const updatedUser = await storage.getUser(user.id);

      res.json({
        bet,
        balance: updatedUser?.balance || 0,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Bet error:", error);
      res.status(500).json({ error: "Failed to place bet" });
    }
  });

  app.get("/api/user/bets", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const bets = await storage.getUserBets(req.session.userId, 50);
      res.json(bets);
    } catch (error) {
      console.error("Get bets error:", error);
      res.status(500).json({ error: "Failed to get bets" });
    }
  });

  app.post("/api/wallet/add", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const { amount } = addMoneySchema.parse(req.body);
      
      const upiId = process.env.ADMIN_UPI_ID || "admin@upi";
      const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // In a real app, you'd generate a QR or redirect to UPI app
      // For this demo, we provide the UPI ID for the user to pay
      res.json({
        upiId,
        amount,
        paymentId,
        note: "Please pay to the UPI ID and wait for confirmation",
        qrData: `upi://pay?pa=${upiId}&pn=GameAdmin&am=${amount}&cu=INR&tn=${paymentId}`
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Add money error:", error);
      res.status(500).json({ error: "Failed to add money" });
    }
  });

  app.get("/api/wallet/transactions", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const transactions = await storage.getUserTransactions(req.session.userId, 50);
      res.json(transactions);
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({ error: "Failed to get transactions" });
    }
  });

  app.get("/api/leaderboard", async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      const leaderboard = users
        .filter((u) => !u.isAdmin && u.phone !== ADMIN_PHONE)
        .slice(0, 20)
        .map((u, i) => ({
          rank: i + 1,
          username: u.username,
          balance: u.balance,
        }));
      res.json(leaderboard);
    } catch (error) {
      console.error("Get leaderboard error:", error);
      res.status(500).json({ error: "Failed to get leaderboard" });
    }
  });

  app.get("/api/admin/users", async (req: Request, res: Response) => {
    if (!req.session.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const users = await storage.getAllUsers();
      res.json(users.map((u) => ({
        id: u.id,
        username: u.username,
        phone: u.phone,
        balance: u.balance,
        isAdmin: u.isAdmin,
        createdAt: u.createdAt,
      })));
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ error: "Failed to get users" });
    }
  });

  app.post("/api/admin/set-result", async (req: Request, res: Response) => {
    if (!req.session.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const { color } = req.body;
      if (!["red", "yellow", "green"].includes(color)) {
        return res.status(400).json({ error: "Invalid color" });
      }

      await gameEngine.setNextResult(color);
      res.json({ success: true, message: `Next result set to ${color}` });
    } catch (error) {
      console.error("Set result error:", error);
      res.status(500).json({ error: "Failed to set result" });
    }
  });

  app.post("/api/admin/add-balance", async (req: Request, res: Response) => {
    if (!req.session.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const { userId, amount } = req.body;
      if (!userId || typeof amount !== "number") {
        return res.status(400).json({ error: "Invalid request" });
      }

      const user = await storage.updateUserBalance(userId, amount);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      await storage.createTransaction(userId, "admin_credit", amount, "completed");

      res.json({ success: true, newBalance: user.balance });
    } catch (error) {
      console.error("Add balance error:", error);
      res.status(500).json({ error: "Failed to add balance" });
    }
  });

  app.post("/api/wallet/withdraw", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const { amount, bankName, ifscCode, accountNumber, accountHolderName } = req.body;
      
      if (!amount || amount < 500) {
        return res.status(400).json({ error: "Minimum withdrawal amount is 500" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user || user.balance < amount) {
        return res.status(400).json({ error: "Insufficient balance" });
      }

      await storage.updateUserBankDetails(user.id, {
        bankName,
        ifscCode,
        accountNumber,
        accountHolderName
      });

      await storage.updateUserBalance(user.id, -amount);
      
      const transaction = await storage.createTransaction(
        user.id,
        "withdrawal",
        amount,
        "pending"
      );

      res.json({
        success: true,
        transaction,
        message: "Withdrawal request submitted successfully!"
      });
    } catch (error) {
      console.error("Withdraw error:", error);
      res.status(500).json({ error: "Failed to process withdrawal" });
    }
  });

  app.get("/api/user/referrals", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      const users = await storage.getAllUsers();
      const referrals = users.filter(u => u.referredBy === user.id);
      
      res.json({
        referralCode: user.referralCode,
        referralCount: referrals.length,
        referrals: referrals.map(u => ({
          username: u.username,
          createdAt: u.createdAt
        }))
      });
    } catch (error) {
      console.error("Referrals error:", error);
      res.status(500).json({ error: "Failed to get referral data" });
    }
  });

  app.post("/api/admin/confirm-deposit", async (req: Request, res: Response) => {
    if (!req.session.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const { transactionId } = req.body;
      const transaction = await db.select().from(transactions).where(eq(transactions.id, transactionId)).limit(1);
      
      if (!transaction[0] || transaction[0].type !== "deposit" || transaction[0].status !== "pending") {
        return res.status(400).json({ error: "Invalid transaction" });
      }

      await storage.updateTransactionStatus(transactionId, "completed");
      await storage.updateUserBalance(transaction[0].userId, transaction[0].amount);

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to confirm deposit" });
    }
  });

  app.post("/api/wallet/submit-deposit", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const { amount, paymentId } = req.body;
      const transaction = await storage.createTransaction(
        req.session.userId,
        "deposit",
        amount,
        "pending",
        paymentId
      );
      res.json({ success: true, transaction });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit deposit" });
    }
  });

  app.get("/api/admin/pending-transactions", async (req: Request, res: Response) => {
    if (!req.session.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }
    const pending = await db.select().from(transactions).where(eq(transactions.status, "pending"));
    res.json(pending);
  });

  app.post("/api/admin/next-result", async (req: Request, res: Response) => {
    if (!req.session.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }
    res.json({ nextResult: (await gameEngine.getState()).nextResult });
  });

  const httpServer = createServer(app);

  return httpServer;
}
