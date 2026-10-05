import React, { useEffect, useState } from 'react';
import { socketService } from '../../services/SocketService';
import { authService } from '../../services/AuthService';
import { PlayerColor } from '../../types/player';
import { X, Search, Clock } from 'lucide-react';

interface MatchmakingModalProps {
  mode?: 2 | 4;
  preferredColor?: PlayerColor;
  onMatchFound: (gameId: string, assignedColor: PlayerColor, activeColors: PlayerColor[], players: any[]) => void;
  onCancel: () => void;
}

const VSBadge = () => (
  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700 rounded-full flex items-center justify-center p-1 shadow-[0_0_20px_rgba(234,179,8,0.5)] transform -rotate-12 relative z-20">
    <div className="w-full h-full rounded-full border border-yellow-200/50 flex items-center justify-center">
      <span className="text-xl sm:text-2xl font-black text-red-950 italic">VS</span>
    </div>
  </div>
);

const dummyAvatars = Array.from({ length: 7 }).map((_, i) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 900}`);

const TrainWindowSlot = ({ avatar, name, isFound, delayStr, isLocal }: { avatar?: string, name?: string, isFound: boolean, delayStr?: string, isLocal?: boolean }) => {
  const [animClass, setAnimClass] = useState('');

  useEffect(() => {
    if (isLocal) return;
    if (!isFound) {
      setAnimClass('animate-[train-fast_0.25s_linear_infinite]');
    } else {
      setAnimClass('animate-[train-stop_1.8s_cubic-bezier(0.1,0.9,0.25,1)_forwards]');
    }
  }, [isFound, isLocal]);

  return (
    <div className="flex flex-col items-center relative z-10">
      <div className="w-24 h-24 sm:w-28 sm:h-28 bg-slate-400 p-2 rounded-[2.5rem] shadow-[0_15px_35px_rgba(0,0,0,0.8)] relative overflow-hidden border-b-4 border-r-4 border-slate-500 border-t-2 border-l-2 border-slate-300">
        
        <div className="w-full h-full bg-slate-900 rounded-[2rem] relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
          
          {isLocal ? (
            <img src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=local`} alt={name} className="w-full h-full object-cover" />
          ) : (
            <>
              {!isFound && (
                <div className="absolute inset-0 z-0">
                  <div className="w-[150%] h-[1px] bg-white/40 absolute top-[15%] animate-[train-fast_0.15s_linear_infinite]" />
                  <div className="w-[200%] h-0.5 bg-white/20 absolute top-[40%] animate-[train-fast_0.1s_linear_infinite]" />
                  <div className="w-[150%] h-[1px] bg-white/50 absolute top-[65%] animate-[train-fast_0.18s_linear_infinite]" />
                  <div className="w-[250%] h-1 bg-white/30 absolute top-[85%] animate-[train-fast_0.25s_linear_infinite]" />
                </div>
              )}

              <div 
                className={`absolute inset-0 w-full h-full flex items-center justify-center ${animClass}`}
                style={{ animationDelay: !isFound ? delayStr : '0s' }}
              >
                {!isFound ? (
                  <div className="w-[200%] h-full flex items-center gap-12 opacity-50 blur-[1px] scale-x-[1.5]">
                     <img src={dummyAvatars[1]} className="w-16 h-16 object-cover rounded-full mix-blend-luminosity" />
                     <img src={dummyAvatars[2]} className="w-16 h-16 object-cover rounded-full mix-blend-luminosity" />
                  </div>
                ) : (
                  <img src={avatar || dummyAvatars[0]} className="w-full h-full object-cover" />
                )}
              </div>
            </>
          )}

          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/30 pointer-events-none rounded-[2rem] shadow-[inset_2px_2px_5px_rgba(255,255,255,0.2)]" />
          <div className="absolute top-1.5 left-4 right-4 h-1 bg-white/40 rounded-full blur-[1px] opacity-70" />
        </div>
      </div>
      
      <span className="mt-3 text-white font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] min-h-[1.5rem] text-sm sm:text-base text-center bg-black/60 px-4 py-1 rounded-full border border-slate-700">
        {isFound || isLocal ? (name || 'Opponent') : 'Searching...'}
      </span>
    </div>
  );
};

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
      }, 3500); 
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
        
        <div className="w-full pt-10 pb-8 px-4 sm:px-8 flex flex-col items-center">
          
          <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-600 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] mb-10 tracking-wide text-center">
            ONLINE MULTIPLAYER
          </h1>

          <div className="relative w-full max-w-sm mb-12">
            {mode === 2 ? (
              <div className="flex justify-between items-center px-4">
                 <TrainWindowSlot avatar={currentUser?.avatar} name={currentUser?.displayName} isFound={true} isLocal={true} />
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-[-1rem]">
                   <VSBadge />
                 </div>
                 <TrainWindowSlot 
                   avatar={opponents[0]?.profile?.avatar} 
                   name={opponents[0]?.profile?.displayName} 
                   isFound={isMatchFound} 
                   delayStr="0s" 
                 />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-y-10 gap-x-12 relative place-items-center">
                <TrainWindowSlot avatar={currentUser?.avatar} name={currentUser?.displayName} isFound={true} isLocal={true} />
                <TrainWindowSlot 
                   avatar={opponents[0]?.profile?.avatar} 
                   name={opponents[0]?.profile?.displayName} 
                   isFound={isMatchFound} 
                   delayStr="0.1s" 
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-[-1rem]">
                   <VSBadge />
                </div>
                <TrainWindowSlot 
                   avatar={opponents[1]?.profile?.avatar} 
                   name={opponents[1]?.profile?.displayName} 
                   isFound={isMatchFound} 
                   delayStr="0.25s" 
                />
                <TrainWindowSlot 
                   avatar={opponents[2]?.profile?.avatar} 
                   name={opponents[2]?.profile?.displayName} 
                   isFound={isMatchFound} 
                   delayStr="0.4s" 
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col items-center">
            {isMatchFound ? (
              <div className="text-emerald-400 font-black text-xl animate-pulse">TRAIN STOPPING...</div>
            ) : (
              <>
                <div className="bg-black/50 border border-slate-700 rounded-full px-6 py-2 flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
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
