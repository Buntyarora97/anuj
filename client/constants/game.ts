export const GAME_CONFIG = {
  STARTING_COINS: 1000,
  MIN_BET: 10,
  MAX_BET: 500,
  BET_INCREMENT: 10,
  ROUND_DURATION: 10,
  BETTING_CLOSE_TIME: 3,
  WIN_MULTIPLIER: 2.5,
  COLORS: ["red", "yellow", "green"] as const,
};

export type GameColor = (typeof GAME_CONFIG.COLORS)[number];

export interface GameRound {
  id: string;
  timestamp: number;
  betColor: GameColor | null;
  betAmount: number;
  resultColor: GameColor;
  won: boolean;
  coinsChange: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  balance: number;
  rank: number;
}

export interface GameState {
  balance: number;
  currentBet: number;
  selectedColor: GameColor | null;
  roundPhase: "betting" | "waiting" | "result";
  countdown: number;
  lastResult: GameColor | null;
  history: GameRound[];
}
