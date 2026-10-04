import React, { useEffect, useState } from 'react';
import { Sun, Moon, Clock } from 'lucide-react';
import { themeService, Theme } from '../../services/ThemeService';

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(themeService.getTheme());

  useEffect(() => {
    return themeService.subscribe(setTheme);
  }, []);

  const renderIcon = () => {
    if (theme === 'dark') return <Moon className="w-5 h-5 text-indigo-400" />;
    if (theme === 'light') return <Sun className="w-5 h-5 text-amber-500" />;
    return <Clock className="w-5 h-5 text-sky-400" />;
  };

  const getTitle = () => {
    if (theme === 'dark') return 'Dark Mode (Click for Light)';
    if (theme === 'light') return 'Light Mode (Click for Auto)';
    return 'Auto Mode: 6PM-6AM Night (Click for Dark)';
  };

  return (
    <button
      onClick={() => themeService.cycleTheme()}
      title={getTitle()}
      className="relative p-2 sm:p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center"
      aria-label="Toggle Theme"
    >
      {renderIcon()}
      {theme === 'auto' && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
        </span>
      )}
    </button>
  );
};

