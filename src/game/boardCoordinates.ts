/**
 * Re-exports from authoritative boardPath.ts to ensure a single source of truth.
 */
export * from './boardPath';
export {
  BOARD_PATH as TRACK_CELLS_PATH,
  PLAYER_START_INDEX as PLAYER_START_TRACK_INDEX,
  SAFE_CELL_SET as SAFE_TRACK_INDICES,
} from './boardPath';
