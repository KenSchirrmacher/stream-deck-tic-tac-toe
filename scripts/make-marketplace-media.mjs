import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const PHOTO = "C:/Users/kensc/Downloads/PXL_20261020_161929799.jpg";
const PLUGIN_ICON = "C:/users/kensc/OneDrive/Documents/GitHub/Stream Deck Tic-Tac-Toe/com.homedeck.tictactoe.sdPlugin/imgs/plugin/plugin-icon@2x.png";
const OUT = "C:/Users/kensc/AppData/Local/Temp/claude/C--users-kensc-OneDrive-Documents-GitHub/c9391527-b74f-4f95-a256-95f796cb078e/scratchpad/marketplace-tictactoe";

fs.mkdirSync(OUT, { recursive: true });

// --- Icon: 288x288 from the existing plugin icon ---
await sharp(PLUGIN_ICON).resize(288, 288).png().toFile(path.join(OUT, "icon-288.png"));

// --- Thumbnail + gallery 0: real device photo ---
await sharp(PHOTO).resize(1920, 960, { fit: "cover", position: "attention" }).jpeg({ quality: 90 }).toFile(path.join(OUT, "thumbnail-1920x960.jpg"));
await sharp(PHOTO).resize(1920, 960, { fit: "cover", position: "attention" }).jpeg({ quality: 92 }).toFile(path.join(OUT, "gallery-0-device-photo.jpg"));

// --- Reproduce the plugin's own key art (same code as src/game/render.ts) ---
const SIZE = 144;
const CELL_BG = "#1C1E26";
const CELL_BORDER = "#30333F";
const X_COLOR = "#E53935";
const O_COLOR = "#1E88E5";
const WIN_GLOW = "#43A047";
const DRAW_GLOW = "#FDD835";

function cellWrap(body, glow) {
  const ring = glow
    ? `<rect x="3" y="3" width="${SIZE - 6}" height="${SIZE - 6}" rx="20" fill="none" stroke="${glow}" stroke-width="6"/>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
    <rect width="${SIZE}" height="${SIZE}" rx="22" fill="${CELL_BG}" stroke="${CELL_BORDER}" stroke-width="3"/>
    ${body}
    ${ring}
  </svg>`;
}
function xGlyph() {
  return `<g stroke="${X_COLOR}" stroke-width="14" stroke-linecap="round">
    <line x1="40" y1="40" x2="104" y2="104"/>
    <line x1="104" y1="40" x2="40" y2="104"/>
  </g>`;
}
function oGlyph() {
  return `<circle cx="72" cy="72" r="32" fill="none" stroke="${O_COLOR}" stroke-width="14"/>`;
}
function cellEmptyFrame() { return cellWrap(""); }
function cellMarkFrame(mark) { return cellWrap(mark === "X" ? xGlyph() : oGlyph()); }
function cellWinFrame(mark) { return cellWrap(mark === "X" ? xGlyph() : oGlyph(), WIN_GLOW); }
function cellDrawFrame(mark) { return cellWrap(mark === "X" ? xGlyph() : oGlyph(), DRAW_GLOW); }

function frameFor(board, winSet, i) {
  const mark = board[i];
  if (!mark) return cellEmptyFrame();
  if (winSet && winSet.includes(i)) return cellWinFrame(mark);
  return cellMarkFrame(mark);
}

// --- Gallery 1: a won board, 3x3, centered ---
{
  const W = 1920, H = 960;
  const winBoard = ["X", "X", "X", "O", "O", null, null, null, null];
  const winLine = [0, 1, 2];
  const cols = 3, rows = 3, gap = 20, outerMargin = 80;
  const cellFromHeight = Math.floor((H - outerMargin * 2 - gap * (rows - 1)) / rows);
  const cellFromWidth = Math.floor((W - outerMargin * 2 - gap * (cols - 1)) / cols);
  const cell = Math.min(cellFromHeight, cellFromWidth);
  const contentW = cols * cell + (cols - 1) * gap;
  const contentH = rows * cell + (rows - 1) * gap;
  const padX = Math.round((W - contentW) / 2);
  const padY = Math.round((H - contentH) / 2);
  const composites = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * 3 + c;
      const svg = frameFor(winBoard, winLine, i);
      composites.push({
        input: await sharp(Buffer.from(svg)).resize(cell, cell).png().toBuffer(),
        left: padX + c * (cell + gap),
        top: padY + r * (cell + gap),
      });
    }
  }
  await sharp({ create: { width: W, height: H, channels: 3, background: "#15171c" } })
    .composite(composites)
    .jpeg({ quality: 92 })
    .toFile(path.join(OUT, "gallery-1-win.jpg"));
}

// --- Gallery 2: three boards side by side — empty, mid-game, draw ---
{
  const W = 1920, H = 960;
  const emptyBoard = [null, null, null, null, null, null, null, null, null];
  const midBoard = ["X", null, "O", null, "X", null, null, null, "O"];
  const drawBoard = ["X", "O", "X", "X", "O", "O", "O", "X", "X"];
  const boards = [emptyBoard, midBoard, drawBoard];
  const drawGlow = [false, false, true];

  const cols = 3, rows = 3, gap = 8, boardGap = 70, outerMargin = 60;
  const cellFromHeight = Math.floor((H - outerMargin * 2 - gap * (rows - 1)) / rows);
  const boardW = cols * cellFromHeight + (cols - 1) * gap;
  const totalW = boards.length * boardW + (boards.length - 1) * boardGap;
  const cellFromWidth = Math.floor((W - outerMargin * 2 - (boards.length - 1) * boardGap - boards.length * (cols - 1) * gap) / (boards.length * cols));
  const cell = Math.min(cellFromHeight, cellFromWidth);
  const actualBoardW = cols * cell + (cols - 1) * gap;
  const actualTotalW = boards.length * actualBoardW + (boards.length - 1) * boardGap;
  const startX = Math.round((W - actualTotalW) / 2);
  const startY = Math.round((H - (rows * cell + (rows - 1) * gap)) / 2);

  const composites = [];
  for (let b = 0; b < boards.length; b++) {
    const boardX = startX + b * (actualBoardW + boardGap);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * 3 + c;
        const mark = boards[b][i];
        let svg;
        if (!mark) svg = cellEmptyFrame();
        else if (drawGlow[b]) svg = cellDrawFrame(mark);
        else svg = cellMarkFrame(mark);
        composites.push({
          input: await sharp(Buffer.from(svg)).resize(cell, cell).png().toBuffer(),
          left: boardX + c * (cell + gap),
          top: startY + r * (cell + gap),
        });
      }
    }
  }
  await sharp({ create: { width: W, height: H, channels: 3, background: "#15171c" } })
    .composite(composites)
    .jpeg({ quality: 92 })
    .toFile(path.join(OUT, "gallery-2-states.jpg"));
}

console.log("Done:", fs.readdirSync(OUT));
