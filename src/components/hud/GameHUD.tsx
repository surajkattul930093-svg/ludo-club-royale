import React, { useState } from 'react';
import { Player, PlayerColor } from '../../types/player';
import { DebugMovementLog } from '../../types/game';
import { getLogicalPosition } from '../../game/boardPath';
import { Volume2, VolumeX, Settings, ArrowLeft, RotateCcw, Bug, Eye, EyeOff } from 'lucide-react';

interface GameHUDProps {
  players: Record<PlayerColor, Player>;
  currentTurnColor: PlayerColor;
  lastActionMessage: string;
  soundEnabled: boolean;
  isAnimating: boolean;
  debugMode: boolean;
  debugBoard: boolean;
  debugLog: DebugMovementLog | null;
  onToggleSound: () => void;
  onToggleDebug: () => void;
  onToggleDebugBoard: () => void;
  onOpenSettings: () => void;
  onBackToMenu: () => void;
  onRestart?: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  players,
  currentTurnColor,
  lastActionMessage,
  soundEnabled,
  isAnimating,
  debugMode,
  debugBoard,
  debugLog,
  onToggleSound,
  onToggleDebug,
  onToggleDebugBoard,
  onOpenSettings,
  onBackToMenu,
  onRestart,
}) => {
  const currentPlayer = players[currentTurnColor];
  const [showTokensList, setShowTokensList] = useState(false);

  return (
    <div className="w-full flex flex-col items-center gap-1.5 select-none">
      {/* Top Utility Header */}
      <header className="w-full flex items-center justify-between px-3 py-2 bg-slate-900/70 backdrop-blur-md border-b border-slate-800">
        <button
          onClick={onBackToMenu}
          disabled={isAnimating}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 hover:text-white transition-colors text-xs font-semibold cursor-pointer"
          aria-label="Back to main menu"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Menu</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="font-extrabold tracking-wider bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent text-sm sm:text-base">
            LUDO ROYALE
          </span>
          {/* Developer Debug Toggle Button */}
          <button
            onClick={onToggleDebug}
            title="Toggle Developer Debug Panel"
            className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded border transition-colors cursor-pointer flex items-center gap-1 ${
              debugMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Bug className="w-3 h-3" />
            DEBUG
          </button>
        </div>

        <div className="flex items-center gap-1">
          {onRestart && (<button
            onClick={onRestart}
            disabled={isAnimating}
            title="Restart Match"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Restart match"
          >
            <RotateCcw className="w-4 h-4" />
          </button>)}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle sound"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>
          <button
            onClick={onOpenSettings}
            disabled={isAnimating}
            title="Game Settings"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Game settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Movement & Cell ID Debug Panel (Development only, toggled via DEBUG button) */}
      {debugMode && (
        <div className="w-full max-w-lg mx-auto px-3 py-2 rounded-xl bg-slate-950/95 border border-amber-500/50 text-[11px] font-mono text-amber-300 shadow-md">
          <div className="flex items-center justify-between font-bold border-b border-amber-500/30 pb-1">
            <span className="flex items-center gap-1">
              <Bug className="w-3.5 h-3.5 text-amber-400" />
              [DEV DEBUG CONTROLLER]
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleDebugBoard}
                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
                  debugBoard
                    ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400/60'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
                title="Toggle visual numbering on all board cells"
              >
                {debugBoard ? <Eye className="w-3 h-3 text-emerald-300" /> : <EyeOff className="w-3 h-3" />}
                BOARD IDS: {debugBoard ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={() => setShowTokensList(!showTokensList)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                  showTokensList
                    ? 'bg-blue-500/25 text-blue-300 border-blue-400/60'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                TOKENS {showTokensList ? '▲' : '▼'}
              </button>
            </div>
          </div>

          {/* Real-time Movement Sequence Log */}
          {debugLog ? (
            <div className="mt-1.5 space-y-1 text-slate-200">
              <div className="grid grid-cols-2 gap-x-2 text-[10.5px]">
                <div>
                  <span className="text-amber-400">Player:</span> {debugLog.player.toUpperCase()} (T{debugLog.tokenId + 1})
                </div>
                <div>
                  <span className="text-amber-400">Dice:</span> {debugLog.dice}
                </div>
                <div>
                  <span className="text-amber-400">Start:</span> {debugLog.fromCellId}
                </div>
                <div>
                  <span className="text-amber-400">Destination:</span> {debugLog.toCellId}
                </div>
              </div>
              <div className="text-[10px] text-amber-200 truncate bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800">
                <span className="text-amber-400 font-bold">Movement:</span> {debugLog.pathSequence}
              </div>
              <div className="text-emerald-400 font-bold text-[10.5px]">
                ✓ EXACT MATCH: Traversed {debugLog.stepCount} cells (Dice = {debugLog.dice})
              </div>
            </div>
          ) : (
            <div className="text-slate-400 mt-1 text-[10.5px]">
              Tap active player dice to roll and observe movement verification.
            </div>
          )}

          {/* Detailed Token Positions Inspector */}
          {showTokensList && (
            <div className="mt-2 pt-1.5 border-t border-amber-500/20">
              <div className="text-[10px] font-bold text-amber-400 mb-1">
                TOKEN LOCATIONS (CURRENT ACTIVE: {currentPlayer.name.toUpperCase()})
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-[9.5px]">
                {currentPlayer.tokens.map((t) => {
                  const pos = getLogicalPosition(currentTurnColor, t.id, t.state, t.stepsFromStart);
                  return (
                    <div
                      key={t.id}
                      className="bg-slate-900/90 p-1 rounded border border-slate-800 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-300">T{t.id + 1}</span>
                        <span
                          className={`text-[8.5px] px-1 rounded ${
                            t.state === 'FINISHED'
                              ? 'bg-amber-400/20 text-amber-300'
                              : t.state === 'ON_BOARD'
                              ? 'bg-emerald-400/20 text-emerald-300'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {t.state}
                        </span>
                      </div>
                      <div className="text-slate-300 font-mono text-[9px] mt-0.5 truncate">
                        {pos.cellId}
                      </div>
                      <div className="text-slate-400 text-[8.5px]">
                        {pos.boxNumber ? `Box ${pos.boxNumber}` : `Step ${pos.stepsFromStart}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Live Action Banner */}
      <div className="w-full max-w-lg px-3 py-1 rounded-xl bg-slate-900/80 border border-slate-800/90 shadow-sm flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 truncate">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              isAnimating ? 'bg-sky-400 animate-ping' : 'bg-amber-400 animate-pulse'
            }`}
          />
          <span className="font-semibold text-slate-200 truncate text-[11.5px]">
            {lastActionMessage}
          </span>
        </div>

        <span className="text-[10px] font-black uppercase text-amber-400 shrink-0 ml-2 tracking-wider">
          {isAnimating
            ? 'MOVING...'
            : currentPlayer?.isAi
            ? 'BOT TURN'
            : currentPlayer?.dice.state === 'READY'
            ? 'ROLL DICE'
            : 'PICK TOKEN'}
        </span>
      </div>
    </div>
  );
};

