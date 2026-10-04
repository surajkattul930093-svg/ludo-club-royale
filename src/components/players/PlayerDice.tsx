import React, { useState, useEffect, useRef } from 'react';
import { PlayerColor, DiceState } from '../../types/player';
import { AudioService } from '../../services/AudioService';

interface PlayerDiceProps {
  playerId: string;
  playerColor: PlayerColor;
  value: number | null;
  state: DiceState; // 'READY' | 'ROLLING' | 'RESULT' | 'DISABLED'
  rollId?: number;
  isCurrentTurn: boolean;
  isAnimating: boolean;
  onRoll: () => void;
  size?: number; // default ~44px
  debugVisuals?: boolean;
}

type LocalDiceState = 'IDLE' | 'ROLLING' | 'RESULT';

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

const COLOR_GLOW: Record<
  PlayerColor,
  {
    ring: string;
    border: string;
    shadow: string;
    accent: string;
  }
> = {
  blue: {
    ring: 'ring-[#0878E8]',
    border: 'border-[#0878E8]',
    shadow: 'shadow-[0_0_18px_rgba(8,120,232,0.8)]',
    accent: 'bg-[#0878E8]',
  },
  yellow: {
    ring: 'ring-[#FFD21C]',
    border: 'border-[#FFD21C]',
    shadow: 'shadow-[0_0_18px_rgba(255,210,28,0.8)]',
    accent: 'bg-[#FFD21C]',
  },
  green: {
    ring: 'ring-[#08B83F]',
    border: 'border-[#08B83F]',
    shadow: 'shadow-[0_0_18px_rgba(8,184,63,0.8)]',
    accent: 'bg-[#08B83F]',
  },
  red: {
    ring: 'ring-[#F01818]',
    border: 'border-[#F01818]',
    shadow: 'shadow-[0_0_18px_rgba(240,24,24,0.8)]',
    accent: 'bg-[#F01818]',
  },
};

// Target Euler angles to bring Face N directly facing the user (+Z)
const TARGET_ANGLES: Record<number, { x: number; y: number; z: number }> = {
  1: { x: 0, y: 0, z: 0 },
  2: { x: -90, y: 0, z: 0 },
  3: { x: 0, y: -90, z: 0 },
  4: { x: 0, y: 90, z: 0 },
  5: { x: 90, y: 0, z: 0 },
  6: { x: 0, y: 180, z: 0 },
};

/**
 * Single 3D Dice Face
 * CRITICAL: overflow: visible (NOT hidden) to prevent 3D context flattening and clipping in WebKit/Blink
 */
const DiceFaceContent: React.FC<{ value: number }> = ({ value }) => {
  const dots = DOT_POSITIONS[value] || DOT_POSITIONS[1];
  const isOne = value === 1;

  return (
    <>
      {/* Top Gloss Sheen */}
      <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/80 via-white/25 to-transparent pointer-events-none rounded-t-xl" />

      {/* Tactile 3D Recessed Pips */}
      <svg className="w-full h-full p-1" viewBox="0 0 100 100">
        {dots.map(([cx, cy], idx) => {
          const radius = isOne ? 12 : 8.5;
          return (
            <g key={idx}>
              {/* Recessed drop shadow inside pip cavity */}
              <circle cx={cx} cy={cy + 1.2} r={radius + 0.5} fill="rgba(0,0,0,0.22)" />
              {/* Main Pip Dot */}
              <circle cx={cx} cy={cy} r={radius} fill={isOne ? '#D31818' : '#1E293B'} />
              {/* Inner depth contour */}
              <circle
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={isOne ? '#991B1B' : '#0F172A'}
                strokeWidth="1"
                opacity="0.6"
              />
              {/* Specular gloss glint */}
              <circle
                cx={cx - radius * 0.3}
                cy={cy - radius * 0.3}
                r={radius * 0.32}
                fill="rgba(255,255,255,0.65)"
              />
            </g>
          );
        })}
      </svg>
    </>
  );
};

export const PlayerDice: React.FC<PlayerDiceProps> = ({
  playerColor,
  value,
  state,
  rollId,
  isCurrentTurn,
  isAnimating,
  onRoll,
  size = 44,
  debugVisuals = false,
}) => {
  const [localDiceState, setLocalDiceState] = useState<LocalDiceState>(
    state === 'READY' ? 'IDLE' : 'RESULT'
  );

  const initialFace = value || 1;
  const initialBase = TARGET_ANGLES[initialFace] || TARGET_ANGLES[1];

  const [rotation, setRotation] = useState<{ x: number; y: number; z: number }>({
    x: initialBase.x,
    y: initialBase.y,
    z: initialBase.z,
  });
  const [visualScale, setVisualScale] = useState<number>(1);
  const [transitionStyle, setTransitionStyle] = useState<string>('none');

  const anglesRef = useRef<{ x: number; y: number; z: number }>({
    x: initialBase.x,
    y: initialBase.y,
    z: initialBase.z,
  });

  const prevRollIdRef = useRef<number | undefined>(undefined);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const halfSize = Math.round(size / 2);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  // Sync state transitions: when engine resets state to READY, restore IDLE state so dice is clickable
  useEffect(() => {
    if (state === 'READY' && localDiceState !== 'ROLLING') {
      setLocalDiceState('IDLE');
      setVisualScale(1);
      setTransitionStyle('none');
    } else if (state === 'DISABLED' && localDiceState !== 'ROLLING') {
      setLocalDiceState('RESULT');
    }
  }, [state]);

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, []);

  // Handle authoritative engine roll (via rollId)
  useEffect(() => {
    if (rollId !== undefined && rollId !== prevRollIdRef.current) {
      prevRollIdRef.current = rollId;

      if (value !== null) {
        clearTimers();
        setLocalDiceState('ROLLING');
        AudioService.getInstance().playDiceSound();

        const targetFace = value;
        const base = TARGET_ANGLES[targetFace] || TARGET_ANGLES[1];

        // Multi-axis forward continuous rotation in place (720deg around X & Y, 360deg around Z)
        const currentX = anglesRef.current.x;
        const currentY = anglesRef.current.y;
        const currentZ = anglesRef.current.z;

        const deltaX = ((base.x - (currentX % 360)) % 360 + 360) % 360;
        const nextX = currentX + 720 + deltaX;

        const deltaY = ((base.y - (currentY % 360)) % 360 + 360) % 360;
        const nextY = currentY + 720 + deltaY;

        const deltaZ = ((base.z - (currentZ % 360)) % 360 + 360) % 360;
        const nextZ = currentZ + 360 + deltaZ;

        anglesRef.current = { x: nextX, y: nextY, z: nextZ };

        // Phase 1: Fast start -> Tumbling -> Deceleration (duration ~640ms)
        // Strictly in place using scale(1.05) only, ZERO translateY!
        setRotation({ x: nextX, y: nextY, z: nextZ });
        setVisualScale(1.05);
        setTransitionStyle('transform 640ms cubic-bezier(0.18, 0.88, 0.28, 1)');

        // Phase 2: Landing impact micro-squash at 640ms (duration ~130ms)
        const tLanding = setTimeout(() => {
          setVisualScale(0.96);
          setTransitionStyle('transform 130ms cubic-bezier(0.34, 1.56, 0.64, 1)');
          AudioService.getInstance().playDiceLand();
        }, 640);
        timersRef.current.push(tLanding);

        // Phase 3: Settle firmly to scale 1.0 at 780ms
        const tSettle = setTimeout(() => {
          setVisualScale(1);
          setTransitionStyle('transform 100ms ease-out');
          setLocalDiceState('RESULT');
        }, 780);
        timersRef.current.push(tSettle);
      }
    } else if (value !== null && localDiceState !== 'ROLLING') {
      // Keep authoritative face aligned toward viewer
      const base = TARGET_ANGLES[value] || TARGET_ANGLES[1];
      const curX = anglesRef.current.x;
      const curY = anglesRef.current.y;
      const deltaX = ((base.x - (curX % 360)) % 360 + 360) % 360;
      const deltaY = ((base.y - (curY % 360)) % 360 + 360) % 360;
      anglesRef.current = { x: curX + deltaX, y: curY + deltaY, z: 0 };
      setRotation(anglesRef.current);
      setVisualScale(1);
      setTransitionStyle('none');
    }
  }, [rollId, value]);

  const canClick =
    isCurrentTurn &&
    state === 'READY' &&
    !isAnimating &&
    localDiceState === 'IDLE';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canClick) return;

    // Trigger engine roll immediately (determines result before visual roll animation)
    onRoll();
  };

  const isRolling = localDiceState === 'ROLLING';
  const colorStyle = COLOR_GLOW[playerColor];
  const isSix = value === 6 && localDiceState === 'RESULT';

  // Common styling for all 6 cube faces:
  // Direct backface-visibility: hidden on transformed face prevents 3D clipping & drops
  const faceBaseStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: `${size}px`,
    height: `${size}px`,
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    overflow: 'visible',
  };

  const faceClassName =
    'rounded-xl bg-gradient-to-br from-white via-[#FAF9F6] to-[#E2E8F0] border border-slate-300 shadow-[inset_0_2px_3px_rgba(255,255,255,1),inset_0_-2px_3px_rgba(0,0,0,0.15)] flex items-center justify-center select-none';

  return (
    <div
      className={`player-dice-container flex flex-col items-center select-none relative ${
        debugVisuals ? 'outline outline-1 outline-blue-400' : ''
      }`}
      style={{ overflow: 'visible' }}
    >
      {/* Golden Six Burst Glow Celebration (scale glow behind dice, ZERO translation) */}
      {isSix && (
        <div className="absolute -inset-3 bg-gradient-to-r from-amber-400/50 via-yellow-300/60 to-amber-500/50 rounded-2xl blur-md animate-golden-burst pointer-events-none z-10" />
      )}

      {/* DiceStage: Fixed dimensions, relative, flex items-center justify-center, perspective: 800px, overflow: visible, isolation: isolate */}
      <div
        className={`dice-stage relative flex items-center justify-center perspective-800 ${
          debugVisuals ? 'outline outline-1 outline-amber-400' : ''
        }`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          overflow: 'visible',
          isolation: 'isolate',
        }}
      >
        {/* Dynamic 3D Contact Shadow beneath dice (In-place, scale only, NO translateY) */}
        <div
          style={{
            width: `${size * 0.85}px`,
            height: `${size * 0.22}px`,
            bottom: '-2px',
          }}
          className={`absolute left-1/2 -translate-x-1/2 rounded-full bg-slate-950/70 blur-[3px] transition-all duration-300 pointer-events-none ${
            isRolling ? 'scale-125 opacity-25 blur-[5px]' : 'scale-100 opacity-60'
          }`}
        />

        {/* Glow halo when it is this player's turn to roll */}
        {canClick && (
          <div
            className={`absolute inset-0 rounded-2xl ring-2 ${colorStyle.ring} ${colorStyle.shadow} pointer-events-none transition-opacity animate-pulse`}
          />
        )}

        {/* DiceVisual: Only owner of the 3D transforms. Tumbling happens strictly in place! */}
        <button
          type="button"
          disabled={!canClick}
          onClick={handleClick}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg) scale(${visualScale})`,
            transformOrigin: 'center center',
            transformStyle: 'preserve-3d',
            WebkitTransformStyle: 'preserve-3d',
            transition: transitionStyle,
            zIndex: 11,
            overflow: 'visible',
          }}
          className={`dice-visual relative select-none ${
            debugVisuals ? 'outline outline-1 outline-emerald-400' : ''
          } ${
            canClick
              ? 'cursor-pointer active:scale-95'
              : isCurrentTurn
              ? 'cursor-pointer'
              : 'cursor-default'
          }`}
          aria-label={`${playerColor} dice showing ${value || 1}`}
        >
          {/* Face 1: Front (+Z) */}
          <div
            style={{
              ...faceBaseStyle,
              transform: `translateZ(${halfSize}px)`,
            }}
            className={faceClassName}
          >
            <DiceFaceContent value={1} />
          </div>

          {/* Face 6: Back (-Z, opposite of 1) */}
          <div
            style={{
              ...faceBaseStyle,
              transform: `rotateY(180deg) translateZ(${halfSize}px)`,
            }}
            className={faceClassName}
          >
            <DiceFaceContent value={6} />
          </div>

          {/* Face 2: Top (+Y) */}
          <div
            style={{
              ...faceBaseStyle,
              transform: `rotateX(90deg) translateZ(${halfSize}px)`,
            }}
            className={faceClassName}
          >
            <DiceFaceContent value={2} />
          </div>

          {/* Face 5: Bottom (-Y, opposite of 2) */}
          <div
            style={{
              ...faceBaseStyle,
              transform: `rotateX(-90deg) translateZ(${halfSize}px)`,
            }}
            className={faceClassName}
          >
            <DiceFaceContent value={5} />
          </div>

          {/* Face 3: Right (+X) */}
          <div
            style={{
              ...faceBaseStyle,
              transform: `rotateY(90deg) translateZ(${halfSize}px)`,
            }}
            className={faceClassName}
          >
            <DiceFaceContent value={3} />
          </div>

          {/* Face 4: Left (-X, opposite of 3) */}
          <div
            style={{
              ...faceBaseStyle,
              transform: `rotateY(-90deg) translateZ(${halfSize}px)`,
            }}
            className={faceClassName}
          >
            <DiceFaceContent value={4} />
          </div>
        </button>

        {/* "ROLL" Prompt Badge (In place, pulse opacity only, NO bounce translateY) */}
        {canClick && (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase tracking-wider text-slate-950 bg-amber-400 border border-amber-200 shadow-md whitespace-nowrap animate-pulse pointer-events-none z-30">
            ROLL
          </span>
        )}

        {/* "★ SIX! ★" Celebration Badge (In place, NO bounce translateY) */}
        {isSix && (
          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full text-[8.5px] font-black uppercase tracking-wider text-amber-950 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 border border-amber-100 shadow-[0_0_12px_rgba(251,191,36,0.9)] whitespace-nowrap pointer-events-none z-30">
            ★ SIX! ★
          </span>
        )}
      </div>

      {/* Mini Roll Result Label */}
      <span
        className={`text-[9px] font-extrabold tracking-wider mt-1 uppercase ${
          canClick
            ? 'text-amber-400 font-bold animate-pulse'
            : isCurrentTurn
            ? 'text-slate-200 font-semibold'
            : 'text-slate-400 font-medium'
        }`}
      >
        {isRolling
          ? 'ROLLING...'
          : isSix
          ? '+1 ROLL!'
          : canClick
          ? 'ROLL'
          : value
          ? `ROLLED ${value}`
          : 'DICE'}
      </span>
    </div>
  );
};
