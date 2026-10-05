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

const dummyAvatars = Array.from({ length: 8 }).map((_, i) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 800}`);

const mapNodes = [
  { top: '40%', left: '20%' },
  { top: '70%', left: '50%' },
  { top: '40%', left: '80%' },
  { top: '20%', left: '40%' }, 
  { top: '80%', left: '25%' },
  { top: '25%', left: '70%' },
  { top: '65%', left: '85%' },
  { top: '50%', left: '10%' },
];

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
      }, 3000); 
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-950/95 backdrop-blur-md animate-fade-in sm:p-4">
      <div className="relative w-full h-full sm:h-auto sm:max-w-xl bg-gradient-to-b from-red-800 to-red-950 sm:rounded-[2.5rem] shadow-2xl flex flex-col items-center overflow-hidden border-2 border-red-900/50">
        
        <div className="w-full pt-8 pb-6 px-6 flex flex-col items-center">
          
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-600 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] mb-6 tracking-wide text-center">
            ONLINE MULTIPLAYER
          </h1>

          {/* Local Player */}
          <div className="flex flex-col items-center relative z-20 mb-6">
            <div className={`w-24 h-24 bg-white p-1 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.8)] relative z-20 transition-all duration-500 ${isMatchFound ? 'shadow-[0_0_30px_rgba(52,211,153,0.8)] border-2 border-emerald-400' : ''}`}>
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-900">
                <img src={currentUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=local'} alt="Me" className="w-full h-full object-cover" />
              </div>
            </div>
            <span className="mt-2 text-white font-black text-sm drop-shadow-md bg-black/50 px-4 py-1 rounded-full">
              {currentUser?.displayName || 'Guest'}
            </span>
          </div>

          {/* World Map Container */}
          <div className="w-full h-64 sm:h-72 relative bg-blue-950/50 border border-blue-500/30 rounded-3xl shadow-[inset_0_0_50px_rgba(30,58,138,0.5)]">
            <Globe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] text-blue-500/20 stroke-[0.5] animate-spin-slow pointer-events-none" />
            
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
            
            {!isMatchFound && mapNodes.map((node, idx) => (
              <div 
                key={idx} 
                className="absolute w-8 h-8 rounded-full border border-blue-400/50 overflow-hidden transform -translate-x-1/2 -translate-y-1/2 animate-pulse bg-slate-900"
                style={{ top: node.top, left: node.left, animationDelay: `${idx * 0.2}s` }}
              >
                <img src={dummyAvatars[idx]} className="w-full h-full object-cover opacity-60 mix-blend-luminosity" />
              </div>
            ))}

            {isMatchFound && opponents.map((opp, idx) => (
              <div 
                key={idx} 
                className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 z-20 animate-pop-out"
                style={{ top: mapNodes[idx].top, left: mapNodes[idx].left }}
              >
                <div className="w-16 h-16 rounded-full border-2 border-emerald-400 bg-white p-0.5 shadow-[0_0_20px_rgba(52,211,153,0.8)]">
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-900">
                    <img src={opp?.profile?.avatar || dummyAvatars[idx]} className="w-full h-full object-cover" />
                  </div>
                </div>
                <span className="mt-1 text-xs text-white font-bold bg-black/60 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {opp?.profile?.displayName || `Player ${idx + 2}`}
                </span>
              </div>
            ))}
            
            {isMatchFound && (
              <svg className="absolute inset-0 w-full h-full overflow-visible z-10 pointer-events-none drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]">
                {opponents.map((opp, idx) => (
                  <line 
                    key={idx}
                    x1="50%" 
                    y1="-80px" 
                    x2={mapNodes[idx].left} 
                    y2={mapNodes[idx].top}
                    stroke="#34d399" 
                    strokeWidth="3"
                    className="animate-laser"
                  />
                ))}
              </svg>
            )}
          </div>

          <div className="mt-6 flex flex-col items-center">
            {isMatchFound ? (
              <div className="text-emerald-400 font-black text-xl animate-pulse">ESTABLISHING CONNECTION...</div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-yellow-400 font-bold mb-4">
                  <Search className="w-5 h-5 animate-pulse" />
                  <span>SCANNING GLOBAL NETWORK...</span>
                </div>
                
                <div className="bg-black/50 border border-slate-700 rounded-full px-6 py-2 flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white font-mono font-bold text-xl">{formatTime(seconds)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <button 
          onClick={() => { socketService.leaveMatchmaking(); onCancel(); }}
          className="absolute bottom-6 left-6 w-12 h-12 bg-red-600 border-2 border-red-400 rounded-lg shadow-lg flex items-center justify-center hover:bg-red-500 active:scale-95 transition-all z-30"
        >
          <X className="w-8 h-8 text-white font-black" />
        </button>

      </div>
    </div>
  );
};
