import React, { useEffect, useState } from 'react';
import { socketService } from '../../services/SocketService';
import { authService } from '../../services/AuthService';
import { PlayerColor } from '../../types/player';
import { X, Search, Clock, Globe } from 'lucide-react';

interface MatchmakingModalProps {
  mode?: 2 | 4;
  preferredColor?: PlayerColor;
  onMatchFound: (gameId: string, assignedColor: PlayerColor, activeColors: PlayerColor[], players: any[]) => void;
  onCancel: () => void;
}


const dummyAvatars = Array.from({ length: 6 }).map((_, i) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 600}`);

const VSBadge = () => (
  <div className="w-16 h-16 bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700 rounded-full flex items-center justify-center p-1 shadow-[0_0_20px_rgba(234,179,8,0.5)] transform -rotate-12">
    <div className="w-full h-full rounded-full border border-yellow-200/50 flex items-center justify-center">
      <span className="text-2xl font-black text-red-950 italic">VS</span>
    </div>
  </div>
);

export const MatchmakingModal: React.FC<MatchmakingModalProps> = ({ mode = 2, preferredColor, onMatchFound, onCancel }) => {
  const [seconds, setSeconds] = useState(0);
  const [isMatchFound, setIsMatchFound] = useState(false);
  const [foundPlayers, setFoundPlayers] = useState<any[]>([]);
  
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    socketService.connect();
    socketService.joinMatchmaking(mode, currentUser, preferredColor);

    const handleMatchFound = (data: { gameId: string; assignedColor: PlayerColor; players: {id: string, color: PlayerColor, profile?: any}[] }) => {
      setIsMatchFound(true);
      setFoundPlayers(data.players);
      const activeColors = data.players.map(p => p.color);
      setTimeout(() => {
        onMatchFound(data.gameId, data.assignedColor, activeColors, data.players);
      }, 2500);
    };

    socketService.socket?.on('match_found', handleMatchFound);

    const timer = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
      socketService.socket?.off('match_found', handleMatchFound);
      if (!isMatchFound) {
        socketService.leaveMatchmaking();
      }
    };
  }, [mode, isMatchFound]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const opponents = foundPlayers.filter(p => p.id !== socketService.socket?.id);

  const PlayerSlot = ({ avatar, name, isFound, delayStr, isLocal }: { avatar?: string, name?: string, isFound: boolean, delayStr?: string, isLocal?: boolean }) => {
    const diceAnimClass = isLocal ? '' : (isFound ? 'animate-dice-stop' : 'animate-dice-spin-wild');
    
    return (
      <div className="flex flex-col items-center relative z-10">
        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white p-1 rounded-sm shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
          <div className="w-full h-full border-2 border-red-600 relative overflow-hidden bg-slate-800 flex items-center justify-center" style={{ perspective: '800px' }}>
            
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15),transparent_70%)]" />
            
            {/* 3D Spinning Dice containing avatars */}
            <div className={`relative w-16 h-16 sm:w-20 sm:h-20 ${diceAnimClass}`} style={{ animationDelay: delayStr }}>
              
              {/* Front - Target Avatar */}
              <div className="dice-face bg-slate-200 [transform:translateZ(32px)] sm:[transform:translateZ(40px)] overflow-hidden">
                <img src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=opponent`} alt={name} className="w-full h-full object-cover" />
              </div>
              
              {/* Back */}
              <div className="dice-face bg-slate-200 [transform:rotateY(180deg)_translateZ(32px)] sm:[transform:rotateY(180deg)_translateZ(40px)] overflow-hidden">
                <img src={dummyAvatars[1]} className="w-full h-full object-cover" />
              </div>
              
              {/* Right */}
              <div className="dice-face bg-slate-200 [transform:rotateY(90deg)_translateZ(32px)] sm:[transform:rotateY(90deg)_translateZ(40px)] overflow-hidden">
                <img src={dummyAvatars[2]} className="w-full h-full object-cover" />
              </div>
              
              {/* Left */}
              <div className="dice-face bg-slate-200 [transform:rotateY(-90deg)_translateZ(32px)] sm:[transform:rotateY(-90deg)_translateZ(40px)] overflow-hidden">
                <img src={dummyAvatars[3]} className="w-full h-full object-cover" />
              </div>
              
              {/* Top */}
              <div className="dice-face bg-slate-200 [transform:rotateX(90deg)_translateZ(32px)] sm:[transform:rotateX(90deg)_translateZ(40px)] overflow-hidden">
                <img src={dummyAvatars[4]} className="w-full h-full object-cover" />
              </div>
              
              {/* Bottom */}
              <div className="dice-face bg-slate-200 [transform:rotateX(-90deg)_translateZ(32px)] sm:[transform:rotateX(-90deg)_translateZ(40px)] overflow-hidden">
                <img src={dummyAvatars[5]} className="w-full h-full object-cover" />
              </div>
              
            </div>
            
            <div className="absolute inset-0 shadow-[inset_0_0_24px_rgba(0,0,0,0.8)] pointer-events-none" />
          </div>
        </div>
        <span className="mt-2 text-white font-bold drop-shadow-md min-h-[1.5rem] text-sm sm:text-base text-center">
          {isFound || isLocal ? (name || 'Opponent') : 'Rolling...'}
        </span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-950/95 backdrop-blur-md animate-fade-in sm:p-4">
      <div className="relative w-full h-full sm:h-auto sm:max-w-lg bg-gradient-to-b from-red-800 to-red-950 sm:rounded-[2.5rem] shadow-2xl flex flex-col items-center overflow-hidden border-2 border-red-900/50">
        
        {/* Top Header Section */}
        <div className="w-full pt-10 pb-6 px-6 flex flex-col items-center">
          
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-600 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] mb-6 tracking-wide text-center">
            ONLINE MULTIPLAYER
          </h1>

          {/* Info Table */}
          <div className="w-full bg-red-900/80 rounded-xl border border-red-700/50 overflow-hidden shadow-inner mb-8">
            <div className="flex w-full divide-x divide-red-800">
              <div className="flex-1 p-3 text-center">
                <div className="text-red-200 text-xs font-bold uppercase tracking-wider mb-1">Game Mode</div>
                <div className="text-white font-black flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center text-[10px] text-yellow-900">👑</span>
                  Classic
                </div>
              </div>
              <div className="flex-1 p-3 text-center">
                <div className="text-red-200 text-xs font-bold uppercase tracking-wider mb-1">Entry Amount</div>
                <div className="text-yellow-400 font-black text-lg">
                  1,000
                </div>
              </div>
            </div>
          </div>

          {/* Matchmaking Arena */}
          {mode === 2 ? (
            <div className="w-full flex flex-col items-center relative">
              <PlayerSlot avatar={currentUser?.avatar} name={currentUser?.displayName || 'Guest'} isFound={true} />
              <div className="relative z-20 -my-4 sm:-my-6">
                <VSBadge />
              </div>
              <PlayerSlot avatar={opponents[0]?.profile?.avatar} name={opponents[0]?.profile?.displayName} isFound={isMatchFound} />
            </div>
          ) : (
            <div className="w-full grid grid-cols-2 gap-x-8 gap-y-4 sm:gap-x-12 sm:gap-y-8 relative place-items-center">
              <PlayerSlot avatar={currentUser?.avatar} name={currentUser?.displayName || 'Guest'} isFound={true} />
              <PlayerSlot avatar={opponents[0]?.profile?.avatar} name={opponents[0]?.profile?.displayName} isFound={isMatchFound} delayStr="-0.3s" />
              <PlayerSlot avatar={opponents[1]?.profile?.avatar} name={opponents[1]?.profile?.displayName} isFound={isMatchFound} delayStr="-0.6s" />
              <PlayerSlot avatar={opponents[2]?.profile?.avatar} name={opponents[2]?.profile?.displayName} isFound={isMatchFound} delayStr="-0.9s" />
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <VSBadge />
              </div>
            </div>
          )}

          {/* Footer Area */}
          <div className="mt-8 flex flex-col items-center">
            {isMatchFound ? (
              <div className="text-emerald-400 font-black text-xl animate-pulse">MATCH FOUND!</div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-yellow-400 font-bold mb-4">
                  <Search className="w-5 h-5 animate-pulse" />
                  <span>SEARCHING FOR PLAYERS...</span>
                </div>
                
                <div className="bg-black/50 border border-slate-700 rounded-full px-6 py-2 flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-white font-mono font-bold text-xl">{formatTime(seconds)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Back/Cancel Button */}
        <button 
          onClick={() => { socketService.leaveMatchmaking(); onCancel(); }}
          className="absolute bottom-6 left-6 w-12 h-12 bg-blue-600 border-2 border-blue-400 rounded-lg shadow-lg flex items-center justify-center hover:bg-blue-500 active:scale-95 transition-all"
        >
          <X className="w-8 h-8 text-white font-black" />
        </button>

      </div>
    </div>
  );
};






