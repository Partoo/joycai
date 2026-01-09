import "./style.css";

const pre = document.getElementById("ascii");
const word = "JoyC.ai";
const charSet = word.split("");
const coins = [];
let cols = 80;
let rows = 24;
let lastSpawn = 0;
let charWidth = 10;
let charHeight = 18;

function measureChar() {
  const probe = document.createElement("span");
  probe.textContent = "M";
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.fontFamily = "Space Mono, monospace";
  probe.style.fontSize = getComputedStyle(pre).fontSize;
  document.body.appendChild(probe);
  const rect = probe.getBoundingClientRect();
  charWidth = rect.width || 10;
  charHeight = rect.height || 18;
  probe.remove();
}

function resize() {
  measureChar();
  const frame = pre.parentElement;
  cols = Math.max(42, Math.floor(frame.clientWidth / charWidth));
  rows = Math.max(16, Math.floor(frame.clientHeight / charHeight));
}

function spawnCoin(now) {
  if (now - lastSpawn < 320) return;
  lastSpawn = now;
  coins.push({
    x: Math.random() * cols,
    y: -2,
    vy: 0.15 + Math.random() * 0.25,
    drift: (Math.random() - 0.5) * 0.06,
    phase: Math.random() * Math.PI * 2,
  });
}

function setCell(grid, x, y, value) {
  if (x < 0 || x >= cols || y < 0 || y >= rows) return;
  grid[y][x] = value;
}

function render(now) {
  const t = now * 0.001;
  spawnCoin(now);

  const grid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => " ")
  );

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const ripple =
        Math.sin(x * 0.16 + t * 0.9) + Math.cos(y * 0.22 - t * 0.6);
      if (ripple > 1.35) {
        const idx = Math.abs((x + y + Math.floor(t * 3)) % charSet.length);
        setCell(grid, x, y, charSet[idx]);
      }
    }
  }

  const center = rows * 0.5;
  const amp = rows * 0.18;
  const scroll = t * 6;
  const spacing = word.length + 6;

  for (let baseX = -spacing * 2; baseX < cols + spacing * 2; baseX += spacing) {
    for (let i = 0; i < word.length; i += 1) {
      const x = Math.floor(baseX + i + (scroll % spacing));
      const y =
        Math.round(
          center +
            Math.sin(x * 0.32 + t * 1.6) * amp * 0.7 +
            Math.sin(t * 0.7) * 1.5
        );
      setCell(grid, x, y, word[i]);
      setCell(grid, x, y - 1, ".");
      setCell(grid, x, y + 1, ".");
    }
  }

  for (const coin of coins) {
    coin.y += coin.vy;
    coin.x += Math.sin(t * 1.4 + coin.phase) * 0.06 + coin.drift;
    setCell(grid, Math.round(coin.x), Math.round(coin.y), "o");
    setCell(grid, Math.round(coin.x) + 1, Math.round(coin.y), ".");
  }

  for (let i = coins.length - 1; i >= 0; i -= 1) {
    if (coins[i].y > rows + 2) coins.splice(i, 1);
  }

  const lines = grid.map((row) => row.join("")).join("\n");
  pre.textContent = lines;
  requestAnimationFrame(render);
}

window.addEventListener("resize", resize);
resize();
requestAnimationFrame(render);
