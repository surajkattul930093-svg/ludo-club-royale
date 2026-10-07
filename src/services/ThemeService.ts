export type Theme = 'light' | 'dark' | 'auto';
export class ThemeService {
  private static instance: ThemeService;
  private constructor() {
    document.documentElement.classList.remove('dark');
  }
  public static getInstance(): ThemeService {
    if (!ThemeService.instance) ThemeService.instance = new ThemeService();
    return ThemeService.instance;
  }
  public getTheme(): Theme { return 'light'; }
  public setTheme(theme: Theme): void {}
  public cycleTheme(): void {}
  public subscribe(listener: (theme: Theme) => void): () => void { return () => {}; }
}
export const themeService = ThemeService.getInstance();
