import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Player, PlayerColor } from '../../types/player';
import { AudioService } from '../../services/AudioService';
import { Button } from '../common/Button';
import { Trophy, RotateCcw, Home } from 'lucide-react';
import { PlayerAvatar } from '../players/PlayerAvatar';

interface VictoryModalProps {
  winner: PlayerColor | null;
  rankings: PlayerColor[];
  players: Record<PlayerColor, Player>;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  winner,
  rankings,
  players,
  onPlayAgain,
  onBackToMenu,
}) => {
  useEffect(() => {
    if (winner) {
      AudioService.getInstance().playWinSound();

      // Confetti burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      const timer = setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [winner]);

  if (!winner) return null;

  const winnerPlayer = players[winner];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-400/80 shadow-[0_0_50px_rgba(245,158,11,0.4)] p-6 text-center select-none">
        {/* Glow Halo */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-gradient-to-b from-amber-300 via-yellow-500 to-amber-600 border-4 border-amber-200 shadow-[0_0_30px_rgba(245,158,11,0.8)] flex items-center justify-center text-4xl animate-bounce">
          <Trophy className="w-12 h-12 text-slate-950 fill-current drop-shadow-md" />
        </div>

        <div className="mt-10">
          <span className="text-xs font-black tracking-widest text-amber-400 uppercase">
            Victory Celebration
          </span>
          <h2 className="text-2xl font-black text-white mt-1">
            {winnerPlayer.name} Wins!
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Congratulations! All 4 tokens safely reached the center HOME.
          </p>
        </div>

        {/* Podium Card */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
          <div className="flex items-center justify-center gap-3">
            <PlayerAvatar avatar={winnerPlayer.avatar} color={winnerPlayer.color} size="lg" />
            <div className="text-left">
              <div className="font-extrabold text-sm text-slate-100">
                {winnerPlayer.name}
              </div>
              <div className="text-xs font-semibold text-emerald-400">
                Champion #1
              </div>
            </div>
          </div>

          {/* Rankings breakdown */}
          {rankings.length > 1 && (
            <div className="mt-4 pt-3 border-t border-slate-700/60 text-xs text-slate-300 space-y-1">
              {rankings.map((color, idx) => (
                <div key={color} className="flex justify-between items-center">
                  <span>#{idx + 1} {players[color].name}</span>
                  <span className="text-slate-400 font-mono">Rank {idx + 1}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-2.5">
          <Button variant="primary" fullWidth size="md" onClick={onPlayAgain}>
            <RotateCcw className="w-4 h-4" />
            Play Again
          </Button>

          <Button variant="secondary" fullWidth size="sm" onClick={onBackToMenu}>
            <Home className="w-4 h-4" />
            Main Menu
          </Button>
        </div>
      </div>
    </div>
  );
};

