// Service to handle Guest Login and Profile Data using MongoDB

export interface UserProfile {
  _id?: string;
  deviceId?: string;
  uid?: string;
  username?: string;
  displayName?: string;
  avatar: string;
  coins: number;
  level: number;
  gamesPlayed: number;
  gamesWon: number;
}

const SERVER_URL = import.meta.env.VITE_BACKEND_URL || `http://${window.location.hostname}:3001`;

class AuthService {
  private static instance: AuthService;
  public currentUser: UserProfile | null = null;
  // Subscribers array to notify UI components (like Top Bar) when user profile changes
  private subscribers: ((user: UserProfile) => void)[] = [];

  private constructor() {
    this.init();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Auto-login or register guest on load
  private async init() {
    let deviceId = localStorage.getItem('ludo_device_id');
    if (!deviceId) {
      deviceId = 'device_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('ludo_device_id', deviceId);
    }
    await this.loginGuest(deviceId);
  }

  public async loginGuest(deviceId: string) {
    try {
      const response = await fetch(`${SERVER_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId }),
      });
      if (response.ok) {
        const data = await response.json();
        this.currentUser = {
          ...data,
          displayName: data.username,
          uid: data.deviceId,
        };
        this.notifySubscribers();
      } else {
        this.useFallbackProfile(deviceId);
      }
    } catch (error) {
      console.warn('Backend not reachable, using offline profile.');
      this.useFallbackProfile(deviceId);
    }
  }

  private useFallbackProfile(deviceId: string) {
    this.currentUser = {
      deviceId,
      uid: deviceId,
      username: 'Guest_Offline',
      displayName: 'Guest_Offline',
      avatar: 'dY -',
      coins: 2500,
      level: 1,
      gamesPlayed: 0,
      gamesWon: 0,
    };
    this.notifySubscribers();
  }


  public async updateProfile(displayName: string, avatar: string) {
    if (!this.currentUser) return;
    
    // Optimistic local update
    this.currentUser.displayName = displayName;
    this.currentUser.username = displayName;
    this.currentUser.avatar = avatar;
    this.notifySubscribers();

    try {
      await fetch(`${SERVER_URL}/api/user/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          deviceId: this.currentUser.deviceId || this.currentUser.uid,
          username: displayName,
          avatar: avatar 
        }),
      });
    } catch (error) {
      console.error('Failed to sync profile with server:', error);
    }
  }

  public async updateCoins(amountToAdd: number, wonGame: boolean = false) {
    if (!this.currentUser) return;
    
    // Optimistic local update
    this.currentUser.coins += amountToAdd;
    if (wonGame) this.currentUser.gamesWon += 1;
    this.notifySubscribers();

    try {
      await fetch(`${SERVER_URL}/api/user/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          deviceId: this.currentUser.deviceId || this.currentUser.uid,
          coins: this.currentUser.coins,
          won: wonGame 
        }),
      });
    } catch (error) {
      console.error('Failed to sync coins with server:', error);
    }
  }

  public subscribe(callback: (user: UserProfile) => void) {
    this.subscribers.push(callback);
    if (this.currentUser) {
      callback(this.currentUser);
    }
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers() {
    if (this.currentUser) {
      this.subscribers.forEach(cb => cb(this.currentUser!));
    }
  }

  public getCurrentUser(): UserProfile {
    return this.currentUser || {
      uid: 'loading',
      displayName: 'Loading...',
      avatar: 'dY',
      coins: 0,
      level: 1,
      gamesPlayed: 0,
      gamesWon: 0
    };
  }
}

export const authService = AuthService.getInstance();


