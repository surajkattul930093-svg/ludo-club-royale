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

const dummyAvatars = Array.from({ length: 20 }).map((_, i) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 500}`);

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

  const opponentAvatar = isMatchFound 
    ? (foundPlayers.find(p => p.id !== currentUser?.id)?.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=opponent`)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-950/95 backdrop-blur-md animate-fade-in sm:p-4">
      <div className="relative w-full h-full sm:h-auto sm:max-w-md bg-gradient-to-b from-red-800 to-red-950 sm:rounded-[2.5rem] shadow-2xl flex flex-col items-center overflow-hidden border-2 border-red-900/50">
        
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
          <div className="w-full flex flex-col items-center relative">
            
            {/* Local Player */}
            <div className="flex flex-col items-center mb-4 relative z-10">
              <div className="w-28 h-28 bg-white p-1 rounded-sm shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                <div className="w-full h-full border-2 border-red-600 relative overflow-hidden bg-blue-100">
                  <img src={currentUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=local'} alt="Me" className="w-full h-full object-cover" />
                </div>
              </div>
              <span className="mt-2 text-white font-bold drop-shadow-md">{currentUser?.displayName || 'Guest'}</span>
            </div>

            {/* VS Badge */}
            <div className="relative z-20 -my-6">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700 rounded-full flex items-center justify-center p-1 shadow-[0_0_20px_rgba(234,179,8,0.5)] transform -rotate-12">
                <div className="w-full h-full rounded-full border border-yellow-200/50 flex items-center justify-center">
                  <span className="text-2xl font-black text-red-950 italic">VS</span>
                </div>
              </div>
            </div>

            {/* Opponent Slot */}
            <div className="flex flex-col items-center mt-4 relative z-10">
              <div className="w-28 h-28 bg-white p-1 rounded-sm shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                <div className="w-full h-full border-2 border-red-600 relative overflow-hidden bg-slate-200">
                  {isMatchFound ? (
                    <img src={opponentAvatar!} alt="Opponent" className="w-full h-full object-cover animate-scale-in" />
                  ) : (
                    <div className="w-full absolute top-0 left-0 animate-slot-scroll flex flex-col">
                      {dummyAvatars.map((src, idx) => (
                        <img key={idx} src={src} className="w-full h-full object-cover flex-shrink-0" alt="avatar" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <span className="mt-2 text-white font-bold drop-shadow-md min-h-[1.5rem]">
                {isMatchFound ? (foundPlayers.find(p => p.id !== currentUser?.id)?.profile?.displayName || 'Opponent') : '???'}
              </span>
            </div>

          </div>

          {/* Footer Area */}
          <div className="mt-12 flex flex-col items-center">
            {isMatchFound ? (
              <div className="text-emerald-400 font-black text-xl animate-pulse">MATCH FOUND!</div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-yellow-400 font-bold mb-4">
                  <Search className="w-5 h-5 animate-pulse" />
                  <span>SEARCHING FOR PLAYERS...</span>
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
