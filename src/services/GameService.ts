import { GameEngine } from '../game/GameEngine';
import { GameMode, GameState } from '../types/game';
import { GameRepository, LocalGameRepository } from './GameRepository';

/**
 * GameService coordinates the GameEngine and GameRepository.
 * Follows the architecture: Client -> GameService -> (Local/Firebase)
 */
export class GameService {
  private engine: GameEngine;
  private repository: GameRepository;

  constructor(repository: GameRepository = new LocalGameRepository()) {
    this.repository = repository;
    this.engine = new GameEngine();
  }

  public getEngine(): GameEngine {
    return this.engine;
  }

  public startNewGame(mode: GameMode = 'pass_and_play'): GameState {
    this.engine.restartGame(mode);
    const state = this.engine.getState();
    this.repository.saveGame(state);
    return state;
  }

  public async saveCurrentGame(): Promise<void> {
    const state = this.engine.getState();
    await this.repository.saveGame(state);
  }
}
