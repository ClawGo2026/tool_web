# ES Module Refactoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the data visualization toolkit from global script tags to a modern ES module architecture with Vite, while keeping all functionality and appearance identical.

**Architecture:** Each chart type becomes a self-contained ES module with its own data files. Shared state (`currentTool`, `isFullscreen`) lives in a dedicated `state.js` module. Shared utilities are extracted to `utils.js`. Vite handles dev server, HMR, and production bundling. CSS is imported via JS modules.

**Tech Stack:** Vanilla JS (ES modules), Vite 5.x, npm

---

### Task 1: Initialize Vite Project

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `.gitignore` (update)

- [ ] **Step 1: Create package.json**

```json
{
  "name": "web-tool",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^5.4.0"
  }
}
```

- [ ] **Step 2: Create vite.config.js**

```js
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: { input: 'index.html' }
  },
  server: {
    open: true,
    port: 3000
  }
});
```

- [ ] **Step 3: Update .gitignore**

Replace current content with:
```
# Claude Code local settings
.claude/settings.local.json

# Dependencies
node_modules/

# Build output
dist/
```

- [ ] **Step 4: Install Vite**

Run: `npm install`
Expected: `node_modules/` directory created, `package-lock.json` created

- [ ] **Step 5: Create src/ directory structure**

Run: `mkdir -p src/{histogram,linechart,piechart,bubblechart,table,css}`
Expected: Directory structure created

- [ ] **Step 6: Commit**

```bash
git add package.json vite.config.js .gitignore
git commit -m "chore: initialize Vite project with package.json and config"
```

---

### Task 2: Create Shared Modules (state.js, utils.js, style.js)

**Files:**
- Create: `src/state.js`
- Create: `src/utils.js`
- Create: `src/style.js`

- [ ] **Step 1: Create src/state.js**

```js
// Shared application state
export let currentTool = 'histogram';
export let isFullscreen = false;

export function setCurrentTool(tool) {
  currentTool = tool;
}

export function setIsFullscreen(val) {
  isFullscreen = val;
}
```

- [ ] **Step 2: Create src/utils.js**

Extract all shared utility functions from `toolset/js/histogram.js` and `toolset/js/bubblechart.js`:

```js
// Shared utility functions

export function hexToRgba(hex, alpha) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function isLightColor(hex) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);
  return (r * 0.299 + g * 0.587 + b * 0.114) > 160;
}

export function truncate(str, max) {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

export function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function adjustColor(hex, amount) {
  let c = hex.replace('#', '');
  let r = Math.max(0, Math.min(255, parseInt(c.substr(0, 2), 16) + amount));
  let g = Math.max(0, Math.min(255, parseInt(c.substr(2, 2), 16) + amount));
  let b = Math.max(0, Math.min(255, parseInt(c.substr(4, 2), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
```

- [ ] **Step 3: Create src/style.js**

```js
// Import all CSS files — Vite handles injection in dev, extraction in build
import './css/theme.css';
import './css/histogram.css';
import './css/linechart.css';
import './css/piechart.css';
import './css/bubblechart.css';
import './css/table.css';
```

- [ ] **Step 4: Commit**

```bash
git add src/state.js src/utils.js src/style.js
git commit -m "feat: create shared modules (state, utils, style)"
```

---

### Task 3: Migrate Histogram Module

**Files:**
- Create: `src/histogram/palettes.js`
- Create: `src/histogram/bar-styles.js`
- Create: `src/histogram/index.js`

- [ ] **Step 1: Create src/histogram/palettes.js**

Copy the `H_PALETTES` array from `toolset/data/h-palettes.js` and change the declaration from `const H_PALETTES` to `export const H_PALETTES`. The array content is identical — 14 palette objects with `name`, `barText`, `bg`, `grid`, `tickText`, `labelText`, `colors` properties.

```js
export const H_PALETTES = [
  {
    name: '梦幻紫', barText: '#e4e6f0',
    bg: '#1a1028', grid: 'rgba(162,155,254,.1)', tickText: '#a29bfe', labelText: '#8b82be',
    colors: ['#6c5ce7','#a29bfe','#74b9ff','#00cec9','#55efc4','#fdcb6e','#e17055','#ff6b6b','#fd79a8','#e84393','#0984e3','#00b894','#ffeaa7','#fab1a0','#636e72']
  },
  // ... 13 more palettes (identical content from toolset/data/h-palettes.js)
];
```

Full content: copy all 14 palette objects from `toolset/data/h-palettes.js` lines 2-73.

- [ ] **Step 2: Create src/histogram/bar-styles.js**

Copy the `BAR_STYLES` array from `toolset/data/bar-styles.js` and change to `export const BAR_STYLES`. The array content is identical — 15 style objects with `name`, `icon`, `drawBar` properties.

Note: `BAR_STYLES` uses `roundRect`, `adjustColor`, and `hexToRgba` from utils. Import them:

```js
import { roundRect, adjustColor, hexToRgba } from '../utils.js';

export const BAR_STYLES = [
  // ... 15 style objects (identical content from toolset/data/bar-styles.js)
];
```

- [ ] **Step 3: Create src/histogram/index.js**

This is the main histogram module. Migrate from `toolset/js/histogram.js`. Key changes:
- Import `H_PALETTES` from `./palettes.js`
- Import `BAR_STYLES` from `./bar-styles.js`
- Import `currentTool`, `isFullscreen`, `setIsFullscreen` from `../state.js`
- Import `hexToRgba`, `isLightColor`, `truncate`, `roundRect`, `adjustColor` from `../utils.js`
- Remove duplicate local definitions of those utility functions
- Export `initHistogram`, `renderChart`, `enterFsHistogram`, `exitFsHistogram`
- Also export `draw` and `chartData` (needed by fullscreen.js redraw on fullscreen exit)

```js
import { H_PALETTES } from './palettes.js';
import { BAR_STYLES } from './bar-styles.js';
import { currentTool, isFullscreen, setIsFullscreen } from '../state.js';
import { hexToRgba, isLightColor, truncate, roundRect, adjustColor } from '../utils.js';

// State variables
let direction = 'vertical';
let chartData = null;
let barRects = [];
let hCurrentPalette = 0;
let currentBarStyle = 0;

// Init
export function initHistogram() {
  buildPaletteGrid();
  buildBarStyleGrid();
}

// ... (all functions from toolset/js/histogram.js, with local utility
//      function definitions removed since they're imported)

export function renderChart() { ... }
export function enterFsHistogram() { ... }
export function exitFsHistogram() { ... }
```

Critical: keep all DOM element IDs identical (e.g., `jsonInput`, `chartCanvas`, `paletteGrid`, etc.). Keep all `onclick` handler names in the HTML unchanged — the functions are still called from HTML `onclick` attributes, so they must remain as global functions OR be attached via `window`. Since ES modules are strict scope, we need to attach functions that are called from HTML `onclick` to the `window` object.

Add at the end of `src/histogram/index.js`:
```js
// Expose functions called by HTML onclick attributes
window.renderChart = renderChart;
window.loadSample = loadSample;
window.setDirection = setDirection;
window.onTitleChange = onTitleChange;
window.onUnitChange = onUnitChange;
```

- [ ] **Step 4: Commit**

```bash
git add src/histogram/
git commit -m "feat: migrate histogram module to ES module"
```

---

### Task 4: Migrate Line Chart Module

**Files:**
- Create: `src/linechart/palettes.js`
- Create: `src/linechart/line-styles.js`
- Create: `src/linechart/index.js`

- [ ] **Step 1: Create src/linechart/palettes.js**

Copy `L_PALETTES` from `toolset/data/l-palettes.js`, change to `export const L_PALETTES`. 14 palettes with `name`, `lineText`, `bg`, `grid`, `tickText`, `labelText`, `colors`.

- [ ] **Step 2: Create src/linechart/line-styles.js**

Copy `LINE_STYLES` from `toolset/data/line-styles.js`, change to `export const LINE_STYLES`. 10 styles. Import `hexToRgba` from `../utils.js` (used by area fill styles).

```js
import { hexToRgba } from '../utils.js';

export const LINE_STYLES = [ ... ];
```

- [ ] **Step 3: Create src/linechart/index.js**

Migrate from `toolset/js/linechart.js`. Import from `./palettes.js`, `./line-styles.js`, `../state.js`, `../utils.js`. Export `initLineChart`, `renderLineChart`, `enterFsLineChart`, `exitFsLineChart`. Also export `drawLineChart` and `lineChartData` (needed by fullscreen.js redraw).

Expose HTML onclick functions on window:
```js
window.renderLineChart = renderLineChart;
window.loadLSample = loadLSample;
window.onLTitleChange = onLTitleChange;
window.onLUnitChange = onLUnitChange;
```

Note: The line chart draw function is named `drawLineChart` internally (not `drawLine`). Keep this name.

- [ ] **Step 4: Commit**

```bash
git add src/linechart/
git commit -m "feat: migrate line chart module to ES module"
```

---

### Task 5: Migrate Pie Chart Module

**Files:**
- Create: `src/piechart/palettes.js`
- Create: `src/piechart/pie-styles.js`
- Create: `src/piechart/index.js`

- [ ] **Step 1: Create src/piechart/palettes.js**

Copy `P_PALETTES` from `toolset/data/p-palettes.js`, change to `export const P_PALETTES`. 14 palettes with `name`, `text`, `bg`, `labelText`, `colors`.

- [ ] **Step 2: Create src/piechart/pie-styles.js**

Copy `PIE_STYLES` from `toolset/data/pie-styles.js`, change to `export const PIE_STYLES`. 8 styles. Import `adjustColor` and `hexToRgba` from `../utils.js` (used by gradient and line styles).

```js
import { adjustColor, hexToRgba } from '../utils.js';

export const PIE_STYLES = [ ... ];
```

- [ ] **Step 3: Create src/piechart/index.js**

Migrate from `toolset/js/piechart.js`. Import from `./palettes.js`, `./pie-styles.js`, `../state.js`, `../utils.js`. Export `initPieChart`, `renderPieChart`, `enterFsPieChart`, `exitFsPieChart`. Also export `drawPie` and `pieChartData` (needed by fullscreen.js redraw).

Expose HTML onclick functions on window:
```js
window.renderPieChart = renderPieChart;
window.loadPSample = loadPSample;
window.onPTitleChange = onPTitleChange;
```

- [ ] **Step 4: Commit**

```bash
git add src/piechart/
git commit -m "feat: migrate pie chart module to ES module"
```

---

### Task 6: Migrate Bubble Chart Module

**Files:**
- Create: `src/bubblechart/palettes.js`
- Create: `src/bubblechart/layout-algorithms.js`
- Create: `src/bubblechart/index.js`

- [ ] **Step 1: Create src/bubblechart/palettes.js**

Copy `BUBBLE_PALETTES` from `toolset/data/b-palettes.js`, change to `export const BUBBLE_PALETTES`. 8 palettes with `name`, `colors`.

- [ ] **Step 2: Create src/bubblechart/layout-algorithms.js**

Copy `LAYOUT_ALGORITHMS` and all layout functions (`layoutForceDirected`, `layoutGrid`, `layoutCircular`, `layoutTreemap`, `calculateLayout`) from `toolset/data/layout-algorithms.js`. Change to:

```js
export const LAYOUT_ALGORITHMS = [ ... ];

// Internal functions (not exported)
function layoutForceDirected(bubbles, canvasW, canvasH) { ... }
function layoutGrid(bubbles, canvasW, canvasH) { ... }
function layoutCircular(bubbles, canvasW, canvasH) { ... }
function layoutTreemap(bubbles, canvasW, canvasH) { ... }

export function calculateLayout(bubbles, canvasW, canvasH, algorithm) {
  switch (algorithm) {
    case 'force': return layoutForceDirected(bubbles, canvasW, canvasH);
    case 'grid': return layoutGrid(bubbles, canvasW, canvasH);
    case 'circular': return layoutCircular(bubbles, canvasW, canvasH);
    case 'treemap': return layoutTreemap(bubbles, canvasW, canvasH);
    default: return layoutGrid(bubbles, canvasW, canvasH);
  }
}
```

- [ ] **Step 3: Create src/bubblechart/index.js**

Migrate from `toolset/js/bubblechart.js`. Import from `./palettes.js`, `./layout-algorithms.js`, `../state.js`, `../utils.js`. Remove local `hexToRgba`, `isLightColor`, `truncate` definitions (import from utils). Export `initBubbleChart`, `renderBubbleChart`, `enterFsBubble`, `exitFsBubble`.

Expose HTML onclick functions on window:
```js
window.renderBubbleChart = renderBubbleChart;
window.loadBSample = loadBSample;
window.onBTitleChange = onBTitleChange;
```

Note: `bubblechart.js` calls `initBubbleChart()` at the bottom of the file (line 359). Move this call to `main.js` instead.

- [ ] **Step 4: Commit**

```bash
git add src/bubblechart/
git commit -m "feat: migrate bubble chart module to ES module"
```

---

### Task 7: Migrate Table Module

**Files:**
- Create: `src/table/palettes.js`
- Create: `src/table/table-styles.js`
- Create: `src/table/index.js`

- [ ] **Step 1: Create src/table/palettes.js**

Copy `T_PALETTES` from `toolset/data/t-palettes.js`, change to `export const T_PALETTES`. 13 palettes with `name`, `type`, `bg`, `surface`, `headerBg`, `headerText`, `rowBg1`, `rowBg2`, `rowText`, `border`, `hoverBg`, `accent`.

- [ ] **Step 2: Create src/table/table-styles.js**

Copy `TABLE_STYLES` from `toolset/data/table-styles.js`, change to `export const TABLE_STYLES`. 8 styles with `name`, `icon`, `apply`.

- [ ] **Step 3: Create src/table/index.js**

Migrate from `toolset/js/table.js`. Import from `./palettes.js`, `./table-styles.js`, `../state.js`, `../utils.js`. Export `initTable`, `renderTable`, `enterFsTable`, `exitFsTable`.

Expose HTML onclick functions on window:
```js
window.renderTable = renderTable;
window.loadTSample = loadTSample;
window.onTTitleChange = onTTitleChange;
```

- [ ] **Step 4: Commit**

```bash
git add src/table/
git commit -m "feat: migrate table module to ES module"
```

---

### Task 8: Create tab.js, fullscreen.js, and main.js

**Files:**
- Create: `src/tab.js`
- Create: `src/fullscreen.js`
- Create: `src/main.js`

- [ ] **Step 1: Create src/tab.js**

Migrate tab switching logic from `toolset/js/core.js` (lines 6-29).

```js
import { currentTool, setCurrentTool, isFullscreen } from './state.js';

// Fullscreen exit functions — loaded dynamically
import { exitFsHistogram } from './histogram/index.js';
import { exitFsTable } from './table/index.js';
import { exitFsLineChart } from './linechart/index.js';
import { exitFsPieChart } from './piechart/index.js';
import { exitFsBubble } from './bubblechart/index.js';

export function switchTab(tab) {
  setCurrentTool(tab);
  document.getElementById('histogram-panel').style.display = tab === 'histogram' ? 'flex' : 'none';
  document.getElementById('linechart-panel').style.display = tab === 'linechart' ? 'flex' : 'none';
  document.getElementById('piechart-panel').style.display = tab === 'piechart' ? 'flex' : 'none';
  document.getElementById('table-panel').style.display = tab === 'table' ? 'flex' : 'none';
  document.getElementById('bubblechart-panel').style.display = tab === 'bubblechart' ? 'flex' : 'none';
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  // Exit fullscreen when switching tools
  if (isFullscreen) {
    if (tab !== 'histogram') exitFsHistogram();
    if (tab !== 'table') exitFsTable();
    if (tab !== 'linechart') exitFsLineChart();
    if (tab !== 'piechart') exitFsPieChart();
    if (tab !== 'bubblechart') exitFsBubble();
  }
}

// Bind tab buttons
document.querySelectorAll('.tab-btn').forEach(b => {
  b.addEventListener('click', () => switchTab(b.dataset.tab));
});

// Expose for HTML onclick if needed
window.switchTab = switchTab;
```

- [ ] **Step 2: Create src/fullscreen.js**

Migrate fullscreen logic from `toolset/js/core.js` (lines 31-82). Uses dynamic imports for enter functions to avoid circular dependencies.

```js
import { currentTool, isFullscreen, setIsFullscreen } from './state.js';

// Map of tool -> enter/exit functions (loaded lazily)
const enterFns = {
  histogram: () => import('./histogram/index.js').then(m => m.enterFsHistogram()),
  linechart: () => import('./linechart/index.js').then(m => m.enterFsLineChart()),
  piechart: () => import('./piechart/index.js').then(m => m.enterFsPieChart()),
  bubblechart: () => import('./bubblechart/index.js').then(m => m.enterFsBubble()),
  table: () => import('./table/index.js').then(m => m.enterFsTable()),
};

const exitFns = {
  histogram: () => import('./histogram/index.js').then(m => m.exitFsHistogram()),
  linechart: () => import('./linechart/index.js').then(m => m.exitFsLineChart()),
  piechart: () => import('./piechart/index.js').then(m => m.exitFsPieChart()),
  bubblechart: () => import('./bubblechart/index.js').then(m => m.exitFsBubble()),
  table: () => import('./table/index.js').then(m => m.exitFsTable()),
};

export function toggleFullscreen() {
  if (!isFullscreen) {
    const fn = enterFns[currentTool];
    if (fn) fn();
  } else {
    const fn = exitFns[currentTool];
    if (fn) fn();
  }
}

// Shared ESC handler
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && isFullscreen) {
    const fn = exitFns[currentTool];
    if (fn) fn();
  }
});

// Shared fullscreenchange listener
function onFullscreenChangeShared() {
  const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
  if (!fsEl && isFullscreen) {
    setIsFullscreen(false);
    document.getElementById('fullscreenWrapper').classList.remove('active');
    // Trigger redraw for current chart (match original core.js behavior)
    if (currentTool === 'histogram') {
      import('./histogram/index.js').then(m => {
        if (typeof m.chartData !== 'undefined' && m.chartData && typeof m.draw === 'function') {
          const canvas = document.getElementById('chartCanvas');
          if (canvas) m.draw(canvas);
        }
      });
    }
    if (currentTool === 'linechart') {
      import('./linechart/index.js').then(m => {
        if (typeof m.lineChartData !== 'undefined' && m.lineChartData && typeof m.drawLineChart === 'function') {
          const canvas = document.getElementById('lChartCanvas');
          if (canvas) m.drawLineChart(canvas);
        }
      });
    }
    if (currentTool === 'piechart') {
      import('./piechart/index.js').then(m => {
        if (typeof m.pieChartData !== 'undefined' && m.pieChartData && typeof m.drawPie === 'function') {
          const canvas = document.getElementById('pieCanvas');
          if (canvas) m.drawPie(canvas);
        }
      });
    }
  }
}
document.addEventListener('fullscreenchange', onFullscreenChangeShared);
document.addEventListener('webkitfullscreenchange', onFullscreenChangeShared);
document.addEventListener('mozfullscreenchange', onFullscreenChangeShared);
document.addEventListener('MSFullscreenChange', onFullscreenChangeShared);

// Expose for HTML onclick
window.toggleFullscreen = toggleFullscreen;
```

- [ ] **Step 3: Create src/main.js**

```js
import './style.js';
import './tab.js';
import './fullscreen.js';
import { initHistogram } from './histogram/index.js';
import { initLineChart } from './linechart/index.js';
import { initPieChart } from './piechart/index.js';
import { initBubbleChart } from './bubblechart/index.js';
import { initTable } from './table/index.js';

function boot() {
  initHistogram();
  initTable();
  initLineChart();
  initPieChart();
  initBubbleChart();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
```

- [ ] **Step 4: Commit**

```bash
git add src/tab.js src/fullscreen.js src/main.js
git commit -m "feat: create tab, fullscreen, and main entry modules"
```

---

### Task 9: Create index.html and Move CSS Files

**Files:**
- Create: `index.html`
- Move: `toolset/css/theme.css` → `src/css/theme.css`
- Move: `toolset/css/histogram.css` → `src/css/histogram.css`
- Move: `toolset/css/linechart.css` → `src/css/linechart.css`
- Move: `toolset/css/piechart.css` → `src/css/piechart.css`
- Move: `toolset/css/bubblechart.css` → `src/css/bubblechart.css`
- Move: `toolset/css/table.css` → `src/css/table.css`

- [ ] **Step 1: Move CSS files**

Run:
```
mv toolset/css/theme.css src/css/theme.css
mv toolset/css/histogram.css src/css/histogram.css
mv toolset/css/linechart.css src/css/linechart.css
mv toolset/css/piechart.css src/css/piechart.css
mv toolset/css/bubblechart.css src/css/bubblechart.css
mv toolset/css/table.css src/css/table.css
```

- [ ] **Step 2: Create index.html**

Take the full content of `Toolset.html`. Remove all `<link rel="stylesheet">` tags (lines 7-12). Remove all `<script src="...">` tags (lines 409-424). Replace them with a single:

```html
<script type="module" src="/src/main.js"></script>
```

The HTML body content (header, tab bar, all panels, fullscreen overlay) remains identical.

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>数据可视化工具集</title>
</head>
<body>
  <!-- ... all body content from Toolset.html unchanged ... -->
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

- [ ] **Step 3: Commit**

```bash
git add index.html src/css/
git mv toolset/css/*.css src/css/ 2>/dev/null; git add src/css/
git commit -m "feat: create index.html entry point and move CSS to src/css/"
```

---

### Task 10: Test Development Build

**Files:** (no new files)

- [ ] **Step 1: Start Vite dev server**

Run: `npm run dev`
Expected: Browser opens at `http://localhost:3000`

- [ ] **Step 2: Verify each chart tab works**

For each tab (Histogram, Line Chart, Pie Chart, Bubble Chart, Table):
1. Click the tab — panel should show
2. Click "示例数据" (sample data) button — data loads
3. Click "生成图表" / "生成表格" — chart/table renders on canvas
4. Hover over chart elements — tooltips appear
5. Click "全屏展示" — fullscreen overlay appears
6. Press Escape — fullscreen exits
7. Switch to another tab — previous panel hides, new panel shows

- [ ] **Step 3: Check browser console for errors**

Open DevTools → Console. Verify no 404 errors, no import errors, no undefined function errors.

- [ ] **Step 4: If errors found, fix them**

Common issues:
- Missing `window.*` exposure for onclick handlers → add to module
- Wrong import path → fix relative path
- Missing export → add export to source module

- [ ] **Step 5: Commit fixes if needed**

```bash
git add -A
git commit -m "fix: resolve dev server issues found during testing"
```

---

### Task 11: Test Production Build

**Files:** (no new files, dist/ is generated)

- [ ] **Step 1: Run production build**

Run: `npm run build`
Expected: `dist/` directory created with `index.html` and `assets/` folder

- [ ] **Step 2: Preview production build**

Run: `npm run preview`
Expected: Browser opens at `http://localhost:4173` with production build

- [ ] **Step 3: Verify all functionality in production build**

Repeat the same checks as Task 10 Step 2 for each chart tab.

- [ ] **Step 4: Verify dist/ can be opened without server**

Open `dist/index.html` directly in a browser (file:// protocol). Vite's default build uses absolute paths, so a server is needed. If file:// doesn't work, update `vite.config.js` to add `base: './'`:

```js
export default defineConfig({
  root: '.',
  base: './',  // Use relative paths for file:// support
  build: { ... },
  server: { ... }
});
```

Rebuild and verify.

- [ ] **Step 5: Commit if config changed**

```bash
git add vite.config.js
git commit -m "fix: use relative base path for file:// support"
```

---

### Task 12: Clean Up Old Files

**Files:**
- Delete: `Toolset.html`
- Delete: `toolset/` directory

- [ ] **Step 1: Remove old files**

Run:
```
git rm Toolset.html
git rm -r toolset/
```

- [ ] **Step 2: Final verification**

Run `npm run dev` one more time. Verify everything still works.

- [ ] **Step 3: Final commit**

```bash
git commit -m "chore: remove old Toolset.html and toolset/ directory"
```

---

### Task 13: Final Review

**Files:**
- Read: `index.html`, `src/main.js`, `src/state.js`, `src/fullscreen.js`, `src/tab.js`

- [ ] **Step 1: Verify no global script tags remain in index.html**

Grep for `<script src=` in `index.html` — should find zero matches. Only `<script type="module" src="/src/main.js">` should exist.

- [ ] **Step 2: Verify all imports resolve**

Run: `npx vite build 2>&1` and check for any "unresolved import" warnings.

- [ ] **Step 3: Check for remaining references to old globals**

Grep for `isFullscreen` without `import` — should only appear in `state.js` (definition) and modules that import it.

- [ ] **Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "chore: final cleanup and verification"
```
