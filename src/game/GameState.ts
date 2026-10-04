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
  };
}

export function createInitialGameState(mode: GameMode = 'pass_and_play', selectedColors: PlayerColor[] = [], myColor?: PlayerColor): GameState {
  // If no selected colors provided, fallback to defaults
  let activeColors: PlayerColor[] = [];
  if (selectedColors.length > 0) {
    activeColors = selectedColors;
    if (mode === 'vs_computer') {
      const all: PlayerColor[] = ['blue', 'yellow', 'green', 'red'];
      activeColors = [selectedColors[0], ...all.filter(c => c !== selectedColors[0])];
    }
  } else {
    activeColors = mode === '2_player' ? ['blue', 'green'] : ['blue', 'yellow', 'green', 'red'];
  }

  const firstColor = activeColors[0];
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

    if (mode === 'vs_computer' && index > 0) {
      isAi = true;
      name = `Bot ${color.charAt(0).toUpperCase() + color.slice(1)}`;
    }

    if (mode === '2_player') {
      name = index === 0 ? 'Player 1' : 'Player 2';
    }

    if (mode === 'pass_and_play') {
      name = `Player ${index + 1}`;
    }

    if (mode === 'online_multiplayer') {
      name = `Online ${color.charAt(0).toUpperCase() + color.slice(1)}`;
      isAi = false;
    }

    players[color] = createInitialPlayer(
      color,
      (color === myColor ? (authService.getCurrentUser()?.displayName || name) : name),
      isAi ? '🤖' : (color === myColor ? (authService.getCurrentUser()?.avatar || defaultAvatars[color]) : defaultAvatars[color]),
      isAi,
      color === firstColor
    );
  });

  return {
    gameId: 'game_' + Date.now(),
    mode,
    players,
    activeColors,
    currentTurn: firstColor,
    diceValue: 1,
    isRolling: false,
    canRoll: true,
    message: `${players[firstColor].name}'s turn! Roll the dice.`,
    winner: null,
    rankings: [],
    consecutiveSixes: 0,
    hasRolled: false,
  };
}
