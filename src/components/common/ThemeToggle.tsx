import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { themeService } from '../../services/ThemeService';

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState(themeService.getTheme());

  useEffect(() => {
    return themeService.subscribe(setTheme);
  }, []);

  return (
    <button
      onClick={() => themeService.toggleTheme()}
      title="Toggle Day/Night Mode"
      className="p-2 sm:p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 text-amber-400 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center"
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-sky-400" />}
    </button>
  );
};
