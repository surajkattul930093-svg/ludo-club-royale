import { io, Socket } from 'socket.io-client';

// Use the current hostname (e.g., local IP on phone) so other devices on network can connect
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || `http://${window.location.hostname}:3001`;

class SocketService {
  private static instance: SocketService;
  public socket: Socket | null = null;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
      });
      
      this.socket.on('connect', () => {
        console.log('Connected to Multiplayer Server:', this.socket?.id);
      });
    }
  }

  public joinMatchmaking() {
    this.socket?.emit('join_random_match');
  }

  public leaveMatchmaking() {
    this.socket?.emit('leave_queue');
  }

  public emitGameAction(action: any) {
    this.socket?.emit('game_action', action);
  }

  public onGameAction(callback: (action: any) => void) {
    this.socket?.on('game_action', callback);
  }

  public offGameAction(callback: (action: any) => void) {
    this.socket?.off('game_action', callback);
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = SocketService.getInstance();

