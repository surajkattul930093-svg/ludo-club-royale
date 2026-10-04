type Theme = 'dark' | 'light';

class ThemeService {
  private static instance: ThemeService;
  private currentTheme: Theme = 'dark';
  private listeners: Set<(theme: Theme) => void> = new Set();

  private constructor() {
    const saved = localStorage.getItem('ludo_theme') as Theme;
    if (saved) {
      this.currentTheme = saved;
    }
    this.applyTheme();
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

  public toggleTheme() {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('ludo_theme', this.currentTheme);
    this.applyTheme();
    this.notify();
  }

  private applyTheme() {
    if (this.currentTheme === 'light') {
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
