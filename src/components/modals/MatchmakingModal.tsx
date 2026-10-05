import React, { useEffect, useState, useRef } from 'react';
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

const PlayerSlot = ({ avatar, name, isFound, delayStr, isLocal }: { avatar?: string, name?: string, isFound: boolean, delayStr?: string, isLocal?: boolean }) => {
  const [spinAngle, setSpinAngle] = useState(0);
  const [tiltAngle, setTiltAngle] = useState(-25);
  const [transitionStyle, setTransitionStyle] = useState('transform 10s linear');
  const [startTime, setStartTime] = useState(Date.now());
  
  useEffect(() => {
    if (isLocal) return;
    
    if (!isFound) {
      // Start endless spin
      const delayMs = delayStr ? parseFloat(delayStr) * 1000 : 0;
      const timeout = setTimeout(() => {
        setTransitionStyle('transform 20s linear');
        setTiltAngle(-25); // Spinning on edge
        setSpinAngle(360 * 60); // 3 spins/sec for 20s
        setStartTime(Date.now());
      }, delayMs);
      return () => clearTimeout(timeout);
    } else {
      // Match found! Calculate deceleration to land flawlessly
      const elapsed = (Date.now() - startTime) / 1000;
      const currentEstimated = elapsed * (360 * 3); 
      // Calculate next multiple of 360, add 2 extra rotations for a dramatic, smooth fall
      const nextTarget = Math.ceil(currentEstimated / 360) * 360 + 720;
      
      setTransitionStyle('transform 2.5s cubic-bezier(0.15, 0.9, 0.25, 1)'); 
      setTiltAngle(0); // Fall flat perfectly
      setSpinAngle(nextTarget); // Land on front face
    }
  }, [isFound, isLocal]);

  return (
    <div className="flex flex-col items-center relative z-10">
      <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white p-1 rounded-sm shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
        <div className="w-full h-full border-2 border-red-600 relative overflow-hidden bg-slate-900 flex items-center justify-center" style={{ perspective: '800px' }}>
          
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15),transparent_70%)]" />
          
          {isLocal ? (
            <img src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=local`} alt={name} className="w-full h-full object-cover relative z-10 animate-fade-in" />
          ) : (
            <div 
              className="relative w-16 h-16 sm:w-20 sm:h-20"
              style={{ 
                transformStyle: 'preserve-3d', 
                transition: transitionStyle,
                transform: `rotateX(${tiltAngle}deg) rotateY(${spinAngle}deg)`
              }}
            >
              {/* Front Face - Opponent Avatar */}
              <div className="absolute inset-0 bg-white border-2 border-emerald-400 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(52,211,153,0.8)] [transform:translateZ(32px)] sm:[transform:translateZ(40px)]">
                <img src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=opponent`} className="w-full h-full object-cover" />
              </div>
              {/* Back Face */}
              <div className="absolute inset-0 bg-slate-800 border-2 border-slate-600 rounded-xl flex items-center justify-center shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] [transform:rotateY(180deg)_translateZ(32px)] sm:[transform:rotateY(180deg)_translateZ(40px)]">
                <span className="text-white text-3xl font-black opacity-80">?</span>
              </div>
              {/* Right Face */}
              <div className="absolute inset-0 bg-slate-800 border-2 border-slate-600 rounded-xl flex items-center justify-center shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] [transform:rotateY(90deg)_translateZ(32px)] sm:[transform:rotateY(90deg)_translateZ(40px)]">
                <span className="text-white text-3xl font-black opacity-80">?</span>
              </div>
              {/* Left Face */}
              <div className="absolute inset-0 bg-slate-800 border-2 border-slate-600 rounded-xl flex items-center justify-center shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] [transform:rotateY(-90deg)_translateZ(32px)] sm:[transform:rotateY(-90deg)_translateZ(40px)]">
                <span className="text-white text-3xl font-black opacity-80">?</span>
              </div>
              {/* Top Face */}
              <div className="absolute inset-0 bg-slate-800 border-2 border-slate-600 rounded-xl flex items-center justify-center shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] [transform:rotateX(90deg)_translateZ(32px)] sm:[transform:rotateX(90deg)_translateZ(40px)]">
                <span className="text-white text-3xl font-black opacity-80">?</span>
              </div>
              {/* Bottom Face */}
              <div className="absolute inset-0 bg-slate-800 border-2 border-slate-600 rounded-xl flex items-center justify-center shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] [transform:rotateX(-90deg)_translateZ(32px)] sm:[transform:rotateX(-90deg)_translateZ(40px)]">
                <span className="text-white text-3xl font-black opacity-80">?</span>
              </div>
            </div>
          )}
          
          <div className="absolute inset-0 shadow-[inset_0_0_24px_rgba(0,0,0,0.8)] pointer-events-none" />
        </div>
      </div>
      <span className="mt-2 text-white font-bold drop-shadow-md min-h-[1.5rem] text-sm sm:text-base text-center">
        {isFound || isLocal ? (name || 'Opponent') : 'Rolling...'}
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
      }, 3500); // 3.5s to let the dice fall perfectly before starting game
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
                 <PlayerSlot avatar={currentUser?.avatar} name={currentUser?.displayName} isFound={true} isLocal={true} />
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-[-1rem]">
                   <VSBadge />
                 </div>
                 <PlayerSlot 
                   avatar={opponents[0]?.profile?.avatar} 
                   name={opponents[0]?.profile?.displayName} 
                   isFound={isMatchFound} 
                   delayStr="0s" 
                 />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-y-10 gap-x-12 relative place-items-center">
                <PlayerSlot avatar={currentUser?.avatar} name={currentUser?.displayName} isFound={true} isLocal={true} />
                <PlayerSlot 
                   avatar={opponents[0]?.profile?.avatar} 
                   name={opponents[0]?.profile?.displayName} 
                   isFound={isMatchFound} 
                   delayStr="0.1s" 
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-[-1rem]">
                   <VSBadge />
                </div>
                <PlayerSlot 
                   avatar={opponents[1]?.profile?.avatar} 
                   name={opponents[1]?.profile?.displayName} 
                   isFound={isMatchFound} 
                   delayStr="0.25s" 
                />
                <PlayerSlot 
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
              <div className="text-emerald-400 font-black text-xl animate-pulse">MATCH FOUND!</div>
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
