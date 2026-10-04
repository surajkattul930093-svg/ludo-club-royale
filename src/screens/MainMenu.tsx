import React, { useState } from 'react';
import { GameMode } from '../types/game';
import { Button } from '../components/common/Button';
import {
  Users,
  Bot,
  Globe,
  Key,
  User,
  Settings,
  Sparkles,
  Coins,
  Crown,
  Play,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { SettingsModal } from '../components/modals/SettingsModal';
import { FeaturePlaceholderModal } from '../components/modals/FeaturePlaceholderModal';
import { ColorSelectionModal } from '../components/modals/ColorSelectionModal';
import { MatchmakingModal } from '../components/modals/MatchmakingModal';
import { authService, UserProfile } from '../services/AuthService';
import { useEffect } from 'react';
import { PlayerColor } from '../types/player';

interface MainMenuProps {
  onStartGame: (mode: GameMode, colors: PlayerColor[], myColor?: PlayerColor) => void;
  soundEnabled: boolean;
  animationSpeed: number;
  onToggleSound: () => void;
  onChangeAnimationSpeed: (speedMs: number) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  soundEnabled,
  animationSpeed,
  onToggleSound,
  onChangeAnimationSpeed,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [playModePickerOpen, setPlayModePickerOpen] = useState(false);
  const [colorPickerMode, setColorPickerMode] = useState<GameMode | null>(null);
  const [isMatchmakingOpen, setIsMatchmakingOpen] = useState(false);
  const [onlineMatchMode, setOnlineMatchMode] = useState<2 | 4>(2);
  const [userProfile, setUserProfile] = useState<UserProfile>(authService.getCurrentUser());

  useEffect(() => {
    const unsubscribe = authService.subscribe((user) => {
      setUserProfile(user);
    });
    return unsubscribe;
  }, []);

  const [placeholderData, setPlaceholderData] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
  }>({
    isOpen: false,
    title: '',
    description: '',
  });

  const openPlaceholder = (title: string, description: string) => {
    setPlaceholderData({
      isOpen: true,
      title,
      description,
    });
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-gradient-to-b from-slate-950 via-[#061838] to-slate-950 p-4 sm:p-6 text-slate-100 select-none overflow-x-hidden">
      {/* Background Subtle Radial Elements */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />

      {/* Top Header: Profile & Currency Bar */}
      <header className="relative z-10 w-full max-w-lg mx-auto flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800 shadow-lg">
        {/* User Profile Capsule */}
        <button
          onClick={() =>
            openPlaceholder(
              'Player Profile',
              'View stats, customize tokens, unlock dice skins, and track match achievements. Coming in Phase 2!'
            )
          }
          className="flex items-center gap-2.5 text-left group cursor-pointer"
        >
          <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-amber-200 shadow-md flex items-center justify-center text-lg">
            <span>👑</span>
            <span className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 w-3 h-3 rounded-full border border-slate-900" />
          </div>
          <div>
            <div className="text-xs font-black text-white group-hover:text-amber-400 transition-colors">
              {userProfile.displayName}
            </div>
            <div className="text-[10px] font-semibold text-slate-400">
              Level 5 · Pro
            </div>
          </div>
        </button>

        {/* Currency & Audio Quick Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700/80 shadow-inner">
            <Coins className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-xs font-black text-amber-300 font-mono">
              {userProfile.coins.toLocaleString()}
            </span>
          </div>

          <button
            onClick={onToggleSound}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle sound"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </header>

      {/* Hero / Game Emblem & Title */}
      <main className="relative z-10 my-auto flex flex-col items-center text-center py-6">
        {/* Animated Badge */}
        <div className="relative mb-4">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl p-1.5 bg-gradient-to-tr from-amber-300 via-yellow-400 to-amber-600 border-2 border-amber-200 shadow-[0_12px_32px_rgba(0,0,0,0.6),0_0_30px_rgba(245,158,11,0.35)] flex items-center justify-center">
            <div className="w-full h-full rounded-2xl bg-slate-950 grid grid-cols-2 grid-rows-2 p-1 gap-1">
              <div className="rounded-lg bg-[#0878E8] shadow-inner" />
              <div className="rounded-lg bg-[#FFD21C] shadow-inner" />
              <div className="rounded-lg bg-[#F01818] shadow-inner" />
              <div className="rounded-lg bg-[#08B83F] shadow-inner" />
            </div>
          </div>
          <Crown className="w-7 h-7 text-amber-300 absolute -top-3 -right-2 rotate-12 drop-shadow-lg" />
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
          LUDO <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">ROYALE</span>
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-300 font-semibold tracking-wide">
          Premium Board Game Foundation
        </p>

        {/* Primary Action Buttons Menu */}
        <div className="w-full max-w-xs mt-8 flex flex-col gap-3">
          {/* PLAY Button */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => setPlayModePickerOpen(true)}
            className="text-base py-3.5"
          >
            <Play className="w-5 h-5 fill-current" />
            Play Local Match
          </Button>

          {/* ONLINE Matchmaking 2P */}
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={() => {
              setOnlineMatchMode(2);
              setIsMatchmakingOpen(true);
            }}
          >
            <Globe className="w-4 h-4 text-sky-400" />
            Online Match (2 Player)
          </Button>

          {/* ONLINE Matchmaking 4P */}
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={() => {
              setOnlineMatchMode(4);
              setIsMatchmakingOpen(true);
            }}
          >
            <Globe className="w-4 h-4 text-emerald-400" />
            Online Match (4 Player)
          </Button>

          {/* PRIVATE ROOM */}
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={() =>
              openPlaceholder(
                'Private Rooms',
                'Create custom rooms and share invite codes with friends and family. Coming in Phase 2!'
              )
            }
          >
            <Key className="w-4 h-4 text-emerald-400" />
            Private Room
          </Button>

          {/* Secondary Buttons Row */}
          <div className="grid grid-cols-2 gap-2.5 mt-1">
            <button
              onClick={() =>
                openPlaceholder(
                  'Player Profile',
                  'Customize your display name, avatars, and check win rates.'
                )
              }
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:bg-slate-800 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
            >
              <User className="w-4 h-4 text-amber-400" />
              Profile
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:bg-slate-800 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              Settings
            </button>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 w-full max-w-sm mx-auto text-center py-2 text-[11px] text-slate-500 font-medium">
        <span>Production Ludo Engine · Android & iOS Ready</span>
      </footer>

      {/* Mode Selection Dialog */}
      {playModePickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 select-none">
            <h3 className="text-xl font-extrabold text-white text-center">
              Select Match Mode
            </h3>
            <p className="text-xs text-slate-400 text-center mt-1">
              Choose how you want to play locally
            </p>

            <div className="mt-5 space-y-3">
              {/* Pass and Play 4 Players */}
              <button
                onClick={() => {
                  setPlayModePickerOpen(false);
                  setColorPickerMode('pass_and_play');
                }}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-blue-900/40 to-slate-800/80 border border-blue-500/40 hover:border-blue-400 flex items-center gap-3.5 transition-all text-left cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/50 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-white group-hover:text-blue-300">
                    4 Players (Pass & Play)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Blue, Yellow, Green, Red all human players
                  </div>
                </div>
              </button>

              {/* vs Computer */}
              <button
                onClick={() => {
                  setPlayModePickerOpen(false);
                  setColorPickerMode('vs_computer');
                }}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-emerald-900/40 to-slate-800/80 border border-emerald-500/40 hover:border-emerald-400 flex items-center gap-3.5 transition-all text-left cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-400/50 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-white group-hover:text-emerald-300">
                    vs Computer Bots
                  </div>
                  <div className="text-[11px] text-slate-400">
                    You (Blue) vs 3 intelligent bots
                  </div>
                </div>
              </button>

              {/* 2 Players */}
              <button
                onClick={() => {
                  setPlayModePickerOpen(false);
                  setColorPickerMode('2_player');
                }}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-amber-900/40 to-slate-800/80 border border-amber-500/40 hover:border-amber-400 flex items-center gap-3.5 transition-all text-left cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-600/30 border border-amber-400/50 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-white group-hover:text-amber-300">
                    2 Players Head-to-Head
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Fast 1v1 duel (Blue vs Green)
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-5">
              <button
                onClick={() => setPlayModePickerOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        soundEnabled={soundEnabled}
        animationSpeed={animationSpeed}
        onToggleSound={onToggleSound}
        onChangeAnimationSpeed={onChangeAnimationSpeed}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Placeholder Modal */}
      <FeaturePlaceholderModal
        isOpen={placeholderData.isOpen}
        featureTitle={placeholderData.title}
        featureDescription={placeholderData.description}
        onClose={() =>
          setPlaceholderData((prev) => ({ ...prev, isOpen: false }))
        }
      />
      {colorPickerMode && (
        <ColorSelectionModal
          mode={colorPickerMode}
          onConfirm={(colors) => onStartGame(colorPickerMode, colors)}
          onCancel={() => setColorPickerMode(null)}
        />
      )}
      {isMatchmakingOpen && (
        <MatchmakingModal
          mode={onlineMatchMode}
          onMatchFound={(gameId, color, activeColors) => {
            setIsMatchmakingOpen(false);
            onStartGame('online_multiplayer', activeColors, color);
          }}
          onCancel={() => setIsMatchmakingOpen(false)}
        />
      )}
    </div>
  );
};










