import React from 'react';
import { PlayerColor } from '../../types/player';

interface PlayerAvatarProps {
  avatar: string;
  name: string;
  color: PlayerColor;
  isCurrentTurn: boolean;
  isAi: boolean;
  size?: number; // pixel diameter (default 40px)
}

const COLOR_BORDER: Record<PlayerColor, { ring: string; border: string; glow: string }> = {
  blue: {
    ring: 'ring-[#0878E8]',
    border: 'border-[#0878E8]',
    glow: 'shadow-[0_0_14px_rgba(8,120,232,0.7)]',
  },
  yellow: {
    ring: 'ring-[#FFD21C]',
    border: 'border-[#FFD21C]',
    glow: 'shadow-[0_0_14px_rgba(255,210,28,0.7)]',
  },
  green: {
    ring: 'ring-[#08B83F]',
    border: 'border-[#08B83F]',
    glow: 'shadow-[0_0_14px_rgba(8,184,63,0.7)]',
  },
  red: {
    ring: 'ring-[#F01818]',
    border: 'border-[#F01818]',
    glow: 'shadow-[0_0_14px_rgba(240,24,24,0.7)]',
  },
};

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  avatar,
  color,
  isCurrentTurn,
  isAi,
  size = 40,
}) => {
  const styles = COLOR_BORDER[color];
  const isUrl = avatar?.startsWith('http');

  return (
    <div className="relative select-none shrink-0" style={{ width: `${size}px`, height: `${size}px` }}>
      {/* Outer Glow Ring on Turn */}
      <div
        className={`w-full h-full rounded-full p-[2px] bg-slate-900 border-2 transition-all duration-200 flex items-center justify-center ${
          isCurrentTurn
            ? `${styles.border} ${styles.glow} ring-2 ring-white/60 scale-105`
            : 'border-slate-700/80'
        }`}
      >
        {/* Avatar Interior */}
        <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center overflow-hidden">
          {isUrl ? (
            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-base sm:text-lg leading-none">{avatar}</span>
          )}
        </div>
      </div>

      {/* Turn Pulsing Dot */}
      {isCurrentTurn && (
        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400 border border-slate-950" />
        </span>
      )}

      {/* Bot Tag */}
      {isAi && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1 py-0.2 rounded-full text-[7.5px] font-black uppercase tracking-wider text-slate-200 bg-slate-800 border border-slate-600 shadow-sm whitespace-nowrap">
          BOT
        </span>
      )}
    </div>
  );
};
