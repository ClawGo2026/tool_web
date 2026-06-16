# ES Module Refactoring Design

**Date:** 2026-06-16
**Status:** Approved
**Approach:** Vite + Full ES Module Migration

---

## 1. Overview

Refactor the data visualization toolkit from a global-script-tag architecture to a modern ES module architecture using Vite as the build tool. All user-facing functionality, HTML element IDs, CSS class names, and visual appearance remain identical. The refactoring is purely internal.

### Goals
- Convert all global scripts to ES modules with explicit `import`/`export`
- Introduce Vite for development (dev server, HMR) and production (bundling, optimization)
- Extract shared utilities into a dedicated module
- Centralize shared state (`currentTool`, `isFullscreen`) in a dedicated module
- CSS loaded via JS modules (Vite native support)
- Maintain zero functional changes — pixel-perfect output

---

## 2. Project Structure

```
web_tool/
├── index.html                # Entry point (renamed from Toolset.html)
├── package.json              # npm config with Vite dependency
├── vite.config.js            # Vite configuration
├── src/
│   ├── main.js               # App entry: imports all modules, boots the app
│   ├── state.js              # Shared state: currentTool, isFullscreen
│   ├── utils.js              # Shared utility functions (hexToRgba, isLightColor, etc.)
│   ├── style.js              # Imports all CSS files
│   ├── tab.js                # Tab switching logic
│   ├── fullscreen.js         # Shared fullscreen management with dynamic import routing
│   ├── histogram/
│   │   ├── index.js          # Histogram init, render, draw, controls, fullscreen
│   │   ├── palettes.js       # H_PALETTES data
│   │   └── bar-styles.js     # BAR_STYLES data
│   ├── linechart/
│   │   ├── index.js          # Line chart init, render, draw, fullscreen
│   │   ├── palettes.js       # L_PALETTES
│   │   └── line-styles.js    # LINE_STYLES
│   ├── piechart/
│   │   ├── index.js          # Pie chart init, render, draw, fullscreen
│   │   ├── palettes.js       # P_PALETTES
│   │   └── pie-styles.js     # PIE_STYLES
│   ├── bubblechart/
│   │   ├── index.js          # Bubble chart init, render, draw, fullscreen
│   │   ├── palettes.js       # BUBBLE_PALETTES
│   │   └── layout-algorithms.js
│   └── table/
│       ├── index.js          # Table init, render, build HTML, fullscreen
│       ├── palettes.js       # T_PALETTES
│       └── table-styles.js   # TABLE_STYLES
├── src/css/
│   ├── theme.css             # (moved from toolset/css/)
│   ├── histogram.css
│   ├── linechart.css
│   ├── piechart.css
│   ├── bubblechart.css
│   └── table.css
└── dist/                     # Vite production build output
```

### File Mapping (Old → New)

| Old Location | New Location |
|---|---|
| `Toolset.html` | `index.html` |
| `toolset/data/h-palettes.js` | `src/histogram/palettes.js` |
| `toolset/data/t-palettes.js` | `src/table/palettes.js` |
| `toolset/data/bar-styles.js` | `src/histogram/bar-styles.js` |
| `toolset/data/table-styles.js` | `src/table/table-styles.js` |
| `toolset/data/l-palettes.js` | `src/linechart/palettes.js` |
| `toolset/data/line-styles.js` | `src/linechart/line-styles.js` |
| `toolset/data/p-palettes.js` | `src/piechart/palettes.js` |
| `toolset/data/pie-styles.js` | `src/piechart/pie-styles.js` |
| `toolset/data/b-palettes.js` | `src/bubblechart/palettes.js` |
| `toolset/data/layout-algorithms.js` | `src/bubblechart/layout-algorithms.js` |
| `toolset/js/histogram.js` | `src/histogram/index.js` |
| `toolset/js/table.js` | `src/table/index.js` |
| `toolset/js/linechart.js` | `src/linechart/index.js` |
| `toolset/js/piechart.js` | `src/piechart/index.js` |
| `toolset/js/bubblechart.js` | `src/bubblechart/index.js` |
| `toolset/js/core.js` | Split into `src/state.js`, `src/tab.js`, `src/fullscreen.js`, `src/main.js` |
| `toolset/css/*.css` | `src/css/*.css` |

---

## 3. Module Dependency Graph

```
index.html
  └─ <script type="module" src="/src/main.js">
       ├── imports style.js ──► imports ../css/*.css (Vite handles)
       ├── imports state.js
       ├── imports tab.js ──► imports state.js
       ├── imports fullscreen.js ──► imports state.js, dynamic-imports chart modules
       ├── imports histogram/index.js ──► imports state.js, utils.js, palettes.js, bar-styles.js
       ├── imports linechart/index.js ──► imports state.js, utils.js, palettes.js, line-styles.js
       ├── imports piechart/index.js ──► imports state.js, utils.js, palettes.js, pie-styles.js
       ├── imports bubblechart/index.js ──► imports state.js, utils.js, palettes.js, layout-algorithms.js
       └── imports table/index.js ──► imports state.js, utils.js, palettes.js, table-styles.js
```

---

## 4. Key Module Contracts

### state.js
```js
export let currentTool = 'histogram';
export let isFullscreen = false;
export function setCurrentTool(tool) { currentTool = tool; }
export function setIsFullscreen(val) { isFullscreen = val; }
```

### utils.js
```js
export function hexToRgba(hex, alpha) { ... }
export function isLightColor(hex) { ... }
export function truncate(str, max) { ... }
export function roundRect(ctx, x, y, w, h, r) { ... }
export function adjustColor(hex, amount) { ... }
```

### Each chart module (e.g., histogram/index.js)
```js
export function initHistogram() { ... }       // build palette/style grids, bind events
export function renderChart() { ... }         // parse input + draw
export function enterFsHistogram() { ... }    // enter fullscreen for this chart
export function exitFsHistogram() { ... }     // exit fullscreen for this chart
```

### tab.js
```js
import { setCurrentTool, currentTool } from './state.js';
export function switchTab(tab) { ... }        // hide/show panels, exit fullscreen on switch
```

### fullscreen.js
```js
import { currentTool, isFullscreen, setIsFullscreen } from './state.js';
export function toggleFullscreen() { ... }    // route to correct chart's enter/exit
export function enterFullscreen() { ... }     // dynamic import based on currentTool
export function exitFullscreen() { ... }      // dynamic import based on currentTool
```

### style.js
```js
import '../css/theme.css';
import '../css/histogram.css';
import '../css/linechart.css';
import '../css/piechart.css';
import '../css/bubblechart.css';
import '../css/table.css';
```

### main.js
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

---

## 5. Vite Configuration

### vite.config.js
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

### package.json
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

### index.html
Same HTML body content as current `Toolset.html`. All `<script src="...">` and `<link rel="stylesheet">` tags removed. Replaced with:
```html
<script type="module" src="/src/main.js"></script>
```

---

## 6. Shared Utilities Consolidation

The following functions are currently duplicated across multiple chart modules and will be extracted to `src/utils.js`:

| Function | Currently in |
|---|---|
| `hexToRgba` | histogram.js, bubblechart.js |
| `isLightColor` | histogram.js, bubblechart.js |
| `truncate` | histogram.js, bubblechart.js |
| `roundRect` | histogram.js (used by bar-styles.js) |
| `adjustColor` | histogram.js (used by bar-styles.js) |

After migration, all chart modules import these from `utils.js`.

---

## 7. CSS Handling

Vite natively supports CSS imports from JavaScript. `style.js` imports all CSS files. During development, Vite injects CSS as `<style>` tags. During production build, Vite extracts CSS into a separate `.css` file in `dist/assets/`.

No changes to CSS file content — they are moved to `src/css/` with identical content.

---

## 8. Migration Steps (Implementation Order)

1. Initialize project: create `package.json`, `vite.config.js`, install Vite
2. Create `src/` directory structure
3. Create `src/utils.js` with shared utility functions
4. Create `src/state.js` with shared state
5. Migrate each chart module (data → palettes/styles → index.js):
   - histogram (palettes.js + bar-styles.js + index.js)
   - linechart (palettes.js + line-styles.js + index.js)
   - piechart (palettes.js + pie-styles.js + index.js)
   - bubblechart (palettes.js + layout-algorithms.js + index.js)
   - table (palettes.js + table-styles.js + index.js)
6. Create `src/tab.js`, `src/fullscreen.js`, `src/style.js`, `src/main.js`
7. Create `index.html` (from Toolset.html, with script tag pointing to main.js)
8. Move CSS files to `src/css/`
9. Test with `vite dev`
10. Test production build with `vite build` + `vite preview`
11. Clean up old `toolset/` directory

---

## 9. Constraints & Decisions

- **No functional changes** — all HTML IDs, CSS classes, and user interactions remain identical
- **No framework** — pure vanilla JS with ES modules, no React/Vue/Svelte
- **Vite only** — no additional plugins unless needed
- **CSS unchanged** — content identical, only import mechanism changes
- **Old toolset/ directory removed** after migration is verified
- **No server-side rendering** — purely client-side SPA
