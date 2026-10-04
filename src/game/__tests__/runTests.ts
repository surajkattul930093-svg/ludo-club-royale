import { GameRules } from '../GameRules';
import { MovementEngine } from '../MovementEngine';
import { createInitialGameState, createInitialPlayer } from '../GameState';
import { GameEngine } from '../GameEngine';
import {
  BOARD_PATH,
  PLAYER_START_INDEX,
  SAFE_CELL_SET,
  TOTAL_STEPS_TO_FINISH,
} from '../boardPath';

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passCount++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failCount++;
  }
}

console.log('--- RUNNING LUDO ENGINE TESTS ---');

// 1. Test dice 1..6 = exactly 1..6 steps
console.log('\n[1] Testing Step Count vs Dice Value (1 to 6):');
for (let dice = 1; dice <= 6; dice++) {
  const queue = MovementEngine.generateMovementQueue('blue', 0, 'ON_BOARD', 10, dice);
  assert(queue.length === dice, `Dice ${dice} produces exactly ${dice} movement steps (got ${queue.length})`);
  assert(
    queue[queue.length - 1].stepsFromStart === 10 + dice,
    `Dice ${dice} destination stepsFromStart is 10 + ${dice} = ${10 + dice}`
  );
}

// 2. Test HOME + dice 6 valid entry
console.log('\n[2] Testing HOME Entry Rules:');
const homeToken = { id: 0, state: 'HOME' as const, stepsFromStart: 0, pathIndex: null };
assert(!GameRules.canTokenMove(homeToken, 5), 'Cannot move from HOME on dice 5');
assert(GameRules.canTokenMove(homeToken, 6), 'Can move from HOME on dice 6');

const homeEntryQueue = MovementEngine.generateMovementQueue('blue', 0, 'HOME', 0, 6);
assert(homeEntryQueue.length === 1, 'HOME exit queue has exactly 1 step (to start cell)');
assert(homeEntryQueue[0].stepsFromStart === 0, 'HOME exit sets stepsFromStart to 0 (start cell)');
assert(
  homeEntryQueue[0].logicalPos.pathIndex === PLAYER_START_INDEX.blue,
  `HOME exit lands on Blue start cell (index ${PLAYER_START_INDEX.blue})`
);

// 3. Test Capture on non-safe cell
console.log('\n[3] Testing Capture on Non-Safe Cell:');
const state = createInitialGameState('pass_and_play');
// Place Yellow token 0 on track cell 5 (not safe)
state.players.yellow.tokens[0] = {
  id: 0,
  state: 'ON_BOARD',
  stepsFromStart: (5 - PLAYER_START_INDEX.yellow + 52) % 52,
  pathIndex: 5,
};
// Blue token starts at 0, moves 5 steps -> lands on cell 5
const captures = GameRules.checkCapture('blue', 5, state.players);
assert(captures.length === 1, 'Opponent captured on non-safe cell 5');
assert(
  captures[0]?.capturedColor === 'yellow' && captures[0]?.capturedTokenId === 0,
  'Captured token is Yellow-0'
);

// 4. Test No Capture on Safe Cell
console.log('\n[4] Testing Safe Cell Immunity:');
// Cell 0 is Blue start (safe), Cell 9 is safe star, Cell 13 is Yellow start (safe)
// Place Yellow on Cell 9 (safe star)
state.players.yellow.tokens[0] = {
  id: 0,
  state: 'ON_BOARD',
  stepsFromStart: (9 - PLAYER_START_INDEX.yellow + 52) % 52,
  pathIndex: 9,
};
const safeCaptures = GameRules.checkCapture('blue', 9, state.players);
assert(safeCaptures.length === 0, 'No capture occurs on Safe Star Cell 9');

// 5. Test Final Home Path & Overshoot
console.log('\n[5] Testing Final Home Path & Overshoot:');
// Step 54 is 2 steps away from finish (56)
const nearFinishToken = { id: 0, state: 'ON_BOARD' as const, stepsFromStart: 54, pathIndex: null };
assert(GameRules.canTokenMove(nearFinishToken, 2), 'Can move 2 steps to finish (54 + 2 = 56)');
assert(!GameRules.canTokenMove(nearFinishToken, 3), 'Cannot overshoot finish (54 + 3 = 57 > 56)');

const finishQueue = MovementEngine.generateMovementQueue('blue', 0, 'ON_BOARD', 54, 2);
assert(finishQueue.length === 2, 'Finish queue has exactly 2 steps');
assert(
  finishQueue[1].logicalPos.type === 'FINISHED',
  'Final step reaches FINISHED center triangle'
);

// 6. Test Winning with 4 tokens
console.log('\n[6] Testing Victory Detection:');
const winningPlayer = createInitialPlayer('blue', 'Winner', '👑');
winningPlayer.tokens.forEach((t) => {
  t.state = 'FINISHED';
  t.stepsFromStart = TOTAL_STEPS_TO_FINISH;
});
assert(GameRules.hasPlayerWon(winningPlayer), 'Player detected as winner when all 4 tokens finished');

// 7. Test Four Player Seats & Individual Dice State Machine
console.log('\n[7] Testing Individual Player Dice State Machine:');
const engine = new GameEngine('pass_and_play');
const s0 = engine.getState();

assert(s0.players.blue.dice.state === 'READY', 'Player 1 (Blue) starts with READY dice');
assert(s0.players.yellow.dice.state === 'IDLE', 'Player 2 (Yellow) starts with IDLE dice');
assert(s0.players.green.dice.state === 'IDLE', 'Player 3 (Green) starts with IDLE dice');
assert(s0.players.red.dice.state === 'IDLE', 'Player 4 (Red) starts with IDLE dice');
assert(s0.currentPlayerId === s0.players.blue.id, 'currentPlayerId is Player 1');

// Blue rolls 3 (no tokens on board, turn will pass)
engine.rollDice(3);
const s1 = engine.getState();
assert(s1.players.blue.dice.value === 3, 'Blue player dice stores rolled value 3');
assert(s1.players.blue.dice.rollId === 1, 'Blue player dice stores rollId 1');
assert(s1.players.yellow.dice.value === null, 'Yellow player dice value remains null');

// 8. Test That Movement Steps Strictly Equal Dice Result
console.log('\n[8] Testing Absolute Match Between Dice Value and Token Step Count:');
const testEngine = new GameEngine('pass_and_play');
// Manually place a Blue token on track at step 10
testEngine.updateState({
  players: {
    ...testEngine.getState().players,
    blue: {
      ...testEngine.getState().players.blue,
      tokens: [
        { id: 0, state: 'ON_BOARD', stepsFromStart: 10, pathIndex: 10 },
        { id: 1, state: 'HOME', stepsFromStart: 0, pathIndex: null },
        { id: 2, state: 'HOME', stepsFromStart: 0, pathIndex: null },
        { id: 3, state: 'HOME', stepsFromStart: 0, pathIndex: null },
      ],
    },
  },
});

for (let testRoll = 1; testRoll <= 6; testRoll++) {
  const currentToken = testEngine.getState().players.blue.tokens[0];
  const startStep = currentToken.stepsFromStart;
  const queue = MovementEngine.generateMovementQueue('blue', 0, currentToken.state, startStep, testRoll);
  assert(queue.length === testRoll, `Roll of ${testRoll} produces EXACTLY ${testRoll} movement steps`);
  assert(
    queue[queue.length - 1].stepsFromStart === startStep + testRoll,
    `Final cell is exactly ${startStep} + ${testRoll} = ${startStep + testRoll}`
  );
}

// 9. Test Authoritative Board Cell Numbering & Unique Traceable IDs
console.log('\n[9] Testing Authoritative Board Cell IDs & Numbering Order:');
import { getCellById, CELL_REGISTRY } from '../boardPath';
import { ANIMATION_CONFIG } from '../../config/animationConfig';

assert(BOARD_PATH.length === 52, 'Main path has exactly 52 cells');
assert(BOARD_PATH[0].cellId === 'MAIN-01', 'Cell index 0 is MAIN-01 (Blue Start)');
assert(BOARD_PATH[0].boxNumber === 1, 'Cell index 0 is Box 1');
assert(BOARD_PATH[26].cellId === 'MAIN-27', 'Cell index 26 is MAIN-27 (Box 27 / Green Start)');
assert(BOARD_PATH[26].boxNumber === 27, 'Cell index 26 is Box 27');
assert(BOARD_PATH[51].cellId === 'MAIN-52', 'Cell index 51 is MAIN-52 (Box 52)');
assert(BOARD_PATH[51].boxNumber === 52, 'Cell index 51 is Box 52');

// Verify strictly contiguous numbering
let isContiguous = true;
for (let i = 0; i < 52; i++) {
  if (BOARD_PATH[i].id !== i || BOARD_PATH[i].boxNumber !== i + 1) {
    isContiguous = false;
    break;
  }
}
assert(isContiguous, 'All 52 main path cells have strictly contiguous box numbers from 1 to 52');

// 10. Test Cell Registry & Query by Box Number (e.g., Box 27)
console.log('\n[10] Testing getCellById("Box 27") & Cell Registry:');
const box27 = getCellById('27');
assert(box27 !== null, 'Found cell for query "27"');
assert(box27?.cellId === 'MAIN-27', 'Box 27 cellId is MAIN-27');
assert(box27?.row === 8 && box27?.col === 13, 'Box 27 is located at Row 8, Col 13');
assert(box27?.isStartFor === 'green', 'Box 27 is Green Start cell');

const blueHome3 = getCellById('BLUE-HOME-3');
assert(blueHome3 !== null, 'Found cell for query "BLUE-HOME-3"');
assert(blueHome3?.row === 7 && blueHome3?.col === 3, 'BLUE-HOME-3 is located at Row 7, Col 3');

const blueBase1 = getCellById('BLUE-BASE-1');
assert(blueBase1 !== null, 'Found cell for query "BLUE-BASE-1"');

// 11. Test Animation Configuration
console.log('\n[11] Testing Centralized Animation Configuration:');
assert(ANIMATION_CONFIG.tokenStepDuration > 0, 'tokenStepDuration is defined');
assert(ANIMATION_CONFIG.diceRollDuration > 0, 'diceRollDuration is defined');
assert(ANIMATION_CONFIG.captureImpactDuration > 0, 'captureImpactDuration is defined');

console.log(`\n--- SUMMARY: ${passCount} PASSED, ${failCount} FAILED ---`);
if (failCount > 0) {
  process.exit(1);
}
