import React from 'react';
import { PlayerColor, PlayerStatusType } from '../../types/player';

interface PlayerStatusProps {
  status: PlayerStatusType;
  connectionStatus: 'ONLINE' | 'CONNECTING' | 'DISCONNECTED';
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
    if (finishedCount === 4) return 'FINISHED';
    if (isCurrentTurn) {
      if (status === 'ROLLING') return 'ROLLING...';
      if (status === 'MOVING') return 'MOVING...';
      return 'YOUR TURN';
    }
    if (finishedCount > 0) return `${finishedCount}/4 HOME`;
    return 'WAITING';
  };

  const getStatusColor = () => {
    if (finishedCount === 4) return 'text-amber-300';
    if (isCurrentTurn) return 'text-amber-400 font-black animate-pulse';
    return 'text-slate-400 font-medium';
  };

  return (
    <div className="flex items-center gap-1.5 text-[9.5px] leading-tight select-none">
      {/* Realtime Online Indicator Dot */}
      <span
        title={`Connection: ${connectionStatus}`}
        className={`w-1.5 h-1.5 rounded-full ${
          connectionStatus === 'ONLINE'
            ? 'bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.8)]'
            : connectionStatus === 'CONNECTING'
            ? 'bg-amber-400 animate-pulse'
            : 'bg-slate-500'
        }`}
      />

      {/* Contextual Status Label */}
      <span className={`tracking-wider uppercase truncate ${getStatusColor()}`}>
        {getStatusText()}
      </span>
    </div>
  );
};
