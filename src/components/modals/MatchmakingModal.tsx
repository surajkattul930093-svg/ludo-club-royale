import React, { useEffect, useState } from 'react';
import { Button } from '../common/Button';
import { Globe, Users, X } from 'lucide-react';
import { socketService } from '../../services/SocketService';
import { authService } from '../../services/AuthService';
import { PlayerColor } from '../../types/player';

interface MatchmakingModalProps {
  mode?: 2 | 4;
  onMatchFound: (gameId: string, assignedColor: PlayerColor, activeColors: PlayerColor[], players: any[]) => void;
  onCancel: () => void;
}

export const MatchmakingModal: React.FC<MatchmakingModalProps> = ({ mode = 2, onMatchFound, onCancel }) => {
  const [queueCount, setQueueCount] = useState(1);
  const [isMatchFound, setIsMatchFound] = useState(false);
  const REQUIRED_PLAYERS = mode;

  useEffect(() => {
    socketService.connect();
    socketService.joinMatchmaking(mode, authService.getCurrentUser());

    const handleQueueUpdate = (data: { count: number }) => {
      setQueueCount(data.count);
    };

    const handleMatchFound = (data: { gameId: string; assignedColor: PlayerColor; players: {id: string, color: PlayerColor, profile?: any}[] }) => {
      setIsMatchFound(true);
      const activeColors = data.players.map(p => p.color);
      setTimeout(() => {
        onMatchFound(data.gameId, data.assignedColor, activeColors, data.players);
      }, 1500);
    };

    socketService.socket?.on(`queue_update_${mode}`, handleQueueUpdate);
    socketService.socket?.on('match_found', handleMatchFound);

    return () => {
      socketService.socket?.off(`queue_update_${mode}`, handleQueueUpdate);
      socketService.socket?.off('match_found', handleMatchFound);
      if (!isMatchFound) {
        socketService.leaveMatchmaking();
      }
    };
  }, [mode, isMatchFound]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 w-full max-w-sm shadow-2xl flex flex-col items-center animate-scale-in text-center relative overflow-hidden">
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/20 rounded-full blur-[60px] pointer-events-none" />

        {!isMatchFound ? (
          <>
            <div className="w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-6 animate-pulse">
              <Globe className="w-10 h-10 animate-spin-slow" />
            </div>

            <h2 className="text-2xl font-black text-white mb-2">Finding Match</h2>
            <p className="text-sm text-slate-400 mb-8">
              Searching for {REQUIRED_PLAYERS} global opponents...
            </p>

            <div className="w-full bg-slate-800 rounded-2xl p-4 border border-slate-700 mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-bold text-slate-300">Players in Queue</span>
              </div>
              <span className="text-lg font-black text-blue-400">{queueCount} / {REQUIRED_PLAYERS}</span>
            </div>

            <Button variant="ghost" fullWidth onClick={() => { socketService.leaveMatchmaking(); onCancel(); }} className="text-slate-400 hover:text-white">
              Cancel Search
            </Button>
          </>
        ) : (
          <>
            <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mb-6 animate-bounce-short">
              <Users className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black text-emerald-400 mb-2">Match Found!</h2>
            <p className="text-sm text-slate-400">
              Connecting to game server...
            </p>
          </>
        )}
      </div>
    </div>
  );
};


