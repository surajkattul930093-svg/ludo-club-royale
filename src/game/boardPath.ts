import { PlayerColor } from '../types/player';

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface BoardCellMetadata {
  id: number; // 0 to 51 (authoritative track index)
  boxNumber: number; // 1 to 52 (authoritative human-readable box number)
  cellId: string; // e.g. 'MAIN-01' to 'MAIN-52'
  debugLabel: string; // e.g. '01' to '52'
  row: number; // 0 to 14
  col: number; // 0 to 14
  direction: Direction;
  isSafe?: boolean;
  isStartFor?: PlayerColor;
  hasStraightArrow?: boolean;
  hasTurnArrow?: boolean;
}

export interface GridCoord {
  row: number;
  col: number;
}

export interface CellRegistryItem {
  cellId: string;
  debugLabel: string;
  type: 'MAIN' | 'HOME_PATH' | 'BASE' | 'FINISH';
  row: number;
  col: number;
  color?: PlayerColor;
  pathIndex?: number;
  boxNumber?: number;
  isSafe?: boolean;
  isStartFor?: PlayerColor;
  description: string;
}

/**
 * Colors used across the board
 */
export const BOARD_COLORS = {
  blue: '#0878E8',
  yellow: '#FFD21C',
  green: '#08B83F',
  red: '#F01818',
  darkBlue: '#002E7A',
  borderGold: '#F8BF2A',
  cellBg: '#FFFFFF',
  cellBorder: '#23272F',
} as const;

/**
 * 52 cells of the perimeter main track in the exact clockwise order a token travels.
 * Index 0 is Blue Start (Row 6, Col 1), Box 1, 'MAIN-01'.
 * Follows strict movement order: Box 1 -> Box 2 -> ... -> Box 52.
 */
export const BOARD_PATH: BoardCellMetadata[] = [
  /* 0 - 4: Left Arm moving RIGHT towards top arm */
  { id: 0, boxNumber: 1, cellId: 'MAIN-01', debugLabel: '01', row: 6, col: 1, direction: 'RIGHT', isSafe: true, isStartFor: 'blue' },
  { id: 1, boxNumber: 2, cellId: 'MAIN-02', debugLabel: '02', row: 6, col: 2, direction: 'RIGHT' },
  { id: 2, boxNumber: 3, cellId: 'MAIN-03', debugLabel: '03', row: 6, col: 3, direction: 'RIGHT', hasStraightArrow: true },
  { id: 3, boxNumber: 4, cellId: 'MAIN-04', debugLabel: '04', row: 6, col: 4, direction: 'RIGHT' },
  { id: 4, boxNumber: 5, cellId: 'MAIN-05', debugLabel: '05', row: 6, col: 5, direction: 'RIGHT' },

  /* 5 - 10: Top Arm moving UP towards top edge */
  { id: 5, boxNumber: 6, cellId: 'MAIN-06', debugLabel: '06', row: 5, col: 6, direction: 'UP' },
  { id: 6, boxNumber: 7, cellId: 'MAIN-07', debugLabel: '07', row: 4, col: 6, direction: 'UP' },
  { id: 7, boxNumber: 8, cellId: 'MAIN-08', debugLabel: '08', row: 3, col: 6, direction: 'UP' },
  { id: 8, boxNumber: 9, cellId: 'MAIN-09', debugLabel: '09', row: 2, col: 6, direction: 'UP', isSafe: true }, // Neutral Safe Star
  { id: 9, boxNumber: 10, cellId: 'MAIN-10', debugLabel: '10', row: 1, col: 6, direction: 'UP' },
  { id: 10, boxNumber: 11, cellId: 'MAIN-11', debugLabel: '11', row: 0, col: 6, direction: 'RIGHT', hasTurnArrow: true },

  /* 11 - 12: Top edge across center */
  { id: 11, boxNumber: 12, cellId: 'MAIN-12', debugLabel: '12', row: 0, col: 7, direction: 'RIGHT' },
  { id: 12, boxNumber: 13, cellId: 'MAIN-13', debugLabel: '13', row: 0, col: 8, direction: 'DOWN' },

  /* 13 - 17: Top Arm moving DOWN towards center */
  { id: 13, boxNumber: 14, cellId: 'MAIN-14', debugLabel: '14', row: 1, col: 8, direction: 'DOWN', isSafe: true, isStartFor: 'yellow' },
  { id: 14, boxNumber: 15, cellId: 'MAIN-15', debugLabel: '15', row: 2, col: 8, direction: 'DOWN', hasStraightArrow: true },
  { id: 15, boxNumber: 16, cellId: 'MAIN-16', debugLabel: '16', row: 3, col: 8, direction: 'DOWN' },
  { id: 16, boxNumber: 17, cellId: 'MAIN-17', debugLabel: '17', row: 4, col: 8, direction: 'DOWN' },
  { id: 17, boxNumber: 18, cellId: 'MAIN-18', debugLabel: '18', row: 5, col: 8, direction: 'DOWN' },

  /* 18 - 23: Right Arm moving RIGHT towards right edge */
  { id: 18, boxNumber: 19, cellId: 'MAIN-19', debugLabel: '19', row: 6, col: 9, direction: 'RIGHT' },
  { id: 19, boxNumber: 20, cellId: 'MAIN-20', debugLabel: '20', row: 6, col: 10, direction: 'RIGHT' },
  { id: 20, boxNumber: 21, cellId: 'MAIN-21', debugLabel: '21', row: 6, col: 11, direction: 'RIGHT' },
  { id: 21, boxNumber: 22, cellId: 'MAIN-22', debugLabel: '22', row: 6, col: 12, direction: 'RIGHT', isSafe: true }, // Neutral Safe Star
  { id: 22, boxNumber: 23, cellId: 'MAIN-23', debugLabel: '23', row: 6, col: 13, direction: 'RIGHT' },
  { id: 23, boxNumber: 24, cellId: 'MAIN-24', debugLabel: '24', row: 6, col: 14, direction: 'DOWN', hasTurnArrow: true },

  /* 24 - 25: Right edge across center */
  { id: 24, boxNumber: 25, cellId: 'MAIN-25', debugLabel: '25', row: 7, col: 14, direction: 'DOWN' },
  { id: 25, boxNumber: 26, cellId: 'MAIN-26', debugLabel: '26', row: 8, col: 14, direction: 'LEFT' },

  /* 26 - 30: Right Arm moving LEFT towards bottom arm */
  { id: 26, boxNumber: 27, cellId: 'MAIN-27', debugLabel: '27', row: 8, col: 13, direction: 'LEFT', isSafe: true, isStartFor: 'green' },
  { id: 27, boxNumber: 28, cellId: 'MAIN-28', debugLabel: '28', row: 8, col: 12, direction: 'LEFT' },
  { id: 28, boxNumber: 29, cellId: 'MAIN-29', debugLabel: '29', row: 8, col: 11, direction: 'LEFT', hasStraightArrow: true },
  { id: 29, boxNumber: 30, cellId: 'MAIN-30', debugLabel: '30', row: 8, col: 10, direction: 'LEFT' },
  { id: 30, boxNumber: 31, cellId: 'MAIN-31', debugLabel: '31', row: 8, col: 9, direction: 'LEFT' },

  /* 31 - 36: Bottom Arm moving DOWN towards bottom edge */
  { id: 31, boxNumber: 32, cellId: 'MAIN-32', debugLabel: '32', row: 9, col: 8, direction: 'DOWN' },
  { id: 32, boxNumber: 33, cellId: 'MAIN-33', debugLabel: '33', row: 10, col: 8, direction: 'DOWN' },
  { id: 33, boxNumber: 34, cellId: 'MAIN-34', debugLabel: '34', row: 11, col: 8, direction: 'DOWN' },
  { id: 34, boxNumber: 35, cellId: 'MAIN-35', debugLabel: '35', row: 12, col: 8, direction: 'DOWN', isSafe: true }, // Neutral Safe Star
  { id: 35, boxNumber: 36, cellId: 'MAIN-36', debugLabel: '36', row: 13, col: 8, direction: 'DOWN' },
  { id: 36, boxNumber: 37, cellId: 'MAIN-37', debugLabel: '37', row: 14, col: 8, direction: 'LEFT', hasTurnArrow: true },

  /* 37 - 38: Bottom edge across center */
  { id: 37, boxNumber: 38, cellId: 'MAIN-38', debugLabel: '38', row: 14, col: 7, direction: 'LEFT' },
  { id: 38, boxNumber: 39, cellId: 'MAIN-39', debugLabel: '39', row: 14, col: 6, direction: 'UP' },

  /* 39 - 43: Bottom Arm moving UP towards center */
  { id: 39, boxNumber: 40, cellId: 'MAIN-40', debugLabel: '40', row: 13, col: 6, direction: 'UP', isSafe: true, isStartFor: 'red' },
  { id: 40, boxNumber: 41, cellId: 'MAIN-41', debugLabel: '41', row: 12, col: 6, direction: 'UP', hasStraightArrow: true },
  { id: 41, boxNumber: 42, cellId: 'MAIN-42', debugLabel: '42', row: 11, col: 6, direction: 'UP' },
  { id: 42, boxNumber: 43, cellId: 'MAIN-43', debugLabel: '43', row: 10, col: 6, direction: 'UP' },
  { id: 43, boxNumber: 44, cellId: 'MAIN-44', debugLabel: '44', row: 9, col: 6, direction: 'UP' },

  /* 44 - 49: Left Arm moving LEFT towards left edge */
  { id: 44, boxNumber: 45, cellId: 'MAIN-45', debugLabel: '45', row: 8, col: 5, direction: 'LEFT' },
  { id: 45, boxNumber: 46, cellId: 'MAIN-46', debugLabel: '46', row: 8, col: 4, direction: 'LEFT' },
  { id: 46, boxNumber: 47, cellId: 'MAIN-47', debugLabel: '47', row: 8, col: 3, direction: 'LEFT' },
  { id: 47, boxNumber: 48, cellId: 'MAIN-48', debugLabel: '48', row: 8, col: 2, direction: 'LEFT', isSafe: true }, // Neutral Safe Star
  { id: 48, boxNumber: 49, cellId: 'MAIN-49', debugLabel: '49', row: 8, col: 1, direction: 'LEFT' },
  { id: 49, boxNumber: 50, cellId: 'MAIN-50', debugLabel: '50', row: 8, col: 0, direction: 'UP', hasTurnArrow: true },

  /* 50 - 51: Left edge across center */
  { id: 50, boxNumber: 51, cellId: 'MAIN-51', debugLabel: '51', row: 7, col: 0, direction: 'UP' },
  { id: 51, boxNumber: 52, cellId: 'MAIN-52', debugLabel: '52', row: 6, col: 0, direction: 'RIGHT' },
];

/**
 * Starting index on BOARD_PATH for each player
 */
export const PLAYER_START_INDEX: Record<PlayerColor, number> = {
  blue: 0, // Box 1, MAIN-01
  yellow: 13, // Box 14, MAIN-14
  green: 26, // Box 27, MAIN-27
  red: 39, // Box 40, MAIN-40
};

/**
 * 8 Safe Cells on the main track: 4 player start cells + 4 neutral star cells
 */
export const SAFE_CELL_INDICES: number[] = [0, 9, 13, 21, 26, 34, 39, 47];
export const SAFE_CELL_BOX_NUMBERS: number[] = [1, 10, 14, 22, 27, 35, 40, 48];
export const SAFE_CELL_SET = new Set(SAFE_CELL_INDICES);

export interface HomePathCell {
  row: number;
  col: number;
  stepIndex: number; // 0..4
  cellId: string; // e.g. 'BLUE-HOME-1'
  debugLabel: string; // e.g. 'BH1'
}

/**
 * Colored home path cells for each player leading towards center HOME.
 * Exactly 5 steps: step 51, 52, 53, 54, 55.
 */
export const HOME_PATHS: Record<PlayerColor, HomePathCell[]> = {
  blue: [
    { row: 7, col: 1, stepIndex: 0, cellId: 'BLUE-HOME-1', debugLabel: 'BH1' },
    { row: 7, col: 2, stepIndex: 1, cellId: 'BLUE-HOME-2', debugLabel: 'BH2' },
    { row: 7, col: 3, stepIndex: 2, cellId: 'BLUE-HOME-3', debugLabel: 'BH3' },
    { row: 7, col: 4, stepIndex: 3, cellId: 'BLUE-HOME-4', debugLabel: 'BH4' },
    { row: 7, col: 5, stepIndex: 4, cellId: 'BLUE-HOME-5', debugLabel: 'BH5' },
  ],
  yellow: [
    { row: 1, col: 7, stepIndex: 0, cellId: 'YELLOW-HOME-1', debugLabel: 'YH1' },
    { row: 2, col: 7, stepIndex: 1, cellId: 'YELLOW-HOME-2', debugLabel: 'YH2' },
    { row: 3, col: 7, stepIndex: 2, cellId: 'YELLOW-HOME-3', debugLabel: 'YH3' },
    { row: 4, col: 7, stepIndex: 3, cellId: 'YELLOW-HOME-4', debugLabel: 'YH4' },
    { row: 5, col: 7, stepIndex: 4, cellId: 'YELLOW-HOME-5', debugLabel: 'YH5' },
  ],
  green: [
    { row: 7, col: 13, stepIndex: 0, cellId: 'GREEN-HOME-1', debugLabel: 'GH1' },
    { row: 7, col: 12, stepIndex: 1, cellId: 'GREEN-HOME-2', debugLabel: 'GH2' },
    { row: 7, col: 11, stepIndex: 2, cellId: 'GREEN-HOME-3', debugLabel: 'GH3' },
    { row: 7, col: 10, stepIndex: 3, cellId: 'GREEN-HOME-4', debugLabel: 'GH4' },
    { row: 7, col: 9, stepIndex: 4, cellId: 'GREEN-HOME-5', debugLabel: 'GH5' },
  ],
  red: [
    { row: 13, col: 7, stepIndex: 0, cellId: 'RED-HOME-1', debugLabel: 'RH1' },
    { row: 12, col: 7, stepIndex: 1, cellId: 'RED-HOME-2', debugLabel: 'RH2' },
    { row: 11, col: 7, stepIndex: 2, cellId: 'RED-HOME-3', debugLabel: 'RH3' },
    { row: 10, col: 7, stepIndex: 3, cellId: 'RED-HOME-4', debugLabel: 'RH4' },
    { row: 9, col: 7, stepIndex: 4, cellId: 'RED-HOME-5', debugLabel: 'RH5' },
  ],
};

export interface CenterHomeCell {
  row: number;
  col: number;
  cellId: string;
  debugLabel: string;
}

/**
 * Center HOME finished coordinate (step 56)
 */
export const CENTER_HOME_COORDS: Record<PlayerColor, CenterHomeCell> = {
  blue: { row: 7, col: 6.2, cellId: 'BLUE-FINISH', debugLabel: 'B-WIN' },
  yellow: { row: 6.2, col: 7, cellId: 'YELLOW-FINISH', debugLabel: 'Y-WIN' },
  green: { row: 7, col: 7.8, cellId: 'GREEN-FINISH', debugLabel: 'G-WIN' },
  red: { row: 7.8, col: 7, cellId: 'RED-FINISH', debugLabel: 'R-WIN' },
};

export interface BaseSocketCell {
  row: number;
  col: number;
  socketId: number;
  cellId: string;
  debugLabel: string;
}

/**
 * Home base 4 sockets for each player
 */
export const HOME_BASE_SOCKETS: Record<PlayerColor, BaseSocketCell[]> = {
  blue: [
    { row: 1.85, col: 1.85, socketId: 0, cellId: 'BLUE-BASE-1', debugLabel: 'B-B1' },
    { row: 1.85, col: 3.65, socketId: 1, cellId: 'BLUE-BASE-2', debugLabel: 'B-B2' },
    { row: 3.65, col: 1.85, socketId: 2, cellId: 'BLUE-BASE-3', debugLabel: 'B-B3' },
    { row: 3.65, col: 3.65, socketId: 3, cellId: 'BLUE-BASE-4', debugLabel: 'B-B4' },
  ],
  yellow: [
    { row: 1.85, col: 10.85, socketId: 0, cellId: 'YELLOW-BASE-1', debugLabel: 'Y-B1' },
    { row: 1.85, col: 12.65, socketId: 1, cellId: 'YELLOW-BASE-2', debugLabel: 'Y-B2' },
    { row: 3.65, col: 10.85, socketId: 2, cellId: 'YELLOW-BASE-3', debugLabel: 'Y-B3' },
    { row: 3.65, col: 12.65, socketId: 3, cellId: 'YELLOW-BASE-4', debugLabel: 'Y-B4' },
  ],
  green: [
    { row: 10.85, col: 10.85, socketId: 0, cellId: 'GREEN-BASE-1', debugLabel: 'G-B1' },
    { row: 10.85, col: 12.65, socketId: 1, cellId: 'GREEN-BASE-2', debugLabel: 'G-B2' },
    { row: 12.65, col: 10.85, socketId: 2, cellId: 'GREEN-BASE-3', debugLabel: 'G-B3' },
    { row: 12.65, col: 12.65, socketId: 3, cellId: 'GREEN-BASE-4', debugLabel: 'G-B4' },
  ],
  red: [
    { row: 10.85, col: 1.85, socketId: 0, cellId: 'RED-BASE-1', debugLabel: 'R-B1' },
    { row: 10.85, col: 3.65, socketId: 1, cellId: 'RED-BASE-2', debugLabel: 'R-B2' },
    { row: 12.65, col: 1.85, socketId: 2, cellId: 'RED-BASE-3', debugLabel: 'R-B3' },
    { row: 12.65, col: 3.65, socketId: 3, cellId: 'RED-BASE-4', debugLabel: 'R-B4' },
  ],
};

/**
 * Master Registry of all playable board cells for lookup, debugging, and verification
 */
export const CELL_REGISTRY: Record<string, CellRegistryItem> = {};

// Register 52 main path cells
BOARD_PATH.forEach((cell) => {
  const item: CellRegistryItem = {
    cellId: cell.cellId,
    debugLabel: cell.debugLabel,
    type: 'MAIN',
    row: cell.row,
    col: cell.col,
    pathIndex: cell.id,
    boxNumber: cell.boxNumber,
    isSafe: cell.isSafe,
    isStartFor: cell.isStartFor,
    description: `Box ${cell.boxNumber} (${cell.cellId})${cell.isSafe ? ' [SAFE]' : ''}${cell.isStartFor ? ` [${cell.isStartFor.toUpperCase()} START]` : ''}`,
  };
  CELL_REGISTRY[cell.cellId] = item;
  CELL_REGISTRY[`${cell.boxNumber}`] = item;
  CELL_REGISTRY[`BOX-${cell.boxNumber}`] = item;
});

// Register home path cells
(['blue', 'yellow', 'green', 'red'] as PlayerColor[]).forEach((color) => {
  HOME_PATHS[color].forEach((hCell) => {
    const item: CellRegistryItem = {
      cellId: hCell.cellId,
      debugLabel: hCell.debugLabel,
      type: 'HOME_PATH',
      row: hCell.row,
      col: hCell.col,
      color,
      description: `${color.toUpperCase()} Home Path Step ${hCell.stepIndex + 1} (${hCell.cellId})`,
    };
    CELL_REGISTRY[hCell.cellId] = item;
    CELL_REGISTRY[hCell.debugLabel] = item;
  });

  const finishCell = CENTER_HOME_COORDS[color];
  const finishItem: CellRegistryItem = {
    cellId: finishCell.cellId,
    debugLabel: finishCell.debugLabel,
    type: 'FINISH',
    row: finishCell.row,
    col: finishCell.col,
    color,
    description: `${color.toUpperCase()} Center HOME Finished Area`,
  };
  CELL_REGISTRY[finishCell.cellId] = finishItem;

  HOME_BASE_SOCKETS[color].forEach((socket) => {
    const socketItem: CellRegistryItem = {
      cellId: socket.cellId,
      debugLabel: socket.debugLabel,
      type: 'BASE',
      row: socket.row,
      col: socket.col,
      color,
      description: `${color.toUpperCase()} Yard Socket ${socket.socketId + 1}`,
    };
    CELL_REGISTRY[socket.cellId] = socketItem;
  });
});

/**
 * Authoritative lookup helper:
 * Allows querying by "MAIN-27", "27", "Box 27", "BLUE-HOME-3", "RED-BASE-1", etc.
 */
export function getCellById(cellQuery: string | number): CellRegistryItem | null {
  const normalized = String(cellQuery).trim().toUpperCase().replace(/^BOX\s*#?/, 'BOX-');
  return CELL_REGISTRY[normalized] || null;
}

/**
 * Total steps to reach finished center HOME
 */
export const TOTAL_STEPS_TO_FINISH = 56;

export interface LogicalPosition {
  type: 'HOME' | 'TRACK' | 'HOME_PATH' | 'FINISHED';
  row: number;
  col: number;
  pathIndex: number | null; // 0..51 when on main track
  boxNumber: number | null; // 1..52 when on main track
  cellId: string; // e.g. 'MAIN-27', 'BLUE-HOME-3', 'BLUE-FINISH', 'BLUE-BASE-1'
  debugLabel: string; // e.g. '27', 'BH3', 'B-WIN', 'B-B1'
  stepsFromStart: number;
}

/**
 * Resolves logical stepsFromStart into exact grid coordinates, cellId, and pathIndex
 */
export function getLogicalPosition(
  color: PlayerColor,
  tokenId: number,
  state: 'HOME' | 'ON_BOARD' | 'FINISHED',
  stepsFromStart: number
): LogicalPosition {
  if (state === 'HOME') {
    const socket = HOME_BASE_SOCKETS[color][tokenId] || HOME_BASE_SOCKETS[color][0];
    return {
      type: 'HOME',
      row: socket.row,
      col: socket.col,
      pathIndex: null,
      boxNumber: null,
      cellId: socket.cellId,
      debugLabel: socket.debugLabel,
      stepsFromStart: 0,
    };
  }

  if (state === 'FINISHED' || stepsFromStart >= TOTAL_STEPS_TO_FINISH) {
    const finishCoord = CENTER_HOME_COORDS[color];
    return {
      type: 'FINISHED',
      row: finishCoord.row,
      col: finishCoord.col,
      pathIndex: null,
      boxNumber: null,
      cellId: finishCoord.cellId,
      debugLabel: finishCoord.debugLabel,
      stepsFromStart: TOTAL_STEPS_TO_FINISH,
    };
  }

  // ON_BOARD:
  if (stepsFromStart <= 50) {
    // On the 52-cell main track
    const startIdx = PLAYER_START_INDEX[color];
    const pathIndex = (startIdx + stepsFromStart) % 52;
    const cell = BOARD_PATH[pathIndex];
    return {
      type: 'TRACK',
      row: cell.row,
      col: cell.col,
      pathIndex,
      boxNumber: cell.boxNumber,
      cellId: cell.cellId,
      debugLabel: cell.debugLabel,
      stepsFromStart,
    };
  }

  // Home Path (stepsFromStart 51 to 55)
  const homePathIdx = stepsFromStart - 51;
  const homeCell = HOME_PATHS[color][homePathIdx] || HOME_PATHS[color][4];
  return {
    type: 'HOME_PATH',
    row: homeCell.row,
    col: homeCell.col,
    pathIndex: null,
    boxNumber: null,
    cellId: homeCell.cellId,
    debugLabel: homeCell.debugLabel,
    stepsFromStart,
  };
}

/**
 * Converts grid coordinate (row, col) on a 15x15 board to screen percentage coordinates
 */
export function gridToScreenPercentage(row: number, col: number): { leftPercent: number; topPercent: number } {
  const cellSize = 100 / 15;
  return {
    leftPercent: (col + 0.5) * cellSize,
    topPercent: (row + 0.5) * cellSize,
  };
}
