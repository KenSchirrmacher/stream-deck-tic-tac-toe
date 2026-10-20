import streamDeck, { type KeyAction } from "@elgato/streamdeck";
import { cellDrawFrame, cellEmptyFrame, cellMarkFrame, cellWinFrame } from "./render.js";

const APPEAR_DEBOUNCE_MS = 400;
const WIN_RESET_MS = 2_200;
const DRAW_RESET_MS = 1_600;

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

type Mark = "X" | "O";

type CellState = {
  action: KeyAction;
  row: number;
  col: number;
};

type DeviceState = {
  cells: Map<string, CellState>;
  boardOrder: string[];
  board: (Mark | null)[];
  currentPlayer: Mark;
  started: boolean;
  gameOver: boolean;
  appearDebounce: ReturnType<typeof setTimeout> | null;
  resetTimer: ReturnType<typeof setTimeout> | null;
};

function freshState(): DeviceState {
  return {
    cells: new Map(),
    boardOrder: [],
    board: [],
    currentPlayer: "X",
    started: false,
    gameOver: false,
    appearDebounce: null,
    resetTimer: null,
  };
}

class GameEngine {
  private devices = new Map<string, DeviceState>();

  registerCell(deviceId: string, action: KeyAction, row: number, col: number): void {
    const state = this.getOrCreate(deviceId);
    state.cells.set(action.id, { action, row, col });
    void action.setImage(cellEmptyFrame()).catch((err) =>
      streamDeck.logger.error(`tic-tac-toe: setImage(empty) failed for ${action.id}: ${String(err)}`),
    );
    this.scheduleStart(state);
  }

  unregisterCell(deviceId: string, actionId: string): void {
    const state = this.devices.get(deviceId);
    if (!state) return;
    state.cells.delete(actionId);
    if (state.cells.size === 0) {
      if (state.appearDebounce) clearTimeout(state.appearDebounce);
      if (state.resetTimer) clearTimeout(state.resetTimer);
      this.devices.delete(deviceId);
    }
  }

  handleCellPress(deviceId: string, action: KeyAction): void {
    const state = this.devices.get(deviceId);
    if (!state || !state.started || state.gameOver) return;

    const idx = state.boardOrder.indexOf(action.id);
    if (idx < 0 || state.board[idx] !== null) return;

    const mark = state.currentPlayer;
    state.board[idx] = mark;
    this.renderCell(state, idx, cellMarkFrame(mark));

    const winLine = WIN_LINES.find((line) => line.every((i) => state.board[i] === mark));
    if (winLine) {
      state.gameOver = true;
      for (const i of winLine) this.renderCell(state, i, cellWinFrame(mark));
      state.resetTimer = setTimeout(() => this.newGame(state), WIN_RESET_MS);
      return;
    }

    if (state.board.every((cell) => cell !== null)) {
      state.gameOver = true;
      for (let i = 0; i < state.board.length; i++) {
        const cellMark = state.board[i];
        if (cellMark) this.renderCell(state, i, cellDrawFrame(cellMark));
      }
      state.resetTimer = setTimeout(() => this.newGame(state), DRAW_RESET_MS);
      return;
    }

    state.currentPlayer = mark === "X" ? "O" : "X";
  }

  private renderCell(state: DeviceState, boardIndex: number, image: string): void {
    const id = state.boardOrder[boardIndex];
    const cell = state.cells.get(id);
    if (cell) void cell.action.setImage(image);
  }

  private scheduleStart(state: DeviceState): void {
    if (state.appearDebounce) clearTimeout(state.appearDebounce);
    state.appearDebounce = setTimeout(() => {
      state.appearDebounce = null;
      if (!state.started && state.cells.size >= 9) {
        state.boardOrder = [...state.cells.values()]
          .sort((a, b) => (a.row - b.row) || (a.col - b.col))
          .slice(0, 9)
          .map((c) => c.action.id);
        state.started = true;
        this.newGame(state);
      }
    }, APPEAR_DEBOUNCE_MS);
  }

  private newGame(state: DeviceState): void {
    state.board = new Array(9).fill(null);
    state.currentPlayer = "X";
    state.gameOver = false;
    for (let i = 0; i < state.boardOrder.length; i++) this.renderCell(state, i, cellEmptyFrame());
  }

  private getOrCreate(deviceId: string): DeviceState {
    let state = this.devices.get(deviceId);
    if (!state) {
      state = freshState();
      this.devices.set(deviceId, state);
    }
    return state;
  }
}

export const gameEngine = new GameEngine();
