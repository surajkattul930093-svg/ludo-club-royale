import React, { useMemo } from 'react';
import { PlayerColor } from '../../types/player';
import { Token as TokenType } from '../../types/token';
import { AnimatingTokenInfo } from '../../types/game';
import {
  BOARD_COLORS,
  BOARD_PATH,
  HOME_PATHS,
  HOME_BASE_SOCKETS,
  CENTER_HOME_COORDS,
  getLogicalPosition,
  gridToScreenPercentage,
} from '../../game/boardPath';
import { PlayerHome } from './PlayerHome';
import { SafeCellStar } from './SafeCell';
import { Token } from '../tokens/Token';
import { ParticleBurst } from '../effects/ParticleBurst';
import { Crown } from 'lucide-react';

interface GameBoardProps {
  tokens: TokenType[];
  animatingToken: AnimatingTokenInfo | null;
  isAnimating: boolean;
  movableTokenIds: number[];
  selectedTokenId: number | null;
  currentTurnColor: PlayerColor;
  debugBoard?: boolean;
  boardRotation?: number;
  onTokenClick: (tokenId: number) => void;
  explosions?: { id: string, index: number, color: PlayerColor }[];
  finishedPlayers?: { color: PlayerColor, rank: number }[];
}

/**
 * Gold Corner Star Medallion in the outer border
 */
const CornerStarMedallion: React.FC<{
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}> = ({ position }) => {
  const posClasses =
    position === 'top-left'
      ? 'top-1.5 left-1.5'
      : position === 'top-right'
      ? 'top-1.5 right-1.5'
      : position === 'bottom-left'
      ? 'bottom-1.5 left-1.5'
      : 'bottom-1.5 right-1.5';

  return (
    <div
      className={`absolute ${posClasses} w-4 h-4 md:w-5 md:h-5 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border border-amber-100 shadow-[0_2px_4px_rgba(0,0,0,0.5)] flex items-center justify-center pointer-events-none z-20`}
    >
      <svg viewBox="0 0 24 24" className="w-3 h-3 text-amber-950 fill-current">
        <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
      </svg>
    </div>
  );
};

/**
 * Clean straight path arrow pointing in the travel direction
 */
const StraightPathArrow: React.FC<{ direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' }> = ({
  direction,
}) => {
  const rotation =
    direction === 'RIGHT'
      ? 'rotate-0'
      : direction === 'DOWN'
      ? 'rotate-90'
      : direction === 'LEFT'
      ? 'rotate-180'
      : '-rotate-90';

  return (
    <svg viewBox="0 0 32 32" className={`w-[72%] h-[72%] ${rotation} pointer-events-none`}>
      <line
        x1="4"
        y1="16"
        x2="22"
        y2="16"
        stroke="#111827"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <polygon points="28,16 19,10 19,22" fill="#111827" />
      <rect x="4" y="13" width="3" height="6" fill="#111827" rx="0.5" />
    </svg>
  );
};

/**
 * Curved corner turn arrow showing track direction around the corner
 */
const CurvedTurnArrow: React.FC<{
  type: 'TOP_TURN' | 'RIGHT_TURN' | 'BOTTOM_TURN' | 'LEFT_TURN';
}> = ({ type }) => {
  if (type === 'TOP_TURN') {
    return (
      <div className="absolute w-[200%] h-full top-0 left-0 flex items-center justify-center pointer-events-none z-10">
        <svg viewBox="0 0 72 36" className="w-[90%] h-[85%]">
          <path d="M 18 36 L 18 16 C 18 4, 54 4, 54 16 L 54 22" fill="none" stroke="#111827" strokeWidth="3" strokeLinecap="round" />
          <polygon points="54,28 49,20 59,20" fill="#111827" />
          <polygon points="12,36 24,36 18,28" fill="#111827" />
        </svg>
      </div>
    );
  }

  if (type === 'RIGHT_TURN') {
    return (
      <div className="absolute w-full h-[200%] top-0 left-0 flex items-center justify-center pointer-events-none z-10">
        <svg viewBox="0 0 36 72" className="w-[85%] h-[90%]">
          <path d="M 0 18 L 20 18 C 32 18, 32 54, 20 54 L 14 54" fill="none" stroke="#111827" strokeWidth="3" strokeLinecap="round" />
          <polygon points="8,54 16,49 16,59" fill="#111827" />
          <polygon points="0,12 0,24 8,18" fill="#111827" />
        </svg>
      </div>
    );
  }

  if (type === 'BOTTOM_TURN') {
    return (
      <div className="absolute w-[200%] h-full top-0 right-0 flex items-center justify-center pointer-events-none z-10">
        <svg viewBox="0 0 72 36" className="w-[90%] h-[85%]">
          <path d="M 54 0 L 54 20 C 54 32, 18 32, 18 20 L 18 14" fill="none" stroke="#111827" strokeWidth="3" strokeLinecap="round" />
          <polygon points="18,8 13,16 23,16" fill="#111827" />
          <polygon points="48,0 60,0 54,8" fill="#111827" />
        </svg>
      </div>
    );
  }

  return (
    <div className="absolute w-full h-[200%] bottom-0 left-0 flex items-center justify-center pointer-events-none z-10">
      <svg viewBox="0 0 36 72" className="w-[85%] h-[90%]">
        <path d="M 36 54 L 16 54 C 4 54, 4 18, 16 18 L 22 18" fill="none" stroke="#111827" strokeWidth="3" strokeLinecap="round" />
        <polygon points="28,18 20,13 20,23" fill="#111827" />
        <polygon points="36,48 36,60 28,54" fill="#111827" />
      </svg>
    </div>
  );
};

const FROST_PATH: Record<PlayerColor, string[]> = {
  blue: ['8 / 6 / 9 / 7', '8 / 5 / 9 / 6', '8 / 4 / 9 / 5', '8 / 3 / 9 / 4', '8 / 2 / 9 / 3', '7 / 2 / 8 / 3', '1 / 1 / 7 / 7'],
  yellow: ['6 / 8 / 7 / 9', '5 / 8 / 6 / 9', '4 / 8 / 5 / 9', '3 / 8 / 4 / 9', '2 / 8 / 3 / 9', '2 / 9 / 3 / 10', '1 / 10 / 7 / 16'],
  green: ['8 / 10 / 9 / 11', '8 / 11 / 9 / 12', '8 / 12 / 9 / 13', '8 / 13 / 9 / 14', '8 / 14 / 9 / 15', '9 / 14 / 10 / 15', '10 / 10 / 16 / 16'],
  red: ['10 / 8 / 11 / 9', '11 / 8 / 12 / 9', '12 / 8 / 13 / 9', '13 / 8 / 14 / 9', '14 / 8 / 15 / 9', '14 / 7 / 15 / 8', '10 / 1 / 16 / 7']
};

const FROST_CENTER: Record<PlayerColor, string> = {
  blue: 'polygon(0% 100%, 0% 0%, 50% 50%)',
  yellow: 'polygon(0% 0%, 100% 0%, 50% 50%)',
  green: 'polygon(100% 0%, 100% 100%, 50% 50%)',
  red: 'polygon(100% 100%, 0% 100%, 50% 50%)'
};

const GoldenFrostOverlay: React.FC<{ color: PlayerColor; rank: number }> = ({ color, rank }) => {
  const path = FROST_PATH[color];
  const centerClip = FROST_CENTER[color];
  const cellClass = `frost-cell-rank-${rank <= 3 ? rank : 3}`;
  return (
    <>
      <div 
        style={{ gridArea: '7 / 7 / 10 / 10', clipPath: centerClip, animationDelay: '0s' }}
        className={cellClass}
      >
        <div className="frost-star" style={{ width: '15%', height: '15%', top: '45%', left: '45%', animationDelay: '0.2s' }} />
        <div className="frost-star" style={{ width: '10%', height: '10%', top: '35%', left: '55%', animationDelay: '0.6s' }} />
        <div className="frost-star" style={{ width: '12%', height: '12%', top: '55%', left: '35%', animationDelay: '1.1s' }} />
      </div>
      {path.map((gridArea, i) => (
        <div
          key={gridArea}
          style={{ gridArea, animationDelay: `${(i + 1) * 0.8}s` }}
          className={`border border-white/30 ${cellClass} ${i === 6 ? 'frost-yard' : ''} flex items-center justify-center relative overflow-hidden`}
        >
          <div className="frost-star" style={{ width: '40%', height: '40%', top: '10%', left: '10%', animationDelay: `${(i+1) * 0.8 + 0.1}s` }} />
          <div className="frost-star" style={{ width: '30%', height: '30%', bottom: '15%', right: '15%', animationDelay: `${(i+1) * 0.8 + 0.5}s` }} />
          <div className="frost-star" style={{ width: '25%', height: '25%', top: '20%', right: '20%', animationDelay: `${(i+1) * 0.8 + 0.9}s` }} />
          <div className="frost-star" style={{ width: '35%', height: '35%', bottom: '10%', left: '25%', animationDelay: `${(i+1) * 0.8 + 1.3}s` }} />
          <div className="frost-star" style={{ width: '20%', height: '20%', top: '45%', left: '45%', animationDelay: `${(i+1) * 0.8 + 0.3}s` }} />
          
          {i === 6 && (
            <>
               <div className="frost-star" style={{ width: '15%', height: '15%', top: '40%', left: '40%', animationDelay: `${(i+1) * 0.8 + 1.2}s` }} />
               <div className="frost-star" style={{ width: '20%', height: '20%', top: '20%', right: '30%', animationDelay: `${(i+1) * 0.8 + 0.8}s` }} />
               <div className="frost-star" style={{ width: '18%', height: '18%', bottom: '30%', left: '20%', animationDelay: `${(i+1) * 0.8 + 1.6}s` }} />
               <div className="frost-star" style={{ width: '22%', height: '22%', bottom: '20%', right: '40%', animationDelay: `${(i+1) * 0.8 + 0.4}s` }} />
               <div className="frost-star" style={{ width: '16%', height: '16%', top: '60%', right: '15%', animationDelay: `${(i+1) * 0.8 + 1.8}s` }} />
               <div className="frost-star" style={{ width: '25%', height: '25%', top: '15%', left: '30%', animationDelay: `${(i+1) * 0.8 + 0.7}s` }} />
            </>
          )}
        </div>
      ))}
    </>
  );
};

export const GameBoard: React.FC<GameBoardProps> = ({
  tokens,
  animatingToken,
  isAnimating,
  movableTokenIds,
  selectedTokenId,
  currentTurnColor,
  debugBoard = false,
  boardRotation = 0,
  onTokenClick,
  explosions = [],
  finishedPlayers = [],
}) => {
  // Resolve current visual position for each token (accounting for real-time animatingToken)
  const tokenVisualPositions = useMemo(() => {
    return tokens.map((token) => {
      if (
        animatingToken &&
        animatingToken.color === token.color &&
        animatingToken.tokenId === token.id
      ) {
        return {
          token,
          row: animatingToken.row,
          col: animatingToken.col,
        };
      }
      const logPos = getLogicalPosition(
        token.color,
        token.id,
        token.state,
        token.stepsFromStart
      );
      return {
        token,
        row: logPos.row,
        col: logPos.col,
      };
    });
  }, [tokens, animatingToken]);

  // Group tokens by cell coordinates to calculate non-overlapping offsets
  const tokenOffsets = useMemo(() => {
    const cellGroups: Record<string, { key: string; index: number }[]> = {};

    tokenVisualPositions.forEach(({ token, row, col }) => {
      const key = `${token.color}_${token.id}`;
      const cellKey = `${row.toFixed(1)},${col.toFixed(1)}`;
      if (!cellGroups[cellKey]) cellGroups[cellKey] = [];
      cellGroups[cellKey].push({ key, index: cellGroups[cellKey].length });
    });

    const offsets: Record<string, { x: number; y: number; scale: number; index: number }> = {};

    Object.values(cellGroups).forEach((group) => {
      const count = group.length;
      group.forEach(({ key, index }) => {
        if (count === 1) {
          offsets[key] = { x: 0, y: 0, scale: 1, index };
        } else if (count === 2) {
          offsets[key] = index === 0 
            ? { x: -6, y: -6, scale: 0.75, index } 
            : { x: 6, y: 6, scale: 0.75, index };
        } else if (count === 3) {
          const spread = [
            { x: -7, y: -7 },
            { x: 7, y: -7 },
            { x: 0, y: 7 },
          ];
          const pos = spread[index] || { x: 0, y: 0 };
          offsets[key] = { ...pos, scale: 0.65, index };
        } else {
          const spread = [
            { x: -7, y: -7 },
            { x: 7, y: -7 },
            { x: -7, y: 7 },
            { x: 7, y: 7 },
          ];
          const pos = spread[index % 4];
          offsets[key] = { ...pos, scale: 0.65, index };
        }
      });
    });

    return offsets;
  }, [tokenVisualPositions]);



  return (
    <div className="relative w-full max-w-[560px] aspect-square mx-auto p-2 sm:p-3 md:p-3.5 select-none">
      {/* Outer Royal Blue Border with Double Gold Pinstripes */}
      <div className="relative w-full h-full rounded-2xl bg-gradient-to-b from-[#003B94] via-[#054EB8] to-[#002B73] p-1.5 sm:p-2 border-2 border-amber-300 shadow-[0_12px_32px_rgba(0,0,0,0.7),inset_0_2px_4px_rgba(255,255,255,0.4)] flex items-center justify-center">
        {/* Inner Gold Thin Pinstripe */}
        <div className="absolute inset-1 sm:inset-1.5 rounded-xl border border-amber-300/70 pointer-events-none" />

        {/* 4 Corner Star Medallions */}
        <CornerStarMedallion position="top-left" />
        <CornerStarMedallion position="top-right" />
        <CornerStarMedallion position="bottom-left" />
        <CornerStarMedallion position="bottom-right" />

        {/* 15x15 Playing Surface */}
        <div className="relative w-full h-full bg-white rounded-lg overflow-hidden border-2 border-slate-900 shadow-inner">
          <div
            className="w-full h-full grid"
            style={{
              gridTemplateColumns: 'repeat(15, minmax(0, 1fr))',
              gridTemplateRows: 'repeat(15, minmax(0, 1fr))',
            }}
          >
            {/* 1. TOP-LEFT: Blue Base (6x6) */}
            <PlayerHome color="blue" gridArea="1 / 1 / 7 / 7" />

            {/* 2. TOP-RIGHT: Yellow Base (6x6) */}
            <PlayerHome color="yellow" gridArea="1 / 10 / 7 / 16" />

            {/* 3. BOTTOM-LEFT: Red Base (6x6) */}
            <PlayerHome color="red" gridArea="10 / 1 / 16 / 7" />

            {/* 4. BOTTOM-RIGHT: Green Base (6x6) */}
            <PlayerHome color="green" gridArea="10 / 10 / 16 / 16" />

            {/* 5. CENTER: 3x3 Home Triangle Area */}
            <div
              style={{ gridArea: '7 / 7 / 10 / 10' }}
              className="relative w-full h-full border border-black overflow-hidden"
            >
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full"
                preserveAspectRatio="none"
              >
                {/* Top: Yellow */}
                <polygon
                  points="0,0 100,0 50,50"
                  fill={BOARD_COLORS.yellow}
                  stroke="#111827"
                  strokeWidth="1.5"
                />
                {/* Right: Green */}
                <polygon
                  points="100,0 100,100 50,50"
                  fill={BOARD_COLORS.green}
                  stroke="#111827"
                  strokeWidth="1.5"
                />
                {/* Bottom: Red */}
                <polygon
                  points="100,100 0,100 50,50"
                  fill={BOARD_COLORS.red}
                  stroke="#111827"
                  strokeWidth="1.5"
                />
                {/* Left: Blue */}
                <polygon
                  points="0,100 0,0 50,50"
                  fill={BOARD_COLORS.blue}
                  stroke="#111827"
                  strokeWidth="1.5"
                />

                {/* HOME Text Labels */}
                <text
                  x="50"
                  y="26"
                  textAnchor="middle"
                  fill="#111827"
                  fontSize="10"
                  fontWeight="900"
                  letterSpacing="0.05em"
                  className="font-sans"
                >
                  HOME
                </text>
                <text
                  x="78"
                  y="53"
                  textAnchor="middle"
                  fill="#111827"
                  fontSize="9.5"
                  fontWeight="900"
                  transform="rotate(90, 78, 50)"
                  className="font-sans"
                >
                  HOME
                </text>
                <text
                  x="50"
                  y="80"
                  textAnchor="middle"
                  fill="#111827"
                  fontSize="10"
                  fontWeight="900"
                  letterSpacing="0.05em"
                  className="font-sans"
                >
                  HOME
                </text>
                <text
                  x="22"
                  y="53"
                  textAnchor="middle"
                  fill="#111827"
                  fontSize="9.5"
                  fontWeight="900"
                  transform="rotate(-90, 22, 50)"
                  className="font-sans"
                >
                  HOME
                </text>
              </svg>
            </div>

            {/* 6. TOP ARM (Rows 1..6, Cols 7..9 in 1-based index) */}
            {/* Col 7: (row 0 to 5) */}
            <div
              style={{ gridArea: '1 / 7 / 2 / 8' }}
              className="border border-black bg-white flex items-center justify-center relative"
            >
              {/* Row 0, Col 6: Curved Arrow turning right */}
              <CurvedTurnArrow type="TOP_TURN" />
            </div>
            <div style={{ gridArea: '2 / 7 / 3 / 8' }} className="border border-black bg-white" />
            <div
              style={{ gridArea: '3 / 7 / 4 / 8' }}
              className="border border-black bg-white flex items-center justify-center relative"
            >
              {/* Row 2, Col 6: Neutral Safe Star */}
              <SafeCellStar />
            </div>
            <div style={{ gridArea: '4 / 7 / 5 / 8' }} className="border border-black bg-white" />
            <div style={{ gridArea: '5 / 7 / 6 / 8' }} className="border border-black bg-white" />
            <div style={{ gridArea: '6 / 7 / 7 / 8' }} className="border border-black bg-white" />

            {/* Col 8: Yellow Home Path */}
            <div style={{ gridArea: '1 / 8 / 2 / 9' }} className="border border-black bg-white" />
            {[1, 2, 3, 4, 5].map((r) => (
              <div
                key={r}
                style={{
                  gridArea: `${r + 1} / 8 / ${r + 2} / 9`,
                  backgroundColor: BOARD_COLORS.yellow,
                }}
                className="border border-black"
              />
            ))}

            {/* Col 9: Yellow Start & Track */}
            <div style={{ gridArea: '1 / 9 / 2 / 10' }} className="border border-black bg-white" />
            <div
              style={{
                gridArea: '2 / 9 / 3 / 10',
                backgroundColor: BOARD_COLORS.yellow,
              }}
              className="border border-black flex items-center justify-center relative"
            >
              {/* Row 1, Col 8: Yellow Start with Star */}
              <SafeCellStar />
            </div>
            <div
              style={{ gridArea: '3 / 9 / 4 / 10' }}
              className="border border-black bg-white flex items-center justify-center"
            >
              {/* Row 2, Col 8: Straight Arrow pointing DOWN */}
              <StraightPathArrow direction="DOWN" />
            </div>
            <div style={{ gridArea: '4 / 9 / 5 / 10' }} className="border border-black bg-white" />
            <div style={{ gridArea: '5 / 9 / 6 / 10' }} className="border border-black bg-white" />
            <div style={{ gridArea: '6 / 9 / 7 / 10' }} className="border border-black bg-white" />

            {/* 7. LEFT ARM (Rows 7..9, Cols 1..6) */}
            {/* Row 7: Blue Start, Track, Arrow */}
            <div style={{ gridArea: '7 / 1 / 8 / 2' }} className="border border-black bg-white" />
            <div
              style={{
                gridArea: '7 / 2 / 8 / 3',
                backgroundColor: BOARD_COLORS.blue,
              }}
              className="border border-black flex items-center justify-center relative"
            >
              {/* Row 6, Col 1: Blue Start with Star */}
              <SafeCellStar />
            </div>
            <div style={{ gridArea: '7 / 3 / 8 / 4' }} className="border border-black bg-white" />
            <div
              style={{ gridArea: '7 / 4 / 8 / 5' }}
              className="border border-black bg-white flex items-center justify-center"
            >
              {/* Row 6, Col 3: Straight Arrow pointing RIGHT */}
              <StraightPathArrow direction="RIGHT" />
            </div>
            <div style={{ gridArea: '7 / 5 / 8 / 6' }} className="border border-black bg-white" />
            <div style={{ gridArea: '7 / 6 / 8 / 7' }} className="border border-black bg-white" />

            {/* Row 8: Blue Home Path */}
            <div style={{ gridArea: '8 / 1 / 9 / 2' }} className="border border-black bg-white" />
            {[1, 2, 3, 4, 5].map((c) => (
              <div
                key={c}
                style={{
                  gridArea: `8 / ${c + 1} / 9 / ${c + 2}`,
                  backgroundColor: BOARD_COLORS.blue,
                }}
                className="border border-black"
              />
            ))}

            {/* Row 9: Track with Safe Star at (8, 2) & Turn Arrow at (8, 1) */}
            <div
              style={{ gridArea: '9 / 1 / 10 / 2' }}
              className="border border-black bg-white flex items-center justify-center relative"
            >
              {/* Row 8, Col 0: Curved Arrow turning UP */}
              <CurvedTurnArrow type="LEFT_TURN" />
            </div>
            <div style={{ gridArea: '9 / 2 / 10 / 3' }} className="border border-black bg-white" />
            <div
              style={{ gridArea: '9 / 3 / 10 / 4' }}
              className="border border-black bg-white flex items-center justify-center relative"
            >
              {/* Row 8, Col 2: Neutral Safe Star */}
              <SafeCellStar />
            </div>
            <div style={{ gridArea: '9 / 4 / 10 / 5' }} className="border border-black bg-white" />
            <div style={{ gridArea: '9 / 5 / 10 / 6' }} className="border border-black bg-white" />
            <div style={{ gridArea: '9 / 6 / 10 / 7' }} className="border border-black bg-white" />

            {/* 8. RIGHT ARM (Rows 7..9, Cols 10..15) */}
            {/* Row 7: Top track with Star at col 12 & Turn Arrow at col 14 */}
            <div style={{ gridArea: '7 / 10 / 8 / 11' }} className="border border-black bg-white" />
            <div style={{ gridArea: '7 / 11 / 8 / 12' }} className="border border-black bg-white" />
            <div style={{ gridArea: '7 / 12 / 8 / 13' }} className="border border-black bg-white" />
            <div
              style={{ gridArea: '7 / 13 / 8 / 14' }}
              className="border border-black bg-white flex items-center justify-center relative"
            >
              {/* Row 6, Col 12: Neutral Safe Star */}
              <SafeCellStar />
            </div>
            <div style={{ gridArea: '7 / 14 / 8 / 15' }} className="border border-black bg-white" />
            <div
              style={{ gridArea: '7 / 15 / 8 / 16' }}
              className="border border-black bg-white flex items-center justify-center relative"
            >
              {/* Row 6, Col 14: Curved Arrow turning DOWN */}
              <CurvedTurnArrow type="RIGHT_TURN" />
            </div>

            {/* Row 8: Green Home Path */}
            {[9, 10, 11, 12, 13].map((c) => (
              <div
                key={c}
                style={{
                  gridArea: `8 / ${c + 1} / 9 / ${c + 2}`,
                  backgroundColor: BOARD_COLORS.green,
                }}
                className="border border-black"
              />
            ))}
            <div style={{ gridArea: '8 / 15 / 9 / 16' }} className="border border-black bg-white" />

            {/* Row 9: Green Start & Track with Arrow */}
            <div style={{ gridArea: '9 / 10 / 10 / 11' }} className="border border-black bg-white" />
            <div style={{ gridArea: '9 / 11 / 10 / 12' }} className="border border-black bg-white" />
            <div
              style={{ gridArea: '9 / 12 / 10 / 13' }}
              className="border border-black bg-white flex items-center justify-center"
            >
              {/* Row 8, Col 11: Straight Arrow pointing LEFT */}
              <StraightPathArrow direction="LEFT" />
            </div>
            <div style={{ gridArea: '9 / 13 / 10 / 14' }} className="border border-black bg-white" />
            <div
              style={{
                gridArea: '9 / 14 / 10 / 15',
                backgroundColor: BOARD_COLORS.green,
              }}
              className="border border-black flex items-center justify-center relative"
            >
              {/* Row 8, Col 13: Green Start with Star */}
              <SafeCellStar />
            </div>
            <div style={{ gridArea: '9 / 15 / 10 / 16' }} className="border border-black bg-white" />

            {/* 9. BOTTOM ARM (Rows 10..15, Cols 7..9) */}
            {/* Col 7: Red Start & Track */}
            <div style={{ gridArea: '10 / 7 / 11 / 8' }} className="border border-black bg-white" />
            <div style={{ gridArea: '11 / 7 / 12 / 8' }} className="border border-black bg-white" />
            <div style={{ gridArea: '12 / 7 / 13 / 8' }} className="border border-black bg-white" />
            <div
              style={{ gridArea: '13 / 7 / 14 / 8' }}
              className="border border-black bg-white flex items-center justify-center"
            >
              {/* Row 12, Col 6: Straight Arrow pointing UP */}
              <StraightPathArrow direction="UP" />
            </div>
            <div
              style={{
                gridArea: '14 / 7 / 15 / 8',
                backgroundColor: BOARD_COLORS.red,
              }}
              className="border border-black flex items-center justify-center relative"
            >
              {/* Row 13, Col 6: Red Start with Star */}
              <SafeCellStar />
            </div>
            <div style={{ gridArea: '15 / 7 / 16 / 8' }} className="border border-black bg-white" />

            {/* Col 8: Red Home Path */}
            {[9, 10, 11, 12, 13].map((r) => (
              <div
                key={r}
                style={{
                  gridArea: `${r + 1} / 8 / ${r + 2} / 9`,
                  backgroundColor: BOARD_COLORS.red,
                }}
                className="border border-black"
              />
            ))}
            <div style={{ gridArea: '15 / 8 / 16 / 9' }} className="border border-black bg-white" />

            {/* Col 9: Bottom Track with Safe Star at (12, 8) & Turn Arrow at (14, 8) */}
            <div style={{ gridArea: '10 / 9 / 11 / 10' }} className="border border-black bg-white" />
            <div style={{ gridArea: '11 / 9 / 12 / 10' }} className="border border-black bg-white" />
            <div style={{ gridArea: '12 / 9 / 13 / 10' }} className="border border-black bg-white" />
            <div
              style={{ gridArea: '13 / 9 / 14 / 10' }}
              className="border border-black bg-white flex items-center justify-center relative"
            >
              {/* Row 12, Col 8: Neutral Safe Star */}
              <SafeCellStar />
            </div>
            <div style={{ gridArea: '14 / 9 / 15 / 10' }} className="border border-black bg-white" />
            <div
              style={{ gridArea: '15 / 9 / 16 / 10' }}
              className="border border-black bg-white flex items-center justify-center relative"
            >
              {/* Row 14, Col 8: Curved Arrow turning LEFT */}
              <CurvedTurnArrow type="BOTTOM_TURN" />
            </div>

            {finishedPlayers.map(p => (
              <GoldenFrostOverlay key={p.color} color={p.color} rank={p.rank} />
            ))}
          </div>

          {/* Normal Gameplay Movement Box Numbers (Always Visible on playable movement cells) */}
          <div className="absolute inset-0 pointer-events-none z-10">
            {/* 52 Main Path Movement Boxes */}
            {BOARD_PATH.map((cell) => {
              const isStart = cell.isStartFor !== undefined;
              return (
                <div
                  key={`box-label-${cell.cellId}`}
                  style={{
                    left: `${(cell.col / 15) * 100}%`,
                    top: `${(cell.row / 15) * 100}%`,
                    width: `${100 / 15}%`,
                    height: `${100 / 15}%`,
                  }}
                  className="absolute pointer-events-none p-[2px] flex flex-col items-start justify-start select-none overflow-hidden"
                >
                  {isStart ? (
                    <div className="flex flex-col leading-none">
                      <span className="text-[5px] sm:text-[5.5px] font-sans font-black tracking-tighter text-slate-900/80 uppercase">
                        START
                      </span>
                      <span className="text-[7.5px] sm:text-[8px] font-mono font-black text-slate-900/90 tracking-tight">
                        {cell.debugLabel}
                      </span>
                    </div>
                  ) : (
                    <span
                      className={`text-[7px] sm:text-[7.5px] font-mono font-bold leading-none ${
                        cell.isSafe
                          ? 'text-slate-800/85 font-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]'
                          : 'text-slate-500/75'
                      }`}
                    >
                      {cell.debugLabel}
                    </span>
                  )}
                </div>
              );
            })}

            {/* 20 Home Path Steps (H1..H5) */}
            {(['blue', 'yellow', 'green', 'red'] as PlayerColor[]).flatMap((color) =>
              HOME_PATHS[color].map((hCell) => (
                <div
                  key={`home-step-${color}-${hCell.cellId}`}
                  style={{
                    left: `${(hCell.col / 15) * 100}%`,
                    top: `${(hCell.row / 15) * 100}%`,
                    width: `${100 / 15}%`,
                    height: `${100 / 15}%`,
                  }}
                  className="absolute pointer-events-none p-[2px] flex items-start justify-start select-none"
                >
                  <span className="text-[6.5px] sm:text-[7px] font-mono font-bold text-slate-900/60 leading-none">
                    H{hCell.stepIndex + 1}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Debug Cell Numbering & ID Overlay (Active when debugBoard is enabled) */}
          {debugBoard && (
            <div className="absolute inset-0 pointer-events-none z-15">
              {/* 52 Main Path Cells with Full IDs */}
              {BOARD_PATH.map((cell) => {
                const screen = gridToScreenPercentage(cell.row, cell.col);
                const isStart = cell.isStartFor !== undefined;
                const isSafe = cell.isSafe && !isStart;
                return (
                  <div
                    key={cell.cellId}
                    style={{
                      left: `${screen.leftPercent}%`,
                      top: `${screen.topPercent}%`,
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
                  >
                    <span
                      title={`${cell.cellId} - Box ${cell.boxNumber}`}
                      className={`px-0.5 py-0.2 rounded text-[7.5px] font-mono font-black border leading-none shadow-sm ${
                        isStart
                          ? 'bg-amber-300 text-slate-950 border-amber-500 font-extrabold'
                          : isSafe
                          ? 'bg-emerald-200 text-emerald-950 border-emerald-500 font-extrabold'
                          : 'bg-white/90 text-slate-900 border-slate-700/70'
                      }`}
                    >
                      {cell.cellId}
                    </span>
                  </div>
                );
              })}

              {/* 20 Home Path Cells */}
              {(['blue', 'yellow', 'green', 'red'] as PlayerColor[]).flatMap((c) =>
                HOME_PATHS[c].map((hCell) => {
                  const screen = gridToScreenPercentage(hCell.row, hCell.col);
                  return (
                    <div
                      key={hCell.cellId}
                      style={{
                        left: `${screen.leftPercent}%`,
                        top: `${screen.topPercent}%`,
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    >
                      <span
                        title={hCell.cellId}
                        className="px-0.5 py-0.2 rounded text-[7px] font-mono font-black bg-slate-950/85 text-amber-300 border border-amber-400/60 leading-none shadow-sm"
                      >
                        {hCell.debugLabel}
                      </span>
                    </div>
                  );
                })
              )}

              {/* 16 Home Base Sockets */}
              {(['blue', 'yellow', 'green', 'red'] as PlayerColor[]).flatMap((c) =>
                HOME_BASE_SOCKETS[c].map((socket) => {
                  const screen = gridToScreenPercentage(socket.row, socket.col);
                  return (
                    <div
                      key={socket.cellId}
                      style={{
                        left: `${screen.leftPercent}%`,
                        top: `${screen.topPercent - 2.8}%`,
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    >
                      <span
                        title={socket.cellId}
                        className="px-0.5 py-0.2 rounded text-[6.5px] font-mono font-bold bg-slate-950/90 text-slate-200 border border-slate-600 leading-none"
                      >
                        {socket.debugLabel}
                      </span>
                    </div>
                  );
                })
              )}

              {/* Center Finish Labels */}
              {(['blue', 'yellow', 'green', 'red'] as PlayerColor[]).map((c) => {
                const finish = CENTER_HOME_COORDS[c];
                const screen = gridToScreenPercentage(finish.row, finish.col);
                return (
                  <div
                    key={finish.cellId}
                    style={{
                      left: `${screen.leftPercent}%`,
                      top: `${screen.topPercent}%`,
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  >
                    <span
                      title={finish.cellId}
                      className="px-0.5 py-0.2 rounded text-[6.5px] font-mono font-bold bg-amber-400 text-slate-950 border border-amber-200 shadow-sm leading-none"
                    >
                      {finish.debugLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tokens Layer */}
          <div className="absolute inset-0 pointer-events-none">
            {tokenVisualPositions.map(({ token, row, col }) => {
              const screen = gridToScreenPercentage(row, col);
              const idKey = `${token.color}_${token.id}`;
              const offset = tokenOffsets[idKey] || { x: 0, y: 0, scale: 1, index: 0 };
              const isCurrentAnimating =
                animatingToken?.color === token.color &&
                animatingToken?.tokenId === token.id;
              const isMovable =
                !isAnimating &&
                token.color === currentTurnColor &&
                movableTokenIds.includes(token.id);
              const isSelected = selectedTokenId === token.id && token.color === currentTurnColor;
              const finishedPlayer = finishedPlayers.find(p => p.color === token.color);
              const isTokenFinished = token.state === 'FINISHED' && finishedPlayer;
              const rank = finishedPlayer?.rank || 4;

              return (
                <div
                  key={idKey}
                  style={{
                    left: `${screen.leftPercent}%`,
                    top: `${screen.topPercent}%`,
                    width: '6.2%',
                    height: '6.2%',
                    transform: isCurrentAnimating
                      ? undefined
                      : `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${offset.scale})`,
                    zIndex: isMovable || isSelected ? 40 : 20 + offset.index,
                  }}
                  className={`absolute pointer-events-auto transition-[left,top,transform] duration-180 ease-out ${
                    isCurrentAnimating
                      ? 'z-50 scale-125 -translate-x-1/2 -translate-y-[55%] drop-shadow-[0_8px_14px_rgba(0,0,0,0.65)]'
                      : ''
                  }`}
                >
                  <div className={`w-full h-full relative ${isTokenFinished ? 'animate-bounce' : ''}`}>
                    <Token
                        id={token.id}
                        rotation={boardRotation}
                      color={token.color}
                      isMovable={isMovable}
                      isSelected={isSelected}
                      onClick={() => {
                        if (!isAnimating) {
                          onTokenClick(token.id);
                        }
                      }}
                    />
                    {isTokenFinished && rank <= 3 && (
                      <div className={`absolute -top-[50%] left-1/2 -translate-x-1/2 z-50 pointer-events-none ${
                        rank === 1 ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]' : 
                        rank === 2 ? 'text-slate-300 drop-shadow-[0_0_8px_rgba(224,224,224,0.8)]' : 
                        'text-amber-600 drop-shadow-[0_0_8px_rgba(205,127,50,0.8)]'
                      }`}>
                        <Crown className="w-6 h-6 fill-current animate-pulse" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};






