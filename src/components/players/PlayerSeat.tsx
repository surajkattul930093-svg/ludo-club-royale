import React from 'react';
import { Player, PlayerColor } from '../../types/player';
import { PlayerAvatar } from './PlayerAvatar';
import { PlayerStatus } from './PlayerStatus';
import { PlayerDice } from './PlayerDice';

export type SeatPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface PlayerSeatProps {
  player: Player;
  position: SeatPosition;
  isCurrentTurn: boolean;
  isAnimating: boolean;
  debugVisuals?: boolean;
  onRollDice: () => void;
}

const COLOR_ACCENTS: Record<
  PlayerColor,
  {
    border: string;
    glow: string;
    bg: string;
    nameColor: string;
    badgeBg: string;
  }
> = {
  blue: {
    border: 'border-[#0878E8]',
    glow: 'shadow-[0_0_20px_rgba(8,120,232,0.45)]',
    bg: 'bg-[#0878E8] text-white shadow-inner',
    nameColor: 'text-white',
    badgeBg: 'bg-white/20 text-white border-white/40',
  },
  yellow: {
    border: 'border-[#FFD21C]',
    glow: 'shadow-[0_0_20px_rgba(255,210,28,0.45)]',
    bg: 'bg-[#FFD21C] text-slate-900 shadow-inner',
    nameColor: 'text-slate-900',
    badgeBg: 'bg-black/10 text-slate-900 border-black/20',
  },
  green: {
    border: 'border-[#08B83F]',
    glow: 'shadow-[0_0_20px_rgba(8,184,63,0.45)]',
    bg: 'bg-[#08B83F] text-white shadow-inner',
    nameColor: 'text-white',
    badgeBg: 'bg-white/20 text-white border-white/40',
  },
  red: {
    border: 'border-[#F01818]',
    glow: 'shadow-[0_0_20px_rgba(240,24,24,0.45)]',
    bg: 'bg-[#F01818] text-white shadow-inner',
    nameColor: 'text-white',
    badgeBg: 'bg-white/20 text-white border-white/40',
  },
};

export const PlayerSeat: React.FC<PlayerSeatProps> = ({
  player,
  position,
  isCurrentTurn,
  isAnimating,
  debugVisuals = false,
  onRollDice,
}) => {
  const styles = COLOR_ACCENTS[player.color];
  const isRightSide = position === 'top-right' || position === 'bottom-right';

  return (
    <div
      className={`relative flex items-center gap-2 p-1.5 sm:p-2 rounded-2xl border transition-all duration-200 select-none ${
        isCurrentTurn
          ? `${styles.border} ${styles.glow} ring-1 ring-white/40 scale-[1.02] z-20 ${styles.bg}`
          : 'border-slate-800/90 bg-slate-900/75 opacity-85 hover:opacity-95'
      } ${isRightSide ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}
    >
      {/* Player Avatar */}
      <PlayerAvatar
        avatar={player.avatar}
        name={player.name}
        color={player.color}
        isCurrentTurn={isCurrentTurn}
        isAi={player.isAi}
        size={38}
      />

      {/* Player Information Card */}
      <div className="flex flex-col min-w-0 max-w-[90px] sm:max-w-[120px] md:max-w-[140px] truncate">
        {/* Name and Color Tag */}
        <div className="flex items-center gap-1.5 truncate">
          <span className={"text-xs sm:text-sm font-black truncate tracking-tight $\{isCurrentTurn ? 'text-inherit' : 'text-slate-100'\}"}>
            {player.name}
          </span>
        </div>

        {/* Status and Connection */}
        <PlayerStatus
          status={player.status}
          connectionStatus={player.connectionStatus}
          finishedCount={player.finishedCount}
          isCurrentTurn={isCurrentTurn}
          color={player.color}
        />

        {/* Token Progress Indicators (4 dots) */}
        <div className={`flex items-center gap-1 mt-0.5 ${isRightSide ? 'justify-end' : 'justify-start'}`}>
          {player.tokens.map((t) => (
            <span
              key={t.id}
              title={`Token ${t.id + 1}: ${t.state}`}
              className={`w-1.5 h-1.5 rounded-full border ${
                t.state === 'FINISHED'
                  ? 'bg-amber-400 border-amber-200 shadow-sm'
                  : t.state === 'ON_BOARD'
                  ? 'bg-emerald-400 border-emerald-200'
                  : 'bg-slate-700 border-slate-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* DiceSlot: Stable, controlled dimensions, isolation: isolate, overflow: visible */}
      <div
        className={`dice-slot relative shrink-0 flex items-center justify-center overflow-visible ml-0.5 mr-0.5 ${
          debugVisuals ? 'outline outline-1 outline-dashed outline-pink-400' : ''
        }`}
        style={{
          width: 48,
          height: 56,
          zIndex: 10,
          isolation: 'isolate',
        }}
      >
        <PlayerDice
          playerId={player.id}
          playerColor={player.color}
          value={player.dice.value}
          state={player.dice.state}
          rollId={player.dice.rollId}
          isCurrentTurn={isCurrentTurn}
          isAnimating={isAnimating}
          onRoll={onRollDice}
          size={44}
          debugVisuals={debugVisuals}
        />
      </div>
    </div>
  );
};


