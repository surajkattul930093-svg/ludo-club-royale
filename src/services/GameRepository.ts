import { GameState } from '../types/game';

/**
 * GameRepository interface for persisting and loading game state.
 * Initially uses in-memory / local storage; will connect to Firebase Firestore in later phases.
 */
export interface GameRepository {
  saveGame(game: GameState): Promise<void>;
  loadGame(gameId: string): Promise<GameState | null>;
  deleteGame(gameId: string): Promise<void>;
}

export class LocalGameRepository implements GameRepository {
  private storageKey = 'ludo_saved_game';

  async saveGame(game: GameState): Promise<void> {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(game));
    } catch {
      // Local storage fallback
    }
  }

  async loadGame(_gameId: string): Promise<GameState | null> {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  async deleteGame(_gameId: string): Promise<void> {
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      // Ignore
    }
  }
}
