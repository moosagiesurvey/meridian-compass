// Generates the BIMI sender logo (public/brand/bimi-logo.svg) from the
// Playfair Display 600 "M" glyph. Geometry is measured from the supplied
// 800x800 brand PNG, not guessed - see the email-identity SOP section 5.2.
//
// Usage:  bun run scripts/build-bimi-logo.mjs
// Requires: opentype.js (dev dependency) and fonts/playfair600.ttf
//           (downloaded automatically if missing).

import fs from "node:fs";
import path from "node:path";
import opentype from "opentype.js";

const ROOT = path.resolve(import.meta.dir, "..");
const FONT_DIR = path.join(ROOT, "fonts");
const FONT_FILE = path.join(FONT_DIR, "playfair600.ttf");
const FONT_URL =
  "https://fonts.gstatic.com/s/playfairdisplay/v40/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKebukDQ.ttf";
const OUT = path.join(ROOT, "public", "brand", "bimi-logo.svg");

// --- measured from Meridian_Digital_Google_Profile.png (800x800) -------------
const CANVAS = 800;
const GOLD = "#C5A869";
const BG_START = "#112630";
const BG_END = "#0B161C";
const RING_R = 269.5;
const RING_W = 9;
const M_HEIGHT = 237;
const M_WIDTH = 273;
const M_LEFT = 260;
const M_BASELINE = 512;
// -----------------------------------------------------------------------------

if (!fs.existsSync(FONT_FILE)) {
  console.log("font missing, downloading...");
  fs.mkdirSync(FONT_DIR, { recursive: true });
  const res = await fetch(FONT_URL);
  if (!res.ok) throw new Error(`font download failed: ${res.status}`);
  fs.writeFileSync(FONT_FILE, Buffer.from(await res.arrayBuffer()));
}

const buf = fs.readFileSync(FONT_FILE);
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const size = (M_HEIGHT * font.unitsPerEm) / (font.tables.os2.sCapHeight || 700);

const glyph = font.getPath("M", 0, 0, size);
const bb = glyph.getBoundingBox();
const sx = M_WIDTH / (bb.x2 - bb.x1);
const tx = M_LEFT - bb.x1 * sx;
const ty = M_BASELINE - bb.y2;
const d = glyph.toPathData(3);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" version="1.2" baseProfile="tiny-ps" viewBox="0 0 ${CANVAS} ${CANVAS}" width="${CANVAS}" height="${CANVAS}">
<title>Meridian Digital</title>
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="${BG_START}"/>
<stop offset="1" stop-color="${BG_END}"/>
</linearGradient>
</defs>
<rect x="0" y="0" width="${CANVAS}" height="${CANVAS}" fill="url(#bg)"/>
<circle cx="400" cy="400" r="${RING_R}" fill="none" stroke="${GOLD}" stroke-width="${RING_W}"/>
<path transform="translate(${tx.toFixed(3)} ${ty.toFixed(3)}) scale(${sx.toFixed(5)} 1)" d="${d}" fill="${GOLD}"/>
</svg>
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);

console.log(`wrote ${path.relative(ROOT, OUT)} (${Buffer.byteLength(svg)} bytes)`);
console.log(`cap height ${M_HEIGHT}, ink width ${M_WIDTH}, ring r=${RING_R}`);

// BIMI hard limits, checked at build time
const checks = {
  "under 32KB": Buffer.byteLength(svg) < 32768,
  "svg 1.2 tiny-ps": /version="1\.2"\s+baseProfile="tiny-ps"/.test(svg),
  "square viewBox": svg.includes('viewBox="0 0 800 800"'),
  "has title": svg.includes("<title>"),
  "no raster": !/<image/.test(svg),
  "no script": !/<script/.test(svg),
  "no text element": !/<text/.test(svg),
  "no external ref": !/href=|xlink:|url\(http/.test(svg),
  "full-bleed background": svg.includes('width="800" height="800"'),
};
let failed = 0;
for (const [name, ok] of Object.entries(checks)) {
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
}
if (failed) process.exit(1);
