import React from 'react';
import { PlayerColor } from '../../types/player';
import { BOARD_COLORS } from '../../game/boardCoordinates';

interface PlayerHomeProps {
  color: PlayerColor;
  gridArea: string; // e.g. "1 / 1 / 7 / 7"
}

const BASE_CONFIGS: Record<
  PlayerColor,
  {
    bgColor: string;
    filigreeColor: string;
    innerBg: string;
    borderColor: string;
  }
> = {
  blue: {
    bgColor: BOARD_COLORS.blue,
    filigreeColor: '#4facfe',
    innerBg: '#EAF4FE',
    borderColor: '#0556a8',
  },
  yellow: {
    bgColor: BOARD_COLORS.yellow,
    filigreeColor: '#fff176',
    innerBg: '#FFFDF0',
    borderColor: '#cfa200',
  },
  green: {
    bgColor: BOARD_COLORS.green,
    filigreeColor: '#69f0ae',
    innerBg: '#EBF9F0',
    borderColor: '#057d2b',
  },
  red: {
    bgColor: BOARD_COLORS.red,
    filigreeColor: '#ff8a80',
    innerBg: '#FEEAEA',
    borderColor: '#ad1111',
  },
};

/**
 * Botanical leaf flourish SVG for the 4 corners of the base
 */
const CornerFiligree: React.FC<{
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  color: string;
}> = ({ position, color }) => {
  const rotation =
    position === 'top-left'
      ? 'rotate-0'
      : position === 'top-right'
      ? 'rotate-90'
      : position === 'bottom-right'
      ? 'rotate-180'
      : '-rotate-90';

  return (
    <svg
      viewBox="0 0 50 50"
      className={`w-5 h-5 md:w-7 md:h-7 opacity-75 ${rotation} pointer-events-none drop-shadow-sm`}
    >
      {/* Triple leaf flourish matching reference board */}
      <path
        d="M 5 5 C 15 10, 22 22, 25 35 C 20 28, 12 24, 5 25 C 8 20, 8 12, 5 5 Z"
        fill={color}
      />
      <path
        d="M 12 5 C 24 12, 34 24, 40 38 C 30 33, 22 28, 18 20 C 18 14, 15 8, 12 5 Z"
        fill={color}
      />
      <circle cx="8" cy="8" r="2.5" fill={color} />
      <circle cx="16" cy="14" r="2" fill={color} />
    </svg>
  );
};

export const PlayerHome: React.FC<PlayerHomeProps> = ({ color, gridArea }) => {
  const config = BASE_CONFIGS[color];

  return (
    <div
      style={{
        gridArea,
        backgroundColor: config.bgColor,
      }}
      className="relative w-full h-full p-[4%] flex items-center justify-center border border-black/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)] select-none overflow-hidden"
    >
      {/* 4 Corner Leaf Flourishes */}
      <div className="absolute top-1 left-1">
        <CornerFiligree position="top-left" color={config.filigreeColor} />
      </div>
      <div className="absolute top-1 right-1">
        <CornerFiligree position="top-right" color={config.filigreeColor} />
      </div>
      <div className="absolute bottom-1 left-1">
        <CornerFiligree position="bottom-left" color={config.filigreeColor} />
      </div>
      <div className="absolute bottom-1 right-1">
        <CornerFiligree position="bottom-right" color={config.filigreeColor} />
      </div>

      {/* Central White Inset Frame (4x4 cells proportion) */}
      <div
        style={{
          backgroundColor: config.innerBg,
        }}
        className="relative w-[72%] h-[72%] rounded-2xl bg-white border-[6px] border-white shadow-[0_4px_12px_rgba(0,0,0,0.25),inset_0_2px_6px_rgba(0,0,0,0.08)] grid grid-cols-2 grid-rows-2 p-[6%] gap-[12%] items-center justify-items-center"
      >
        {/* 4 Circular Token Sockets */}
        {[0, 1, 2, 3].map((socketIndex) => (
          <div
            key={socketIndex}
            className="w-full h-full rounded-full bg-gradient-to-br from-slate-200 via-white to-slate-300 border-2 border-slate-300/80 shadow-[inset_0_3px_6px_rgba(0,0,0,0.25),0_1px_2px_rgba(255,255,255,0.8)] flex items-center justify-center relative"
          >
            {/* Soft inner socket ring */}
            <div className="w-[78%] h-[78%] rounded-full bg-slate-100/90 shadow-inner" />
          </div>
        ))}
      </div>
    </div>
  );
};
