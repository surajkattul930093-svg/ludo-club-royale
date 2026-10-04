import React from 'react';
import { PlayerColor } from '../../types/player';

interface TokenProps {
  id: number;
  color: PlayerColor;
  isMovable?: boolean;
  isSelected?: boolean;
  rotation?: number;
  onClick?: () => void;
  sizePercent?: number; // size relative to cell (e.g. 75%)
  offset?: { x: number; y: number };
}

const COLOR_STYLES: Record<
  PlayerColor,
  {
    outerRing: string;
    innerRing: string;
    domeGradient: string;
    glowColor: string;
    shadow: string;
  }
> = {
  blue: {
    outerRing: 'bg-gradient-to-b from-[#3ba2ff] via-[#0878E8] to-[#044a99] border-[#02316b]',
    innerRing: 'bg-[#065cb5]',
    domeGradient: 'from-[#6ec5ff] via-[#0878E8] to-[#023875]',
    glowColor: 'rgba(8, 120, 232, 0.85)',
    shadow: 'shadow-[0_4px_8px_rgba(4,74,153,0.6)]',
  },
  yellow: {
    outerRing: 'bg-gradient-to-b from-[#fff070] via-[#FFD21C] to-[#d69f00] border-[#996f00]',
    innerRing: 'bg-[#cca000]',
    domeGradient: 'from-[#fff89e] via-[#FFD21C] to-[#b38400]',
    glowColor: 'rgba(255, 210, 28, 0.9)',
    shadow: 'shadow-[0_4px_8px_rgba(180,130,0,0.6)]',
  },
  green: {
    outerRing: 'bg-gradient-to-b from-[#4ee87f] via-[#08B83F] to-[#057829] border-[#034d1a]',
    innerRing: 'bg-[#069934]',
    domeGradient: 'from-[#8bf5ab] via-[#08B83F] to-[#04591e]',
    glowColor: 'rgba(8, 184, 63, 0.85)',
    shadow: 'shadow-[0_4px_8px_rgba(5,120,41,0.6)]',
  },
  red: {
    outerRing: 'bg-gradient-to-b from-[#ff6b6b] via-[#F01818] to-[#9e0505] border-[#6b0202]',
    innerRing: 'bg-[#bf1111]',
    domeGradient: 'from-[#ff9e9e] via-[#F01818] to-[#780303]',
    glowColor: 'rgba(240, 24, 24, 0.85)',
    shadow: 'shadow-[0_4px_8px_rgba(158,5,5,0.6)]',
  },
};

export const Token: React.FC<TokenProps> = ({
  color,
  isMovable = false,
  isSelected = false,
  rotation = 0,
  onClick,
  offset = { x: 0, y: 0 },
}) => {
  const styles = COLOR_STYLES[color];

  return (
    <div
      onClick={isMovable ? onClick : undefined}
      style={{
        color: styles.glowColor,
        
      }}
      className={`relative rounded-full aspect-square flex items-center justify-center select-none transition-transform duration-150 ${
        isMovable
          ? 'cursor-pointer animate-pulse-glow z-30 scale-105 hover:scale-110 active:scale-95'
          : 'cursor-default'
      } ${isSelected ? 'ring-4 ring-white ring-offset-2 scale-110 z-40' : ''}`}
    >
      {/* Outer Raised 3D Bevel Rim */}
      <div
        style={{ transform: `rotate(${-rotation}deg)` }}
        className={`w-full h-full rounded-full p-[2.5px] border ${styles.outerRing} ${styles.shadow} flex items-center justify-center`}
      >
        {/* Deep Recessed Ring */}
        <div
          className={`w-full h-full rounded-full p-[2px] ${styles.innerRing} shadow-inner flex items-center justify-center`}
        >
          {/* Raised Center Glossy Dome */}
          <div
            className={`w-full h-full rounded-full bg-gradient-to-br ${styles.domeGradient} relative overflow-hidden shadow-[0_2px_4px_rgba(0,0,0,0.4)] flex items-center justify-center`}
          >
            {/* Top-Left Specular Glass Reflection */}
            <div className="absolute top-[10%] left-[14%] w-[46%] h-[32%] bg-white/70 rounded-full blur-[0.6px] rotate-[-25deg] pointer-events-none" />

            {/* Bottom-Right Subsurface Scattering Glow */}
            <div className="absolute bottom-[8%] right-[12%] w-[35%] h-[25%] bg-white/20 rounded-full blur-[1px] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Movable Crown/Sparkle Indicator */}
      {isMovable && (
        <div style={{ transform: `translate(-50%, 0) rotate(${-rotation}deg)`, top: rotation === 180 ? 'auto' : '-0.5rem', bottom: rotation === 180 ? '-0.5rem' : 'auto' }} className="absolute left-1/2 bg-amber-400 text-slate-950 font-black text-[9px] px-1 py-0.2 rounded-full border border-amber-200 shadow-md animate-bounce pointer-events-none whitespace-nowrap">
          TAP
        </div>
      )}
    </div>
  );
};





