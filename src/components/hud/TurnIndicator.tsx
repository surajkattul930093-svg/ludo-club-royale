import React from 'react';
import { Player, PlayerColor } from '../../types/player';

interface TurnIndicatorProps {
  players: Record<PlayerColor, Player>;
  activeColors: PlayerColor[];
  currentTurnColor: PlayerColor;
  winner: PlayerColor | null;
}

const COLOR_ACCENTS: Record<
  PlayerColor,
  {
    border: string;
    bg: string;
    glow: string;
    text: string;
  }
> = {
  blue: {
    border: 'border-[#0878E8]',
    bg: 'bg-[#0878E8]/15',
    glow: 'shadow-[0_0_15px_rgba(8,120,232,0.6)]',
    text: 'text-[#3ba2ff]',
  },
  yellow: {
    border: 'border-[#FFD21C]',
    bg: 'bg-[#FFD21C]/15',
    glow: 'shadow-[0_0_15px_rgba(255,210,28,0.6)]',
    text: 'text-[#ffd21c]',
  },
  green: {
    border: 'border-[#08B83F]',
    bg: 'bg-[#08B83F]/15',
    glow: 'shadow-[0_0_15px_rgba(8,184,63,0.6)]',
    text: 'text-[#4ee87f]',
  },
  red: {
    border: 'border-[#F01818]',
    bg: 'bg-[#F01818]/15',
    glow: 'shadow-[0_0_15px_rgba(240,24,24,0.6)]',
    text: 'text-[#ff6b6b]',
  },
};

export const TurnIndicator: React.FC<TurnIndicatorProps> = ({
  players,
  activeColors,
  currentTurnColor,
  winner,
}) => {
  return (
    <div className="flex items-center justify-between gap-1.5 sm:gap-3 w-full max-w-md mx-auto px-2">
      {activeColors.map((color) => {
        const player = players[color];
        const isCurrent = currentTurnColor === color && !winner;
        const styles = COLOR_ACCENTS[color];
        const finishedTokens = player.finishedCount;

        return (
          <div
            key={color}
            className={`flex-1 flex flex-col items-center py-1.5 px-1 rounded-xl border transition-all duration-200 ${
              isCurrent
                ? `${styles.border} ${styles.bg} ${styles.glow} scale-105 z-10 bg-slate-900/90`
                : 'border-slate-800/80 bg-slate-900/40 opacity-70'
            }`}
          >
            <div className="relative">
              {/* Avatar circular frame */}
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-lg sm:text-xl border-2 ${
                  isCurrent ? styles.border : 'border-slate-700'
                } bg-slate-800 shadow-md`}
              >
                <span>{player.avatar}</span>
              </div>

              {/* Turn pulsing dot */}
              {isCurrent && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border border-slate-900" />
                </span>
              )}

              {/* Finished count chip */}
              {finishedTokens > 0 && (
                <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 font-black text-[9px] px-1 rounded-full border border-amber-200">
                  {finishedTokens}/4
                </span>
              )}
            </div>

            {/* Player Name */}
            <span className="text-[11px] sm:text-xs font-bold truncate max-w-[68px] mt-1 text-slate-200">
              {player.name}
            </span>

            {/* Status / Bot tag */}
            <span className="text-[9px] text-slate-400 font-medium">
              {player.isAi ? 'BOT' : isCurrent ? 'TURN' : 'WAIT'}
            </span>
          </div>
        );
      })}
    </div>
  );
};
