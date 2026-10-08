import React, { useState, useEffect, useRef } from 'react';
import { PlayerColor } from '../../types/player';
import { AudioService } from '../../services/AudioService';

interface Physical3DDiceProps {
  value: number | null;
  rollId?: number;
  playerColor: PlayerColor;
  isRolling: boolean;
  canClick: boolean;
  size?: number; // pixel width/height (default 46px)
  onRollClick: () => void;
}

// Opposite faces sum to 7: 1-6, 2-5, 3-4
const BASE_ROTATIONS: Record<number, { x: number; y: number; z: number }> = {
  1: { x: 0, y: 0, z: 0 }, // Front face
  2: { x: -90, y: 0, z: 0 }, // Top face
  3: { x: 0, y: -90, z: 0 }, // Right face
  4: { x: 0, y: 90, z: 0 }, // Left face
  5: { x: 90, y: 0, z: 0 }, // Bottom face
  6: { x: 180, y: 0, z: 0 }, // Back face
};

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
    [25, 25],
    [25, 50],
    [25, 75],
    [75, 25],
    [75, 50],
    [75, 75],
  ],
};

const COLOR_GLOW: Record<PlayerColor, string> = {
  blue: 'shadow-[0_0_16px_rgba(8,120,232,0.85)] ring-[#0878E8]',
  yellow: 'shadow-[0_0_16px_rgba(255,210,28,0.85)] ring-[#FFD21C]',
  green: 'shadow-[0_0_16px_rgba(8,184,63,0.85)] ring-[#08B83F]',
  red: 'shadow-[0_0_16px_rgba(240,24,24,0.85)] ring-[#F01818]',
};

export const Physical3DDice: React.FC<Physical3DDiceProps> = ({
  value,
  rollId,
  playerColor,
  canClick,
  size = 46,
  onRollClick,
}) => {
  const half = Math.round(size / 2);
  const targetFace = value && value >= 1 && value <= 6 ? value : 1;

  // Cumulative rotation tracker to allow continuous fluid rolling forward
  const rotRef = useRef({ x: 0, y: 0, z: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [diceState, setDiceState] = useState<'idle' | 'lift' | 'rolling' | 'landing' | 'settled'>('idle');
  const prevRollIdRef = useRef<number | undefined>(undefined);

  // Trigger physical 3D roll when rollId updates
  useEffect(() => {
    if (rollId !== undefined && rollId !== prevRollIdRef.current) {
      prevRollIdRef.current = rollId;

      // STEP 1 & 2: Lift and throw
      setDiceState('lift');

      // Randomize full 360-degree spins so every throw feels organic
      const extraXTurns = 2 + Math.floor(Math.random() * 2); // 2 or 3 turns
      const extraYTurns = 2 + Math.floor(Math.random() * 2); // 2 or 3 turns
      const wobbleZ = (Math.random() > 0.5 ? 1 : -1) * 360;

      const base = BASE_ROTATIONS[targetFace] || BASE_ROTATIONS[1];
      // Target angles guaranteed to land upright on targetFace
      const targetX = rotRef.current.x + extraXTurns * 360 + base.x;
      const targetY = rotRef.current.y + extraYTurns * 360 + base.y;
      const targetZ = rotRef.current.z + wobbleZ;

      rotRef.current = { x: targetX, y: targetY, z: targetZ };

      // STEP 3, 4, 5: Physics tumble & multi-axis deceleration
      const tumbleTimeout = setTimeout(() => {
        setDiceState('rolling');
        setRotation({ x: targetX, y: targetY, z: targetZ });
      }, 40);

      // STEP 6 & 7: Landing impact & bounce
      const landTimeout = setTimeout(() => {
        setDiceState('landing');
      }, 760);

      // STEP 8: Settled
      const settleTimeout = setTimeout(() => {
        setDiceState('settled');
      }, 920);

      return () => {
        clearTimeout(tumbleTimeout);
        clearTimeout(landTimeout);
        clearTimeout(settleTimeout);
      };
    } else if (value && diceState === 'idle') {
      const base = BASE_ROTATIONS[value] || BASE_ROTATIONS[1];
      setRotation({ x: base.x, y: base.y, z: base.z });
      rotRef.current = { x: base.x, y: base.y, z: base.z };
    }
  }, [rollId, targetFace, value, diceState]);

  const isLifted = diceState === 'lift' || diceState === 'rolling';
  const isLanding = diceState === 'landing';
  const isSix = value === 6 && (diceState === 'landing' || diceState === 'settled');

  // Cube translation/bounce styling based on roll phase
  let cubeY = 0;
  let cubeScale = 1;
  let transitionDuration = '720ms';
  let transitionTiming = 'cubic-bezier(0.18, 0.89, 0.32, 1.15)'; // Eased momentum deceleration

  if (diceState === 'lift') {
    cubeY = -12;
    cubeScale = 1.08;
    transitionDuration = '120ms';
    transitionTiming = 'ease-out';
  } else if (diceState === 'rolling') {
    cubeY = -14;
    cubeScale = 1.06;
    transitionDuration = '720ms';
    transitionTiming = 'cubic-bezier(0.2, 0.85, 0.35, 1)';
  } else if (diceState === 'landing') {
    cubeY = 2;
    cubeScale = 0.94; // Impact squash
    transitionDuration = '120ms';
    transitionTiming = 'ease-in';
  } else if (diceState === 'settled') {
    cubeY = 0;
    cubeScale = 1;
    transitionDuration = '160ms';
    transitionTiming = 'cubic-bezier(0.34, 1.56, 0.64, 1)'; // Rebound settle
  }

  // Render individual face with ivory bevel, specular shine, and recessed pips
  const renderFace = (faceNumber: number, transformStyle: string) => {
    const dots = DOT_POSITIONS[faceNumber] || [];
    const isCenterRed = faceNumber === 1;

    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          transform: transformStyle,
        }}
        className="absolute inset-0 rounded-[8px] bg-gradient-to-br from-white via-[#f7f8fa] to-[#e4e7ec] border border-slate-300 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),inset_0_-1px_2px_rgba(0,0,0,0.1)] flex items-center justify-center overflow-hidden backface-visible select-none"
      >
        {/* Top diagonal specular sheen */}
        <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/90 to-transparent pointer-events-none" />

        {/* Die Face Pips */}
        <svg className="w-full h-full p-1.5" viewBox="0 0 100 100">
          {dots.map(([cx, cy], idx) => (
            <g key={idx}>
              {/* Debossed shadow */}
              <circle cx={cx} cy={cy + 1.2} r={8.5} fill="rgba(0,0,0,0.16)" />
              {/* Pip body */}
              <circle
                cx={cx}
                cy={cy}
                r={8}
                fill={isCenterRed ? '#E01616' : '#1e293b'}
              />
              {/* Specular pip dot */}
              <circle
                cx={cx - 2.2}
                cy={cy - 2.2}
                r={2.2}
                fill="rgba(255,255,255,0.4)"
              />
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div
      onClick={canClick ? onRollClick : undefined}
      style={{ width: `${size}px`, height: `${size + 8}px` }}
      className={`relative flex flex-col items-center justify-center select-none ${
        canClick ? 'cursor-pointer active:scale-95' : 'cursor-default'
      }`}
    >
      {/* 3D Perspective Stage */}
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          perspective: '420px',
        }}
        className="relative flex items-center justify-center"
      >
        {/* Dynamic Physical Shadow below the die */}
        <div
          style={{
            width: `${Math.round(size * 0.85)}px`,
            height: '8px',
            transform: `translateY(${Math.round(size * 0.48)}px) scale(${isLifted ? 0.65 : isLanding ? 1.2 : 1})`,
            opacity: isLifted ? 0.18 : isLanding ? 0.65 : 0.4,
            filter: `blur(${isLifted ? '6px' : '2.5px'})`,
          }}
          className="absolute rounded-full bg-slate-950 transition-all duration-200 pointer-events-none"
        />

        {/* Six Celebration Radiant Aura */}
        {isSix && (
          <div className="absolute -inset-3 bg-gradient-to-r from-amber-400/40 via-yellow-300/50 to-amber-500/40 rounded-full blur-md animate-golden-burst pointer-events-none z-0" />
        )}

        {/* 3D Rotating Cube */}
        <div
          style={{
            width: `${size}px`,
            height: `${size}px`,
            transformStyle: 'preserve-3d',
            transform: `translateY(${cubeY}px) scale(${cubeScale}) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
            transition: `transform ${transitionDuration} ${transitionTiming}`,
          }}
          className={`relative ${
            canClick && diceState === 'idle'
              ? `animate-dice-idle ${COLOR_GLOW[playerColor]} rounded-[8px]`
              : ''
          }`}
        >
          {/* 1. FRONT FACE (1 Pip) */}
          {renderFace(1, `rotateY(0deg) translateZ(${half}px)`)}

          {/* 2. TOP FACE (2 Pips) */}
          {renderFace(2, `rotateX(90deg) translateZ(${half}px)`)}

          {/* 3. RIGHT FACE (3 Pips) */}
          {renderFace(3, `rotateY(90deg) translateZ(${half}px)`)}

          {/* 4. LEFT FACE (4 Pips) */}
          {renderFace(4, `rotateY(-90deg) translateZ(${half}px)`)}

          {/* 5. BOTTOM FACE (5 Pips) */}
          {renderFace(5, `rotateX(-90deg) translateZ(${half}px)`)}

          {/* 6. BACK FACE (6 Pips) */}
          {renderFace(6, `rotateY(180deg) translateZ(${half}px)`)}
        </div>

        {/* Active Player Prompt Tag */}
        {canClick && diceState === 'idle' && (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full text-[7.5px] font-black uppercase tracking-wider text-slate-950 bg-amber-400 border border-amber-200 shadow-md whitespace-nowrap animate-pulse pointer-events-none z-30">
            ROLL
          </span>
        )}

        {/* Six Celebration Badge */}
        {isSix && (
          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase tracking-wider text-amber-950 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 border border-amber-100 shadow-[0_0_12px_rgba(251,191,36,0.9)] whitespace-nowrap animate-bounce pointer-events-none z-30">
            ★ SIX! ★
          </span>
        )}
      </div>
    </div>
  );
};
