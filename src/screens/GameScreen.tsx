import React, { useEffect, useState, useMemo, useRef } from 'react';
import { GameEngine } from '../game/GameEngine';
import { GameMode, GameState } from '../types/game';
import { Token } from '../types/token';
import { PlayerColor } from '../types/player';
import { GameBoard } from '../components/board/GameBoard';
import { GameHUD } from '../components/hud/GameHUD';
import { PlayerSeat } from '../components/players/PlayerSeat';
import { VictoryModal } from '../components/modals/VictoryModal';
import { SettingsModal } from '../components/modals/SettingsModal';
import { AudioService } from '../services/AudioService';
import { socketService } from '../services/SocketService';

interface GameScreenProps {
  remotePlayers?: any[];
  mode: GameMode;
  selectedColors?: PlayerColor[];
  localColor?: PlayerColor | null;
  gameId?: string | null;
  onBackToMenu: () => void;
  soundEnabled: boolean;
  animationSpeed: number;
  onToggleSound: () => void;
  onChangeAnimationSpeed: (speedMs: number) => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  mode,
  selectedColors,
  localColor,
  gameId,
  onBackToMenu,
  soundEnabled,
  animationSpeed,
  onToggleSound,
  onChangeAnimationSpeed,
  remotePlayers,
}) => {
  const engine = useMemo(() => new GameEngine(mode, selectedColors, localColor || undefined, remotePlayers), [mode, selectedColors, localColor, remotePlayers]);
  const [gameState, setGameState] = useState<GameState>(engine.getState());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const actionQueueRef = useRef<any[]>([]);
  const isProcessingQueueRef = useRef(false);

  useEffect(() => {
    if (mode === 'online_multiplayer') {
      if (gameId && localColor) {
        const handleConnect = () => {
          socketService.emitRejoinGame(gameId, localColor);
        };
        // Emit once in case we are already connected
        socketService.emitRejoinGame(gameId, localColor);
        socketService.onConnect(handleConnect);

        return () => {
          socketService.offConnect(handleConnect);
        };
      }
    }
  }, [mode, gameId, localColor]);

  useEffect(() => {
    if (mode === 'online_multiplayer' && gameId && localColor) {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          socketService.emitGameAction(gameId, { type: 'PLAYER_OFFLINE', color: localColor });
        } else {
          socketService.emitGameAction(gameId, { type: 'PLAYER_ONLINE', color: localColor });
          socketService.emitRejoinGame(gameId, localColor);
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  }, [mode, gameId, localColor]);

  useEffect(() => {
    if (mode === 'online_multiplayer') {
      const processQueue = () => {
        if (actionQueueRef.current.length === 0) {
          isProcessingQueueRef.current = false;
          return;
        }

        // Check if engine is currently busy animating
        if (engine.getState().isAnimating) {
          setTimeout(processQueue, 100);
          return;
        }

        const action = actionQueueRef.current.shift();
        if (action.type === 'ROLL') {
          engine.rollDice(action.value);
          // Give engine a moment to update state to animating/processing
          setTimeout(processQueue, 100);
        } else if (action.type === 'MOVE') {
          engine.moveToken(action.tokenId, () => {
            AudioService.getInstance().playTokenMoveSound();
          });
          setTimeout(processQueue, 100);
        } else if (action.type === 'PLAYER_LEFT') {
          engine.removePlayer(action.color);
          setTimeout(processQueue, 100);
        } else if (action.type === 'PLAYER_OFFLINE') {
          engine.setConnectionStatus(action.color, 'OFFLINE');
          setTimeout(processQueue, 100);
        } else if (action.type === 'PLAYER_ONLINE') {
          engine.setConnectionStatus(action.color, 'ONLINE');
          setTimeout(processQueue, 100);
        } else {
          processQueue();
        }
      };

      const handleRemoteAction = (action: any) => {
        actionQueueRef.current.push(action);
        if (!isProcessingQueueRef.current) {
          isProcessingQueueRef.current = true;
          processQueue();
        }
      };

      socketService.onGameAction(handleRemoteAction);
      return () => {
        socketService.offGameAction(handleRemoteAction);
      };
    }
  }, [engine, mode]);

  useEffect(() => {
    engine.setSoundEnabled(soundEnabled);
    engine.setAnimationSpeed(animationSpeed);
    const unsubscribe = engine.subscribe((newState) => {
      setGameState(newState);
    });

    return () => {
      unsubscribe();
    };
  }, [engine, soundEnabled, animationSpeed]);

  const allTokens: Token[] = useMemo(() => {
    const list: Token[] = [];
    for (const color of gameState.activeColors) {
      const player = gameState.players[color];
      if (player) {
        for (const t of player.tokens) {
          list.push({
            id: t.id,
            playerId: player.id,
            color: player.color,
            state: t.state,
            stepsFromStart: t.stepsFromStart,
            pathIndex: t.pathIndex,
          });
        }
      }
    }
    return list;
  }, [gameState.players, gameState.activeColors]);

  const handleRollDice = (color: PlayerColor) => {
    if (color === gameState.currentTurnColor && !gameState.isAnimating) {
      if (mode === 'online_multiplayer' && localColor !== color) return;
      const val = engine.rollDice();
      if (mode === 'online_multiplayer') {
        socketService.emitGameAction(gameId || '', { type: 'ROLL', color, value: val });
      }
    }
  };

  const handleTokenClick = (tokenId: number) => {
    if (!gameState.isAnimating) {
      if (mode === 'online_multiplayer' && localColor !== gameState.currentTurnColor) return;
      engine.moveToken(tokenId, () => {
        AudioService.getInstance().playTokenMoveSound();
      });
      if (mode === 'online_multiplayer') {
        socketService.emitGameAction(gameId || '', { type: 'MOVE', tokenId });
      }
    }
  };

  const handleBackToMenu = () => {
    if (mode === 'online_multiplayer') {
      socketService.emitGameAction(gameId || '', { type: 'PLAYER_LEFT', color: localColor });
    }
    onBackToMenu();
  };

  const handleRestart = () => {
    if (!gameState.isAnimating) {
      engine.restartGame(mode);
    }
  };

  const { players, currentTurnColor, activeColors, isAnimating } = gameState;

  // Dynamic orientation logic
  const targetBottomLeft = localColor || 'red';
  const colorsClockwise: PlayerColor[] = ['blue', 'yellow', 'green', 'red'];
  const targetIndex = colorsClockwise.indexOf(targetBottomLeft);
  const offset = (3 - targetIndex + 4) % 4; // 0 for Red, 1 for Green, 2 for Yellow, 3 for Blue
  const boardRotation = offset * 90;

  const getPosColor = (screenIndex: number) => colorsClockwise[(screenIndex - offset + 4) % 4];
  const topLeftColor = getPosColor(0);
  const topRightColor = getPosColor(1);
  const bottomRightColor = getPosColor(2);
  const bottomLeftColor = getPosColor(3);

  const renderSeat = (color: PlayerColor, position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => {
    if (!activeColors.includes(color)) return <div className="flex-1 max-w-[48%]" />;
    return (
      <div className="flex-1 max-w-[48%]">
        <PlayerSeat
          player={players[color]}
          position={position}
          isCurrentTurn={currentTurnColor === color}
          isAnimating={isAnimating}
          debugVisuals={gameState.debugMode}
          onRollDice={() => handleRollDice(color)}
        />
      </div>
    );
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-gradient-to-b from-slate-950 via-[#071630] to-slate-950 text-slate-100 select-none overflow-x-hidden p-1 sm:p-2">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none" />

      <GameHUD
        players={players}
        currentTurnColor={currentTurnColor}
        lastActionMessage={gameState.lastActionMessage}
        soundEnabled={soundEnabled}
        isAnimating={isAnimating}
        debugMode={gameState.debugMode}
        debugBoard={gameState.debugBoard}
        debugLog={gameState.debugLog}
        onToggleSound={onToggleSound}
        onToggleDebug={() => engine.toggleDebugMode()}
        onToggleDebugBoard={() => engine.toggleDebugBoard()}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onBackToMenu={handleBackToMenu}
        onRestart={mode === 'online_multiplayer' ? undefined : handleRestart}
      />

      <main className="w-full flex-1 flex flex-col items-center justify-center my-auto py-1">
        <div className="w-full max-w-[560px] flex flex-col items-center gap-1 sm:gap-2">
          <div className="w-full flex items-center justify-between px-1 gap-2">
            {renderSeat(topLeftColor, 'top-left')}
            {renderSeat(topRightColor, 'top-right')}
          </div>

          <div className="w-full flex items-center justify-center">
            <div style={{ transform: `rotate(${boardRotation}deg)`, transition: 'transform 0.5s' }}><GameBoard
              tokens={allTokens}
              animatingToken={gameState.animatingToken}
              isAnimating={isAnimating}
              movableTokenIds={gameState.movableTokenIds}
              selectedTokenId={gameState.selectedTokenId}
              currentTurnColor={currentTurnColor}
              debugBoard={gameState.debugBoard}
              onTokenClick={handleTokenClick} /></div>
          </div>

          <div className="w-full flex items-center justify-between px-1 gap-2">
            {renderSeat(bottomLeftColor, 'bottom-left')}
            {renderSeat(bottomRightColor, 'bottom-right')}
          </div>
        </div>
      </main>

      <VictoryModal
        winner={gameState.winner}
        rankings={gameState.rankings}
        players={players}
        onPlayAgain={handleRestart}
        onBackToMenu={handleBackToMenu}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        soundEnabled={soundEnabled}
        animationSpeed={animationSpeed}
        onToggleSound={onToggleSound}
        onChangeAnimationSpeed={onChangeAnimationSpeed}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};







