import "../styles/style.css";

const asciiHero = document.getElementById("ascii-hero");
const glyphs = "JoyC.ai";
const glyphPattern = `${glyphs}    `;
let tick = 0;
let cols = 60;
let rows = 18;
let charWidth = 18;
let charHeight = 20;
let yOffset = 0.08;
let intervalId = null;
let isVisible = true;
const frameDelay = 260;
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

function measureHeroGrid() {
  if (!asciiHero || !asciiHero.parentElement) return;
  const probe = document.createElement("span");
  const sampleCount = 12;
  probe.textContent = "M".repeat(sampleCount);
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.fontFamily = "IBM Plex Mono, monospace";
  const computedHero = getComputedStyle(asciiHero);
  probe.style.fontSize = computedHero.fontSize;
  probe.style.letterSpacing = computedHero.letterSpacing;
  document.body.appendChild(probe);
  const rect = probe.getBoundingClientRect();
  probe.remove();
  const letterSpacing =
    computedHero.letterSpacing === "normal"
      ? 0
      : parseFloat(computedHero.letterSpacing || "0");
  const totalSpacing = letterSpacing * (sampleCount - 1);
  charWidth = rect.width
    ? (rect.width - totalSpacing) / sampleCount
    : 8;
  charHeight = rect.height || 14;

  const computed = computedHero;
  const paddingX =
    parseFloat(computed.paddingLeft || "0") +
    parseFloat(computed.paddingRight || "0");
  const paddingY =
    parseFloat(computed.paddingTop || "0") +
    parseFloat(computed.paddingBottom || "0");
  const rectHero = asciiHero.getBoundingClientRect();
  const availableWidth = (rectHero.width || 600) - paddingX;
  const availableHeight = (rectHero.height || 240) - paddingY;
  cols = Math.max(36, Math.floor(availableWidth / charWidth - 0.2));
  rows = Math.max(12, Math.floor(availableHeight / charHeight - 0.2));
}

function inDollar(x, y, t) {
  const warp = Math.sin(t * 0.4 + y * 3) * 0.025;
  const xShift = x + warp;
  const sCurve = 0.68 * Math.sin(Math.PI * y);
  const sStroke = Math.abs(xShift - sCurve) < 0.16;
  const bar = Math.abs(xShift) < 0.12 && Math.abs(y) < 1.08;
  const topBar = Math.abs(y - 0.6) < 0.12 && Math.abs(xShift) < 0.75;
  const bottomBar = Math.abs(y + 0.6) < 0.12 && Math.abs(xShift) < 0.75;
  return sStroke || bar || topBar || bottomBar;
}

function renderHeroAscii() {
  if (!asciiHero) return;
  if (!isVisible) return;
  tick += 1;
  const t = tick * 0.08;
  const lines = [];
  for (let row = 0; row < rows; row += 1) {
    let line = "";
    const y = (row / (rows - 1)) * 2.2 - 1.1 + yOffset;
    for (let col = 0; col < cols; col += 1) {
      const x = (col / (cols - 1)) * 2.2 - 1.1;
      if (inDollar(x, y, t)) {
        const idx = (col + row + tick) % glyphPattern.length;
        line += glyphPattern[idx];
      } else {
        line += " ";
      }
    }
    lines.push(line);
  }
  asciiHero.textContent = lines.join("\n");
}

measureHeroGrid();
renderHeroAscii();
window.addEventListener("resize", () => {
  measureHeroGrid();
  renderHeroAscii();
});
document.addEventListener("visibilitychange", () => {
  isVisible = document.visibilityState === "visible";
  if (!isVisible && intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  if (isVisible && !prefersReducedMotion.matches && !intervalId) {
    intervalId = setInterval(renderHeroAscii, frameDelay);
  }
});
if (!prefersReducedMotion.matches) {
  intervalId = setInterval(renderHeroAscii, frameDelay);
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    if (intervalId) clearInterval(intervalId);
  });
}
