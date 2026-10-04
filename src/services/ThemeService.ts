export type Theme = 'dark' | 'light' | 'auto';

class ThemeService {
  private static instance: ThemeService;
  private currentTheme: Theme = 'auto';
  private listeners: Set<(theme: Theme) => void> = new Set();
  private intervalId: number | null = null;

  private constructor() {
    const saved = localStorage.getItem('ludo_theme') as Theme;
    if (saved) {
      this.currentTheme = saved;
    }
    this.applyTheme();

    // Re-check auto theme every minute
    this.intervalId = window.setInterval(() => {
      if (this.currentTheme === 'auto') {
        this.applyTheme();
      }
    }, 60000);
  }

  public static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
    }
    return ThemeService.instance;
  }

  public getTheme(): Theme {
    return this.currentTheme;
  }

  public cycleTheme() {
    if (this.currentTheme === 'dark') this.currentTheme = 'light';
    else if (this.currentTheme === 'light') this.currentTheme = 'auto';
    else this.currentTheme = 'dark';
    
    localStorage.setItem('ludo_theme', this.currentTheme);
    this.applyTheme();
    this.notify();
  }

  private isNightTime(): boolean {
    const hour = new Date().getHours();
    return hour >= 18 || hour < 6;
  }

  private applyTheme() {
    let effectiveTheme = this.currentTheme;
    if (effectiveTheme === 'auto') {
      effectiveTheme = this.isNightTime() ? 'dark' : 'light';
    }

    if (effectiveTheme === 'light') {
      document.documentElement.classList.add('theme-light');
    } else {
      document.documentElement.classList.remove('theme-light');
    }
  }

  public subscribe(callback: (theme: Theme) => void) {
    this.listeners.add(callback);
    callback(this.currentTheme);
    return () => this.listeners.delete(callback);
  }

  private notify() {
    this.listeners.forEach(cb => cb(this.currentTheme));
  }
}

export const themeService = ThemeService.getInstance();
