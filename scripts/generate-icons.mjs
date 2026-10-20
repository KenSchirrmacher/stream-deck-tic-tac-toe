/**
 * Generates PNG icons for the Tic-Tac-Toe plugin (plugin, category, and action icons).
 * Run: node scripts/generate-icons.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "com.homedeck.tictactoe.sdPlugin", "imgs");

// All icon bodies below are authored on a fixed 72x72 design grid. Rendering with
// width/height = target size but viewBox always "0 0 72 72" lets SVG scale every
// coordinate (not just stroke-width) proportionally, so artwork fills the canvas
// at any requested size instead of staying pinned to its original 72px position.
const GRID = 72;

function svgIcon(body, size) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${GRID} ${GRID}">
  <rect width="${GRID}" height="${GRID}" rx="${GRID * 0.18}" fill="#101014"/>
  ${body}
</svg>`);
}

async function writeIcon(dir, name, body, sizes = [72, 144]) {
  const folder = path.join(root, dir);
  fs.mkdirSync(folder, { recursive: true });
  for (const [index, size] of sizes.entries()) {
    const svg = svgIcon(body, size);
    const out = path.join(folder, `${name}${index === 1 ? "@2x" : ""}.png`);
    await sharp(svg).png().toFile(out);
  }
}

// 3x3 grid with an X and an O placed in opposite corners, the classic icon shorthand.
const pluginBody = `
  <g stroke="#546E7A" stroke-width="3" stroke-linecap="round">
    <line x1="26" y1="10" x2="26" y2="62"/>
    <line x1="46" y1="10" x2="46" y2="62"/>
    <line x1="10" y1="26" x2="62" y2="26"/>
    <line x1="10" y1="46" x2="62" y2="46"/>
  </g>
  <g stroke="#E53935" stroke-width="5" stroke-linecap="round">
    <line x1="13" y1="13" x2="23" y2="23"/>
    <line x1="23" y1="13" x2="13" y2="23"/>
  </g>
  <circle cx="54" cy="54" r="7" fill="none" stroke="#1E88E5" stroke-width="5"/>`;

const categoryBody = `
  <circle cx="36" cy="36" r="20" fill="none" stroke="#FFFFFF" stroke-width="4"/>
  <text x="36" y="42" fill="#FFFFFF" font-family="Segoe UI, sans-serif" font-size="18" font-weight="700" text-anchor="middle">T</text>`;

const cellActionBody = `
  <rect x="12" y="12" width="48" height="48" rx="10" fill="#1C1E26" stroke="#30333F" stroke-width="2.5"/>`;

await writeIcon("plugin", "plugin-icon", pluginBody, [256, 512]);
await writeIcon("plugin", "category-icon", categoryBody, [28, 56]);
await writeIcon("actions/cell", "icon", cellActionBody);

console.log("Icons generated in com.homedeck.tictactoe.sdPlugin/imgs/");
