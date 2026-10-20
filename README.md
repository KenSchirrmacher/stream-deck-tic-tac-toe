# Tic-Tac-Toe for Stream Deck

Classic pass-the-deck Tic-Tac-Toe. X and O alternate turns automatically as you press keys —
three in a row lights up green, a full board with no winner flashes yellow, and either way the
board clears itself a moment later for a rematch.

All the key art is generated as plain SVG at runtime — no image files.

## Build

```
npm install
npm run build
npx @elgato/cli link com.homedeck.tictactoe.sdPlugin
```

Dev watch: `npm run watch`

If `npm run build` fails on `sharp` (native binary), just re-run `npm install` once — sharp
downloads a prebuilt binary for your platform on install.

## Setting it up

This plugin ships one action, **Cell** — it doesn't come with a prebuilt layout, because Stream
Deck plugins can't create pages/profiles on your behalf. You build the board once, the same way
you'd lay out any other folder:

1. Create a folder (or a whole profile) on your Stream Deck and drag **Cell** (under the
   "Tic-Tac-Toe" category) onto exactly nine keys arranged in a 3x3 block. The plugin reads each
   key's actual position on the deck to build the board, so the nine cells need to form a real
   3x3 square — not scattered keys.
2. The board deals itself automatically a moment after the page becomes visible (it waits
   briefly for all nine keys to finish appearing first).

**Handing the deck to a kid without worry:** put the board on its own folder page, and use Stream
Deck's built-in **Parent Folder** action (no plugin needed) on one key as the way out. Launch the
folder from your main page with the built-in **Create Folder** / navigation action.

## Game internals

- `src/game/engine.ts` — one shared state machine per Stream Deck device: the 3x3 board state,
  whose turn it is, win detection across all eight lines, and the timers for the win/draw flash
  before the board resets.
- `src/game/render.ts` — all the key art (empty cell, X, O, win glow, draw glow), generated at
  runtime.
- Board position comes from each key's real `coordinates` on the device (sorted row-major), not
  registration order — that's what lets a 3x3 block placed anywhere on the page work correctly.
- Tuning constants live at the top of `engine.ts`: `WIN_RESET_MS`/`DRAW_RESET_MS` control how
  long the board holds before clearing for a rematch.

## License

MIT
