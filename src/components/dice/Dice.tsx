import React, { useState, useEffect, useRef } from 'react';
import { PlayerColor } from '../../types/player';
import { AudioService } from '../../services/AudioService';

interface DiceProps {
  value: number | null;
  isRolling: boolean;
  canRoll: boolean;
  playerColor: PlayerColor;
  onRoll: () => void;
  size?: number; // pixel width/height (default ~64px)
}

const DOT_POSITIONS: Record<number, number[][]> = {
  1: [[50, 50]],
  2: [
    [25, 25],
    [75, 75],
  ],
  3: [
    [25, 25],
    [50, 50],
    [75, 75],
  ],
  4: [
    [25, 25],
    [25, 75],
    [75, 25],
    [75, 75],
  ],
  5: [
    [25, 25],
    [25, 75],
    [50, 50],
    [75, 25],
    [75, 75],
  ],
  6: [
    [25, 22],
    [25, 50],
    [25, 78],
    [75, 22],
    [75, 50],
    [75, 78],
  ],
};

const COLOR_GLOW: Record<PlayerColor, string> = {
  blue: 'ring-[#0878E8] shadow-[0_0_24px_rgba(8,120,232,0.8)]',
  yellow: 'ring-[#FFD21C] shadow-[0_0_24px_rgba(255,210,28,0.8)]',
  green: 'ring-[#08B83F] shadow-[0_0_24px_rgba(8,184,63,0.8)]',
  red: 'ring-[#F01818] shadow-[0_0_24px_rgba(240,24,24,0.8)]',
};

const TARGET_ANGLES: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  2: { x: -90, y: 0 },
  3: { x: 0, y: -90 },
  4: { x: 0, y: 90 },
  5: { x: 90, y: 0 },
  6: { x: 0, y: 180 },
};

const DiceFace: React.FC<{ value: number; size: number }> = ({ value, size }) => {
  const dots = DOT_POSITIONS[value] || DOT_POSITIONS[1];
  const isOne = value === 1;

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        overflow: 'visible',
      }}
      className="relative w-full h-full rounded-2xl bg-gradient-to-br from-white via-[#FAF9F6] to-[#E2E8F0] border border-slate-300 shadow-[inset_0_2px_3px_rgba(255,255,255,1),inset_0_-2px_3px_rgba(0,0,0,0.15)] flex items-center justify-center select-none"
    >
      <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/80 via-white/30 to-transparent pointer-events-none rounded-t-2xl" />
      <svg className="w-full h-full p-1.5" viewBox="0 0 100 100">
        {dots.map(([cx, cy], idx) => {
          const radius = isOne ? 12 : 8.5;
          return (
            <g key={idx}>
              <circle cx={cx} cy={cy + 1.2} r={radius + 0.5} fill="rgba(0,0,0,0.22)" />
              <circle cx={cx} cy={cy} r={radius} fill={isOne ? '#D31818' : '#1E293B'} />
              <circle cx={cx} cy={cy} r={radius} fill="none" stroke={isOne ? '#991B1B' : '#0F172A'} strokeWidth="1" opacity="0.6" />
              <circle cx={cx - radius * 0.3} cy={cy - radius * 0.3} r={radius * 0.32} fill="rgba(255,255,255,0.65)" />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export const Dice: React.FC<DiceProps> = ({
  value,
  isRolling,
  canRoll,
  playerColor,
  onRoll,
  size = 64,
}) => {
  const initialFace = value || 1;
  const initialBase = TARGET_ANGLES[initialFace] || TARGET_ANGLES[1];

  const [rotation, setRotation] = useState<{ x: number; y: number }>({
    x: initialBase.x,
    y: initialBase.y,
  });

  const anglesRef = useRef<{ x: number; y: number }>({
    x: initialBase.x,
    y: initialBase.y,
  });

  const halfSize = Math.round(size / 2);

  useEffect(() => {
    if (isRolling && value) {
      AudioService.getInstance().playDiceSound();
      const base = TARGET_ANGLES[value] || TARGET_ANGLES[1];
      const curX = anglesRef.current.x;
      const curY = anglesRef.current.y;
      const deltaX = ((base.x - (curX % 360)) % 360 + 360) % 360;
      const deltaY = ((base.y - (curY % 360)) % 360 + 360) % 360;
      const nextX = curX + 720 + deltaX;
      const nextY = curY + 720 + deltaY;
      anglesRef.current = { x: nextX, y: nextY };
      setRotation({ x: nextX, y: nextY });

      setTimeout(() => {
        AudioService.getInstance().playDiceLand();
      }, 550);
    } else if (value) {
      const base = TARGET_ANGLES[value] || TARGET_ANGLES[1];
      const curX = anglesRef.current.x;
      const curY = anglesRef.current.y;
      const deltaX = ((base.x - (curX % 360)) % 360 + 360) % 360;
      const deltaY = ((base.y - (curY % 360)) % 360 + 360) % 360;
      anglesRef.current = { x: curX + deltaX, y: curY + deltaY };
      setRotation(anglesRef.current);
    }
  }, [isRolling, value]);

  const handleClick = () => {
    if (!canRoll || isRolling) return;
    onRoll();
  };

  return (
    <div className="flex flex-col items-center select-none relative group">
      <div
        className="relative flex items-center justify-center perspective-800 overflow-visible"
        style={{ width: `${size + 12}px`, height: `${size + 12}px` }}
      >
        <div
          style={{
            width: `${size * 0.85}px`,
            height: `${size * 0.28}px`,
            bottom: '-2px',
          }}
          className={`absolute left-1/2 -translate-x-1/2 rounded-full bg-slate-950/70 blur-[3px] transition-all duration-300 pointer-events-none ${
            isRolling ? 'scale-130 opacity-20 blur-[6px] translate-y-1' : 'scale-100 opacity-60'
          }`}
        />

        {canRoll && !isRolling && (
          <div
            className={`absolute inset-0 rounded-2xl ring-2 ${COLOR_GLOW[playerColor]} pointer-events-none transition-opacity animate-pulse`}
          />
        )}

        <button
          type="button"
          disabled={!canRoll || isRolling}
          onClick={handleClick}
          style={{ width: `${size}px`, height: `${size}px` }}
          className={`relative preserve-3d transition-transform duration-200 ${
            canRoll && !isRolling ? 'cursor-pointer active:scale-95' : 'opacity-80 cursor-default'
          } ${isRolling ? 'scale-105' : 'scale-100'}`}
          aria-label={`Dice showing ${value || 1}. Click to roll.`}
        >
          <div
            className="relative w-full h-full preserve-3d"
            style={{
              transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
              transition: isRolling ? 'transform 580ms cubic-bezier(0.18, 0.89, 0.32, 1)' : 'none',
            }}
          >
            <div style={{ transform: `translateZ(${halfSize}px)` }} className="absolute inset-0 preserve-3d">
              <DiceFace value={1} size={size} />
            </div>
            <div style={{ transform: `rotateY(180deg) translateZ(${halfSize}px)` }} className="absolute inset-0 preserve-3d">
              <DiceFace value={6} size={size} />
            </div>
            <div style={{ transform: `rotateX(90deg) translateZ(${halfSize}px)` }} className="absolute inset-0 preserve-3d">
              <DiceFace value={2} size={size} />
            </div>
            <div style={{ transform: `rotateX(-90deg) translateZ(${halfSize}px)` }} className="absolute inset-0 preserve-3d">
              <DiceFace value={5} size={size} />
            </div>
            <div style={{ transform: `rotateY(90deg) translateZ(${halfSize}px)` }} className="absolute inset-0 preserve-3d">
              <DiceFace value={3} size={size} />
            </div>
            <div style={{ transform: `rotateY(-90deg) translateZ(${halfSize}px)` }} className="absolute inset-0 preserve-3d">
              <DiceFace value={4} size={size} />
            </div>
          </div>
        </button>
      </div>

      <span
        className={`mt-1.5 text-xs font-bold tracking-wider uppercase transition-opacity duration-150 ${
          canRoll ? 'text-amber-300 animate-pulse' : 'text-slate-400'
        }`}
      >
        {isRolling ? 'ROLLING...' : canRoll ? 'TAP TO ROLL' : `ROLLED ${value || ''}`}
      </span>
    </div>
  );
};
