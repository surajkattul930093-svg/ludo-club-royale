import { GameMode, GameState } from '../types/game';
import { Player, PlayerColor } from '../types/player';
import { PLAYER_START_INDEX } from './boardPath';
import { authService } from '../services/AuthService';

export function createInitialPlayer(
  color: PlayerColor,
  name: string,
  avatar: string,
  isAi = false,
  isFirstPlayer = false
): Player {
  return {
    id: `player_${color}`,
    color,
    name,
    avatar,
    isAi,
    hasFinished: false,
    tokens: [
      { id: 0, state: 'HOME', stepsFromStart: 0, pathIndex: null },
      { id: 1, state: 'HOME', stepsFromStart: 0, pathIndex: null },
      { id: 2, state: 'HOME', stepsFromStart: 0, pathIndex: null },
      { id: 3, state: 'HOME', stepsFromStart: 0, pathIndex: null },
    ],
    startTrackIndex: PLAYER_START_INDEX[color],
    finishedCount: 0,
    rank: null,
    status: isFirstPlayer ? 'READY' : 'WAITING',
    connectionStatus: 'ONLINE',
    coins: 0,
    level: 1,
    dice: {
      playerId: `player_${color}`,
      value: null,
      state: isFirstPlayer ? 'READY' : 'IDLE',
    }
  };
}

export function createInitialGameState(mode: GameMode = 'pass_and_play', selectedColors: PlayerColor[] = [], myColor?: PlayerColor, remotePlayers?: any[]): GameState {
  let activeColors: PlayerColor[] = [];
  if (selectedColors.length > 0) {
    activeColors = selectedColors;
    if (mode === 'vs_computer') {
      activeColors = ['blue', 'yellow', 'green', 'red'];
    }
  } else {
    activeColors = mode === '2_player' ? ['blue', 'green'] : ['blue', 'yellow', 'green', 'red'];
  }

  // Always keep standard clockwise turn order so TurnManager works correctly
  const clockwise: PlayerColor[] = ['blue', 'yellow', 'green', 'red'];
  activeColors.sort((a, b) => clockwise.indexOf(a) - clockwise.indexOf(b));

  const firstColor = selectedColors.length > 0 ? selectedColors[0] : activeColors[0];
  const players = {} as Record<PlayerColor, Player>;

  const defaultNames = {
    blue: 'Player 1',
    yellow: 'Player 2',
    green: 'Player 3',
    red: 'Player 4',
  };

  const defaultAvatars = {
    blue: 'dY`',
    yellow: '-?',
    green: 'dY??',
    red: 'dY"',
  };

  activeColors.forEach((color, index) => {
    let isAi = false;
    let name = defaultNames[color];
    let avatar = defaultAvatars[color];

    if (mode === 'vs_computer') {
      if (color === firstColor) {
        name = authService.getCurrentUser()?.displayName || 'Player 1';
        avatar = authService.getCurrentUser()?.avatar || defaultAvatars[color];
      } else {
        isAi = true;
        name = `Bot ${color.charAt(0).toUpperCase() + color.slice(1)}`;
        avatar = 'Ã°Å¸Â¤â€“';
      }
    } else if (mode === '2_player') {
      if (color === firstColor) {
        name = authService.getCurrentUser()?.displayName || 'Player 1';
        avatar = authService.getCurrentUser()?.avatar || defaultAvatars[color];
      }
      name = color === firstColor ? name : 'Player 2';
    } else if (mode === 'pass_and_play') {
      if (color === firstColor) {
        name = authService.getCurrentUser()?.displayName || 'Player 1';
        avatar = authService.getCurrentUser()?.avatar || defaultAvatars[color];
      } else {
        const turnOrderIndex = (index - activeColors.indexOf(firstColor) + activeColors.length) % activeColors.length;
        name = `Player ${turnOrderIndex + 1}`;
      }
    } else if (mode === 'online_multiplayer') {
      isAi = false;
      if (color === myColor) {
        name = authService.getCurrentUser()?.displayName || `Online ${color.charAt(0).toUpperCase() + color.slice(1)}`;
        avatar = authService.getCurrentUser()?.avatar || defaultAvatars[color];
      } else {
        const remoteProfile = remotePlayers?.find(p => p.color === color)?.profile;
        if (remoteProfile) {
          name = remoteProfile.username || remoteProfile.displayName || `Online ${color.charAt(0).toUpperCase() + color.slice(1)}`;
          avatar = remoteProfile.avatar || defaultAvatars[color];
        } else {
          name = `Online ${color.charAt(0).toUpperCase() + color.slice(1)}`;
          avatar = defaultAvatars[color];
        }
      }
    }

    players[color] = createInitialPlayer(
      color,
      name,
      avatar,
      isAi,
      color === firstColor
    );
  });

  return {
    gameId: 'game_' + Date.now(),
    mode,
    status: 'idle',
    players,
    activeColors,
    currentTurnColor: firstColor,
    currentPlayerId: players[firstColor].id,
    diceValue: null,
    isDiceRolling: false,
    consecutiveSixes: 0,
    turnNumber: 1,
    winner: null,
    rankings: [],
    movableTokenIds: [],
    selectedTokenId: null,
    lastActionMessage: `${players[firstColor].name}'s turn! Roll the dice.`,
    soundEnabled: true,
    animationSpeed: 180,
    isAnimating: false,
    animatingToken: null,
    debugMode: false,
    debugBoard: false,
    debugLog: null,
  };
}




