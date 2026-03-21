import { storage } from "./storage";

const COLORS = ["red", "yellow", "green"] as const;
const ROUND_DURATION = 30;
const RESULT_DISPLAY_DURATION = 5;
const WIN_MULTIPLIER = 2.5;

class GameEngine {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    
    let state = await storage.getGameState();
    if (!state) {
      state = await storage.createGameState();
    }
    
    this.initialized = true;
    this.startGameLoop();
  }

  private startGameLoop() {
    this.intervalId = setInterval(async () => {
      await this.tick();
    }, 1000);
  }

  private async tick() {
    try {
      let state = await storage.getGameState();
      if (!state) {
        state = await storage.createGameState();
      }

      const newCountdown = state.countdown - 1;

      if (newCountdown <= 0) {
        if (state.phase === "betting") {
          await storage.updateGameState({
            phase: "result",
            countdown: RESULT_DISPLAY_DURATION,
          });
        } else if (state.phase === "result") {
          const resultColor = state.nextResult || this.getRandomColor();
          
          const round = await storage.createGameRound(state.currentRound, resultColor);
          
          await this.processRoundResults(round.id, resultColor);
          
          await storage.updateGameState({
            phase: "betting",
            countdown: ROUND_DURATION,
            currentRound: state.currentRound + 1,
            lastResult: resultColor,
            nextResult: null,
          });
        }
      } else {
        await storage.updateGameState({ countdown: newCountdown });
      }
    } catch (error) {
      console.error("Game engine tick error:", error);
    }
  }

  private getRandomColor(): string {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
  }

  private async processRoundResults(roundId: number, resultColor: string) {
    const bets = await storage.getBetsForRound(roundId);
    const GST_RATE = 0.18;
    const COMMISSION_RATE_L1 = 0.05;
    const COMMISSION_RATE_L2 = 0.025;
    
    for (const bet of bets) {
      const won = bet.betColor === resultColor;
      let winAmount = 0;
      
      if (won) {
        const grossWin = Math.floor(bet.betAmount * WIN_MULTIPLIER);
        const profit = grossWin - bet.betAmount;
        const gstAmount = Math.floor(profit * GST_RATE);
        winAmount = grossWin - gstAmount;
      }
      
      await storage.updateBetResult(bet.id, won, winAmount);
      
      if (won) {
        await storage.updateUserBalance(bet.userId, winAmount);
      }

      // Referral Commissions based on bet amount (Turnover)
      const user = await storage.getUser(bet.userId);
      if (user && user.referredBy) {
        // Level 1 Commission
        const l1Bonus = Math.floor(bet.betAmount * COMMISSION_RATE_L1);
        await storage.updateUserBalance(user.referredBy, l1Bonus);
        await storage.createTransaction(user.referredBy, "COMMISSION_L1", l1Bonus, "completed");

        const parent = await storage.getUser(user.referredBy);
        if (parent && parent.referredBy) {
          // Level 2 Commission
          const l2Bonus = Math.floor(bet.betAmount * COMMISSION_RATE_L2);
          await storage.updateUserBalance(parent.referredBy, l2Bonus);
          await storage.createTransaction(parent.referredBy, "COMMISSION_L2", l2Bonus, "completed");
        }
      }
    }
  }

  async setNextResult(color: string) {
    if (!COLORS.includes(color as any)) {
      throw new Error("Invalid color");
    }
    await storage.updateGameState({ nextResult: color });
  }

  async getState() {
    let state = await storage.getGameState();
    if (!state) {
      state = await storage.createGameState();
    }
    return state;
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const gameEngine = new GameEngine();
