import React, { useState, useEffect } from 'react';
import { GameMode } from '../types/game';
import { PlayerColor } from '../types/player';
import { authService, UserProfile } from '../services/AuthService';
import { SettingsModal } from '../components/modals/SettingsModal';
import { FeaturePlaceholderModal } from '../components/modals/FeaturePlaceholderModal';
import { ColorSelectionModal } from '../components/modals/ColorSelectionModal';
import { MatchmakingModal } from '../components/modals/MatchmakingModal';
import { ProfileModal } from '../components/modals/ProfileModal';
import { PrivateRoomModal } from '../components/modals/PrivateRoomModal';
import {
  Settings, Plus, Gift, CalendarCheck, Trophy, Store, 
  Users, Bot, Globe, Key, User, HelpCircle,
  Home as HomeIcon, Gamepad2, Swords, ShoppingCart, LogIn, Crown
} from 'lucide-react';

interface MainMenuProps {
  onStartGame: (mode: GameMode, colors: PlayerColor[], myColor?: PlayerColor, gameId?: string, players?: any[]) => void;
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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [colorPickerMode, setColorPickerMode] = useState<GameMode | null>(null);
  const [preferredColor, setPreferredColor] = useState<PlayerColor | undefined>(undefined);
  const [isMatchmakingOpen, setIsMatchmakingOpen] = useState(false);
  const [onlineMatchMode, setOnlineMatchMode] = useState<2 | 4>(4);
  const [userProfile, setUserProfile] = useState<UserProfile>(authService.getCurrentUser());
  const [showOnlineModeSelect, setShowOnlineModeSelect] = useState(false);
  const [privateRoomMode, setPrivateRoomMode] = useState<'create' | 'join' | null>(null);

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
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-gradient-to-b from-sky-400 via-blue-500 to-indigo-900 select-none overflow-x-hidden font-sans">
      
      {/* Top Bar */}
      <header className="relative z-20 w-full px-4 pt-4 pb-2 flex items-center justify-between">
        
        {/* Profile */}
        <div 
          onClick={() => setIsProfileOpen(true)}
          className="flex items-center bg-[#0F204C] rounded-full pr-4 p-1 cursor-pointer shadow-lg border border-indigo-500/30"
        >
          <div className="w-10 h-10 rounded-full bg-orange-200 border-2 border-amber-400 overflow-hidden flex items-center justify-center mr-2">
            {userProfile?.avatar?.startsWith('http') ? (
              <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl">{userProfile?.avatar || '👦'}</span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-sm leading-tight">{userProfile?.displayName || userProfile?.username || 'Player123'}</span>
            <div className="flex items-center bg-yellow-500 rounded-full px-1.5 mt-0.5">
              <Crown className="w-3 h-3 text-white mr-1" />
              <span className="text-[10px] text-white font-bold">Level {userProfile?.level || 12}</span>
            </div>
          </div>
        </div>

        {/* Currencies & Settings */}
        <div className="flex items-center gap-2">
          {/* Coins */}
          <div className="flex items-center bg-[#0F204C] rounded-full pl-1 pr-1 py-1 shadow-lg border border-indigo-500/30">
            <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center mr-1 shadow-inner">
              <span className="text-yellow-700 font-bold text-xs">$</span>
            </div>
            <span className="text-white font-bold text-sm mr-2">{userProfile?.coins?.toLocaleString() || '5,420'}</span>
            <button className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white shadow-md hover:bg-green-400">
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Gems */}
          <div className="flex items-center bg-[#0F204C] rounded-full pl-1 pr-1 py-1 shadow-lg border border-indigo-500/30">
            <div className="w-6 h-6 rounded-full bg-cyan-400 flex items-center justify-center mr-1 shadow-inner">
              <span className="text-cyan-800 font-bold text-xs">💎</span>
            </div>
            <span className="text-white font-bold text-sm mr-2">120</span>
            <button className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white shadow-md hover:bg-green-400">
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Settings */}
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-10 h-10 rounded-xl bg-[#0F204C] flex items-center justify-center text-white shadow-lg border border-indigo-500/30 hover:bg-[#1a326e]"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 w-full max-w-md mx-auto">
        
        {/* Left Sidebar Actions */}
        <div className="absolute left-2 top-1/4 flex flex-col gap-4">
          <button onClick={() => openPlaceholder('Daily Reward', 'Claim your daily bonus!')} className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-blue-400 to-blue-600 border-2 border-white/20 shadow-lg flex items-center justify-center mb-1">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-[10px] font-bold drop-shadow-md text-center leading-tight">Daily<br/>Reward</span>
          </button>
          <button onClick={() => openPlaceholder('Missions', 'Complete tasks for rewards.')} className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-blue-400 to-blue-600 border-2 border-white/20 shadow-lg flex items-center justify-center mb-1 relative">
              <CalendarCheck className="w-6 h-6 text-white" />
              <div className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center border border-white text-[9px] text-white font-bold">1</div>
            </div>
            <span className="text-white text-[10px] font-bold drop-shadow-md text-center">Missions</span>
          </button>
          <button onClick={() => openPlaceholder('Leaderboard', 'See top players globally.')} className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-blue-400 to-blue-600 border-2 border-white/20 shadow-lg flex items-center justify-center mb-1">
              <Trophy className="w-6 h-6 text-yellow-300" />
            </div>
            <span className="text-white text-[10px] font-bold drop-shadow-md text-center">Leaderboard</span>
          </button>
        </div>

        {/* Right Sidebar Actions */}
        <div className="absolute right-2 top-1/4 flex flex-col gap-4">
          <button onClick={() => openPlaceholder('Shop', 'Buy exclusive items and skins.')} className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-blue-400 to-blue-600 border-2 border-white/20 shadow-lg flex items-center justify-center mb-1">
              <Store className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-[10px] font-bold drop-shadow-md text-center">Shop</span>
          </button>
          <button onClick={() => openPlaceholder('Lucky Spin', 'Spin the wheel for prizes!')} className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-blue-400 to-blue-600 border-2 border-white/20 shadow-lg flex items-center justify-center mb-1">
              <HelpCircle className="w-6 h-6 text-rose-300" />
            </div>
            <span className="text-white text-[10px] font-bold drop-shadow-md text-center leading-tight">Lucky<br/>Spin</span>
          </button>
          <button onClick={() => openPlaceholder('Friends', 'Manage your friends list.')} className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-blue-400 to-blue-600 border-2 border-white/20 shadow-lg flex items-center justify-center mb-1">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-[10px] font-bold drop-shadow-md text-center">Friends</span>
          </button>
        </div>

        {/* Logo Area */}
        <div className="w-full flex justify-center items-center mt-8 mb-4">
          <div className="relative text-center">
            <Crown className="w-16 h-16 text-yellow-400 mx-auto -mb-4 relative z-10 drop-shadow-lg" />
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-yellow-200 to-orange-500 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] filter" style={{ WebkitTextStroke: '2px #b43b02' }}>
              LUDO
            </h1>
            <div className="bg-red-600 rounded-full px-4 py-1 mx-auto mt-[-5px] border-2 border-red-800 shadow-md">
              <span className="text-[10px] text-white font-bold tracking-widest">PLAY â€¢ COMPETE â€¢ WIN</span>
            </div>
          </div>
        </div>

        {/* Simulated 3D Board Background Image */}
        <div className="w-64 h-64 mx-auto mb-6 relative mt-4 perspective-1000">
           {/* Mockup of a board in CSS */}
           <div className="w-full h-full bg-orange-100 rounded-xl border-b-8 border-orange-300 shadow-2xl transform rotateX-12 rotateZ-45 p-2 grid grid-cols-2 grid-rows-2 gap-2 opacity-90">
              <div className="bg-blue-500 rounded-lg shadow-inner"></div>
              <div className="bg-green-500 rounded-lg shadow-inner"></div>
              <div className="bg-red-500 rounded-lg shadow-inner"></div>
              <div className="bg-yellow-400 rounded-lg shadow-inner"></div>
           </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="w-full flex flex-col gap-3 px-2 pb-6">
          
          {/* Row 1: Play Online & Play with AI */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setShowOnlineModeSelect(true)}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-yellow-300 to-orange-500 p-0.5 shadow-lg active:scale-95 transition-transform"
            >
              <div className="w-full h-full bg-gradient-to-b from-yellow-400 to-orange-600 rounded-[14px] flex items-center p-3 gap-2 border-b-4 border-orange-700">
                <Globe className="w-8 h-8 text-white drop-shadow-md shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="text-white font-black text-sm drop-shadow-md leading-tight">PLAY ONLINE</span>
                  <span className="text-white/80 font-bold text-[9px]">Real Players Worldwide</span>
                </div>
              </div>
            </button>

            <button 
              onClick={() => setColorPickerMode('vs_computer')}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-sky-300 to-blue-500 p-0.5 shadow-lg active:scale-95 transition-transform"
            >
              <div className="w-full h-full bg-gradient-to-b from-sky-400 to-blue-600 rounded-[14px] flex items-center p-3 gap-2 border-b-4 border-blue-800">
                <Bot className="w-8 h-8 text-white drop-shadow-md shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="text-white font-black text-sm drop-shadow-md leading-tight">PLAY WITH AI</span>
                  <span className="text-white/80 font-bold text-[9px]">Play Offline</span>
                </div>
              </div>
            </button>
          </div>

          {/* Row 2: Local, Create, Join */}
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => setColorPickerMode('pass_and_play')}
              className="relative overflow-hidden rounded-xl bg-gradient-to-b from-purple-400 to-purple-600 p-0.5 shadow-lg active:scale-95 transition-transform"
            >
              <div className="w-full h-full bg-gradient-to-b from-purple-500 to-purple-700 rounded-lg flex flex-col items-center justify-center p-2 gap-1 border-b-4 border-purple-900">
                <Users className="w-6 h-6 text-white drop-shadow-md" />
                <span className="text-white font-black text-[10px] text-center drop-shadow-md leading-tight">LOCAL<br/>MULTIPLAYER</span>
              </div>
            </button>

            <button 
              onClick={() => {
                setPrivateRoomMode('create');
                setColorPickerMode('online_multiplayer');
              }}
              className="relative overflow-hidden rounded-xl bg-gradient-to-b from-emerald-300 to-emerald-500 p-0.5 shadow-lg active:scale-95 transition-transform"
            >
              <div className="w-full h-full bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-lg flex flex-col items-center justify-center p-2 gap-1 border-b-4 border-emerald-800">
                <Plus className="w-6 h-6 text-white drop-shadow-md" />
                <span className="text-white font-black text-[10px] text-center drop-shadow-md leading-tight">CREATE<br/>ROOM</span>
              </div>
            </button>

            <button 
              onClick={() => {
                setPrivateRoomMode('join');
                setColorPickerMode('online_multiplayer');
              }}
              className="relative overflow-hidden rounded-xl bg-gradient-to-b from-pink-400 to-rose-500 p-0.5 shadow-lg active:scale-95 transition-transform"
            >
              <div className="w-full h-full bg-gradient-to-b from-pink-500 to-rose-600 rounded-lg flex flex-col items-center justify-center p-2 gap-1 border-b-4 border-rose-900">
                <LogIn className="w-6 h-6 text-white drop-shadow-md" />
                <span className="text-white font-black text-[10px] text-center drop-shadow-md leading-tight">JOIN<br/>ROOM</span>
              </div>
            </button>
          </div>

          {/* Special Offer Banner */}
          <div className="mt-2 relative rounded-2xl bg-gradient-to-r from-orange-600 to-amber-700 border border-yellow-500/50 shadow-xl overflow-hidden p-3 flex items-center justify-between">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[8px] font-bold px-3 py-0.5 rounded-b-md">SPECIAL OFFER</div>
             <div className="flex flex-col mt-2">
                <span className="text-white font-black text-lg drop-shadow-md">STARTER PACK</span>
                <span className="text-yellow-200 font-semibold text-[10px]">Coins + Gems + Exclusive Dice</span>
             </div>
             <button onClick={() => openPlaceholder('Starter Pack', 'Get amazing value for $0.99!')} className="bg-gradient-to-b from-yellow-300 to-yellow-500 text-yellow-900 font-bold text-xs px-4 py-2 rounded-full border-b-2 border-yellow-600 active:scale-95 transition-transform">
               VIEW OFFER
             </button>
          </div>
        </div>

      </main>

      {/* Bottom Navigation */}
      <footer className="relative z-20 w-full bg-[#111b3d] border-t border-indigo-900/50 py-3 px-6 flex justify-between items-center rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.3)]">
        <button className="flex flex-col items-center text-yellow-500">
          <HomeIcon className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button onClick={() => openPlaceholder('Games', 'Explore other mini-games.')} className="flex flex-col items-center text-slate-400 hover:text-white transition-colors">
          <Gamepad2 className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold">Games</span>
        </button>
        <button onClick={() => openPlaceholder('Tournaments', 'Compete for big prizes.')} className="flex flex-col items-center text-slate-400 hover:text-white transition-colors">
          <Trophy className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold">Tournaments</span>
        </button>
        <button onClick={() => openPlaceholder('Store', 'Buy coins and gems.')} className="flex flex-col items-center text-slate-400 hover:text-white transition-colors">
          <ShoppingCart className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold">Store</span>
        </button>
        <button onClick={() => setIsProfileOpen(true)} className="flex flex-col items-center text-slate-400 hover:text-white transition-colors">
          <User className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </footer>

      {/* Modals */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <SettingsModal
        isOpen={isSettingsOpen}
        soundEnabled={soundEnabled}
        animationSpeed={animationSpeed}
        onToggleSound={onToggleSound}
        onChangeAnimationSpeed={onChangeAnimationSpeed}
        onClose={() => setIsSettingsOpen(false)}
      />
      <FeaturePlaceholderModal
        isOpen={placeholderData.isOpen}
        featureTitle={placeholderData.title}
        featureDescription={placeholderData.description}
        onClose={() => setPlaceholderData((prev) => ({ ...prev, isOpen: false }))}
      />
      {colorPickerMode && (
        <ColorSelectionModal
          mode={colorPickerMode}
          onConfirm={(colors) => {
              if (colorPickerMode === 'online_multiplayer') {
                setPreferredColor(colors[0]);
                setColorPickerMode(null);
                if (!privateRoomMode) {
                  setIsMatchmakingOpen(true);
                }
              } else {
                onStartGame(colorPickerMode, colors);
              }
            }}
          onCancel={() => setColorPickerMode(null)}
        />
      )}
      {isMatchmakingOpen && (
        <MatchmakingModal
          mode={onlineMatchMode}
          preferredColor={preferredColor}
          onMatchFound={(gameId, color, activeColors, players) => {
              setIsMatchmakingOpen(false);
              onStartGame('online_multiplayer', activeColors, color, gameId, players);
            }}
          onCancel={() => setIsMatchmakingOpen(false)}
        />
      )}

      {privateRoomMode && !colorPickerMode && (
        <PrivateRoomModal
          mode={privateRoomMode}
          profile={userProfile}
          preferredColor={preferredColor}
          onGameStart={(gameId, color, activeColors, players) => {
            setPrivateRoomMode(null);
            onStartGame('online_multiplayer', activeColors, color, gameId, players);
          }}
          onCancel={() => setPrivateRoomMode(null)}
        />
      )}

      {showOnlineModeSelect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-xs shadow-2xl animate-scale-in text-center flex flex-col">
            <h2 className="text-xl font-black text-white mb-6">Select Match Type</h2>
            <div className="flex flex-col gap-3">
              <button 
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all"
                onClick={() => {
                  setShowOnlineModeSelect(false);
                  setOnlineMatchMode(2);
                  setColorPickerMode('online_multiplayer');
                }}
              >
                2 Players (1v1)
              </button>
              <button 
                className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 transition-all"
                onClick={() => {
                  setShowOnlineModeSelect(false);
                  setOnlineMatchMode(4);
                  setColorPickerMode('online_multiplayer');
                }}
              >
                4 Players (Free for All)
              </button>
              <button 
                className="mt-4 text-xs font-bold text-slate-400 hover:text-white transition-colors py-2" 
                onClick={() => setShowOnlineModeSelect(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
