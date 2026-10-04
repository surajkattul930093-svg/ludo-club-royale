import React, { useEffect, useState } from 'react';
import { Sparkles, Play } from 'lucide-react';
import { AudioService } from '../services/AudioService';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onFinish, 400);
          return 100;
        }
        return prev + 12;
      });
    }, 120);

    return () => clearInterval(timer);
  }, [onFinish]);

  const handleSkip = () => {
    AudioService.getInstance().playButtonSound();
    onFinish();
  };

  return (
    <div
      onClick={handleSkip}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-8 bg-gradient-to-b from-slate-950 via-[#071630] to-slate-950 select-none cursor-pointer overflow-hidden"
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />

      {/* Top Tagline */}
      <div className="pt-6 flex items-center gap-2 text-amber-400 font-bold tracking-widest text-xs uppercase animate-pulse">
        <Sparkles className="w-4 h-4" />
        <span>Classic Royale Edition</span>
        <Sparkles className="w-4 h-4" />
      </div>

      {/* Main Logo & Emblem */}
      <div className="flex flex-col items-center text-center">
        {/* 4 Colored Shield Crest */}
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl p-2 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-[0_12px_36px_rgba(0,0,0,0.8),0_0_40px_rgba(245,158,11,0.4)] rotate-3 hover:rotate-0 transition-transform">
          <div className="w-full h-full rounded-2xl bg-slate-950 grid grid-cols-2 grid-rows-2 p-1.5 gap-1.5 overflow-hidden">
            <div className="rounded-xl bg-[#0878E8] shadow-inner flex items-center justify-center">
              <span className="w-3.5 h-3.5 rounded-full bg-white/90 shadow-sm" />
            </div>
            <div className="rounded-xl bg-[#FFD21C] shadow-inner flex items-center justify-center">
              <span className="w-3.5 h-3.5 rounded-full bg-white/90 shadow-sm" />
            </div>
            <div className="rounded-xl bg-[#F01818] shadow-inner flex items-center justify-center">
              <span className="w-3.5 h-3.5 rounded-full bg-white/90 shadow-sm" />
            </div>
            <div className="rounded-xl bg-[#08B83F] shadow-inner flex items-center justify-center">
              <span className="w-3.5 h-3.5 rounded-full bg-white/90 shadow-sm" />
            </div>
          </div>

          {/* Golden Crown badge */}
          <div className="absolute -top-3 -right-3 text-2xl animate-bounce">
            👑
          </div>
        </div>

        {/* Title */}
        <h1 className="mt-6 text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
          LUDO <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">ROYALE</span>
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-300 font-semibold tracking-wide">
          The Ultimate Board Game Experience
        </p>
      </div>

      {/* Bottom Loading Bar */}
      <div className="w-full max-w-xs flex flex-col items-center gap-2 pb-6">
        <div className="w-full h-2.5 rounded-full bg-slate-800/80 border border-slate-700/60 overflow-hidden p-0.5">
          <div
            style={{ width: `${progress}%` }}
            className="h-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 transition-all duration-150 shadow-[0_0_12px_rgba(245,158,11,0.8)]"
          />
        </div>
        <span className="text-[11px] text-slate-400 font-bold tracking-wider flex items-center gap-1">
          <Play className="w-3 h-3 text-amber-400 fill-current" /> Tap anywhere to skip
        </span>
      </div>
    </div>
  );
};
