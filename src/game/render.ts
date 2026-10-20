const SIZE = 144;
const CELL_BG = "#1C1E26";
const CELL_BORDER = "#30333F";
const X_COLOR = "#E53935";
const O_COLOR = "#1E88E5";
const WIN_GLOW = "#43A047";
const DRAW_GLOW = "#FDD835";

function toDataUri(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function cellWrap(body: string, glow?: string): string {
  const ring = glow
    ? `<rect x="3" y="3" width="${SIZE - 6}" height="${SIZE - 6}" rx="20" fill="none" stroke="${glow}" stroke-width="6"/>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
    <rect width="${SIZE}" height="${SIZE}" rx="22" fill="${CELL_BG}" stroke="${CELL_BORDER}" stroke-width="3"/>
    ${body}
    ${ring}
  </svg>`;
}

function xGlyph(): string {
  return `<g stroke="${X_COLOR}" stroke-width="14" stroke-linecap="round">
    <line x1="40" y1="40" x2="104" y2="104"/>
    <line x1="104" y1="40" x2="40" y2="104"/>
  </g>`;
}

function oGlyph(): string {
  return `<circle cx="72" cy="72" r="32" fill="none" stroke="${O_COLOR}" stroke-width="14"/>`;
}

export function cellEmptyFrame(): string {
  return toDataUri(cellWrap(""));
}

export function cellMarkFrame(mark: "X" | "O"): string {
  return toDataUri(cellWrap(mark === "X" ? xGlyph() : oGlyph()));
}

export function cellWinFrame(mark: "X" | "O"): string {
  return toDataUri(cellWrap(mark === "X" ? xGlyph() : oGlyph(), WIN_GLOW));
}

export function cellDrawFrame(mark: "X" | "O"): string {
  return toDataUri(cellWrap(mark === "X" ? xGlyph() : oGlyph(), DRAW_GLOW));
}
