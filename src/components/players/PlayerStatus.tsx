import React from 'react';
import { PlayerColor, PlayerStatusType } from '../../types/player';
import { Wifi, WifiOff, Loader } from 'lucide-react';

interface PlayerStatusProps {
  status: PlayerStatusType;
  connectionStatus: 'ONLINE' | 'OFFLINE' | 'SLOW';
  finishedCount: number;
  isCurrentTurn: boolean;
  color: PlayerColor;
}

export const PlayerStatus: React.FC<PlayerStatusProps> = ({
  status,
  connectionStatus,
  finishedCount,
  isCurrentTurn,
}) => {
  const getStatusText = () => {
    if (connectionStatus === 'OFFLINE') return 'OFFLINE (WAITING)';
    if (connectionStatus === 'SLOW') return 'SLOW NET';
    if (finishedCount === 4) return 'FINISHED';
    if (isCurrentTurn) {
      if (status === 'ROLLING') return 'ROLLING...';
      if (status === 'MOVING') return 'MOVING...';
      return 'YOUR TURN';
    }
    if (finishedCount > 0) return ${finishedCount}/4 HOME;
    return 'WAITING';
  };

  const getStatusColor = () => {
    if (connectionStatus === 'OFFLINE') return 'text-red-400 font-bold animate-pulse';
    if (connectionStatus === 'SLOW') return 'text-amber-400 font-bold';
    if (finishedCount === 4) return 'text-amber-300';
    if (isCurrentTurn) return 'text-emerald-300 font-black animate-pulse';
    return 'text-slate-400 font-medium';
  };

  return (
    <div className="flex items-center gap-1 text-[9.5px] leading-tight select-none">
      {/* Realtime Online Indicator Icon/Dot */}
      {connectionStatus === 'ONLINE' ? (
        <span
          title="Online"
          className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.8)] shrink-0"
        />
      ) : connectionStatus === 'SLOW' ? (
        <Wifi className="w-2.5 h-2.5 text-amber-400 shrink-0" title="Slow Network" />
      ) : (
        <WifiOff className="w-2.5 h-2.5 text-red-500 shrink-0" title="Offline" />
      )}

      {/* Contextual Status Label */}
      <span className={	racking-wider uppercase truncate \}>
        {getStatusText()}
      </span>
    </div>
  );
};
