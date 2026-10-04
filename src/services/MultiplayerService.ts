import { GameState } from '../types/game';

export interface RoomOptions {
  roomCode?: string;
  maxPlayers: 2 | 3 | 4;
  isPrivate: boolean;
  stakeCoins?: number;
}

export interface MultiplayerService {
  createRoom(options: RoomOptions): Promise<string>;
  joinRoom(roomCode: string): Promise<boolean>;
  leaveRoom(roomCode: string): Promise<void>;
  broadcastMove(gameId: string, action: any): Promise<void>;
  onGameStateSync(gameId: string, callback: (state: GameState) => void): () => void;
}

/**
 * Local mock multiplayer service prepared for Firebase realtime/firestore sync in Phase 2
 */
export class LocalMultiplayerService implements MultiplayerService {
  async createRoom(options: RoomOptions): Promise<string> {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    console.log(`[MultiplayerService] Room created with code ${code}`, options);
    return code;
  }

  async joinRoom(roomCode: string): Promise<boolean> {
    console.log(`[MultiplayerService] Joining room ${roomCode}`);
    return true;
  }

  async leaveRoom(roomCode: string): Promise<void> {
    console.log(`[MultiplayerService] Left room ${roomCode}`);
  }

  async broadcastMove(gameId: string, action: any): Promise<void> {
    console.log(`[MultiplayerService] Broadcasting move on ${gameId}:`, action);
  }

  onGameStateSync(_gameId: string, _callback: (state: GameState) => void): () => void {
    return () => {};
  }
}
